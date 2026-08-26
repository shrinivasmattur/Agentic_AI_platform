# Production Deployment Guide - Agentic AI Automation Platform (Agentflow_AI)

This guide provides step-by-step instructions to deploy **Agentflow_AI** to production for free using **Render** (Backend API + Socket.IO) and **Vercel** (Next.js Frontend).

---

## Prerequisites
- A **GitHub Account**
- A **Render Account** ([render.com](https://render.com))
- A **Vercel Account** ([vercel.com](https://vercel.com))
- MongoDB Atlas cluster URL (`mongodb+srv://...`)

---

## Step 1: Push Code to GitHub

Open terminal in the workspace root directory:

```bash
git init
git add .
git commit -m "Initial commit of Agentflow_AI"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/agentflow_ai.git
git push -u origin main
```

---

## Step 2: Deploy Backend API (`server/`) to Render.com

1. Log in to [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your `agentflow_ai` GitHub repository.
4. Configure service settings:
   - **Name**: `agentflow-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Instance Type**: `Free`

5. In **Environment Variables**, add the following keys:

```env
NODE_ENV=production
CLIENT_URL=https://agentflow-ai.vercel.app
MONGODB_URI=mongodb+srv://2023isshrinivasmatturd_db_user:BBTr5pcZObgsfz63@automationai.2pdpafe.mongodb.net/agentflow_ai?retryWrites=true&w=majority&appName=AutomationAI
JWT_SECRET=agentflow_jwt_secret_dev_key_32_bytes_long_key_spec
CREDENTIAL_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```
*(Optionally add `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`, `SLACK_CLIENT_ID`, `DISCORD_BOT_TOKEN` if using third-party OAuth integrations)*.

6. Click **Create Web Service**.
7. Once deployed, copy your backend URL (e.g. `https://agentflow-backend.onrender.com`).

---

## Step 3: Deploy Frontend Client (`client/`) to Vercel.com

1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your `agentflow_ai` GitHub repository.
4. Configure project settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select `client`
5. Expand **Environment Variables** and add:

```env
NEXT_PUBLIC_API_URL=https://agentflow-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://agentflow-backend.onrender.com
```

6. Click **Deploy**. Vercel will build your Next.js application and assign a live URL (e.g. `https://agentflow-ai.vercel.app`).

---

## Step 4: Synchronize Backend CORS URL

1. Go back to your **Render Console** -> `agentflow-backend` service -> **Environment**.
2. Update `CLIENT_URL` to match your live Vercel domain (e.g. `https://agentflow-ai.vercel.app`).
3. Save changes. Render will automatically re-deploy.

---

## Step 5: Post-Deployment Verification

1. Open `https://agentflow-ai.vercel.app/` in your browser.
2. Navigate to `/register` and create an operator account.
3. Launch the `/workflows/builder` page and test prompt-to-workflow generation.
4. Trigger a workflow execution and check the `/executions` live telemetry feed.
