# 🚀 SAGAR AI — Generative AI Super App Suite

An all-in-one generative AI powerhouse featuring **8K Text-to-Image Creation**, **AI Master Prompt Engineering Studio**, **Google Gemini 2.5 Pro Multimodal Reasoning Chat**, and **Zero-Latency AI Multimodal Tools**.

👉 **Global Live Demo (Production Speed)**: **[https://volume-safely-restaurant-fought.trycloudflare.com](https://volume-safely-restaurant-fought.trycloudflare.com)**
👉 **Offline / Same Wi-Fi LAN Access**: **[http://10.166.139.128:3000](http://10.166.139.128:3000)** *(Zero internet required — works over Wi-Fi / Hotspot)*
👉 **Local Machine**: **[http://localhost:3000](http://localhost:3000)**

---

## 🌟 Core AI Features

1. **🎨 AI Image Studio (`/images`)**:
   - High-definition text-to-image synthesis (Flux.1 Ultra + SDXL).
   - 10+ artistic styles (Photorealistic, Anime, Cyberpunk, 3D Pixar, Cinematic, Surrealism, Fantasy, Watercolor, etc.).
   - Multiple aspect ratios (`1:1 Square`, `16:9 Landscape`, `9:16 Story/Reel`, `4:3 Classic`).
   - "✨ Enhance with Gemini" 1-click prompt expander.
   - High-Res Downloads, Fullscreen Lightbox, and Personal Creation Gallery.

2. **✍️ AI Prompt Engineering Studio (`/prompts`)**:
   - Master Prompt Optimizer (transforms simple ideas into multi-layered master prompts).
   - AI System Instructions & Persona Generator.
   - 30+ Curated Prompt Templates (Coding, Design, Copywriting, Marketing, Reasoning).
   - Personal Prompt Vault for saving and 1-click testing.

3. **💬 Google Gemini 2.5 Pro Chat (`/chat`)**:
   - Full-screen conversational AI with 1M context window and multi-turn reasoning.
   - Dynamic Persona Switcher (Software Architect, Creative Prompt Master, Executive Strategist).
   - Clean markdown formatting with 1-click code block copying.

4. **⚡ AI Multimodal Tools Hub (`/tools`)**:
   - **Code Architect**: Clean code generation in 15+ languages.
   - **Document Summarizer**: Executive briefs & bullet points.
   - **50+ Language Translator**: Cultural & contextual translation.
   - **Sentiment Analyzer**: Emotional tone & polarity scoring.

5. **⭐ Operator Review System**:
   - Preserved at the bottom/last position with session close-time tracking.

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
