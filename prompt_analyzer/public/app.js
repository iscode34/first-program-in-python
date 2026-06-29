// PromptPilot Relational Database & UI Orchestration Engine

// ============================================================================
// 1. DATABASE SIMULATOR (LocalStorage Backed)
// ============================================================================

const DEFAULT_CATEGORIES = [
  { category_id: 1, category_name: 'Marketing', created_at: new Date('2025-06-01').toISOString() },
  { category_id: 2, category_name: 'Coding', created_at: new Date('2025-06-01').toISOString() },
  { category_id: 3, category_name: 'Education', created_at: new Date('2025-06-01').toISOString() },
  { category_id: 4, category_name: 'Career', created_at: new Date('2025-06-01').toISOString() },
  { category_id: 5, category_name: 'Creative', created_at: new Date('2025-06-01').toISOString() }
];

// Helper to generate UUIDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class RelationalDB {
  constructor() {
    this.tables = {
      users: [],
      categories: [],
      prompts: [],
      prompt_history: [],
      ai_analysis: [],
      favorites: []
    };
    this.load();
  }

  load() {
    const saved = localStorage.getItem('promptpilot_db');
    if (saved) {
      try {
        this.tables = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse DB, resetting...", e);
        this.resetToDefaults();
      }
    } else {
      this.resetToDefaults();
    }
  }

  save() {
    localStorage.setItem('promptpilot_db', JSON.stringify(this.tables));
  }

  resetToDefaults() {
    this.tables = {
      users: [],
      categories: [...DEFAULT_CATEGORIES],
      prompts: [],
      prompt_history: [],
      ai_analysis: [],
      favorites: []
    };

    // Seed default user: Samuel
    const samuelId = 'd3b07384-d113-4ec2-a5d6-c6c7d1e8c9b1';
    this.tables.users.push({
      user_id: samuelId,
      username: 'Samuel',
      email: 'studen@gmail.com', // as in the report screenshots
      password_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // SHA-256 of "password"
      created_at: new Date('2025-11-15T08:00:00Z').toISOString()
    });

    // Seed default prompts matching screenshot on Page 10
    const mockPrompts = [
      {
        prompt_id: 'e2a9b3d1-4475-4dcf-8bb2-cf56230f1aa1',
        title: 'Marketing Email',
        category_id: 1,
        text: 'Write a high-converting product launch email sequence for our new software. Use a friendly but professional tone. Focus on solving the user\'s immediate pain point of losing time.',
        is_favorite: true,
        created: '2025-11-20T10:00:00Z',
        clarity: 95, grammar: 90, optimization: 91
      },
      {
        prompt_id: 'fa9900c2-3cf4-4e2b-8a71-6c2e8a1d7f45',
        title: 'Python Debugger',
        category_id: 2,
        text: 'Act as a senior python developer. Debug this script and explain where the memory leak is happening: \n\n```python\nimport sys\ndef process_data(data=[]):\n    data.append("new_element")\n    return data\n```',
        is_favorite: false,
        created: '2025-12-10T14:30:00Z',
        clarity: 88, grammar: 85, optimization: 88
      },
      {
        prompt_id: 'b1c8f7e3-b5d4-42b1-b952-b8f1c8e3d0f1',
        title: 'Essay Writer',
        category_id: 3,
        text: 'Write an argumentative essay of 1000 words on the theme: "Should social media algorithms be regulated by the government?" Include at least three primary academic sources and outline arguments for and against.',
        is_favorite: false,
        created: '2025-12-12T09:15:00Z',
        clarity: 92, grammar: 88, optimization: 90
      },
      {
        prompt_id: '9d2f8e1c-7a6b-4c5d-8e9f-0a1b2c3d4e5f',
        title: 'Resume Generator',
        category_id: 4,
        text: 'Generate a professional resume for a Senior Software Engineer with 6 years of experience in React, Node.js, and AWS. Use a clean, modern style layout format, highlighting measurable achievements.',
        is_favorite: false,
        created: '2026-01-20T11:45:00Z',
        clarity: 96, grammar: 94, optimization: 95
      }
    ];

    // Bulk insert mock prompts
    mockPrompts.forEach(p => {
      // 1. Insert prompt
      this.tables.prompts.push({
        prompt_id: p.prompt_id,
        user_id: samuelId,
        category_id: p.category_id,
        title: p.title,
        current_prompt_text: p.text,
        is_favorite: p.is_favorite,
        created_at: p.created,
        updated_at: p.created
      });

      // 2. Insert prompt history (v1)
      this.tables.prompt_history.push({
        history_id: generateUUID(),
        prompt_id: p.prompt_id,
        historical_text_state: p.text,
        version_number: 1,
        created_at: p.created
      });

      // 3. Insert prompt history (v2 for marketing email to show version history timeline)
      if (p.title === 'Marketing Email') {
        const v2Text = 'Write a high-converting product launch email sequence for our new SaaS platform. Act as an expert copywriter. Use a friendly, persuasive tone. Include a clear call to action and double check the grammar.';
        // Update prompt text
        const promptIdx = this.tables.prompts.findIndex(pr => pr.prompt_id === p.prompt_id);
        this.tables.prompts[promptIdx].current_prompt_text = v2Text;
        this.tables.prompts[promptIdx].updated_at = new Date('2026-01-24T15:00:00Z').toISOString();

        this.tables.prompt_history.push({
          history_id: generateUUID(),
          prompt_id: p.prompt_id,
          historical_text_state: v2Text,
          version_number: 2,
          created_at: new Date('2026-01-24T15:00:00Z').toISOString()
        });
      }

      // 4. Insert AI analysis
      this.tables.ai_analysis.push({
        analysis_id: generateUUID(),
        prompt_id: p.prompt_id,
        clarity_score: p.clarity,
        grammar_score: p.grammar,
        optimization_score: p.optimization,
        suggestions_payload: {
          clarity: "Your prompt clearly defines the desired outcomes and parameters.",
          grammar: "Good syntactical structuring. Keep sentences readable.",
          optimization: "Consider adding specific negative constraints (what to exclude)."
        },
        analyzed_at: p.created
      });

      // 5. Insert favorites junction
      if (p.is_favorite) {
        this.tables.favorites.push({
          favorite_id: generateUUID(),
          user_id: samuelId,
          prompt_id: p.prompt_id,
          bookmarked_at: p.created
        });
      }
    });

    this.save();
  }
}

const db = new RelationalDB();

// ============================================================================
// 2. MOCK AI DIAGNOSTICS ENGINE
// ============================================================================

