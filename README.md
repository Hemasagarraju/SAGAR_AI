# 🚀 SAGARAGENT_AI — Autonomous Multi-Agent AI Automation Platform

An enterprise-grade, distributed AI automation platform powered by autonomous multi-agent pipelines (Planner, Execution, Validation, Recovery, and Monitoring), real-time DAG telemetry, AES-256 encrypted credential vaults, and seamless third-party tool integrations.

👉 **Live Demo Web App**: **[https://metallic-cure-installation-animation.trycloudflare.com](https://metallic-cure-installation-animation.trycloudflare.com)** *(Instant access — No password required)*

---

## 🌟 Key Architecture & Capabilities

- **🧠 Multi-Agent Orchestration Chain**:
  - **Planner Agent**: Performs topological sort (Kahn's algorithm) on DAG workflows, evaluates execution safety, and scores plan confidence.
  - **Execution Agent**: Dispatches atomic action steps (Gmail, Slack, Discord, Google Sheets, AI reasoning).
  - **Validation Agent**: Performs JSON schema compliance and data integrity verification.
  - **Recovery Agent**: Autonomous self-healing with exponential backoff and alternate path routing.
  - **Monitoring Agent**: Emits real-time execution telemetry and latency analytics over WebSocket / Socket.IO.

- **⚡ AI Prompt-to-Workflow Graph Studio**:
  - Natural language automation requirement compilation directly into executable DAGs.
  - Interactive React Flow canvas with drag-and-drop node configuration.

- **🔒 Enterprise Security & Encryption**:
  - Vault with **AES-256-GCM** encryption for all third-party OAuth tokens and secrets.
  - JWT Authentication with role-based access control (Admin / Operator).

- **🔌 1-Click Integrations Hub**:
  - Gmail API, Slack Workspace, Discord Webhooks, Google Sheets API, OpenRouter AI, and Google Gemini AI.

---

## 📁 Repository Structure

```
hemasagar/
├── client/                     # Next.js 14 Web Frontend
│   ├── src/
│   │   ├── components/         # React Flow Canvas, AppShell, NodePalette, MetricGrid
│   │   ├── pages/              # Dashboard, Workflows, Builder, Executions, Integrations, Auth
│   │   ├── services/           # Axios API Client & Socket.IO Client
│   │   └── store/              # Zustand Stores (Workflow, Auth)
│   └── package.json
│
├── server/                     # Node.js Express REST & Real-Time Engine
│   ├── src/
│   │   ├── agents/             # 5 Autonomous Agents (Planner, Exec, Valid, Recovery, Monitor)
│   │   ├── config/             # MongoDB, Redis, and Environment Configurations
│   │   ├── controllers/        # Workflow, Execution, Auth, Integration Controllers
│   │   ├── integrations/       # Gmail, Slack, Discord, Google Sheets Providers
│   │   ├── models/             # Mongoose Models (User, Workflow, ExecutionLog, Integration)
│   │   ├── queues/             # BullMQ / In-Memory Execution Queues
│   │   └── services/           # Business Logic, AI Engine & AES-256 Vault
│   ├── test-pipeline.js        # 26/26 Automated End-to-End Test Suite
│   └── package.json
│
└── README.md                   # Platform Documentation
```

---

## ⚙️ Quick Start Guide

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 2. Run the Platform Locally

#### Terminal 1 — Start Backend Server (Port 5000)
```bash
cd server
npm install
node src/server.js
```

#### Terminal 2 — Start Frontend Application (Port 3000)
```bash
cd client
npm install
npm run dev
```

### 3. Open in Browser
- **Frontend Console**: [http://localhost:3000](http://localhost:3000)
- **1-Click Demo Login**: Click `⚡ 1-Click Demo Operator Sign In` on `/login`
- **Integrations**: [http://localhost:3000/integrations](http://localhost:3000/integrations) (Click `⚡ 1-Click Auto-Connect All Tools`)
- **AI Prompt Studio**: [http://localhost:3000/workflows/builder](http://localhost:3000/workflows/builder)

---

## 🧪 Run Automated Verification Test Suite

```bash
cd server
node test-pipeline.js
```
*Result: 26/26 Tests Passed (100%)*

---

## 🚀 Pushing to GitHub

1. Initialize Git repository:
   ```bash
   git init
   git add .
   git commit -m "feat: complete SAGARAGENT_AI autonomous multi-agent automation platform"
   ```
2. Link your remote GitHub repository and push:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/sagaragent-ai.git
   git branch -M main
   git push -u origin main
   ```
