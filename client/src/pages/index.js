import { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import PlatformLogo from '../components/PlatformLogo';
import ThemeSwitcher from '../components/ThemeSwitcher';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Activity,
  GitFork,
  ArrowRight,
  PlayCircle,
  Layers,
  Cpu,
  RefreshCw,
  CheckCircle2,
  Lock,
  Radio,
  Terminal,
  ChevronRight,
  Bot
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [selectedAgent, setSelectedAgent] = useState('planner');
  const [demoPrompt, setDemoPrompt] = useState('When an urgent customer ticket arrives, evaluate sentiment with AI, post high-priority alert to #ops-alerts in Slack, and append row to Google Sheets audit ledger.');

  const agents = [
    {
      id: 'planner',
      name: 'Planner Agent',
      badge: 'DAG Topology & Kahn Sort',
      color: 'indigo',
      desc: 'Parses the graph topology, detects cycles, builds an optimal dependency execution order, and emits a confidence score.',
      status: 'Confidence: 98%'
    },
    {
      id: 'execution',
      name: 'Execution Agent',
      badge: 'Provider Dispatcher',
      color: 'cyan',
      desc: 'Executes each step against connected integrations (Gmail, Slack, Discord, Google Sheets) or AI reasoning models.',
      status: 'Dispatched in 42ms'
    },
    {
      id: 'validation',
      name: 'Validation Agent',
      badge: 'Output Verification',
      color: 'emerald',
      desc: 'Verifies required output schema fields and data contracts before passing context to downstream nodes.',
      status: '4/4 Checks Passed'
    },
    {
      id: 'recovery',
      name: 'Recovery Agent',
      badge: 'Self-Healing & Backoff',
      color: 'amber',
      desc: 'Classifies runtime failures (TRANSIENT, AUTH_EXPIRED, RATE_LIMIT, MISSING_FIELDS) and executes jittered exponential backoff or escalation.',
      status: 'Self-Healing Active'
    },
    {
      id: 'monitoring',
      name: 'Monitoring Agent',
      badge: 'Real-Time Telemetry',
      color: 'rose',
      desc: 'Emits granular timeline logs over Socket.IO, records immutable Execution documents, and triggers notifications.',
      status: 'Streaming 60fps'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Neon Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navbar */}
      <nav className="h-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <NextLink href="/" className="transition-transform hover:scale-105">
          <PlatformLogo size="md" textClass="text-lg font-black" />
        </NextLink>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#agents" className="hover:text-white transition">Agent Chain</a>
          <a href="#demo" className="hover:text-white transition">Prompt Studio</a>
          <a href="#integrations" className="hover:text-white transition">Integrations</a>
          <a href="#features" className="hover:text-white transition">Capabilities</a>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <ThemeSwitcher />

          {isAuthenticated ? (
            <NextLink
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-glow-indigo transition"
            >
              <span>Operator Console</span>
              <ArrowRight className="w-4 h-4" />
            </NextLink>
          ) : (
            <>
              <NextLink
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition"
              >
                Sign In
              </NextLink>
              <NextLink
                href="/register"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-glow-indigo transition"
              >
                <span>Get Started</span>
                <ChevronRight className="w-4 h-4" />
              </NextLink>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Next-Generation Multi-Agent Automation Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight">
          Turn Plain Language into <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-violet-400">
            Autonomous Agentic Workflows
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Describe any operations workflow in natural language. Watch SAGARAGENT_AI generate the complete visual DAG, orchestrate cooperating AI agents (Planner, Executor, Validator, Recovery, Monitor), and execute live actions across Gmail, Slack, Discord, and Google Sheets.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <NextLink
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-glow-indigo transition group"
          >
            <span>Launch Operator Console</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </NextLink>

          <NextLink
            href="/workflows/builder"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl glass-panel text-slate-200 hover:text-white hover:border-slate-700 font-semibold text-sm transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Try AI Prompt Studio</span>
          </NextLink>
        </div>

        {/* Live Architecture Showcase */}
        <div className="pt-12">
          <div className="glass-panel p-6 lg:p-8 rounded-3xl border border-slate-800 shadow-2xl text-left space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="font-mono text-xs text-slate-400">sagaragent-orchestrator-core.js</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LangGraph Substrate: ONLINE</span>
              </div>
            </div>

            {/* Interactive Agent Flow Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    selectedAgent === agent.id
                      ? 'bg-slate-900 border-indigo-500 shadow-glow-indigo ring-1 ring-indigo-500'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {agent.badge}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{agent.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{agent.desc}</p>
                  <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{agent.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Agent Deep Dive */}
      <section id="agents" className="py-16 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-900 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold font-mono uppercase text-indigo-400 tracking-widest">Cooperating Agent Architecture</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Five Specialized Autonomous Agents</h3>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Instead of brittle monolithic scripts, SAGARAGENT_AI runs each workflow through a synchronized chain of specialized agents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">1. Planner Agent</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Performs topological sorting via Kahn’s algorithm to determine exact step dependencies. Detects circular dependencies and reports graph confidence scores.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">2. Execution Agent</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interpolates mustache template variables ({'{{node_1.output}}'}), executes OAuth integration calls, or synthesizes intelligent responses via OpenRouter / Gemini.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">3. Validation Agent</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enforces output data integrity. Confirms that required output fields (delivery tokens, message IDs, spreadsheet range updates) exist before allowing downstream execution.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">4. Recovery Agent</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Classifies errors into TRANSIENT, AUTH_EXPIRED, RATE_LIMIT, or MISSING_FIELDS. Triggers exponential backoff with jitter or escalates unrecoverable states to operators.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">5. Monitoring Agent</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Streams every step transition in real time via Socket.IO, records immutable audit trails in MongoDB, and delivers alerts to the Notifications Drawer.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">AES-256 Encrypted Credential Vault</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              All third-party tokens and refresh keys are encrypted at rest with application-level AES-256-GCM. Decrypted credentials never leak into server logs.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 px-6 lg:px-12 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 SAGARAGENT_AI. Designed & Engineered by <span className="text-indigo-400 font-bold">Hemasagar Raju</span>.</p>
          <div className="flex items-center gap-6">
            <a href="https://github.com/Hemasagarraju/sagaragent-ai" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition">GitHub Repo</a>
            <NextLink href="/dashboard" className="hover:text-slate-300">Dashboard</NextLink>
            <NextLink href="/workflows/builder" className="hover:text-slate-300">AI Studio</NextLink>
            <NextLink href="/integrations" className="hover:text-slate-300">Integrations</NextLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
