import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import MetricGrid from '../components/MetricGrid';
import api from '../services/api';
import { getSocket } from '../services/socket';
import {
  Sparkles,
  Play,
  GitFork,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Plus,
  Layers,
  ChevronRight,
  Radio,
  Cpu,
  Zap
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [liveActivities, setLiveActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [runningWorkflowId, setRunningWorkflowId] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/workflows/dashboard');
      if (res.data?.success) {
        setDashboardData(res.data.data);
        setLiveActivities(res.data.data.recentActivity || []);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();

    const socket = getSocket();
    if (socket) {
      const handleActivity = (event) => {
        const newEntry = {
          id: event.data?.id || `evt_${Date.now()}`,
          agent: event.data?.agent || 'monitoring',
          level: event.data?.level || 'info',
          message: event.data?.message || 'Agent executed step',
          timestamp: event.data?.timestamp || new Date(),
          executionId: event.executionId
        };

        setLiveActivities((prev) => [newEntry, ...prev.slice(0, 15)]);
      };

      socket.on('dashboard:activity', handleActivity);
      return () => {
        socket.off('dashboard:activity', handleActivity);
      };
    }
  }, []);

  const handleQuickExecute = async (workflowId) => {
    setRunningWorkflowId(workflowId);
    try {
      const res = await api.post(`/workflows/${workflowId}/execute`, {
        inputs: { triggerSource: 'dashboard_quick_run', timestamp: new Date().toISOString() }
      });
      if (res.data?.success) {
        const execObj = res.data.data || res.data.execution;
        router.push(`/executions/${execObj._id || execObj.id}`);
      }
    } catch (err) {
      console.error('Quick execution failed:', err);
      setRunningWorkflowId(null);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell pageTitle="Operator Console Dashboard">
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Operations Control Center
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Autonomous multi-agent orchestration, real-time telemetry, and self-healing pipelines.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <NextLink
                href="/workflows/builder"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-glow-indigo transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Prompt Studio</span>
              </NextLink>

              <NextLink
                href="/workflows"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>New Workflow</span>
              </NextLink>
            </div>
          </div>

          {/* Metric Grid */}
          <MetricGrid metrics={dashboardData?.metrics} />

          {/* Main 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (2 spans): Recent Executions & Workflows */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Executions */}
              <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-sm text-white">Recent Execution Runs</h3>
                  </div>
                  <NextLink
                    href="/executions"
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 transition"
                  >
                    <span>View All Runs</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </NextLink>
                </div>

                <div className="divide-y divide-slate-800/60 overflow-x-auto">
                  {dashboardData?.recentExecutions?.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs font-mono">
                      No executions recorded yet. Trigger your first workflow!
                    </div>
                  ) : (
                    dashboardData?.recentExecutions?.map((exec) => {
                      const isSuccess = exec.status === 'COMPLETED';
                      const isFailed = exec.status === 'FAILED';
                      const isRunning = exec.status === 'RUNNING' || exec.status === 'RETRYING';

                      return (
                        <div
                          key={exec._id}
                          onClick={() => router.push(`/executions/${exec._id}`)}
                          className="p-4 flex items-center justify-between gap-4 hover:bg-slate-850/50 cursor-pointer transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`p-2 rounded-xl border shrink-0 ${
                                isSuccess
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : isFailed
                                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 animate-pulse'
                              }`}
                            >
                              {isSuccess ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : isFailed ? (
                                <AlertCircle className="w-4 h-4" />
                              ) : (
                                <Zap className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-200 truncate">
                                {exec.workflowSnapshot?.name || 'Automation Pipeline'}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                                <span>ID: {exec._id.substring(0, 8)}</span>
                                <span>•</span>
                                <span>{new Date(exec.createdAt).toLocaleTimeString()}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right hidden sm:block">
                              <span className="text-[10px] text-slate-400 font-mono">
                                {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : 'Active'}
                              </span>
                              <span className="block text-[10px] text-slate-500 font-mono">
                                {exec.retryCount > 0 ? `${exec.retryCount} Retries` : 'Clean run'}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-semibold border ${
                                isSuccess
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : isFailed
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              }`}
                            >
                              {exec.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NextLink
                  href="/workflows/builder"
                  className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition group flex items-start justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <Sparkles className="w-4 h-4" />
                      <h4 className="font-bold text-xs text-white">Prompt-to-Graph Studio</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Describe an operational task in natural English and materialize executable DAG workflows.
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition shrink-0 mt-1" />
                </NextLink>

                <NextLink
                  href="/integrations"
                  className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition group flex items-start justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Layers className="w-4 h-4" />
                      <h4 className="font-bold text-xs text-white">Connect Integrations</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Authorize Gmail, Slack, Discord, and Google Sheets OAuth credentials with AES-256 vault.
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition shrink-0 mt-1" />
                </NextLink>
              </div>
            </div>

            {/* Right Column (1 span): Real-Time Agent Stream Feed */}
            <div className="space-y-6">
              <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[520px]">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                    <h3 className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                      Live Telemetry Stream
                    </h3>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    Real-Time
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
                  {liveActivities.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 space-y-2 text-xs">
                      <Cpu className="w-6 h-6 mx-auto text-slate-600 opacity-60" />
                      <p>Agent chain telemetry stream standby...</p>
                    </div>
                  ) : (
                    liveActivities.map((act, idx) => {
                      const isPlanner = act.agent === 'planner';
                      const isExecution = act.agent === 'execution';
                      const isValidation = act.agent === 'validation';
                      const isRecovery = act.agent === 'recovery';
                      const isMonitoring = act.agent === 'monitoring';

                      const agentBadgeStyle = isPlanner
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        : isExecution
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : isValidation
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : isRecovery
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30';

                      return (
                        <div
                          key={act.id || idx}
                          className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] space-y-1 animate-in fade-in duration-150"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold ${agentBadgeStyle}`}>
                              {act.agent}
                            </span>
                            <span className="text-[9px] text-slate-500">
                              {new Date(act.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-slate-300 leading-snug text-[10px] font-sans">
                            {act.message}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
