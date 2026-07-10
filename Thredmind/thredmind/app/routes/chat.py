"""
Chat route: RAG-powered AI chat with semantic search and knowledge graph integration.
Uses local embeddings (fastembed/ONNX) for retrieval and the AI provider rotation for generation.
"""
import json
import uuid
from datetime import datetime

from fastapi import APIRouter, Form, Request
from fastapi.responses import HTMLResponse, RedirectResponse

from app.dependencies import get_current_user, theme_from_request
from app.services.db_client import execute, execute_one
from app.services.embedding_service import search_chunks

router = APIRouter()

# ============================================================
# Pages
# ============================================================

@router.get("/chat", response_class=HTMLResponse)
async def chat_page(request: Request):
    user = get_current_user(request)
    if not user:
        return RedirectResponse("/auth/login", status_code=302)
    from app.templating import templates
    theme = theme_from_request(request)

    # Load existing sessions
    sessions = execute(
        "SELECT id, title, updated_at FROM chat_sessions WHERE user_id = %s ORDER BY updated_at DESC LIMIT 20",
        (user["id"],)
    ) or []
    sessions_list = []
    for s in sessions:
        sd = dict(s)
        if sd.get("updated_at"):
            sd["updated_at"] = sd["updated_at"].strftime("%b %d")
        sessions_list.append(sd)

    return templates.TemplateResponse("chat.html", {
        "request": request, "user": user, "theme": theme,
        "sidebar_active": "chat", "sessions": sessions_list
    })


# ============================================================
# Semantic Search
# ============================================================

@router.post("/chat/search", response_class=HTMLResponse)
async def semantic_search(request: Request, query: str = Form(...)):
    user = get_current_user(request)
    if not user:
        return HTMLResponse("Not authenticated", status_code=401)

    if not query.strip():
        return HTMLResponse("""<div class="text-fg-dim text-sm p-4">Enter a search query to find relevant documents.</div>""")

    try:
        results = search_chunks(query.strip(), user["id"], limit=5)
    except Exception as e:
        return HTMLResponse(f"""<div class="text-error text-sm p-4">Search failed: {str(e)}</div>""")

    if not results:
        return HTMLResponse("""<div class="text-fg-dim text-sm p-4">No relevant documents found. Try a different query.</div>""")

    items = ""
    for r in results:
        source_icon = {"pdf": "text-red-400", "docx": "text-blue-400", "url": "text-sky-400", "ai_generated": "text-violet-400", "txt": "text-emerald-400", "md": "text-emerald-400"}.get(r.get("source_type", ""), "text-fg-dim")
        items += f"""
        <a href="/api/documents/{r['id']}" class="flex items-start gap-3 p-3 rounded-xl hover:bg-accent-bg transition-colors group">
            <div class="w-8 h-8 rounded-lg bg-accent-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg class="w-4 h-4 {source_icon}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-fg truncate group-hover:text-fg transition-colors">{r['title']}</p>
                <p class="text-xs text-fg-dim mt-0.5 line-clamp-2">{r.get('snippet', r.get('summary', ''))[:200]}</p>
                <div class="flex items-center gap-2 mt-1.5">
                    <span class="text-[10px] text-fg-dim uppercase">{r.get('source_type', '')}</span>
                    <span class="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-[10px] text-emerald-400 font-medium">{r.get('similarity', 0)}% match</span>
                </div>
            </div>
        </a>"""

    return HTMLResponse(f"""<div class="divide-y divide-border">{items}</div>""")


# ============================================================
# RAG Chat
# ============================================================

