# ClientSphere CRM

A modern, full-stack Customer Relationship Management platform to manage clients, leads, tasks, and sales pipelines — built with React 19, Express, PostgreSQL, and Tailwind CSS 4.

![ClientSphere Dashboard](https://img.shields.io/badge/status-active-brightgreen) ![License](https://img.shields.io/badge/license-Apache--2.0-blue)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Tailwind CSS 4, Recharts, Framer Motion |
| Backend | Node.js, Express 4, TypeScript |
| Database | PostgreSQL (via `pg`) |
| Auth | JWT (localStorage token) + AuthContext |
| AI | Google Gemini API (`@google/genai`) |
| Build | Vite 6, esbuild, TypeScript |

---

## Features

- **Dashboard** — KPI summary cards (total clients, leads, tasks, revenue) with monthly revenue chart and lead conversion breakdown
- **Clients** — Full CRUD: create, search/filter by status, edit, delete. Statuses: Active / Inactive / Pending
- **Leads** — Lead tracking with scoring (1–100), source tagging, and status pipeline (New → Contacted → Qualified → Proposal → Nurturing → Unqualified)
- **Tasks** — Task management with priority levels (Low / Medium / High), due dates, and status tracking (Pending / In Progress / Completed)
- **Pipeline** — Kanban-style deal board across stages (New Lead → Contacted → Qualified → Proposal Sent → Won / Lost) with deal values
- **Auth** — JWT-based registration and login with protected routes
- **Responsive dark UI** throughout

---

## Project Structure

```
/
├── backend/
│   ├── server.ts          ← Express app entry point
│   ├── load-env.ts        ← dotenv loader
│   └── server/
│       └── routes/
│           └── api.ts     ← All API route definitions
├── frontend/
│   ├── src/
│   │   ├── pages/         ← DashboardPage, ClientsPage, LeadsPage, TasksPage, PipelinePage
│   │   ├── components/
│   │   │   ├── layout/    ← DashboardLayout (sidebar nav)
│   │   │   ├── forms/     ← ClientForm, LeadForm, TaskForm, PipelineForm
│   │   │   └── common/    ← Dialog, Toast
│   │   ├── context/
│   │   │   └── AuthContext.tsx  ← Auth state & JWT token management
│   │   ├── services/
│   │   │   └── api.ts     ← Axios API client (authService, clientService, etc.)
│   │   ├── routes/
│   │   │   └── index.tsx  ← ProtectedRoute wrapper
│   │   └── types.ts       ← Shared TypeScript interfaces
│   ├── index.html
│   └── vite.config.ts
├── .env                   ← Environment variables
├── package.json           ← Root scripts
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://npmjs.com/) (comes with Node)
- A running PostgreSQL instance

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Edit `.env` in the project root:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/clientsphere"

# JWT signing secret
JWT_SECRET="your-secure-secret-here"

# Optional: Google Gemini API key
# GEMINI_API_KEY="your-gemini-key"
```

### 3. Set up the database

Create the database and run the schema (see your DB setup scripts or use the `/api` endpoints which auto-initialize tables on first run).

### 4. Start the development server

```bash
npm run dev
```

This starts the Express backend (with Vite middleware for the frontend) on **http://localhost:3000**.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start full-stack dev server (backend + Vite frontend) on port 3000 |
| `npm run dev:frontend` | Start only the Vite frontend dev server (port 5173) |
| `npm run dev:backend` | Start only the Express API server (standalone, no frontend) |
| `npm run build` | Build frontend + bundle backend to `dist/` |
| `npm run start` | Run the production build (`dist/server.cjs`) |
| `npm run clean` | Remove `dist/` and `server-db.json` |
| `npm run lint` | TypeScript type check |

---

## API Endpoints

All endpoints are prefixed with `/api`.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Log in, returns JWT token |
| `GET` | `/auth/me` | Get current user (requires auth) |
| `GET` | `/clients` | List clients (supports `?search=` & `?status=`) |
| `POST` | `/clients` | Create a client |
| `PUT` | `/clients/:id` | Update a client |
| `DELETE` | `/clients/:id` | Delete a client |
| `GET` | `/leads` | List leads (supports `?search=` & `?status=`) |
| `POST` | `/leads` | Create a lead |
| `PUT` | `/leads/:id` | Update a lead |
| `DELETE` | `/leads/:id` | Delete a lead |
| `GET` | `/tasks` | List tasks (supports `?status=`) |
| `POST` | `/tasks` | Create a task |
| `PUT` | `/tasks/:id` | Update a task |
| `DELETE` | `/tasks/:id` | Delete a task |
| `GET` | `/pipelines` | List pipeline deals |
| `POST` | `/pipelines` | Create a deal |
| `PUT` | `/pipelines/:id` | Update a deal (e.g. move stage) |
| `DELETE` | `/pipelines/:id` | Delete a deal |
| `GET` | `/dashboard/stats` | Get KPI stats for the dashboard |

Authentication uses Bearer tokens — include `Authorization: Bearer <token>` on protected requests.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for AI features |

---

## License

Apache-2.0