function analyzePromptText(text) {
  const cleanText = text.trim();
  if (!cleanText) {
    return { clarity: 0, grammar: 0, optimization: 0, suggestions: {} };
  }

  // Clarity Heuristics
  let clarity = 50;
  const actionWords = /\b(act as|role|simulate|create|generate|write|explain|develop)\b/i;
  const formatWords = /\b(format|markdown|bullet|list|table|output|json|yaml|xml)\b/i;
  const exampleWords = /\b(example|e\.g\.|like this|for instance)\b/i;
  
  if (actionWords.test(cleanText)) clarity += 15;
  if (formatWords.test(cleanText)) clarity += 15;
  if (exampleWords.test(cleanText)) clarity += 10;
  if (cleanText.length > 120) clarity += 10;
  clarity = Math.min(clarity, 100);

  // Grammar Heuristics
  let grammar = 60;
  const endsWithPunctuation = /[.!?]$/.test(cleanText);
  const doubleSpaces = /\s{2,}/.test(cleanText);
  const codeBlocks = /```/.test(cleanText);
  
  if (endsWithPunctuation) grammar += 15;
  if (!doubleSpaces) grammar += 15;
  if (codeBlocks) grammar += 10;
  grammar = Math.min(grammar, 100);

  // Optimization Heuristics
  let optimization = 40;
  const personaWords = /\b(you are|expert|professional|specialist|persona)\b/i;
  const variables = /([\[{<][a-zA-Z0-9_\s-]+[\]}>])/;
  const constraintWords = /\b(do not|without|avoid|exclude|never|restrict)\b/i;
  const parameterWords = /\b(temperature|max tokens|tokens|length|limit|words|audience|tone)\b/i;

  if (personaWords.test(cleanText)) optimization += 15;
  if (variables.test(cleanText)) optimization += 20;
  if (constraintWords.test(cleanText)) optimization += 15;
  if (parameterWords.test(cleanText)) optimization += 10;
  optimization = Math.min(optimization, 100);

  // Generate suggestions lists
  const claritySugs = [];
  if (!actionWords.test(cleanText)) claritySugs.push("Add a specific role persona (e.g. 'Act as a professional copywriter') to guide the model.");
  if (!formatWords.test(cleanText)) claritySugs.push("Specify the target output format (e.g. 'Format as bullet points').");
  if (cleanText.length < 50) claritySugs.push("Provide more detailed context to remove ambiguity.");
  if (claritySugs.length === 0) claritySugs.push("Your prompt clearly defines targets, roles, and formats.");

  const grammarSugs = [];
  if (!endsWithPunctuation) grammarSugs.push("Ensure your prompt ends with proper punctuation (period, question mark).");
  if (doubleSpaces) grammarSugs.push("Remove double spaces to clean up syntax tokens.");
  if (grammarSugs.length === 0) grammarSugs.push("Excellent text formatting and grammatical cohesion.");

  const optSugs = [];
  if (!variables.test(cleanText)) optSugs.push("Include prompt variables in brackets like [topic] to make this prompt reusable.");
  if (!constraintWords.test(cleanText)) optSugs.push("Add negative constraints (e.g. 'do not use jargon') to limit hallucinations.");
  if (!parameterWords.test(cleanText)) optSugs.push("Define specific length constraints (e.g. 'under 150 words') or parameters.");
  if (optSugs.length === 0) optSugs.push("The prompt contains high-level parameter constraints and variable inputs.");

  return {
    clarity,
    grammar,
    optimization,
    suggestions: {
      clarity: claritySugs.join(" "),
      grammar: grammarSugs.join(" "),
      optimization: optSugs.join(" ")
    }
  };
}

// ============================================================================
// 3. SQL ENGINE / PARSER
// ============================================================================

function evaluateSQL(sqlText) {
  const query = sqlText.trim().replace(/\s+/g, ' ').replace(/;$/, '');
  const selectRegex = /^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+JOIN\s+([a-zA-Z0-9_]+)\s+ON\s+(.+?))?(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i;

  const match = query.match(selectRegex);
  if (!match) {
    throw new Error("SQL Syntax Error: Supported format is SELECT columns FROM table [JOIN table2 ON cond] [WHERE cond] [ORDER BY col [ASC|DESC]] [LIMIT n]");
  }

  const columnsStr = match[1];
  const primaryTable = match[2].toLowerCase();
  const joinTable = match[3] ? match[3].toLowerCase() : null;
  const joinOn = match[4] ? match[4].trim() : null;
  const whereClause = match[5] ? match[5].trim() : null;
  const orderByClause = match[6] ? match[6].trim() : null;
  const limitClause = match[7] ? parseInt(match[7], 10) : null;

  if (!db.tables[primaryTable]) {
    throw new Error(`Table '${primaryTable}' does not exist in the schema.`);
  }
  if (joinTable && !db.tables[joinTable]) {
    throw new Error(`Joined table '${joinTable}' does not exist in the schema.`);
  }

  // Clone primary table rows
  let dataset = JSON.parse(JSON.stringify(db.tables[primaryTable]));

  // Perform JOIN
  if (joinTable && joinOn) {
    const parts = joinOn.split('=');
    if (parts.length !== 2) {
      throw new Error(`Invalid JOIN condition: ${joinOn}. Must be table1.col = table2.col`);
    }
    const condLeft = parts[0].trim();
    const condRight = parts[1].trim();

    const getKeys = (left, right) => {
      const getTableAndCol = (str) => {
        const s = str.split('.');
        return s.length === 2 ? { tbl: s[0].toLowerCase(), col: s[1] } : { tbl: null, col: str };
      };
      const leftInfo = getTableAndCol(left);
      const rightInfo = getTableAndCol(right);
      return { leftInfo, rightInfo };
    };

    const { leftInfo, rightInfo } = getKeys(condLeft, condRight);

    let joinedData = [];
    dataset.forEach(row => {
      const joinVal = row[leftInfo.col] || row[rightInfo.col];
      const matchingRows = db.tables[joinTable].filter(jRow => {
        const jVal = jRow[leftInfo.col] || jRow[rightInfo.col];
        return String(jVal) === String(joinVal);
      });

      if (matchingRows.length > 0) {
        matchingRows.forEach(mRow => {
          // Merge objects, adding prefix to avoid conflict if cols share names
          let merged = {};
          // copy primary
          for (let key in row) {
            merged[`${primaryTable}.${key}`] = row[key];
            merged[key] = row[key]; // fallback for easy selection
          }
          // copy join
          for (let key in mRow) {
            merged[`${joinTable}.${key}`] = mRow[key];
            if (merged[key] === undefined) {
              merged[key] = mRow[key];
            }
          }
          joinedData.push(merged);
        });
      }
    });
    dataset = joinedData;
  } else if (joinTable) {
    throw new Error("JOIN keyword requires an ON clause.");
  }

  // Apply WHERE filters
  if (whereClause) {
    // Basic parser for WHERE column = 'value' or column = value or column LIKE '%val%'
    // Supports: = , != , LIKE, >, <
    const operators = [/!=/, /=/, /LIKE/i, />/, /</];
    let operator = null;
    let parts = null;

    for (let op of operators) {
      const regex = new RegExp(`^(.+?)\\s+(${op.source})\\s+(.+?)$`, 'i');
      const pm = whereClause.match(regex);
      if (pm) {
        operator = pm[2].toUpperCase();
        parts = [pm[1].trim(), pm[3].trim()];
        break;
      }
    }

    if (!parts) {
      throw new Error(`WHERE clause '${whereClause}' is complex or unsupported. Use: col = value, col != value, col LIKE '%val%', col > val, or col < val.`);
    }

    const column = parts[0];
    let value = parts[1];

    // Strip quotes from value
    if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
      value = value.substring(1, value.length - 1);
    }

    dataset = dataset.filter(row => {
      // Resolve column name if it contains dot
      const cellVal = row[column] !== undefined ? row[column] : null;

      if (operator === '=') {
        return String(cellVal) === String(value);
      } else if (operator === '!=') {
        return String(cellVal) !== String(value);
      } else if (operator === 'LIKE') {
        // Simple wildcards
        const regexStr = '^' + value.replace(/%/g, '.*') + '$';
        const likeRegex = new RegExp(regexStr, 'i');
        return likeRegex.test(String(cellVal));
      } else if (operator === '>') {
        return Number(cellVal) > Number(value);
      } else if (operator === '<') {
        return Number(cellVal) < Number(value);
      }
      return false;
    });
  }

  // Apply ORDER BY
  if (orderByClause) {
    const parts = orderByClause.split(' ');
    const column = parts[0].trim();
    const order = parts[1] ? parts[1].toUpperCase() : 'ASC';

    dataset.sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];

      if (aVal === undefined || bVal === undefined) return 0;

      let compare = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        compare = aVal - bVal;
      } else {
        compare = String(aVal).localeCompare(String(bVal));
      }
      return order === 'DESC' ? -compare : compare;
    });
  }

  // Apply LIMIT
  if (limitClause !== null) {
    dataset = dataset.slice(0, limitClause);
  }

  // Columns selection
  let finalCols = [];
  if (columnsStr === '*') {
    if (dataset.length > 0) {
      // Exclude properties prefixed with table names if they are duplicate
      finalCols = Object.keys(dataset[0]).filter(k => !k.includes('.'));
    } else {
      // Fallback: use table keys
      const tbl = joinTable ? db.tables[joinTable] : db.tables[primaryTable];
      finalCols = Object.keys(db.tables[primaryTable][0] || {});
      if (joinTable) {
        finalCols = finalCols.concat(Object.keys(db.tables[joinTable][0] || {}));
      }
    }
  } else {
    finalCols = columnsStr.split(',').map(c => c.trim());
  }

  // Map dataset to columns
  const rows = dataset.map(row => {
    const mappedRow = {};
    finalCols.forEach(col => {
      mappedRow[col] = row[col] !== undefined ? row[col] : (row[`${primaryTable}.${col}`] !== undefined ? row[`${primaryTable}.${col}`] : row[`${joinTable}.${col}`]);
    });
    return mappedRow;
  });

  return { columns: finalCols, rows };
}

// ============================================================================
// 4. MAIN STATE & ROUTING
// ============================================================================

const state = {
  currentUser: null,
  activeTab: 'dashboard', // dashboard, diagnostics, console, profile
  activePromptId: null, // selected prompt for timeline
  editingPrompt: null // prompt currently being edited or viewed
};

// Check if user is logged in on session start
function initSession() {
  const sessionUser = sessionStorage.getItem('promptpilot_user');
  if (sessionUser) {
    state.currentUser = JSON.parse(sessionUser);
    handleRoute();
  } else {
    handleRoute();
  }
}

function showAuthScreen() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('app-shell').classList.add('hidden');
  const showSignup = new URLSearchParams(window.location.search).get('signup') === '1';
  renderAuthView(showSignup ? 'signup' : 'signin');
}

function showAppShell() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app-shell').classList.remove('hidden');
  document.getElementById('greet-username').innerText = state.currentUser.username;
}

function renderAuthView(view) {
  const container = document.getElementById('auth-form-container');
  if (view === 'signin') {
    container.innerHTML = `
      <div class="animate-fade-in">
        <h2 class="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h2>
        <p class="text-slate-400 text-sm mb-8">Access your multi-tenant prompt developer suite.</p>
        
        <div id="signin-error" class="hidden bg-red-900/40 border border-red-500 text-red-200 text-xs px-3 py-2 rounded mb-4"></div>

        <form id="signin-form" class="space-y-4">
          <div>
            <label class="block text-slate-300 text-xs font-semibold uppercase mb-1">Email Address</label>
            <input type="email" id="signin-email" required class="w-full bg-[#131138] border border-[#3b378c] text-white text-sm px-4 py-2.5 rounded focus:outline-none focus:border-indigo-500" placeholder="samuel@gmail.com" value="studen@gmail.com">
          </div>
          <div>
            <label class="block text-slate-300 text-xs font-semibold uppercase mb-1">Password</label>
            <div class="relative">
              <input type="password" id="signin-password" required class="w-full bg-[#131138] border border-[#3b378c] text-white text-sm px-4 py-2.5 rounded focus:outline-none focus:border-indigo-500" placeholder="••••••••" value="password">
              <button type="button" onclick="togglePasswordVisibility('signin-password')" class="absolute right-3 top-3 text-slate-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
          </div>
          <button type="submit" class="w-full bg-[#4F46E5] hover:bg-[#6366F1] text-white font-semibold text-sm py-2.5 rounded transition duration-200">Sign In</button>
        </form>
        <p class="text-xs text-slate-400 text-center mt-6">Don't have an account? <a href="#" onclick="renderAuthView('signup')" class="text-indigo-400 hover:underline">Create Account</a></p>
      </div>
    `;
    
    document.getElementById('signin-form').addEventListener('submit', handleSignIn);
  } else {
    container.innerHTML = `
      <div class="animate-fade-in">
        <h2 class="text-3xl font-bold tracking-tight text-white mb-2">SIGN UP</h2>
        <p class="text-slate-400 text-sm mb-8">Establish your prompt telemetry isolated tenant.</p>
        
        <div id="signup-error" class="hidden bg-red-900/40 border border-red-500 text-red-200 text-xs px-3 py-2 rounded mb-4"></div>

        <form id="signup-form" class="space-y-4">
          <div>
            <label class="block text-slate-300 text-xs font-semibold uppercase mb-1">Full Name</label>
            <input type="text" id="signup-name" required class="w-full bg-[#131138] border border-[#3b378c] text-white text-sm px-4 py-2.5 rounded focus:outline-none focus:border-indigo-500" placeholder="Malcolm Tampan Tiada Tara">
          </div>
          <div>
            <label class="block text-slate-300 text-xs font-semibold uppercase mb-1">Email Address</label>
            <input type="email" id="signup-email" required class="w-full bg-[#131138] border border-[#3b378c] text-white text-sm px-4 py-2.5 rounded focus:outline-none focus:border-indigo-500" placeholder="student@gmail.com">
          </div>
          <div>
            <label class="block text-slate-300 text-xs font-semibold uppercase mb-1">Password</label>
            <div class="relative">
              <input type="password" id="signup-password" required class="w-full bg-[#131138] border border-[#3b378c] text-white text-sm px-4 py-2.5 rounded focus:outline-none focus:border-indigo-500" placeholder="••••••••">
              <button type="button" onclick="togglePasswordVisibility('signup-password')" class="absolute right-3 top-3 text-slate-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
          </div>
          <div>
            <label class="block text-slate-300 text-xs font-semibold uppercase mb-1">Confirm Password</label>
            <div class="relative">
              <input type="password" id="signup-confirm" required class="w-full bg-[#131138] border border-[#3b378c] text-white text-sm px-4 py-2.5 rounded focus:outline-none focus:border-indigo-500" placeholder="••••••••">
              <button type="button" onclick="togglePasswordVisibility('signup-confirm')" class="absolute right-3 top-3 text-slate-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
          </div>
          <button type="submit" class="w-full bg-[#4F46E5] hover:bg-[#6366F1] text-white font-semibold text-sm py-2.5 rounded transition duration-200">Create Account</button>
        </form>
        <p class="text-xs text-slate-400 text-center mt-6">Already have an account? <a href="#" onclick="renderAuthView('signin')" class="text-indigo-400 hover:underline">Sign In</a></p>
      </div>
    `;
    
    document.getElementById('signup-form').addEventListener('submit', handleSignUp);
  }
}

function togglePasswordVisibility(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.type = field.type === 'password' ? 'text' : 'password';
  }
}

async function handleSignIn(e) {
    e.preventDefault();

    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const errorBox = document.getElementById('signin-error');

    errorBox.classList.add('hidden');

    try {

        const response = await fetch(
            '/api/auth/login',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            errorBox.innerText = data.message;
            errorBox.classList.remove('hidden');
            return;
        }

        localStorage.setItem('token', data.token);

        state.currentUser = {
            user_id: data.user.id,
            username: data.user.full_name,
            email: data.user.email
        };

        sessionStorage.setItem(
            'promptpilot_user',
            JSON.stringify(state.currentUser)
        );

        navigateTo('/dashboard');

    } catch (err) {
        console.error(err);

        errorBox.innerText = 'Cannot connect to server';
        errorBox.classList.remove('hidden');
    }
}
async function handleSignUp(e) {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    const errorBox = document.getElementById('signup-error');

    errorBox.classList.add('hidden');

    if (password !== confirm) {
        errorBox.innerText = 'Passwords do not match.';
        errorBox.classList.remove('hidden');
        return;
    }

    try {

        const response = await fetch(
            '/api/auth/register',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    full_name: name,
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            errorBox.innerText = data.message;
            errorBox.classList.remove('hidden');
            return;
        }

        alert('Account created successfully!');
        renderAuthView('signin');

    } catch (err) {
        console.error(err);
        errorBox.innerText = 'Server connection error.';
        errorBox.classList.remove('hidden');
    }
}

function navigateTo(path) {
    window.history.pushState({}, '', path);
    handleRoute();
}

function handleRoute() {
    const path = window.location.pathname;
    if (!state.currentUser && path !== '/login') {
        window.history.replaceState({}, '', '/login');
        showAuthScreen();
        return;
    }
    if (state.currentUser && path === '/login') {
        navigateTo('/dashboard');
        return;
    }
    showAppShell();
    hideAllViews();
    setActiveNav(path);

    switch(path) {
        case '/dashboard': document.getElementById('view-dashboard')?.classList.remove('hidden'); renderDashboard(); break;
        case '/prompts': document.getElementById('view-diagnostics')?.classList.remove('hidden'); renderDiagnostics(); break;
        case '/templates': document.getElementById('view-templates')?.classList.remove('hidden'); renderTemplates(); break;
        case '/settings': document.getElementById('view-settings')?.classList.remove('hidden'); renderSettings(); break;
        default: document.getElementById('view-dashboard')?.classList.remove('hidden'); renderDashboard();
    }
}

function hideAllViews() {
    ['view-dashboard','view-diagnostics','view-templates','view-settings','view-timeline'].forEach(id => {
        document.getElementById(id)?.classList.add('hidden');
    });
}

function setActiveNav(path) {
    document.querySelectorAll('.sidebar-nav-btn').forEach(b => b.classList.remove('active'));
    const map = { '/dashboard': 'nav-dashboard', '/prompts': 'nav-prompts', '/templates': 'nav-templates', '/settings': 'nav-settings' };
    const btnId = map[path];
    if (btnId) document.getElementById(btnId)?.classList.add('active');
}

function switchTab(tab) {
    const map = { dashboard: '/dashboard', diagnostics: '/prompts', prompts: '/prompts', templates: '/templates', settings: '/settings' };
    navigateTo(map[tab] || '/dashboard');
}
// ============================================================================
// 5. RENDERING: DASHBOARD
// ============================================================================

function renderDashboard() {
  const userId = state.currentUser.user_id;

  // Filter records by tenant identity (FR1: Multi-Tenant Security)
  const userPrompts = db.tables.prompts.filter(p => p.user_id === userId);
  const totalPromptsCount = userPrompts.length;

  const favCount = db.tables.favorites.filter(f => f.user_id === userId).length;

  // AI Improvements = total counts in prompt_history where version_number > 1
  let improvementsCount = 0;
  userPrompts.forEach(p => {
    const history = db.tables.prompt_history.filter(h => h.prompt_id === p.prompt_id);
    if (history.length > 1) {
      improvementsCount += (history.length - 1);
    }
  });

  // Calculate average quality score
  let totalScore = 0;
  let scoreCount = 0;
  userPrompts.forEach(p => {
    const analysis = db.tables.ai_analysis.find(a => a.prompt_id === p.prompt_id);
    if (analysis) {
      const avg = Math.round((analysis.clarity_score + analysis.grammar_score + analysis.optimization_score) / 3);
      totalScore += avg;
      scoreCount++;
    }
  });
  const avgQuality = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

  // Write stats
  document.getElementById('stat-total-prompts').innerText = totalPromptsCount;
  document.getElementById('stat-favorites').innerText = favCount;
  document.getElementById('stat-improvements').innerText = improvementsCount;
  document.getElementById('stat-avg-score').innerText = `${avgQuality}%`;

  // Render recent prompts table
  const tbody = document.getElementById('recent-prompts-tbody');
  tbody.innerHTML = '';

  if (userPrompts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-8 text-slate-400 text-sm">
          No prompts found. Click "+ New Prompt" to create one in the AI Diagnostics Workspace!
        </td>
      </tr>
    `;
    return;
  }

  userPrompts.forEach(p => {
    const category = db.tables.categories.find(c => c.category_id === Number(p.category_id));
    const catName = category ? category.category_name : 'General';

    const analysis = db.tables.ai_analysis.find(a => a.prompt_id === p.prompt_id);
    const scoreVal = analysis ? Math.round((analysis.clarity_score + analysis.grammar_score + analysis.optimization_score) / 3) : 0;

    // Semantic color codes matching tokens
    let scoreColorClass = 'text-green-400';
    if (scoreVal < 50) {
      scoreColorClass = 'text-red-400';
    } else if (scoreVal <= 75) {
      scoreColorClass = 'text-amber-400';
    }

    const tr = document.createElement('tr');
    tr.className = 'border-b border-[#3b378c]/30 hover:bg-[#25235c]/30 transition duration-150 text-sm';
    tr.innerHTML = `
      <td class="py-3.5 px-4 font-medium text-white flex items-center gap-2">
        <button onclick="toggleFavoriteState('${p.prompt_id}')" class="focus:outline-none transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ${p.is_favorite ? 'text-amber-400 fill-current' : 'text-slate-400 hover:text-white'}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.252.584 1.831l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.18 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 10.122c-.776-.579-.377-1.831.582-1.831h4.907a1 1 0 00.95-.69L11.05 2.928z"/></svg>
        </button>
        <span class="truncate max-w-[200px]" title="${p.title}">${p.title}</span>
      </td>
      <td class="py-3.5 px-4 text-slate-300">${catName}</td>
      <td class="py-3.5 px-4 font-bold ${scoreColorClass}">${scoreVal}</td>
      <td class="py-3.5 px-4 flex gap-2">
        <button onclick="loadPromptForEdit('${p.prompt_id}')" class="bg-indigo-900/40 border border-indigo-500/50 hover:bg-indigo-800 text-indigo-200 text-xs px-2.5 py-1 rounded transition">More</button>
        <button onclick="viewPromptTimeline('${p.prompt_id}')" class="bg-[#131138] border border-[#3b378c] hover:bg-[#25235c] text-slate-300 text-xs px-2.5 py-1 rounded transition">History</button>
        <button onclick="deletePromptItem('${p.prompt_id}')" class="bg-red-950/40 border border-red-500/50 hover:bg-red-900 text-red-200 text-xs px-2.5 py-1 rounded transition">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function toggleFavoriteState(promptId) {
  const promptIdx = db.tables.prompts.findIndex(p => p.prompt_id === promptId);
  if (promptIdx === -1) return;

  const prompt = db.tables.prompts[promptIdx];
  const userId = state.currentUser.user_id;

  if (prompt.is_favorite) {
    prompt.is_favorite = false;
    db.tables.favorites = db.tables.favorites.filter(f => !(f.user_id === userId && f.prompt_id === promptId));
  } else {
    prompt.is_favorite = true;
    db.tables.favorites.push({
      favorite_id: generateUUID(),
      user_id: userId,
      prompt_id: promptId,
      bookmarked_at: new Date().toISOString()
    });
  }

  db.save();

  const token = localStorage.getItem('token');
  if (token) {
    fetch(`/api/prompts/${promptId}/favorite`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    }).catch(err => console.error('Favorite sync failed:', err.message));
  }

  renderDashboard();
}

function deletePromptItem(promptId) {
  if (confirm("Are you sure you want to delete this prompt and all its version history & analysis data? This action mimics a CASCADE referential delete.")) {
    db.tables.prompts = db.tables.prompts.filter(p => p.prompt_id !== promptId);
    db.tables.prompt_history = db.tables.prompt_history.filter(h => h.prompt_id !== promptId);
    db.tables.ai_analysis = db.tables.ai_analysis.filter(a => a.prompt_id !== promptId);
    db.tables.favorites = db.tables.favorites.filter(f => f.prompt_id !== promptId);

    db.save();

    const token = localStorage.getItem('token');
    if (token) {
      fetch(`/api/prompts/${promptId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => console.error('Delete sync failed:', err.message));
    }

    renderDashboard();
  }
}

