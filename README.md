# Agentic AI Automation Platform (Agentflow_AI)

**Agentflow_AI** is a full-stack AI Operations Automation Platform that enables operators to describe complex business automations in natural language and transform them into executable, visual workflow graphs. 

The platform features an AI workflow generator, a drag-and-drop React Flow canvas, a multi-agent orchestration engine (Planner, Execution, Validation, Recovery, Monitoring), real-time Socket.IO execution streaming, BullMQ queue management with Redis, and OAuth integrations for third-party tools (Gmail, Slack, Discord, Google Sheets).

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Prerequisites](#prerequisites)
3. [Project Directory Structure](#project-directory-structure)
4. [Environment Variables Setup](#environment-variables-setup)
5. [Step-by-Step Local Setup & Installation](#step-by-step-local-setup--installation)
6. [Running the Application](#running-the-application)
7. [System Architecture & Multi-Agent Workflow Engine](#system-architecture--multi-agent-workflow-engine)
8. [API Endpoints Reference](#api-endpoints-reference)
9. [Development Phases & Roadmap](#development-phases--roadmap)
10. [Security & Error Handling](#security--error-handling)

---

## Tech Stack

### Frontend
- **Framework**: Next.js (Pages Router), React 19
- **Styling**: Tailwind CSS, Lucide React Icons
- **State Management**: Zustand
- **Canvas & Visual Workflows**: React Flow (`@xyflow/react`)
- **HTTP & Real-Time**: Axios, Socket.IO Client

### Backend
- **Runtime & Server**: Node.js, Express.js
- **Database**: MongoDB with Mongoose (*includes in-memory fallback for local dev*)
- **Queueing & Async Jobs**: BullMQ, Redis via `ioredis` (*includes in-memory fallback for local dev*)
- **Real-Time Engine**: Socket.IO
- **Security & Utilities**: JWT (JSON Web Tokens), `bcryptjs` (cost factor 12), `helmet`, `express-validator`, `morgan`, `compression`, `express-rate-limit`

### AI Orchestration & Integrations
- **AI Providers**: OpenRouter API (Primary), Google Generative AI SDK (Gemini Fallback), Deterministic Rule-Based Builder (Offline Fallback)
- **Agent Orchestration**: LangChain, LangGraph
- **Third-Party OAuth / Bot Integrations**: Gmail API, Slack Web API / OAuth, Discord Bot API, Google Sheets API

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:
- **Node.js**: `v18.x` or `v20.x` (or higher)
- **npm** (v9+) or **yarn** / **pnpm**
- **Git**
- *(Optional)* **MongoDB Server** (v6+ or MongoDB Atlas instance)
- *(Optional)* **Redis Server** (v6+ or Redis Cloud instance)

> **Note**: Both MongoDB and Redis support built-in in-memory fallback modes for instant local development without installing external database servers.

---

## Project Directory Structure

```text
ai_platform/
├── spec.md                         # Single source of truth specification document
├── README.md                       # Local setup & project documentation
├── client/                         # Next.js Pages Router Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppShell/           # Main application layout & sidebar navigation
│   │   │   ├── MetricGrid/         # Dashboard analytics & performance metrics
│   │   │   ├── NodePalette/        # Drag-and-drop workflow nodes sidebar
│   │   │   ├── NodeConfigPanel/    # Right-side configuration panel for selected nodes
│   │   │   ├── WorkflowCanvas/     # React Flow interactive workflow builder
│   │   │   ├── Notifications/      # Real-time event notifications drawer
│   │   │   └── ProtectedRoute/     # Auth wrapper for guarded routes
│   │   ├── pages/
│   │   │   ├── index.js            # Landing page / Landing showcase
│   │   │   ├── login.js            # User authentication (Login)
│   │   │   ├── register.js         # Account creation (Register)
│   │   │   ├── dashboard.js        # Operator console & analytics
│   │   │   ├── workflows/
│   │   │   │   ├── index.js        # Workflow list & management page
│   │   │   │   ├── builder.js      # Natural language prompt-to-workflow builder
│   │   │   │   └── [id].js         # Full canvas workflow editor & debugger
│   │   │   ├── executions.js       # Live & historical execution logs
│   │   │   ├── integrations.js     # Third-party OAuth connection hub
│   │   │   └── settings.js         # Profile, API keys, & security controls
│   │   ├── store/                  # Zustand global state stores (auth, workflow, socket)
│   │   ├── styles/                 # Global styles & Tailwind CSS setup
│   │   └── utils/                  # API clients, helpers, & socket connections
│   ├── package.json
│   └── tailwind.config.js
└── server/                         # Express Node.js Backend API
    ├── src/
    │   ├── config/                 # DB, Redis, Socket.IO, & env loading setup
    │   ├── controllers/            # Thin HTTP controllers (request validation & responses)
    │   ├── services/               # Business logic, token encryption, execution lifecycle
    │   ├── agents/                 # Pure multi-agent modules (Planner, Execution, etc.)
    │   ├── integrations/           # Third-party providers implementing baseIntegration interface
    │   │   ├── baseIntegration.js
    │   │   ├── gmailIntegration.js
    │   │   ├── slackIntegration.js
    │   │   ├── discordIntegration.js
    │   │   └── sheetsIntegration.js
    │   ├── queues/                 # BullMQ queue producers & workers (workflowQueue, executionQueue)
    │   ├── models/                 # Mongoose schemas (User, Workflow, Execution, ExecutionLog, etc.)
    │   ├── middleware/             # Auth JWT, rate limiters, express-validator, error handler
    │   ├── routes/                 # Express API routes
    │   └── utils/                  # Encryption helpers, memory store fallback, async wrapper
    ├── package.json
    └── .env.example
```

---

## Environment Variables Setup

### 1. Backend Environment Setup (`server/.env`)

Create a `.env` file inside the `server/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database Configuration (Leave empty to use built-in In-Memory fallback)
MONGODB_URI=mongodb://127.0.0.1:27017/agentflow_ai

# Queue & Cache Configuration (Leave empty to use built-in In-Memory fallback)
REDIS_URL=redis://127.0.0.1:6379

# Authentication & Security Secrets
JWT_SECRET=super_secret_jwt_signing_key_change_in_production_32bytes
# 32-byte (64 hex characters) key used to encrypt OAuth tokens at rest:
CREDENTIAL_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# AI Model Provider API Keys
OPENROUTER_API_KEY=your_openrouter_api_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here

# Third-Party Integrations - Google (Gmail & Google Sheets OAuth)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/google/callback

# Third-Party Integrations - Slack OAuth
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/slack/callback

# Third-Party Integrations - Discord Bot
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/discord/callback
```

### 2. Frontend Environment Setup (`client/.env.local`)

Create a `.env.local` file inside the `client/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## Step-by-Step Local Setup & Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/agentflow_ai.git
cd ai_platform
```

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../client
npm install
```

### Step 4: Configure Environment Files

Follow the instructions in the [Environment Variables Setup](#environment-variables-setup) section to populate `server/.env` and `client/.env.local`.

---

## Running the Application

### Option A: Running Backend & Frontend Concurrently (Recommended)

1. Start the **Backend Server**:
   ```bash
   cd server
   npm run dev
   ```
   *The Express server will start on `http://localhost:5000` with live Socket.IO connection handling.*

2. In a second terminal window, start the **Frontend Next.js Client**:
   ```bash
   cd client
   npm run dev
   ```
   *The Next.js application will start on `http://localhost:3000`.*

3. Open your browser and navigate to `http://localhost:3000`.

---

### Option B: Running with Docker / Database Services (Optional)

If you wish to use standalone MongoDB and Redis containers via Docker:

```bash
# Start MongoDB and Redis containers
docker run -d --name agentflow-mongo -p 27017:27017 mongo:latest
docker run -d --name agentflow-redis -p 6379:6379 redis:alpine
```

---

## System Architecture & Multi-Agent Workflow Engine

### Multi-Agent Chain
Every workflow execution passes through an explicit chain of cooperating AI agents:
1. **Planner Agent**: Analyzes the workflow graph, determines optimal execution ordering, and calculates execution confidence scores.
2. **Execution Agent**: Invokes node actions against target AI providers or third-party integrations (Gmail, Slack, Discord, Google Sheets).
3. **Validation Agent**: Verifies that node execution outputs satisfy required schemas and downstream inputs.
4. **Recovery Agent**: Classifies failure modes (`MISSING_FIELDS`, `API_FAILURE`, `AUTH_EXPIRED`, `RATE_LIMIT`, `TRANSIENT`) and decides whether to retry with exponential backoff or escalate.
5. **Monitoring Agent**: Emits real-time timeline events over Socket.IO to connected clients and records full audit logs.

### AI Generation Fallback Chain
When a user submits a natural-language automation prompt:
1. Checks for `OPENROUTER_API_KEY` (OpenRouter API - Primary).
2. If absent, falls back to `GEMINI_API_KEY` (Google Gemini SDK).
3. If absent, falls back to the **Deterministic Rule-Based Builder** to guarantee offline execution support for standard automations.

---

## API Endpoints Reference

### Health & Authentication
- `GET /api/health` - Backend health heartbeat & dependency check
- `POST /api/auth/register` - Create user account (bcrypt cost 12)
- `POST /api/auth/login` - Authenticate user & issue JWT token
- `GET /api/auth/me` - Fetch authenticated user profile

### Workflows
- `GET /api/workflows/dashboard` - Get aggregated dashboard metrics
- `GET /api/workflows` - List user workflows (supports filtering/pagination)
- `POST /api/workflows` - Create a new workflow graph
- `POST /api/workflows/generate` - Generate workflow graph from prompt via AI agent chain
- `GET /api/workflows/:id` - Fetch single workflow detail
- `PUT /api/workflows/:id` - Update workflow nodes, edges, & metadata
- `POST /api/workflows/:id/duplicate` - Duplicate existing workflow
- `POST /api/workflows/:id/execute` - Trigger manual workflow execution
- `DELETE /api/workflows/:id` - Delete workflow

### Executions
- `GET /api/executions` - List workflow execution history
- `GET /api/executions/:id` - Get details & status of an execution session
- `GET /api/executions/:id/timeline` - Stream/fetch per-agent execution logs
- `POST /api/executions/:id/pause` - Pause a running workflow execution
- `POST /api/executions/:id/resume` - Resume a paused workflow execution
- `POST /api/executions/:id/cancel` - Cancel a running workflow execution

### Integrations & OAuth
- `GET /api/integrations` - List user's third-party integration statuses
- `GET /api/integrations/status` - Provider health & token status check
- `GET /api/integrations/oauth/:provider/start` - Initiate OAuth flow (`gmail`, `slack`, `discord`, `sheets`)
- `GET /api/integrations/oauth/:provider/callback` - Process OAuth callback & store encrypted credentials
- `POST /api/integrations` - Create or update manual integration keys

### Notifications
- `GET /api/notifications` - Fetch user notification alerts & system updates

---

## Development Phases & Roadmap

- **Phase 1**: Core Setup & Authentication (Next.js, Express, MongoDB fallback, JWT auth, Zustand store, AppShell layout).
- **Phase 2**: Workflow Management & Visual Editor (React Flow canvas, Node palette, CRUD APIs, drag-and-drop builder).
- **Phase 3**: AI Workflow Generation (Prompt-to-graph generator, OpenRouter, Gemini fallback, rule builder).
- **Phase 4**: Multi-Agent Orchestration Engine (Planner, Execution, Validation, Recovery, Monitoring agents, state persistence).
- **Phase 5**: Third-Party OAuth Integrations (Gmail, Slack, Discord, Google Sheets integrations with AES encrypted secrets).
- **Phase 6**: Real-Time Streaming & Background Queues (BullMQ on Redis, Socket.IO live updates, notifications drawer).

---

## Security & Error Handling

- **Credential Encryption**: All OAuth access tokens and refresh tokens are encrypted at rest using AES-256 via `CREDENTIAL_ENCRYPTION_KEY`.
- **Password Hashing**: User passwords are explicitly hashed with `bcryptjs` using 12 rounds.
- **Request Guardrails**: Request validation is strictly enforced via `express-validator` on HTTP routes.
- **Security Headers & CORS**: `helmet` is enabled for HTTP security header protection and CORS is strictly restricted to `CLIENT_URL`.
- **Integration Diagnostics**: Missing or expired credentials trigger explicit `INTEGRATION_NOT_CONNECTED` or `AUTH_EXPIRED` timeline alerts rather than silent failures.

---

## License & Credits

Built as part of the **Agentic AI Operations Platform** standard. Refer to `spec.md` for full implementation guidelines.