@router.post("/chat/message", response_class=HTMLResponse)
async def chat_message(request: Request, message: str = Form(...), session_id: str = Form("")):
    user = get_current_user(request)
    if not user:
        return HTMLResponse("Not authenticated", status_code=401)

    message = message.strip()
    if not message:
        return HTMLResponse("")

    user_id = user["id"]

    # Create or get session
    if not session_id:
        session_id = str(uuid.uuid4())
        execute(
            "INSERT INTO chat_sessions (id, user_id, title) VALUES (%s, %s, %s)",
            (session_id, user_id, message[:80])
        )

    # Save user message
    execute(
        "INSERT INTO chat_messages (session_id, role, content) VALUES (%s, %s, %s)",
        (session_id, "user", message)
    )

    # --- RAG Pipeline ---
    # Step 1: Semantic search for relevant documents
    context_chunks = []
    citations = []
    try:
        results = search_chunks(message, user_id, limit=5)
        for r in results:
            sim = r.get("similarity", 0)
            if sim > 30:  # Only include reasonably relevant documents
                context_chunks.append(f"### {r['title']}\n{r.get('snippet', '')}")
                citations.append({"id": r["id"], "title": r["title"], "similarity": sim})
    except Exception:
        pass

    # Step 2: Knowledge graph context (load graph.json for related concepts)
    graph_context = _get_graph_context(message)

    # Step 3: Build RAG prompt
    rag_context = ""
    if context_chunks:
        rag_context = "Relevant documents from your knowledge base:\n\n" + "\n\n---\n\n".join(context_chunks[:3])

    if graph_context:
        rag_context += f"\n\nKnowledge Graph Connections:\n{graph_context}"

    system_prompt = """You are ThredMind, an AI knowledge assistant. Answer questions based on the user's personal knowledge base.
- Use the provided document context to give accurate, specific answers.
- Cite which document(s) your information comes from.
- If the context doesn't contain the answer, say so honestly and suggest what the user might upload or search for.
- Keep answers concise but thorough. Use examples when helpful.
- The knowledge graph shows how concepts connect — mention related topics when relevant."""

    user_prompt = message
    if rag_context:
        user_prompt = f"""Context from your knowledge base:

{rag_context}

User question: {message}

Answer the question using the context above. Mention which documents you used."""

    # Step 4: Call AI
    from app.services.ai_client import chat_completion as _ai_chat

    try:
        result = _ai_chat(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.5,
            max_tokens=1500,
        )
        answer = result["content"]
        provider = result.get("provider", "AI")
    except Exception as e:
        answer = f"I'm having trouble connecting to the AI service right now. Please try again in a moment.\n\nError: {str(e)[:200]}"
        provider = "error"

    # Save AI response
    execute(
        "INSERT INTO chat_messages (session_id, role, content, citations_json) VALUES (%s, %s, %s, %s)",
        (session_id, "assistant", answer, json.dumps(citations) if citations else None)
    )

    # Update session timestamp
    execute(
        "UPDATE chat_sessions SET updated_at = now() WHERE id = %s",
        (session_id,)
    )

    # Build citation HTML
    citation_html = ""
    if citations:
        cite_items = ""
        for c in citations[:3]:
            cite_items += f"""
            <a href="/api/documents/{c['id']}" class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-accent-bg hover:bg-accent-bg/70 transition-colors text-xs">
                <svg class="w-3 h-3 text-fg-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span class="text-fg-muted truncate max-w-[140px]">{c['title']}</span>
                <span class="text-emerald-400">{c['similarity']}%</span>
            </a>"""
        citation_html = f"""
        <div class="mt-3 pt-3 border-t border-border">
            <p class="text-[10px] text-fg-dim uppercase tracking-widest mb-2">Sources</p>
            <div class="flex flex-wrap gap-1.5">{cite_items}</div>
        </div>"""

    # Return both the user message and AI response as HTML
    return HTMLResponse(f"""
    <div class="chat-message user-message flex justify-end mb-4" id="msg-user-{session_id}">
        <div class="max-w-[80%] bg-accent-bg rounded-2xl rounded-br-md px-4 py-3">
            <p class="text-sm text-fg whitespace-pre-wrap">{message}</p>
        </div>
    </div>
    <div class="chat-message ai-message flex gap-3 mb-4" id="msg-ai-{session_id}">
        <div class="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg class="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
        </div>
        <div class="flex-1 min-w-0">
            <div class="bg-bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                <p class="text-sm text-fg-muted whitespace-pre-wrap leading-relaxed">{answer}</p>
                {citation_html}
            </div>
            <p class="text-[10px] text-fg-dim mt-1 ml-1">via {provider}</p>
        </div>
    </div>
    <script>
        // Scroll to the new AI message
        document.getElementById('msg-ai-{session_id}').scrollIntoView({{ behavior: 'smooth', block: 'end' }});
        // Store the session ID in the hidden input for subsequent messages
        var sidInput = document.getElementById('chat-session-id');
        if (sidInput && !sidInput.value) sidInput.value = '{session_id}';
    </script>
    """)


# ============================================================
# Session Management
# ============================================================