// ============================================================================
// 6. RENDERING: AI DIAGNOSTICS WORKSPACE
// ============================================================================

async function renderDiagnostics() {
    // Clear textarea or load active editing prompt
  const titleInput = document.getElementById('diag-title');
  const catSelect = document.getElementById('diag-category');
  const textInput = document.getElementById('diag-text');
  
  // Populate category select
  catSelect.innerHTML = '';

try {

    const response = await fetch(
        '/api/categories'
    );

    const categories = await response.json();

    categories.forEach(c => {

        const opt = document.createElement('option');

        opt.value = c.id;
        opt.innerText = c.name;

        catSelect.appendChild(opt);
    });

} catch (err) {
    console.error(err);
}

  if (state.editingPrompt) {
    titleInput.value = state.editingPrompt.title;
    catSelect.value = state.editingPrompt.category_id;
    textInput.value = state.editingPrompt.current_prompt_text;
    
    // Execute heuristics for loaded prompt
    runLiveAnalysis(state.editingPrompt.current_prompt_text);
    
    // Set title
    document.getElementById('diagnostics-workspace-title').innerText = "AI Diagnostics Workspace - Editing Prompt";
  } else {
    titleInput.value = '';
    catSelect.value = 1;
    textInput.value = '';
    
    // Reset gauges
    setGaugeValue('gauge-clarity', 0, 'clarity');
    setGaugeValue('gauge-grammar', 0, 'grammar');
    setGaugeValue('gauge-optimization', 0, 'optimization');
    
    document.getElementById('overall-progress-bar').style.width = `0%`;
    document.getElementById('overall-score-fraction').innerText = `0/100`;
    document.getElementById('overall-score-pct').innerText = `0%`;
    
    // Report text default
    document.getElementById('report-clarity').innerHTML = '<span class="block text-slate-400 mb-1 font-semibold">CLARITY</span>Write your prompt above and click Analyze to see clarity feedback.';
    document.getElementById('report-grammar').innerHTML = '<span class="block text-slate-400 mb-1 font-semibold">GRAMMAR</span>Grammar and structure analysis will appear here after evaluation.';
    document.getElementById('report-optimization').innerHTML = '<span class="block text-slate-400 mb-1 font-semibold">OPTIMIZATION</span>Get tips on how to make your prompt more effective for AI models.';
    
    document.getElementById('diagnostics-workspace-title').innerText = "AI Diagnostics Workspace";
  }
  
  updateCharCount();
}

