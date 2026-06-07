# ClientSphere CRM — Full-Stack Platform

ClientSphere is a modern, high-performance, and visually elegant CRM platform built with React 19, TypeScript, Node.js, Express, and fully styled with a premium dark minimalist aesthetic inspired by Stripe, Linear, and Attio.

---

## 🛠️ Tech Stack & Production Architecture

### Frontend
- **React 19 / Vite**: High-performance rendering with quick visual updates and zero-flicker compiles.
- **Tailwind CSS**: Modern theme variables configuring safe visual hierarchies.
- **Recharts**: Responsive charting widgets mapping income pipelines and lead distributions.
- **Framer Motion**: Smooth entry layouts transitions.
- **Lucide Icons**: Consistent vector typography iconography.

### Backend & Database
- **Express.js (TypeScript)**: Scalable backend routing architecture.
- **PostgreSQL**: Connected directly using the `pg` (node-postgres) driver. Checks and initializes schemas automatically on startup, pre-seeded with professional ledger data.
- **Native Node Cryptography**: PBKDF2 hashing routines running clean and safe logins without risking native C++ module breakages during cloud deployments.

---

## 📂 Project Organization

```text
clientsphere/
├── .env                 # Database and authentication secrets configuration
├── tsconfig.json        # Unified TypeScript rules compiler
├── package.json         # Module manager & build scripts
├── backend/             # Backend services and API
│   ├── server.ts        # Express entry point
│   └── server/          # Backend modules
│       ├── db.ts        # Direct PostgreSQL pool client and automatic schema initializer 
│       ├── routes/
│       │   └── api.ts   # REST structure (Auth, Clients, Leads, Tasks, Pipeline)
│       ├── middleware/
│       │   └── auth.ts  # HTTP Bearer token interceptor
│       └── utils/
│           └── crypto.ts# Secure password parsing and PBKDF2 cryptography
└── frontend/            # Client resources and UI
    ├── vite.config.ts   # Vite bundler configuration
    └── src/             # React application
        ├── types.ts     # Shared typescript database contract models
        ├── App.tsx      # Router layout maps and authentication providers
        ├── index.css    # Tailwind style guidelines, custom scrollbars, animations
        ├── main.tsx     # Target viewport mounting node
        ├── components/  # Modular UI components
        ├── pages/       # Pages (Dashboard, Clients, Leads, Tasks, Kanban Pipeline, auth)
        ├── routes/      # Logical Route Securers
        └── services/    # Service clients (Axios api integrations)
```

---

## 🗄️ PostgreSQL Database Setup

The project connects directly to PostgreSQL using the `pg` client pool. The tables and baseline seeding are initialized automatically when you boot up the server.

### Configure Connection
Create a `.env` file at the root of the project (or customize the existing one):
```env
# PostgreSQL connection URL
DATABASE_URL="postgresql://postgres:postgres@123@localhost:5432/clientsphere"

# Auth JWT Secret
JWT_SECRET="clientsphere-default-production-key-secret-2026"
```

### Table Schemas Created Automatically
The following tables are initialized on startup:
1. **users**: Platform administrators/agents.
2. **clients**: Active/pending customer contacts.
3. **leads**: Scored marketing/sales prospects.
4. **tasks**: To-do items with status and priority.
5. **pipelines**: Active sales deals tracking revenue pipeline stages.

---

## 🚀 Execution & Standard Operations

### Development Mode
The project is split into frontend and backend servers. You can navigate into their respective directories and run the dev servers.

1. **Start the Backend API Server**:
```bash
cd backend
npm run dev
```
*Runs on port 3000.*

2. **Start the Frontend Development Server**:
```bash
cd frontend
npm run dev
```
*Runs on port 5173.*

### Product Build & Compile
Perform optimized asset optimization and bundling for stand-alone delivery from the root directory:
```bash
npm run build
```

### Start Server
Launches the self-contained production CommonJS build from `/dist`:
```bash
npm run start
```
