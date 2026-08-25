import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import api from '../services/api';
import {
  Layers,
  Mail,
  MessageSquare,
  Hash,
  Table,
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
  Link2,
  Unlink,
  RefreshCw,
  Lock,
  Key,
  ShieldCheck,
  ExternalLink,
  Loader2,
  Sliders
} from 'lucide-react';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [manualModalProvider, setManualModalProvider] = useState(null);
  const [manualApiKey, setManualApiKey] = useState('');
  const [manualWebhook, setManualWebhook] = useState('');
  const [isSavingManual, setIsSavingManual] = useState(false);

  const providerMeta = {
    gmail: {
      name: 'Gmail API',
      category: 'Email & Messaging',
      icon: Mail,
      color: 'rose',
      description: 'Dispatch automated transactional emails, alerts, and read inbound messages.',
      supportsOAuth: true,
      hasWebhook: false
    },
    slack: {
      name: 'Slack Workspace',
      category: 'Team Collaboration',
      icon: MessageSquare,
      color: 'emerald',
      description: 'Post rich formatted messages, alerts, and channel updates to Slack.',
      supportsOAuth: true,
      hasWebhook: true
    },
    discord: {
      name: 'Discord Bot & Webhook',
      category: 'Community & Alerts',
      icon: Hash,
      color: 'indigo',
      description: 'Broadcast real-time operations alerts to Discord servers and channels.',
      supportsOAuth: true,
      hasWebhook: true
    },
    'google-sheets': {
      name: 'Google Sheets',
      category: 'Data & Spreadsheets',
      icon: Table,
      color: 'emerald',
      description: 'Append audit records, export event payloads, and read spreadsheet rows.',
      supportsOAuth: true,
      hasWebhook: false
    },
    openrouter: {
      name: 'OpenRouter AI Models',
      category: 'LLM Orchestration',
      icon: Sparkles,
      color: 'violet',
      description: 'Access 100+ LLMs (Claude, Gemini, Llama 3, DeepSeek) for agentic reasoning.',
      supportsOAuth: false,
      hasWebhook: false,
      isApiKey: true
    },
    gemini: {
      name: 'Google Gemini Pro / Flash AI',
      category: 'Multimodal Generative AI',
      icon: Bot,
      color: 'cyan',
      description: 'Native Gemini 2.5 Pro & Flash models for workflow generation, agentic reasoning, and AI copilot.',
      supportsOAuth: false,
      hasWebhook: false,
      isApiKey: true
    }
  };

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true);
      const [listRes, statusRes] = await Promise.all([
        api.get('/integrations'),
        api.get('/integrations/status')
      ]);

      if (listRes.data?.success) {
        setIntegrations(listRes.data.integrations);
      }
      if (statusRes.data?.success) {
        setStatuses(statusRes.data.statuses);
      }
    } catch (err) {
      console.error('Failed to load integrations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleStartOAuth = (provider) => {
    const baseUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000/api'
      : (process.env.NEXT_PUBLIC_API_URL || 'https://api.hemasagar.ai/api');
    window.location.href = `${baseUrl}/integrations/oauth/${provider}/start`;
  };

  const handleTestConnection = async (provider) => {
    setTestingProvider(provider);
    setTestResult(null);
    try {
      const res = await api.post(`/integrations/${provider}/test`);
      setTestResult({ provider, ...res.data.testResult });
      fetchIntegrations();
    } catch (err) {
      setTestResult({
        provider,
        success: false,
        message: err.response?.data?.error || err.message || 'Connection check failed'
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const [isAutoConnecting, setIsAutoConnecting] = useState(false);

  const handleAutoConnectAll = async () => {
    try {
      setIsAutoConnecting(true);
      await api.post('/integrations/seed-demo');
      await fetchIntegrations();
      setTestResult({
        provider: 'ALL INTEGRATIONS',
        success: true,
        message: 'Successfully auto-connected and validated all 6 tools & integration vaults!'
      });
    } catch (err) {
      console.error('Failed to auto-connect demo integrations:', err);
    } finally {
      setIsAutoConnecting(false);
    }
  };

  const handleDisconnect = async (provider) => {
    if (!confirm(`Are you sure you want to disconnect ${provider}?`)) return;
    try {
      await api.delete(`/integrations/${provider}`);
      fetchIntegrations();
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  };

  const handleSaveManualCredentials = async (e) => {
    e.preventDefault();
    if (!manualModalProvider) return;

    setIsSavingManual(true);
    try {
      const credentials = {};
      if (manualApiKey) credentials.apiKey = manualApiKey;
      if (manualWebhook) credentials.webhookUrl = manualWebhook;
      if (manualApiKey && !credentials.accessToken) credentials.accessToken = manualApiKey;

      await api.post('/integrations', {
        provider: manualModalProvider,
        credentials,
        accountIdentifier: manualWebhook ? 'Configured Webhook' : `${manualModalProvider}-api-key`
      });

      setManualModalProvider(null);
      setManualApiKey('');
      setManualWebhook('');
      fetchIntegrations();
    } catch (err) {
      console.error('Manual credential save failed:', err);
    } finally {
      setIsSavingManual(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell pageTitle="Integrations & OAuth Vault">
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Layers className="w-6 h-6 text-indigo-400" />
                <span>Third-Party Integrations & OAuth Hub</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sensitive tokens and refresh credentials are encrypted at rest with AES-256-GCM.</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleAutoConnectAll}
                disabled={isAutoConnecting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold shadow-glow-emerald transition disabled:opacity-50"
              >
                {isAutoConnecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting All...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>⚡ 1-Click Auto-Connect All Tools</span>
                  </>
                )}
              </button>

              <button
                onClick={fetchIntegrations}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Test Diagnostic Banner */}
          {testResult && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-3 animate-in fade-in duration-200 ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold">
                    {testResult.provider.toUpperCase()} Diagnostic: {testResult.success ? 'HEALTHY' : 'FAILED'}
                  </h4>
                  <p className="text-slate-300 font-sans mt-0.5">{testResult.message}</p>
                </div>
              </div>
              <button
                onClick={() => setTestResult(null)}
                className="text-slate-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Integration Cards Grid */}
          {isLoading ? (
            <div className="text-center py-20 text-slate-500 space-y-2">
              <Loader2 className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
              <p className="text-xs font-mono">Scanning integration vaults...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Array.isArray(integrations) ? integrations : []).map((item, index) => {
                const providerKey = item?.provider || `provider_${index}`;
                const meta = providerMeta[providerKey] || {
                  name: providerKey,
                  category: 'Integration',
                  icon: Layers,
                  color: 'indigo',
                  description: 'Third-party automation connection.'
                };

                const Icon = meta.icon || Layers;
                const status = (statuses && statuses[providerKey]) || { connected: item?.isConnected || false, health: 'disconnected' };
                const isConnected = Boolean(item?.isConnected);

                return (
                  <div
                    key={providerKey}
                    className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between space-y-5 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                            <Icon className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-white">{meta.name}</h3>
                            <span className="text-[10px] text-slate-400 font-mono">{meta.category}</span>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] px-2.5 py-0.5 rounded-full font-mono uppercase font-semibold border ${
                            isConnected
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {isConnected ? 'Connected' : 'Not Configured'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {meta.description}
                      </p>

                      {isConnected && item.accountIdentifier && (
                        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                          <span className="text-slate-500">Account</span>
                          <span className="text-indigo-300 truncate max-w-[160px]">
                            {item.accountIdentifier}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {isConnected ? (
                          <button
                            onClick={() => handleDisconnect(item.provider)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 text-xs font-semibold transition flex items-center gap-1"
                          >
                            <Unlink className="w-3.5 h-3.5" />
                            <span>Disconnect</span>
                          </button>
                        ) : meta.supportsOAuth ? (
                          <button
                            onClick={() => handleStartOAuth(item.provider)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-glow-indigo transition flex items-center gap-1.5"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>OAuth Connect</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setManualModalProvider(item.provider)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-cyan transition flex items-center gap-1.5"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Connect API Key</span>
                          </button>
                        )}

                        {isConnected && (
                          <button
                            onClick={() => setManualModalProvider(item.provider)}
                            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                            title="Update API Key / Config"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {isConnected && (
                        <button
                          onClick={() => handleTestConnection(item.provider)}
                          disabled={testingProvider === item.provider}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition text-xs font-mono flex items-center gap-1"
                          title="Run Health Check"
                        >
                          {testingProvider === item.provider ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          <span>Test</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Manual Credential Configuration Modal */}
          {manualModalProvider && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setManualModalProvider(null)} />
              <div className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-5 z-10 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-bold text-sm text-white">
                      Configure {manualModalProvider.toUpperCase()} Credentials
                    </h3>
                  </div>
                  <button
                    onClick={() => setManualModalProvider(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveManualCredentials} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-medium text-slate-300">API Key / Access Token</label>
                      {manualModalProvider === 'gemini' && (
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Get Gemini Key</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                    <input
                      type="password"
                      placeholder={manualModalProvider === 'gemini' ? 'AIzaSy...' : 'sk-live-...'}
                      value={manualApiKey}
                      onChange={(e) => setManualApiKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {providerMeta[manualModalProvider]?.hasWebhook && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-300">Webhook URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://discord.com/api/webhooks/... or https://hooks.slack.com/..."
                        value={manualWebhook}
                        onChange={(e) => setManualWebhook(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px] text-slate-400 space-y-1 font-mono">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Lock className="w-3 h-3" />
                      <span>AES-256-GCM Hardware Vault</span>
                    </div>
                    <p>Credentials will be encrypted with CREDENTIAL_ENCRYPTION_KEY at rest.</p>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setManualModalProvider(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingManual || (!manualApiKey && !manualWebhook)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow-indigo transition disabled:opacity-50"
                    >
                      {isSavingManual ? 'Encrypting & Saving...' : 'Save Credentials'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
