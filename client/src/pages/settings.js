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
  Eye,
  EyeOff,
  ExternalLink,
  Sparkles,
  Zap,
  Check,
  Loader2
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [serverHealth, setServerHealth] = useState(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);

  // AI Studio Key State
  const [aiStatus, setAiStatus] = useState(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [keyError, setKeyError] = useState('');

  const fetchHealthAndStatus = async () => {
    try {
      setIsLoadingHealth(true);
      const [healthRes, statusRes] = await Promise.all([
        api.get('/health'),
        api.get('/ai/status')
      ]);
      setServerHealth(healthRes.data);
      if (statusRes.data?.success) {
        setAiStatus(statusRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch diagnostics:', err);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealthAndStatus();
  }, []);

  const handleTestKey = async () => {
    setKeyError('');
    setTestResult(null);
    setSaveSuccess(false);

    if (!apiKeyInput.trim() && !aiStatus?.isConfigured) {
      setKeyError('Please paste your Google AI Studio API Key (starts with AIzaSy...).');
      return;
    }

    try {
      setIsTesting(true);
      const res = await api.post('/ai/test-key', { apiKey: apiKeyInput.trim() || undefined });
      if (res.data?.success) {
        setTestResult(res.data);
      }
    } catch (err) {
      setKeyError(err.response?.data?.error || err.message || 'Verification failed. Please check your key.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) {
      setKeyError('Please enter your Google AI Studio API Key to save.');
      return;
    }

    setKeyError('');
    setSaveSuccess(false);

    try {
      setIsSaving(true);
      const res = await api.post('/ai/save-key', { apiKey: apiKeyInput.trim() });
      if (res.data?.success) {
        setSaveSuccess(true);
        setApiKeyInput('');
        fetchHealthAndStatus();
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      setKeyError(err.response?.data?.error || err.message || 'Failed to save key.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell pageTitle="AI Studio & System Settings">
        <div className="p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
          {/* Header */}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Settings className="w-6 h-6 text-cyan-400" />
              <span>Google AI Studio & System Settings</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Connect your Google AI Studio account, manage Gemini Pro models, and monitor real-time server health.
            </p>
          </div>

          <div className="space-y-6">
            {/* Google AI Studio Import Hub */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/40 shadow-2xl space-y-6 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-glow-cyan text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <span>Google AI Studio Integration</span>
                      {aiStatus?.isConfigured ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>CONNECTED</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                          READY TO CONNECT
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Import your Google Gemini Pro / Flash subscription key to power all generation engines.
                    </p>
                  </div>
                </div>

                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 shrink-0"
                >
                  <span>Get AI Studio Key ↗</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* 3-Step Import Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <span className="text-cyan-400 font-mono font-bold text-[11px]">STEP 1</span>
                  <p className="font-semibold text-slate-200">Open AI Studio</p>
                  <p className="text-[11px] text-slate-400">Go to Google AI Studio and click "Create API key".</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <span className="text-indigo-400 font-mono font-bold text-[11px]">STEP 2</span>
                  <p className="font-semibold text-slate-200">Copy Key</p>
                  <p className="text-[11px] text-slate-400">Copy the key string (starts with <code className="text-cyan-300">AIzaSy...</code>).</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <span className="text-emerald-400 font-mono font-bold text-[11px]">STEP 3</span>
                  <p className="font-semibold text-slate-200">Paste & Connect</p>
                  <p className="text-[11px] text-slate-400">Paste below and click "Save & Connect".</p>
                </div>
              </div>

              {/* API Key Form */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                    <span>Google AI Studio API Key</span>
                    {aiStatus?.maskedKey && (
                      <span className="text-[11px] font-mono text-slate-400">
                        Current Key: <strong className="text-cyan-300">{aiStatus.maskedKey}</strong>
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      placeholder={aiStatus?.isConfigured ? 'Paste new key to update (AIzaSy...)' : 'AIzaSy...'}
                      value={apiKeyInput}
                      onChange={(e) => {
                        setApiKeyInput(e.target.value);
                        setKeyError('');
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 pr-20 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-3 p-1 text-slate-500 hover:text-slate-300 transition"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Notifications & Error feedback */}
                {keyError && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
                    <div className="flex items-start gap-2 font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                      <span>{keyError}</span>
                    </div>
                    <div className="pl-6 text-[11px] text-slate-400 space-y-1">
                      <p>💡 <strong>Troubleshooting tips:</strong></p>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                        <li>Ensure the key begins with <code className="text-cyan-300 font-mono">AIzaSy...</code> (typically 39 characters).</li>
                        <li>Create a brand new key for free at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">Google AI Studio ↗</a>.</li>
                        <li>Check that your Google Cloud / AI Studio project has the <strong>Generative Language API</strong> enabled.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {testResult && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{testResult.message}</span>
                    </div>
                    <span className="font-mono text-[11px] text-emerald-400">Latency: {testResult.latencyMs}ms</span>
                  </div>
                )}

                {saveSuccess && (
                  <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Google AI Studio API Key saved and activated successfully!</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={handleTestKey}
                    disabled={isTesting}
                    className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-cyan-400" />}
                    <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <button
                    onClick={handleSaveKey}
                    disabled={isSaving || !apiKeyInput.trim()}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-extrabold shadow-glow-cyan transition flex items-center gap-2 disabled:opacity-40"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{isSaving ? 'Connecting...' : 'Save & Connect to SAGAR AI'}</span>
                  </button>
                </div>
              </div>

              {/* Supported Google AI Studio Models */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Enabled AI Studio Models</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">Gemini 2.5 Pro</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">1M TOKENS</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Deep reasoning, complex code generation, and prompt expansion.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">Gemini 2.5 Flash</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">ULTRA FAST</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Sub-second generation for tools, summaries, and translations.</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">Gemini 1.5 Pro</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">2M TOKENS</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Massive context window for full repository & document analysis.</p>
                  </div>
                </div>
              </div>
            </div>

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

            {/* Server Substrate Telemetry */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Server className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-sm text-white">Engine Substrate Telemetry</h3>
                </div>
                <button
                  onClick={fetchHealthAndStatus}
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
                  <p className="text-[10px] text-emerald-400">Connected</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">AI Foundation</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="font-bold text-white text-sm">Google AI Studio</div>
                  <p className="text-[10px] text-emerald-400">Gemini 2.5 Active</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Real-Time Stream</span>
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="font-bold text-white text-sm">Socket.IO Server</div>
                  <p className="text-[10px] text-emerald-400">Online</p>
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
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
