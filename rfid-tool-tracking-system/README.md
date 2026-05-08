# RFID Tool Tracking System

A full-stack industrial tool management system that simulates RFID-based inventory tracking for warehouses and manufacturing environments.

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | `https://<your-railway-frontend>.up.railway.app` |
| API | `https://<your-railway-api>.up.railway.app/api` |

---

## Features

- **JWT Authentication** — register, login, protected routes
- **Tool Master (CRUD)** — create, read, update, delete tools with status tracking
- **Issue / Return Flow** — assign tools to operators with business logic validation
- **RFID Inventory Scan** — simulate scanning; detects correct, missing, and extra tools
- **Dashboard** — real-time stats, recent activity feed, category breakdown
- **Transaction History** — full audit log of all issue/return events

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query |
| Backend | Node.js 24, Express 5, TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Monorepo | pnpm workspaces |

---

## Project Structure

```
rfid-tool-tracking-system/
│
├── artifacts/
│   ├── api-server/          # Express backend
│   │   └── src/
│   │       ├── routes/      # auth, tools, transactions, scan, stats
│   │       ├── middlewares/ # JWT auth middleware
│   │       └── lib/         # logger, jwt utils
│   │
│   └── rfid-tracker/        # React + Vite frontend
│       └── src/
│           ├── pages/       # login, register, dashboard, tools, issue, return, scan, transactions
│           ├── components/  # layout, shadcn/ui components
│           └── hooks/       # use-auth (JWT context)
│
├── lib/
│   ├── api-spec/            # OpenAPI 3.1 spec (source of truth)
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod validation schemas
│   └── db/                  # Drizzle ORM schema + client
│
├── .env.example             # Required environment variables
├── railway.toml             # Railway deployment config
└── pnpm-workspace.yaml      # pnpm workspace definition
```

---

## API Endpoints

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | No | Register new user |
| `POST` | `/auth/login` | No | Login, returns JWT token |
| `GET` | `/auth/me` | Yes | Get current user |

**Register / Login body:**
```json
{ "name": "Admin User", "email": "admin@rfid.com", "password": "password123" }
```

**Response:**
```json
{ "token": "eyJ...", "user": { "id": 1, "name": "Admin User", "email": "admin@rfid.com" } }
```

### Tools

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/tools` | Yes | List all tools (filter: `?status=available&category=Power Tools`) |
| `POST` | `/tools` | Yes | Create a tool |
| `GET` | `/tools/:id` | Yes | Get a single tool |
| `PUT` | `/tools/:id` | Yes | Update a tool |
| `DELETE` | `/tools/:id` | Yes | Delete a tool |

**Tool statuses:** `available` · `issued` · `missing`

### Issue / Return

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/issue` | Yes | Issue a tool to a user |
| `POST` | `/return` | Yes | Return an issued tool |
| `GET` | `/transactions` | Yes | List all transactions |

**Issue body:**
```json
{ "toolId": "T001", "userId": 1 }
```
- Returns `400` if tool is not `available`
- Returns `400` if tool is already issued (status is `issued`)

**Return body:**
```json
{ "toolId": "T001" }
```
- Returns `400` if tool is not currently `issued`

### Inventory Scan

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/scan` | Yes | Simulate RFID scan |

**Request:**
```json
{ "scannedTools": ["T001", "T002", "T004"] }
```

**Response:**
```json
{
  "correctTools": ["T001", "T002"],
  "missingTools": ["T003", "T005"],
  "extraTools": ["T004"],
  "summary": { "total": 5, "correct": 2, "missing": 2, "extra": 1 }
}
```

### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/stats` | Yes | Dashboard statistics |

