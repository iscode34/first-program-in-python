import uuid

import bcrypt
from fastapi import APIRouter, Depends, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import EmailStr

from app.dependencies import create_access_token, get_current_user, theme_from_request
from app.models.user import LoginRequest, SignupRequest
from app.services.db_client import execute, execute_one

router = APIRouter()


@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    user = get_current_user(request)
    if user:
        return RedirectResponse("/app", status_code=302)
    from app.templating import templates
    theme = theme_from_request(request)
    return templates.TemplateResponse("login.html", {"request": request, "theme": theme})


@router.post("/login")
async def login(request: Request, email: str = Form(...), password: str = Form(...)):
    user = execute_one("SELECT id, email, password_hash FROM users WHERE email = %s", (email,))
    if not user or not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return HTMLResponse(
            """<div id="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"><svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Invalid email or password</div>""",
            status_code=200,
        )
    token = create_access_token(str(user["id"]))
    response = HTMLResponse(content="")
    response.headers["HX-Redirect"] = "/app"
    response.set_cookie(key="token", value=token, httponly=True, max_age=60 * 60 * 24 * 7)
    return response


@router.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request):
    user = get_current_user(request)
    if user:
        return RedirectResponse("/app", status_code=302)
    from app.templating import templates
    theme = theme_from_request(request)
    return templates.TemplateResponse("signup.html", {"request": request, "theme": theme})


@router.post("/signup")
async def signup(request: Request, email: str = Form(...), password: str = Form(...)):
    existing = execute_one("SELECT id FROM users WHERE email = %s", (email,))
    if existing:
        return HTMLResponse(
            """<div id="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"><svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Email already registered</div>""",
            status_code=200,
        )
    if len(password) < 6:
        return HTMLResponse(
            """<div id="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"><svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Password must be at least 6 characters</div>""",
            status_code=200,
        )
    user_id = str(uuid.uuid4())
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    execute(
        "INSERT INTO users (id, email, password_hash) VALUES (%s, %s, %s)",
        (user_id, email, password_hash),
    )
    token = create_access_token(user_id)
    response = HTMLResponse(content="")
    response.headers["HX-Redirect"] = "/app"
    response.set_cookie(key="token", value=token, httponly=True, max_age=60 * 60 * 24 * 7)
    return response


@router.get("/logout")
async def logout():
    response = RedirectResponse("/auth/login", status_code=302)
    response.delete_cookie("token")
    return response