function updateCharCount() {
  const val = document.getElementById('diag-text').value;
  document.getElementById('char-counter').innerText = `${val.length} / 4000 characters`;
}

function setGaugeValue(gaugeId, score, type) {
    const circle = document.getElementById(`${gaugeId}-value`);
    const text = document.getElementById(`${gaugeId}-text`);

    if (!circle || !text) return;

    if (!circle.getAttribute('r')) {
        text.innerText = `${score}%`;
        return;
    }

    const radius = parseFloat(circle.getAttribute('r'));
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset =
        circumference - (score / 100) * circumference;

    text.innerText = `${score}%`;

    let strokeColor = '#EF4444';

    if (score > 75)
        strokeColor = '#10B981';
    else if (score >= 50)
        strokeColor = '#F59E0B';

    circle.style.stroke = strokeColor;
}

  
  


function runLiveAnalysis(text) {
  const analysis = analyzePromptText(text);
  
  // Set gauges
  setGaugeValue('gauge-clarity', analysis.clarity, 'clarity');
  setGaugeValue('gauge-grammar', analysis.grammar, 'grammar');
  setGaugeValue('gauge-optimization', analysis.optimization, 'optimization');

  // Overall prompt score
  const overall = Math.round((analysis.clarity + analysis.grammar + analysis.optimization) / 3);
  document.getElementById('overall-progress-bar').style.width = `${overall}%`;
  document.getElementById('overall-score-fraction').innerText = `${overall}/100`;
  document.getElementById('overall-score-pct').innerText = `${overall}%`;

  // Semantic progress bar color
  const pb = document.getElementById('overall-progress-bar');
  pb.className = 'h-2 rounded-full transition-all duration-500 ';
  if (overall > 75) pb.className += 'bg-[#10B981]';
  else if (overall >= 50) pb.className += 'bg-[#F59E0B]';
  else pb.className += 'bg-[#EF4444]';

  // Set checklists
  document.getElementById('check-ready').innerHTML = overall > 75 
    ? '✓ Ready for AI Generation' 
    : '✗ Insufficient Telemetry Metrics';
  document.getElementById('check-quality').innerHTML = overall > 85 
    ? '✓ High Quality Prompt' 
    : '✗ Needs Performance Tuning';
  document.getElementById('check-improvements').innerHTML = overall < 90 
    ? '⚠ Minor Improvement Suggested' 
    : '✓ Optimization Complete';

  // Report recommendations
  document.getElementById('report-clarity').innerHTML = `<span class="block text-slate-400 mb-1 font-semibold">CLARITY</span>${analysis.suggestions.clarity}`;
  document.getElementById('report-grammar').innerHTML = `<span class="block text-slate-400 mb-1 font-semibold">GRAMMAR</span>${analysis.suggestions.grammar}`;
  document.getElementById('report-optimization').innerHTML = `<span class="block text-slate-400 mb-1 font-semibold">OPTIMIZATION</span>${analysis.suggestions.optimization}`;

  return analysis;
}