@router.get("/chat/sessions/{session_id}", response_class=HTMLResponse)
async def load_session(request: Request, session_id: str):
    user = get_current_user(request)
    if not user:
        return HTMLResponse("Not authenticated", status_code=401)

    messages = execute(
        "SELECT role, content, citations_json, created_at FROM chat_messages WHERE session_id = %s ORDER BY created_at ASC",
        (session_id,)
    ) or []

    html = ""
    for m in messages:
        msg = dict(m)
        if msg["role"] == "user":
            html += f"""
            <div class="chat-message user-message flex justify-end mb-4">
                <div class="max-w-[80%] bg-accent-bg rounded-2xl rounded-br-md px-4 py-3">
                    <p class="text-sm text-fg whitespace-pre-wrap">{msg['content']}</p>
                </div>
            </div>"""
        else:
            citations = msg.get("citations_json")
            if isinstance(citations, str):
                try:
                    citations = json.loads(citations)
                except Exception:
                    citations = None

            cite_html = ""
            if citations:
                cite_items = ""
                for c in citations[:3]:
                    cite_items += f"""
                    <a href="/api/documents/{c['id']}" class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-accent-bg hover:bg-accent-bg/70 transition-colors text-xs">
                        <svg class="w-3 h-3 text-fg-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        <span class="text-fg-muted truncate max-w-[140px]">{c['title']}</span>
                        <span class="text-emerald-400">{c['similarity']}%</span>
                    </a>"""
                cite_html = f"""
                <div class="mt-3 pt-3 border-t border-border">
                    <p class="text-[10px] text-fg-dim uppercase tracking-widest mb-2">Sources</p>
                    <div class="flex flex-wrap gap-1.5">{cite_items}</div>
                </div>"""

            html += f"""
            <div class="chat-message ai-message flex gap-3 mb-4">
                <div class="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg class="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="bg-bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                        <p class="text-sm text-fg-muted whitespace-pre-wrap leading-relaxed">{msg['content']}</p>
                        {cite_html}
                    </div>
                </div>
            </div>"""

    return HTMLResponse(f"""<div id="chat-messages" class="flex-1 overflow-y-auto p-4 lg:p-6 space-y-0">{html}</div>
    <script>
        var container = document.getElementById('chat-messages');
        container.scrollTop = container.scrollHeight;
        var sidInput = document.getElementById('chat-session-id');
        if (sidInput) sidInput.value = '{session_id}';
    </script>""")


@router.post("/chat/new-session", response_class=HTMLResponse)
async def new_session(request: Request):
    user = get_current_user(request)
    if not user:
        return HTMLResponse("Not authenticated", status_code=401)
    # Return empty chat + reset session ID
    return HTMLResponse("""
    <div id="chat-messages" class="flex-1 overflow-y-auto p-4 lg:p-6">
        <div class="flex flex-col items-center justify-center h-full text-center pt-20">
            <div class="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-fg mb-2">ThredMind Chat</h3>
            <p class="text-fg-dim text-sm max-w-sm">Ask questions about your documents. I'll search your knowledge base and use AI to answer.</p>
        </div>
    </div>
    <script>
        document.getElementById('chat-session-id').value = '';
        // Reload the session sidebar
        htmx.ajax('GET', '/chat/sessions-sidebar', '#sessions-list');
    </script>
    """)


@router.get("/chat/sessions-sidebar", response_class=HTMLResponse)
async def sessions_sidebar(request: Request):
    user = get_current_user(request)
    if not user:
        return HTMLResponse("")

    sessions = execute(
        "SELECT id, title, updated_at FROM chat_sessions WHERE user_id = %s ORDER BY updated_at DESC LIMIT 20",
        (user["id"],)
    ) or []

    items = ""
    for s in sessions:
        sd = dict(s)
        date_str = sd["updated_at"].strftime("%b %d") if sd.get("updated_at") else ""
        items += f"""
        <button onclick="loadSession('{sd['id']}')" class="w-full text-left px-3 py-2 rounded-xl hover:bg-accent-bg transition-colors text-sm text-fg-muted hover:text-fg truncate">
            {sd['title'][:50]}
        </button>"""

    if not items:
        items = '<p class="text-xs text-fg-dim px-3 py-2">No conversations yet</p>'

    return HTMLResponse(items)


# ============================================================
# Knowledge Graph Helpers
# ============================================================

def _get_graph_context(query: str) -> str:
    """Extract relevant context from the graphify knowledge graph."""
    try:
        import os
        graph_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "..", "graphify-out", "graph.json")
        if not os.path.exists(graph_path):
            return ""

        with open(graph_path, "r", encoding="utf-8") as f:
            graph = json.load(f)

        nodes = graph.get("nodes", [])
        edges = graph.get("edges", [])

        # Find nodes matching query keywords
        query_lower = query.lower()
        query_words = set(query_lower.split())

        # Score nodes by keyword overlap
        scored = []
        for n in nodes:
            label = (n.get("label") or "").lower()
            nid = (n.get("id") or "").lower()
            score = 0
            for w in query_words:
                if w in label:
                    score += 3
                if w in nid:
                    score += 1
            if score > 0:
                scored.append((score, n))

        scored.sort(key=lambda x: x[0], reverse=True)
        top_nodes = scored[:5]

        if not top_nodes:
            return ""

        # Get connections for top nodes
        related = set()
        node_ids = {n[1]["id"] for n in top_nodes}
        for e in edges:
            if e["source"] in node_ids and e["target"] not in node_ids:
                related.add(e["target"])
            if e["target"] in node_ids and e["source"] not in node_ids:
                related.add(e["source"])

        # Look up related node labels
        node_map = {n["id"]: n["label"] for n in nodes}
        related_labels = [node_map.get(r, r) for r in related if r in node_map][:5]

        lines = []
        for _, n in top_nodes[:3]:
            lines.append(f"- {n['label']}")
        if related_labels:
            lines.append(f"\nRelated concepts: {', '.join(related_labels)}")

        return "\n".join(lines) if lines else ""
    except Exception:
        return ""
