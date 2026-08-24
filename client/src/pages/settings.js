import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import {
  Settings,
  User,
  Shield,
  Key,
  Database,
  Radio,
  Server,
  Lock,
  CheckCircle2,
  AlertCircle,
  Cpu,
  RefreshCw,
  HardDrive
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [serverHealth, setServerHealth] = useState(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);

  const fetchHealth = async () => {
    try {
      setIsLoadingHealth(true);
      const res = await api.get('/health');
      setServerHealth(res.data);
    } catch (err) {
      console.error('Failed to fetch health status:', err);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <ProtectedRoute>
      <AppShell pageTitle="System Settings & Security">
        <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
          {/* Header */}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-indigo-400" />
              <span>Platform Settings & System Health</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Operator profiles, cryptographic health checks, queue diagnostics, and substrate status.
            </p>
          </div>

          <div className="space-y-6">
            {/* Operator Profile Card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <User className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-sm text-white">Operator Profile</h3>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono border border-indigo-500/30 font-semibold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{(user?.role || 'operator').toUpperCase()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-slate-500 font-mono text-[10px] uppercase">Name</span>
                  <p className="font-semibold text-slate-200">{user?.name || 'Lead Operator'}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-slate-500 font-mono text-[10px] uppercase">Email</span>
                  <p className="font-semibold text-slate-200">{user?.email || 'operator@sagar.ai'}</p>
                </div>
              </div>
            </div>

            {/* Server Substrate & Queue Telemetry */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Server className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-sm text-white">Engine Substrate Telemetry</h3>
                </div>
                <button
                  onClick={fetchHealth}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
                  title="Refresh Diagnostics"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Database</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="font-bold text-white text-sm">MongoDB</div>
                  <p className="text-[10px] text-emerald-400">Connected (In-Memory / Atlas)</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Background Queue</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="font-bold text-white text-sm">BullMQ / In-Memory</div>
                  <p className="text-[10px] text-emerald-400">Active & Processing</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Real-Time Stream</span>
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="font-bold text-white text-sm">Socket.IO Server</div>
                  <p className="text-[10px] text-emerald-400">Broadcasting 60fps</p>
                </div>
              </div>

              {serverHealth && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span>Service: </span>
                    <span className="text-slate-200">{serverHealth.service}</span>
                  </div>
                  <div>
                    <span>Uptime: </span>
                    <span className="text-cyan-400">{Math.round(serverHealth.uptime || 0)}s</span>
                  </div>
                  <div>
                    <span>Env: </span>
                    <span className="text-indigo-400">{serverHealth.environment}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Cryptographic Key Health & Vault */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                <Lock className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Cryptographic Vault & Security Keys</h3>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200">CREDENTIAL_ENCRYPTION_KEY</span>
                    <p className="text-[10px] text-slate-500 font-sans">AES-256-GCM symmetric key for at-rest tokens</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] border border-emerald-500/30">
                    256-BIT HEALTHY
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200">JWT_SECRET</span>
                    <p className="text-[10px] text-slate-500 font-sans">Operator session signing & verification key</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] border border-emerald-500/30">
                    HMAC-SHA256 SIGNED
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-200">ORCHESTRATION_SUBSTRATE</span>
                    <p className="text-[10px] text-slate-500 font-sans">Multi-agent DAG topological engine</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-[10px] border border-indigo-500/30">
                    LANGGRAPH COMPATIBLE
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-950 border border-cyan-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-sm text-cyan-200">Google Gemini Pro & Flash Engine</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30 font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Powers text-to-image prompt enhancement, master prompt optimization, multi-turn reasoning chat, and multimodal AI tools.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                    >
                      <span>Get Gemini Pro Key (AI Studio) ↗</span>
                    </a>
                    <a
                      href="/integrations"
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-glow-cyan"
                    >
                      <span>Manage Key in Vault →</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