async function clickAnalyze() {
  const text = document.getElementById('diag-text').value;
  if (!text.trim()) {
    alert("Please enter prompt text to analyze.");
    return;
  }

  const token = localStorage.getItem('token');
  if (token) {
    try {
      const btn = document.querySelector('button[onclick="clickAnalyze()"]');
      if (btn) { btn.disabled = true; btn.innerText = 'Analyzing with DeepSeek...'; }

      const response = await fetch('/api/prompts/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ prompt_text: text })
      });
      const data = await response.json();
      if (btn) { btn.disabled = false; btn.innerText = 'Analyze Prompt'; }

      if (data.success) {
        const a = data.analysis;
        setGaugeValue('gauge-clarity', a.clarity_score, 'clarity');
        setGaugeValue('gauge-grammar', a.grammar_score, 'grammar');
        setGaugeValue('gauge-optimization', a.optimization_score, 'optimization');
        const overall = Math.round((a.clarity_score + a.grammar_score + a.optimization_score) / 3);
        document.getElementById('overall-progress-bar').style.width = `${overall}%`;
        document.getElementById('overall-score-fraction').innerText = `${overall}/100`;
        document.getElementById('overall-score-pct').innerText = `${overall}%`;
        const pb = document.getElementById('overall-progress-bar');
        pb.className = 'h-2 rounded-full transition-all duration-500 ';
        pb.className += overall > 75 ? 'bg-[#10B981]' : overall >= 50 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]';
        document.getElementById('report-clarity').innerHTML = `<span class="block text-slate-400 mb-1 font-semibold">CLARITY</span>${a.clarity_suggestions || 'Good clarity and specificity.'}`;
        document.getElementById('report-grammar').innerHTML = `<span class="block text-slate-400 mb-1 font-semibold">GRAMMAR</span>${a.grammar_suggestions || 'Clean grammar and structure.'}`;
        document.getElementById('report-optimization').innerHTML = `<span class="block text-slate-400 mb-1 font-semibold">OPTIMIZATION</span>${a.optimization_suggestions || 'Well-optimized for AI models.'}`;
        document.getElementById('check-ready').innerHTML = overall > 75 ? '✓ Ready for AI Generation' : '✗ Insufficient Telemetry Metrics';
        document.getElementById('check-quality').innerHTML = overall > 85 ? '✓ High Quality Prompt' : '✗ Needs Performance Tuning';
        document.getElementById('check-improvements').innerHTML = overall < 90 ? '⚠ Minor Improvement Suggested' : '✓ Optimization Complete';
        return;
      }
    } catch (err) {
      const btn = document.querySelector('button[onclick="clickAnalyze()"]');
      if (btn) { btn.disabled = false; btn.innerText = 'Analyze Prompt'; }
      console.error('DeepSeek API failed, using local analysis:', err.message);
    }
  }
  runLiveAnalysis(text);
}