**Response:**
```json
{
  "totalTools": 8,
  "availableTools": 6,
  "issuedTools": 2,
  "missingTools": 0,
  "totalTransactions": 12,
  "recentTransactions": [...],
  "categoryBreakdown": [{ "category": "Power Tools", "count": 2 }]
}
```

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,   -- bcrypt hashed
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tools
CREATE TABLE tools (
  id          SERIAL PRIMARY KEY,
  tool_id     TEXT NOT NULL UNIQUE,    -- RFID tag ID, e.g. "T001"
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'available',  -- available | issued | missing
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id           SERIAL PRIMARY KEY,
  tool_id      INTEGER REFERENCES tools(id),
  user_id      INTEGER REFERENCES users(id),
  action_type  TEXT NOT NULL,          -- issue | return
  issue_date   TIMESTAMPTZ DEFAULT NOW(),
  return_date  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Local Development Setup

### Prerequisites

- Node.js 20+ — [nodejs.org](https://nodejs.org)
- pnpm — `npm install -g pnpm`
- PostgreSQL — or use Railway/Supabase for a hosted DB

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/rfid-tool-tracking-system.git
cd rfid-tool-tracking-system

# 2. Copy environment file and fill in your values
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

# 3. Install all dependencies
pnpm install

# 4. Push database schema
pnpm --filter @workspace/db run push

# 5. Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# 6. In a second terminal, start the frontend (port 23643)
pnpm --filter @workspace/rfid-tracker run dev
```

Open [http://localhost:23643](http://localhost:23643)

**Default test credentials (after seeding):**
- Email: `admin@rfid.com` / Password: `password123`

---

## Deployment — Railway

Railway is the recommended platform. Deploy the backend (Node.js) and frontend (static) as two separate services from the same GitHub repository.

### Step 1 — Push to GitHub

```bash
# In your terminal (Windows: Git Bash or PowerShell with Git)

git init
git add .
git commit -m "Initial production-ready commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/<your-username>/rfid-tool-tracking-system.git
git branch -M main
git push -u origin main
```

### Step 2 — Create Railway Project

1. Go to [railway.app](https://railway.app) and log in with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select your `rfid-tool-tracking-system` repository

### Step 3 — Deploy the API Backend

In your Railway project:

1. Click **Add Service → GitHub Repo** (same repo again)
2. Set the following in service settings:

| Setting | Value |
|---------|-------|
| **Root Directory** | `artifacts/api-server` |
| **Build Command** | `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build` |
| **Start Command** | `node --enable-source-maps ./dist/index.mjs` |

3. Click **Variables** and add:

```
DATABASE_URL     = (paste your PostgreSQL URL — see Step 5)
JWT_SECRET       = (generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
NODE_ENV         = production
PORT             = 8080
```

4. Railway will build and deploy. Note the generated URL, e.g.:
   `https://rfid-api-production.up.railway.app`

### Step 4 — Deploy the Frontend

1. Add another service from the same repo
2. Settings:

| Setting | Value |
|---------|-------|
| **Root Directory** | `artifacts/rfid-tracker` |
| **Build Command** | `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @workspace/rfid-tracker run build` |
| **Start Command** | *(leave empty — Railway will auto-detect static output)* |
| **Output Directory** | `dist/public` |

3. Add variable:

```
VITE_API_URL = https://rfid-api-production.up.railway.app
```

4. Deploy and Railway generates a URL like:
   `https://rfid-tracker-production.up.railway.app`

### Step 5 — PostgreSQL Database

1. In your Railway project, click **Add Service → Database → PostgreSQL**
2. Railway provisions a managed PostgreSQL instance
3. Click the database service → **Variables** → copy `DATABASE_URL`
4. Paste it into the API backend service's `DATABASE_URL` variable
5. After first deploy, run the schema migration once via Railway's shell:

```bash
pnpm --filter @workspace/db run push
```

### Step 6 — Connect Frontend to Backend

Update the `VITE_API_URL` variable in the Railway frontend service to point to your API URL. The app reads this at build time — trigger a redeploy after changing it.

---

## Environment Variables Reference

### Backend (`artifacts/api-server`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `PORT` | No | Server port (Railway sets automatically) |
| `NODE_ENV` | No | `production` or `development` |

### Frontend (`artifacts/rfid-tracker`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend API base URL (defaults to same origin) |

---

## Test Cases

| Scenario | Expected Result |
|----------|-----------------|
| Issue same tool twice | `400` — "Tool T001 is not available (current status: issued)" |
| Return non-issued tool | `400` — "Tool T001 is not currently issued (status: available)" |
| Scan with missing tools | Missing tools appear in `missingTools[]` array |
| Scan with extra tools | Unknown IDs appear in `extraTools[]` array |
| Register duplicate email | `409` — "Email already registered" |
| Access protected route without token | `401` — "No token provided" |

---

## Troubleshooting

### `Cannot connect to database`
- Check `DATABASE_URL` is set correctly
- Ensure the PostgreSQL service is running in Railway
- Run `pnpm --filter @workspace/db run push` after first deploy

### `401 Unauthorized on all requests`
- The JWT token may have expired (7-day TTL) — log out and log back in
- Check `JWT_SECRET` is set in Railway environment variables

### `CORS errors in browser`
- Ensure `VITE_API_URL` in the frontend matches the exact Railway API URL
- The backend allows all origins in development; in production it allows the deployed frontend domain

### `Build fails on Railway`
- Make sure pnpm is available: add `RAILWAY_DOCKER_IMAGE=ghcr.io/railwayapp/nixpacks-node:latest`
- Check the build command includes `cd ../..` to reach the workspace root

### Frontend shows blank page after deploy
- Check that `VITE_API_URL` is set **before** building (it's baked in at build time)
- Verify the output directory is set to `dist/public`

---

## Assumptions & Limitations

**Assumptions:**
- Single-tenant — all authenticated users share the same tool inventory
- RFID simulation uses string IDs (e.g. T001) — no actual hardware integration
- Tool "missing" status must be set manually (no auto-detection from scans)
- JWT tokens expire after 7 days

**Limitations:**
- No role-based access control (all users have equal permissions)
- No real-time updates (polling only via TanStack Query)
- No file uploads or tool images
- No email verification or password reset flow

---

## License

MIT
