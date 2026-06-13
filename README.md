# AI Capstone Shery

A capstone project built at Sheryians Coding School. A full-stack web application that allows users to generate complete, styled single-page websites from natural-language prompts using a large language model. Generated pages are rendered live in a sandboxed preview, support section-targeted editing via click, and are persisted per user project.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Database Setup](#database-setup)
- [API Reference](#api-reference)
- [Contributors](#contributors)

---

## Overview

Users authenticate with an email/password or Google OAuth, create projects, and describe a website in plain text. The backend calls Amazon Bedrock (Nova Pro model) and streams the HTML response token-by-token back to the client over Server-Sent Events (SSE). The streamed output is rendered progressively in a live preview pane powered by WebContainer. Users can click any section of the rendered page to select it and issue targeted edit instructions, causing only that section to be regenerated while the rest of the page is preserved.

All projects and prompt history are persisted in a Supabase PostgreSQL database with Row Level Security policies enforcing per-user data isolation.

---

## Architecture

```
Client (React + Vite)          Server (Express + TypeScript)       External Services
        |                               |                                |
        |  POST /api/auth/signup        |                                |
        |------------------------------>|   Supabase Admin SDK           |
        |                               |------------------------------->| Supabase Auth
        |                               |<-------------------------------|
        |<------------------------------|                                |
        |                               |                                |
        |  POST /api/generate (SSE)     |                                |
        |------------------------------>|   Bedrock InvokeModelStream    |
        |    event: chunk { text }      |------------------------------->| AWS Bedrock
        |<------------------------------|<-------------------------------| (Nova Pro)
        |    event: done  { html }      |                                |
        |<------------------------------|                                |
        |                               |   Supabase (generations table) |
        |                               |------------------------------->| Supabase DB
        |                               |                                |
        |  WebContainer iframe          |                                |
        |  renders HTML locally         |                                |
```

The client never communicates with AWS or Supabase directly for generation. All LLM calls are proxied through the Express backend, which validates the JWT, enforces rate limits, and sanitizes input before calling Bedrock.

---

## Tech Stack

**Client**
- React 18 with TypeScript (strict mode)
- Vite build tool
- Tailwind CSS
- Framer Motion
- Monaco Editor
- WebContainer API (StackBlitz)
- Supabase JS SDK (session management only)

**Server**
- Node.js with Express
- TypeScript (strict mode)
- Supabase Admin SDK (auth and database)
- AWS SDK v3 (`@aws-sdk/client-bedrock-runtime`)
- `xss` library for input sanitization

**Database**
- Supabase PostgreSQL
- Row Level Security on all tables
- Tables: `projects`, `generations` (see `supabase/migrations/`)

**LLM**
- Amazon Bedrock, model: `amazon.nova-pro-v1:0`
- Region: `ap-southeast-2`
- Streaming via `InvokeModelWithResponseStreamCommand`

---

## Project Structure

```
capstone-shery/
├── client/                        # React frontend
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/              # Authentication context, hooks, API calls
│   │   │   ├── dashboard/         # Project list, create/rename/delete modals
│   │   │   ├── editor/            # EditorLayout, streaming view, Monaco editor
│   │   │   └── preview/           # WebContainer iframe, section click, viewport toggle
│   │   └── lib/                   # Supabase browser client
│   └── .env.example
│
├── server/                        # Express backend
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/              # Signup, login, logout, Google OAuth, token refresh
│   │   │   ├── generate/          # LLM streaming route, Bedrock service, system prompt
│   │   │   ├── projects/          # CRUD for user projects
│   │   │   └── export/            # ZIP export (pending implementation)
│   │   ├── middleware/
│   │   │   ├── authGuard.ts       # JWT validation via Supabase Admin
│   │   │   ├── rateLimiter.ts     # Per-user in-memory rate limiter (10 req/min)
│   │   │   ├── sanitise.ts        # XSS sanitization for request body/params/query
│   │   │   └── errorHandler.ts    # Centralized error handler, client-safe messages
│   │   └── lib/
│   │       ├── bedrock.ts         # AWS BedrockRuntimeClient singleton
│   │       └── supabase.ts        # Supabase Admin client (server-side only)
│   └── package.json
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Projects + generations tables with RLS
│
└── .env                           # Root environment file (see Environment Variables)
```

---

## Prerequisites

- Node.js 18 or later
- npm 9 or later
- A [Supabase](https://supabase.com) project (free tier works)
- AWS account with Bedrock access enabled for `amazon.nova-pro-v1:0` in `ap-southeast-2`
- AWS IAM user credentials with `AmazonBedrockFullAccess` or a scoped Bedrock invoke policy

---

## Environment Variables

Create a `.env` file in the project root. The server reads from this file directly. The client reads `VITE_*` prefixed variables via Vite.

```env
# Server
PORT=5000
NODE_ENV=development

# Supabase (server-side — service role key bypasses RLS; never expose to client)
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Client (Vite exposes VITE_* to the browser)
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Rate limiting (defaults shown)
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000

# AWS Bedrock
AWS_REGION=ap-southeast-2
MODEL_ID=amazon.nova-pro-v1:0
AWS_ACCESS_KEY_ID=<your-aws-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>
```

> The `.env` file is excluded from version control via `.gitignore`. Never commit credentials to the repository.

---

## Installation

Install dependencies for both the client and server separately.

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

## Running Locally

Run the server and client in separate terminal windows.

**Terminal 1 — Server**
```bash
cd server
npm run dev
```

The server starts on `http://localhost:5000`.

**Terminal 2 — Client**
```bash
cd client
npm run dev
```

The client starts on `http://localhost:3000`. Open this URL in a browser.

---

## Database Setup

The database schema is defined in `supabase/migrations/001_initial_schema.sql`. This migration must be applied manually to your Supabase project before the application can write or read data.

**Steps:**

1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Open `supabase/migrations/001_initial_schema.sql` from this repository
4. Paste the full contents into the editor and click **Run**

The migration creates:
- `public.projects` — stores each user's projects with name, generated HTML, and timestamps
- `public.generations` — append-only history of every LLM generation per project
- Row Level Security policies ensuring users can only access their own records
- An `updated_at` trigger on `projects` for automatic timestamp management

---

## API Reference

All endpoints are prefixed with `/api`. Protected endpoints require a `Bearer <token>` `Authorization` header containing a valid Supabase JWT.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Create a new account with email and password |
| POST | `/api/auth/login` | No | Log in with email and password, returns access and refresh tokens |
| POST | `/api/auth/logout` | Yes | Invalidate the current session server-side |
| POST | `/api/auth/refresh` | No | Exchange a refresh token for a new access token |
| GET | `/api/auth/google` | No | Get the Google OAuth redirect URL |
| GET | `/api/auth/me` | Yes | Return the currently authenticated user's profile |

### Projects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects` | Yes | List all projects for the authenticated user |
| GET | `/api/projects/:id` | Yes | Get a single project by ID |
| POST | `/api/projects` | Yes | Create a new project |
| PUT | `/api/projects/:id` | Yes | Update a project's name or current HTML |
| DELETE | `/api/projects/:id` | Yes | Delete a project permanently |

### Generation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/generate` | Yes | Stream an LLM-generated HTML page via SSE |

**Request body for `/api/generate`:**
```json
{
  "prompt": "A SaaS landing page for a project management tool",
  "projectId": "uuid",
  "sectionId": "hero",
  "currentHtml": "<full current page html>"
}
```

`sectionId` and `currentHtml` are optional. When provided, only the specified section is regenerated and merged back into the full page.

**SSE events returned:**
| Event | Payload | Description |
|-------|---------|-------------|
| `chunk` | `{ "text": "..." }` | Incremental token from the LLM |
| `done` | `{ "html": "..." }` | Full final HTML on completion |
| `error` | `{ "message": "..." }` | Generation failed |
| `retry` | `{ "attempt": 1, "maxRetries": 2 }` | Transient failure, retrying |

---


---