function clickClear() {
  document.getElementById('diag-text').value = '';
  document.getElementById('diag-title').value = '';
  state.editingPrompt = null;
  renderDiagnostics();
}

async function handleSavePrompt() {
  const title = document.getElementById('diag-title').value.trim();
  const categoryId = parseInt(document.getElementById('diag-category').value, 10);
  const text = document.getElementById('diag-text').value.trim();

  if (!title || !text) {
    alert("Please fill in both prompt title and text body before saving.");
    return;
  }

  const categorySelect = document.getElementById('diag-category');
  const categoryName = categorySelect.options[categorySelect.selectedIndex]?.text || 'General';

  const analysis = runLiveAnalysis(text);
  const userId = state.currentUser.user_id;

  if (state.editingPrompt) {
    const promptId = state.editingPrompt.prompt_id;
    const promptIdx = db.tables.prompts.findIndex(p => p.prompt_id === promptId);

    if (promptIdx !== -1) {
      const oldText = db.tables.prompts[promptIdx].current_prompt_text;

      db.tables.prompts[promptIdx].title = title;
      db.tables.prompts[promptIdx].category_id = categoryId;
      db.tables.prompts[promptIdx].current_prompt_text = text;
      db.tables.prompts[promptIdx].updated_at = new Date().toISOString();

      if (oldText !== text) {
        const historyRows = db.tables.prompt_history.filter(h => h.prompt_id === promptId);
        const nextVersion = Math.max(...historyRows.map(h => h.version_number), 0) + 1;

        db.tables.prompt_history.push({
          history_id: generateUUID(),
          prompt_id: promptId,
          historical_text_state: text,
          version_number: nextVersion,
          created_at: new Date().toISOString()
        });
      }

      const analysisIdx = db.tables.ai_analysis.findIndex(a => a.prompt_id === promptId);
      const newAnalysis = {
        analysis_id: analysisIdx !== -1 ? db.tables.ai_analysis[analysisIdx].analysis_id : generateUUID(),
        prompt_id: promptId,
        clarity_score: analysis.clarity,
        grammar_score: analysis.grammar,
        optimization_score: analysis.optimization,
        suggestions_payload: analysis.suggestions,
        analyzed_at: new Date().toISOString()
      };

      if (analysisIdx !== -1) {
        db.tables.ai_analysis[analysisIdx] = newAnalysis;
      } else {
        db.tables.ai_analysis.push(newAnalysis);
      }
    }
  } else {
    const promptId = generateUUID();

    db.tables.prompts.push({
      prompt_id: promptId,
      user_id: userId,
      category_id: categoryId,
      title: title,
      current_prompt_text: text,
      is_favorite: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    db.tables.prompt_history.push({
      history_id: generateUUID(),
      prompt_id: promptId,
      historical_text_state: text,
      version_number: 1,
      created_at: new Date().toISOString()
    });

    db.tables.ai_analysis.push({
      analysis_id: generateUUID(),
      prompt_id: promptId,
      clarity_score: analysis.clarity,
      grammar_score: analysis.grammar,
      optimization_score: analysis.optimization,
      suggestions_payload: analysis.suggestions,
      analyzed_at: new Date().toISOString()
    });
  }

  db.save();

  const token = localStorage.getItem('token');
  if (token) {
    try {
      await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          id: state.editingPrompt ? state.editingPrompt.prompt_id : undefined,
          title, category: categoryName, prompt_text: text, context: ''
        })
      });
    } catch (err) {
      console.error('Failed to sync prompt to server:', err.message);
    }
  }

  state.editingPrompt = null;
  alert("Prompt analyzed and saved successfully!");
  switchTab('dashboard');
}

