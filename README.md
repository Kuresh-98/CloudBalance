# CloudLens — Cloud Cost Optimization Platform

CloudLens is a premium, full-stack cloud cost optimization platform designed to help organizations monitor cloud spending, identify resource waste, and automatically generate intelligent cost-saving recommendations. The application enables teams to gain visibility into their infrastructure, manage budgets, track resource efficiency, and safely apply remediation.

---

## 🚀 Live Demonstration

*   **Frontend Deployment (Vercel)**: [https://cloud-lens-web.vercel.app/](https://cloud-lens-web.vercel.app/)
*   **Backend API Deployment (Render)**: [https://cloudlens-3.onrender.com/](https://cloudlens-3.onrender.com/)
*   **Backend Liveness Endpoint**: [https://cloudlens-3.onrender.com/api/health](https://cloudlens-3.onrender.com/api/health)

---

## 🛠️ Technology Stack

*   **Frontend**: React (v18), Vite, TypeScript, Vanilla CSS (Premium Neubrutalist Theme), Lucide React (Icons), Recharts (Interactive Analytics charts).
*   **Backend**: Node.js, Express, TypeScript, Nodemon, Vitest (Unit testing).
*   **Database & ORM**: PostgreSQL (Hosted on Neon serverless database), Prisma ORM client.
*   **Deployments**: Vercel (Frontend), Render (Backend API).

---

## 📁 Project Folder Structure

The project is structured as a monorepo using npm workspaces:

```text
├── apps/
│   ├── api/                 # Node.js/Express Backend
│   │   ├── dist/            # Compiled JavaScript output
│   │   ├── scripts/         # Seeding and database utility scripts (seed.ts)
│   │   ├── src/             # Application source files
│   │   │   ├── middleware/  # Custom middleware (Auth, CORS, Error Handlers)
│   │   │   ├── prisma/      # Prisma DB Schema definition (schema.prisma)
│   │   │   ├── routes/      # Express API routers (auth, costs, resources, teams, recommendations)
│   │   │   ├── services/    # Recommendation Engine logic
│   │   │   └── index.ts     # Main Server Entrypoint
│   │   └── tsconfig.json    # Backend TS compiler config
│   │
│   └── web/                 # React Frontend
│       ├── dist/            # Production static site assets
│       ├── src/             # React application source code
│       │   ├── components/  # Layouts, forms, and reusable UI elements
│       │   ├── lib/         # API context and client helper classes
│       │   └── main.tsx     # React Entrypoint
│       ├── tailwind.config.js # Tailwind CSS configuration
│       └── vite.config.ts   # Vite bundler and proxy configuration
│
├── package.json             # Monorepo root workspaces script definitions
└── package-lock.json        # Unified monorepo lockfile
```

---

## 🧩 High-Level Architecture & Solution Design

### Components & Data Flow

```mermaid
flowchart TD
    subgraph Client ["Client (Browser)"]
        ReactApp["React / Vite App (Port 3000)"]
    end

    subgraph HostingPlatforms ["Public Deployments"]
        VercelFront["Vercel (Frontend Hosting)"]
        RenderBack["Render Web Service (Express Server)"]
    end

    subgraph Backend ["Backend API Service (Port 5000)"]
        ExpressRouter["Express.js App Router"]
        RequireAuth["requireAuth JWT Middleware"]
        PrismaClient["Prisma ORM Client"]
        RulesEngine["Intelligent Recommendation Engine"]
    end

    subgraph DataStore ["Database Layer"]
        NeonDB["Neon PostgreSQL (Serverless)"]
    end

    ReactApp -->|HTTPS / API Requests| VercelFront
    VercelFront -->|Cross-Origin Requests with JWT| RenderBack
    RenderBack -->|Verifies JWT Token| RequireAuth
    RequireAuth -->|Handles Routes| ExpressRouter
    ExpressRouter -->|Queries & Mutates| PrismaClient
    PrismaClient -->|Connection Protocol (connect_timeout=30)| NeonDB
    RulesEngine -->|Analyzes Cost & Usage| NeonDB
```

### Design Decisions & Trade-offs
*   **User Isolation**: Linked `Team` directly to `User`. Every database fetch/mutation restricts context to the authenticated user ID (`req.user.id`).
*   **Prisma Connection Optimization**: Appended `connect_timeout=30` to the database URL. This gives serverless Neon Postgres database clusters enough time to warm up and spin down safely without raising `P1001` connection errors.
*   **Authentication & Security**: State is secured using standard JSON Web Tokens (JWT) signed with a secure server-side secret key.

---

## 🔑 Onboarding, Roles & Application Flow

### 1. Sign Up & First-Time Login
*   **Authentication Portal**: When loading CloudLens, unauthenticated visitors are automatically routed to a Neubrutalist-themed Login page.
*   **Pre-Seeded Credentials**: Evaluators can skip registration by logging in with either of these pre-seeded accounts:
    - **Admin Account**: `admin@cloudbalance.com` / `Password123!`
    - **Test Account**: `test@example.com` / `Password123!`
*   **Registration**: Users can click **Sign Up** to create a new profile. Upon registering, a secure profile is registered, a JWT token is created, and the browser stores the credential.

### 2. Role Capabilities (Viewer vs. Admin)
An interactive role selector is pinned in the header menu:
*   **Viewer Mode (Default)**:
    - Focuses on analytics, telemetry history, and optimizations.
    - View cost summary charts (grouped by service/region/team) and spend trend graphs.
    - View active telemetry performance metrics (CPU, Memory, Network) per resource.
    - Apply, dismiss, or reopen cost-saving recommendations.
*   **Admin Mode**:
    - Unlocks full configuration and budget management options.
    - Renders the **Team Admin** control panel on the **Leaderboard** page.
    - Allows the user to **Create**, **Edit (Update budgets/name)**, and **Delete** business teams.

### 3. Team & Resource Administration Flow
*   **Adding Teams**: Switch the role dropdown to **Admin** and navigate to the **Leaderboard** page. Fill out the budget and name form to create the team.
*   **Header Synchronization**: Creating or deleting teams automatically re-fetches the list, instantly updating the global team selectors in the header.
*   **Filtering**: Choose any team from the header selector to focus dashboards, resource trackers, and recommendation cards onto that specific business unit.

---

## 📊 Evaluation Test Data

The database comes populated with mock telemetry data spanning **90 days** of infrastructure logs:

*   **Users**: 2 preconfigured accounts (`admin@cloudbalance.com` and `test@example.com`).
*   **Teams**: 10 teams (5 unique teams per user, e.g. *Platform*, *Growth*, *Data*).
*   **Cloud Resources**: 100 cloud assets (50 per user, spanning *EC2*, *RDS*, *EBS*, *Lambda*).
*   **Cost & Telemetry Records**: 4,773 daily spending logs and 4,773 CPU/Memory performance logs.
*   **Recommendations**: 58 open optimization recommendations (29 per user) generated by the rules engine based on real-world criteria.

---

## 📡 API Documentation

### 1. Authentication
*   `POST /api/auth/register`: Create a new user account.
*   `POST /api/auth/login`: Log in to an account.
*   `GET /api/auth/me`: Retrieve current user profile metadata.

### 2. Teams (Auth Required)
*   `GET /api/teams`: Retrieve teams belonging to the authenticated user.
*   `GET /api/teams/leaderboard`: Ranks user's teams by waste efficiency ratio.
*   `POST /api/teams`: Create a new user-scoped team.
*   `GET /api/teams/:id`: Fetch user-scoped team details.
*   `PATCH /api/teams/:id`: Update user-scoped team budgets/metadata.
*   `DELETE /api/teams/:id`: Delete a user-scoped team.

### 3. Resources (Auth Required)
*   `GET /api/resources`: Fetch resources belonging to user's teams.
*   `GET /api/resources/:id`: Get detail view of resource.
*   `GET /api/resources/:id/usage`: Get usage history charts.
*   `POST /api/resources`: Register a resource under one of user's teams.
*   `PATCH /api/resources/:id`: Edit resource configuration.
*   `DELETE /api/resources/:id`: Decommission resource.

### 4. Recommendations (Auth Required)
*   `GET /api/recommendations`: Retrieve active savings recommendations.
*   `GET /api/recommendations/summary`: Sum potential monthly savings.
*   `POST /api/recommendations/:id/apply`: Apply optimization actions.
*   `POST /api/recommendations/:id/dismiss`: Dismiss recommendation.
*   `POST /api/recommendations/:id/reopen`: Reopen recommendation.

---

## ⚙️ Local Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   npm (v9+)
*   PostgreSQL database (like Neon)

### Step 1: Install Dependencies
From the repository root:
```bash
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the backend folder:
*   File: `apps/api/.env` (See [api/.env.example](file:///c:/Users/DELL/Documents/github/cloudbalance/CloudLens/apps/api/.env.example))
```env
PORT=5000
DATABASE_URL="postgresql://neondb_owner:password@host-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&connect_timeout=30"
JWT_SECRET="your-super-secret-jwt-key"
NODE_ENV=development
```

Create a `.env` file in the frontend folder:
*   File: `apps/web/.env` (See [web/.env.example](file:///c:/Users/DELL/Documents/github/cloudbalance/CloudLens/apps/web/.env.example))
```env
VITE_API_BASE_URL=http://localhost:5000
```

### Step 3: Seed Database
Initialize database tables, client bindings, and mock records:
```bash
# Push database schemas
npm run db:push

# Run seed generator
npm run seed
```

### Step 4: Run Application
Start dev environments:
```bash
npm run dev
```
*   **Web Frontend**: [http://localhost:3000/](http://localhost:3000/)
*   **Backend API**: [http://localhost:5000/](http://localhost:5000/)

---

## ☁️ Deployment Instructions

### 1. Deployed Backend (Render)
*   **Service Type**: Web Service (Node.js runtime).
*   **Root Directory**: `apps/api`
*   **Build Command**: `npm install && npm run db:generate && npm run build`
*   **Start Command**: `node dist/src/index.js`
*   **Environment Variables**:
    *   `DATABASE_URL`: Production Postgres connection string (ensure `connect_timeout=30` is appended).
    *   `JWT_SECRET`: Secure cryptographic token signature key.
    *   `NODE_ENV`: `production`

### 2. Deployed Frontend (Vercel)
*   **Root Directory**: `apps/web`
*   **Framework Preset**: Vite
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`
*   **Environment Variables**:
    *   `VITE_API_BASE_URL`: Live Render API root (e.g. `https://cloudlens-3.onrender.com`)

---

## 👥 Authors
*   **Aafiya**
*   **Kuresh**
