# Capstone-Shery

AI-powered website builder. Describe what you want, get a live website — streamed in real time.

Built as a capstone project at **Sheryians Coding School**.

---

## How It Works

1. Sign up and create a project
2. Type what you want — *"A SaaS landing page for a fitness app"*
3. Watch the website generate live, token by token
4. Click any section in the preview to edit just that part
5. Export your site as a standalone HTML file

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | Express, TypeScript |
| LLM | AWS Bedrock (Amazon Nova Pro) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google OAuth) |

---

## Project Structure

```
capstone-shery/
├── client/                   # React frontend
│   └── src/
│       ├── features/
│       │   ├── auth/         # Login, signup, auth context
│       │   ├── editor/       # Prompt panel, streaming, code view
│       │   ├── preview/      # Sandboxed iframe, section click
│       │   ├── dashboard/    # Project list
│       │   └── account/      # Profile, logout
│       ├── pages/            # Route-level components
│       └── lib/              # Supabase client, utils
│
├── server/                   # Express API
│   └── src/
│       ├── features/
│       │   ├── auth/         # Auth routes
│       │   ├── projects/     # CRUD routes
│       │   └── generate/     # LLM streaming + system prompts
│       ├── middleware/       # Auth guard, rate limiter, sanitise, error handler
│       └── lib/              # Bedrock client, Supabase admin, Tailwind compiler
│
└── supabase/
    └── migrations/           # SQL schema + RLS policies
```

---

## Local Setup

**Prerequisites:** Node.js 18+, npm, AWS account with Bedrock access, Supabase project.

```bash
# 1. Clone
git clone https://github.com/<your-org>/capstone-shery.git
cd capstone-shery

# 2. Set up environment
cp .env.example .env
# Fill in your keys — see .env.example for what's needed

# 3. Run database migration
# Supabase Dashboard → SQL Editor → paste supabase/migrations/001_initial_schema.sql

# 4. Start backend(Node)
cd server
npm install
npm run dev          # → http://localhost:5000

# 5. Start frontend (new terminal)
cd client
npm install
npm run dev          # → http://localhost:5173

# 6. Start backend(Python)
cd server
npm install
.venv\Scripts\activate; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
---

## Environment Variables

See [`.env.example`](.env.example) for the full list. Key ones:

| Variable | Where | Purpose |
|----------|-------|---------|
| `SUPABASE_URL` | Both | Supabase project URL |
| `SUPABASE_ANON_KEY` | Both | Public key for auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin access (never expose to client) |
| `AWS_ACCESS_KEY_ID` | Server only | Bedrock credentials |
| `AWS_SECRET_ACCESS_KEY` | Server only | Bedrock credentials |
| `VITE_API_URL` | Client | Backend API URL |

---

## Key Features

- **Streaming generation** — SSE-based, tokens render as they arrive
- **Section editing** — Click a section, describe changes, only that part regenerates
- **Sandboxed preview** — `iframe` with `sandbox="allow-scripts"`, no parent DOM access
- **Self-healing output** — LLM output is validated; errors trigger automatic correction
- **Undo / Redo** — Last 10 edits tracked per session
- **Viewport toggles** — Preview at mobile, tablet, and desktop widths
- **Rate limiting** — 10 generations per user per minute
- **Auto retry** — Transient LLM failures retried with backoff

---

## Stack Choices

The SRS recommends Next.js, Claude, and Sandpack. We deviated in a few places:

- **Vite + React** instead of Next.js — no SSR needed, faster dev experience. Listed as acceptable in the SRS.
- **AWS Bedrock (Nova Pro)** instead of Claude — faculty provided AWS credits. Same streaming contract.

- **`<iframe srcdoc>`** instead of Sandpack — lighter bundle, stricter sandbox. Listed as acceptable in the SRS.