function loadPromptForEdit(promptId) {
  const prompt = db.tables.prompts.find(p => p.prompt_id === promptId);
  if (prompt) {
    state.editingPrompt = prompt;
    switchTab('diagnostics');
  }
}

function clickEnhance() {
  const textInput = document.getElementById('diag-text');
  let val = textInput.value.trim();
  
  if (!val) {
    alert("Please enter prompt text to enhance.");
    return;
  }

  // AI Enhancement mockup: expands the prompt text with standard guidelines
  let enhanced = val;
  if (!/\b(act as|you are)\b/i.test(val)) {
    enhanced = "Act as an expert assistant. " + enhanced;
  }
  if (!/\b(format|markdown|bullet)\b/i.test(val)) {
    enhanced += "\n\nFormat your response clearly using bullet points and Markdown formatting.";
  }
  if (!/([\[{][a-zA-Z0-9_\s-]+[\]}])/.test(val)) {
    enhanced += "\n\nProvide the analysis context regarding: [ContextParameters]";
  }
  if (!/\b(do not|avoid)\b/i.test(val)) {
    enhanced += "\n\nConstraint: Do not include fluff, conversational filler, or assumptions.";
  }

  textInput.value = enhanced;
  updateCharCount();
  runLiveAnalysis(enhanced);
  alert("AI Enhanced prompt text with optimal guidelines!");
}

function clickExport() {
  const text = document.getElementById('diag-text').value;
  if (!text) {
    alert("Nothing to export. Compose a prompt first.");
    return;
  }
  
  // Download file logic
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PromptPilot_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// 7. RENDERING: VERSION CONTROL TIMELINE
// ============================================================================

function viewPromptTimeline(promptId) {
  state.activePromptId = promptId;
  
  const prompt = db.tables.prompts.find(p => p.prompt_id === promptId);
  if (!prompt) return;

  // Switch tab visually but don't clear sidebar selection
  document.getElementById('view-dashboard').classList.add('hidden');
  document.getElementById('view-diagnostics').classList.add('hidden');
  document.getElementById('view-sqlconsole').classList.add('hidden');
  document.getElementById('view-timeline').classList.remove('hidden');

  document.getElementById('timeline-prompt-title').innerText = prompt.title;

  const listContainer = document.getElementById('timeline-history-list');
  listContainer.innerHTML = '';

  // Get chronological history (SELECT ordered by version_number ASC) (FR5)
  const history = db.tables.prompt_history
    .filter(h => h.prompt_id === promptId)
    .sort((a, b) => a.version_number - b.version_number);

  history.forEach((h, idx) => {
    const isEven = idx % 2 === 0;
    const dateFormatted = new Date(h.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const sideClass = isEven ? 'timeline-left' : 'timeline-right';
    const textSnippet = h.historical_text_state.length > 150 
      ? h.historical_text_state.substring(0, 150) + '...'
      : h.historical_text_state;

    const div = document.createElement('div');
    div.className = 'w-full clear-both mb-8 relative';
    div.innerHTML = `
      <div class="timeline-dot" style="top: 24px;"></div>
      <div class="timeline-card ${sideClass}">
        <div class="bg-[#25235c] border border-[#3b378c] p-5 rounded-lg shadow-xl">
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-semibold text-indigo-400">VERSION #${h.version_number}</span>
            <span class="text-xs text-slate-400">${dateFormatted}</span>
          </div>
          <p class="text-slate-300 text-sm mb-4 italic">"${textSnippet}"</p>
          <div class="flex justify-end gap-2">
            <button onclick="openReadMoreModal('${h.history_id}')" class="text-xs text-indigo-400 hover:text-white flex items-center gap-1 font-semibold transition">Read More →</button>
            <button onclick="restorePromptVersion('${h.history_id}')" class="bg-indigo-900 border border-indigo-500/50 hover:bg-indigo-800 text-white text-xxs px-2 py-0.5 rounded transition">Restore Version</button>
          </div>
        </div>
      </div>
    `;
    listContainer.appendChild(div);
  });
}

function openReadMoreModal(historyId) {
  const hist = db.tables.prompt_history.find(h => h.history_id === historyId);
  if (!hist) return;

  const prompt = db.tables.prompts.find(p => p.prompt_id === hist.prompt_id);
  
  document.getElementById('modal-prompt-name').innerText = prompt ? prompt.title : 'Prompt Snapshot';
  document.getElementById('modal-version-details').innerText = `Version #${hist.version_number} • Saved on ${new Date(hist.created_at).toLocaleString()}`;
  document.getElementById('modal-full-text').innerText = hist.historical_text_state;

  document.getElementById('readmore-modal').classList.remove('hidden');
  document.getElementById('readmore-modal').classList.add('flex');
}

function closeReadMoreModal() {
  document.getElementById('readmore-modal').classList.add('hidden');
  document.getElementById('readmore-modal').classList.remove('flex');
}

function restorePromptVersion(historyId) {
  const hist = db.tables.prompt_history.find(h => h.history_id === historyId);
  if (!hist) return;

  if (confirm(`Do you want to restore the prompt text to Version #${hist.version_number}? This will update the current prompt text and trigger a new analysis, saving a new snapshot.`)) {
    const promptIdx = db.tables.prompts.findIndex(p => p.prompt_id === hist.prompt_id);
    if (promptIdx !== -1) {
      const text = hist.historical_text_state;

      // Update primary text
      db.tables.prompts[promptIdx].current_prompt_text = text;
      db.tables.prompts[promptIdx].updated_at = new Date().toISOString();

      // Append new ledger row
      const historyRows = db.tables.prompt_history.filter(h => h.prompt_id === hist.prompt_id);
      const nextVersion = Math.max(...historyRows.map(h => h.version_number), 0) + 1;

      db.tables.prompt_history.push({
        history_id: generateUUID(),
        prompt_id: hist.prompt_id,
        historical_text_state: text,
        version_number: nextVersion,
        created_at: new Date().toISOString()
      });

      // Analyze again
      const analysis = analyzePromptText(text);
      const analysisIdx = db.tables.ai_analysis.findIndex(a => a.prompt_id === hist.prompt_id);
      const newAnalysis = {
        analysis_id: analysisIdx !== -1 ? db.tables.ai_analysis[analysisIdx].analysis_id : generateUUID(),
        prompt_id: hist.prompt_id,
        clarity_score: analysis.clarity,
        grammar_score: analysis.grammar,
        optimization_score: analysis.optimization,
        suggestions_payload: analysis.suggestions,
        analyzed_at: new Date().toISOString()
      };

      if (analysisIdx !== -1) {
        db.tables.ai_analysis[analysisIdx] = newAnalysis;
      } else {
        db.tables.ai_analysis.push(newAnalysis);
      }

      db.save();
      alert(`Successfully restored to version #${hist.version_number}! Active version is now version #${nextVersion}.`);
      viewPromptTimeline(hist.prompt_id);
    }
  }
}

// ============================================================================
// TEMPLATES VIEW
// ============================================================================
async function renderTemplates() {
    const container = document.getElementById('templates-container');
    container.innerHTML = '<div class="col-span-full text-center py-12 text-slate-400">Loading templates...</div>';

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/templates', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!data.success) return;

        container.innerHTML = '';
        const tagColors = {
            Marketing: 'tag-marketing', Coding: 'tag-coding', Education: 'tag-education',
            Career: 'tag-career', Creative: 'tag-creative'
        };

        data.templates.forEach(t => {
            const card = document.createElement('div');
            card.className = 'bg-[#25235c] border border-[#3b378c] rounded-xl p-6 shadow-xl flex flex-col justify-between hover:border-indigo-500/40 transition';
            card.innerHTML = `
                <div>
                    <span class="inline-block px-3 py-1 text-xs font-semibold rounded-md mb-3 ${tagColors[t.category] || 'tag-marketing'}">${t.category}</span>
                    <h3 class="font-bold text-white text-lg mb-2">${t.title}</h3>
                    <p class="text-slate-400 text-sm mb-4">${t.description}</p>
                    <div class="bg-[#0A0A1F] border border-[#3b378c] rounded-lg p-3 text-xs text-slate-500 font-mono mb-4 truncate">${t.prompt_text.substring(0, 120)}...</div>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-500">Used ${t.usage_count} times</span>
                    <button onclick="cloneTemplate(${t.id})" class="bg-indigo-900/40 border border-indigo-500/50 hover:bg-indigo-800 text-indigo-200 text-xs font-bold px-4 py-2 rounded-lg transition">Use Template</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        container.innerHTML = '<div class="col-span-full text-center py-12 text-red-400">Failed to load templates</div>';
    }
}

async function cloneTemplate(templateId) {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const response = await fetch(`/api/templates/${templateId}/clone`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            const prompt = data.prompt;
            const cats = db.tables.categories;
            const cat = cats.find(c => c.category_name === prompt.category);
            const categoryId = cat ? cat.category_id : 1;

            state.editingPrompt = {
                prompt_id: prompt.id,
                title: prompt.title.replace(' (cloned)', ''),
                category_id: categoryId,
                current_prompt_text: prompt.prompt_text,
                user_id: state.currentUser.user_id
            };

            navigateTo('/prompts');
        }
    } catch (err) {
        alert('Failed to clone template');
    }
}

// ============================================================================
// SETTINGS VIEW
// ============================================================================
async function renderSettings() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const response = await fetch('/api/settings/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('settings-name').value = data.profile.full_name || '';
            document.getElementById('settings-email').value = data.profile.email || '';
            document.getElementById('settings-bio').value = data.profile.bio || '';
        }
    } catch (err) {
        console.error('Failed to load profile:', err);
    }
}

async function saveProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const full_name = document.getElementById('settings-name').value.trim();
    const bio = document.getElementById('settings-bio').value.trim();

    try {
        const response = await fetch('/api/settings/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ full_name, bio })
        });
        const data = await response.json();
        const msg = document.getElementById('settings-msg');
        msg.classList.remove('hidden');
        if (data.success) {
            msg.className = 'text-xs mt-2 text-green-400';
            msg.innerText = 'Profile updated successfully!';
            state.currentUser.username = full_name;
            sessionStorage.setItem('promptpilot_user', JSON.stringify(state.currentUser));
            document.getElementById('greet-username').innerText = full_name;
        } else {
            msg.className = 'text-xs mt-2 text-red-400';
            msg.innerText = data.message || 'Update failed';
        }
    } catch (err) {
        console.error(err);
    }
}

async function changePassword() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const current_password = document.getElementById('settings-current-pw').value;
    const new_password = document.getElementById('settings-new-pw').value;

    if (!current_password || !new_password) {
        alert('Please fill in both password fields');
        return;
    }

    try {
        const response = await fetch('/api/settings/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ current_password, new_password })
        });
        const data = await response.json();
        const msg = document.getElementById('settings-msg');
        msg.classList.remove('hidden');
        if (data.success) {
            msg.className = 'text-xs mt-2 text-green-400';
            msg.innerText = 'Password updated!';
            document.getElementById('settings-current-pw').value = '';
            document.getElementById('settings-new-pw').value = '';
        } else {
            msg.className = 'text-xs mt-2 text-red-400';
            msg.innerText = data.message || 'Password update failed';
        }
    } catch (err) {
        console.error(err);
    }
}

// ============================================================================
// WINDOW LOAD INITIALIZATION
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
    initSession();
});

window.addEventListener('popstate', () => {
    handleRoute();
});

function handleLogout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('promptpilot_user');
    state.currentUser = null;
    window.location.href = '/';
}