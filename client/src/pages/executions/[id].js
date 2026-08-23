import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../services/api';
import { getSocket, joinExecutionRoom, leaveExecutionRoom } from '../../services/socket';
import {
  PlayCircle,
  PauseCircle,
  Play,
  XCircle,
  Terminal,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowLeft,
  Loader2,
  Radio,
  FileJson,
  Database,
  Wrench
} from 'lucide-react';

export default function ExecutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const {
    activeExecution,
    setActiveExecution,
    setActiveWorkflow,
    executionLogs,
    handleAgentEvent,
    handleExecutionUpdate
  } = useWorkflowStore();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline'); // timeline | payload | memory | errors
  const [isActing, setIsActing] = useState(false);

  const fetchExecution = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await api.get(`/executions/${id}/timeline`);
      if (res.data?.success) {
        const payload = res.data.data || res.data;
        const execution = payload?.execution || payload;
        const logs = payload?.logs || [];
        setActiveExecution(execution, logs);

        // Load snapshot into workflow canvas
        if (execution?.workflowSnapshot) {
          setActiveWorkflow({
            ...execution.workflowSnapshot,
            name: execution.workflowSnapshot.name || 'Runtime Execution Snapshot'
          });
        }
      }
    } catch (err) {
      console.error('Failed to load execution timeline:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecution();

    if (id) {
      joinExecutionRoom(id);

      const socket = getSocket();
      if (socket) {
        socket.on('agent:event', handleAgentEvent);
        socket.on('execution:updated', handleExecutionUpdate);

        return () => {
          leaveExecutionRoom(id);
          socket.off('agent:event', handleAgentEvent);
          socket.off('execution:updated', handleExecutionUpdate);
        };
      }
    }
  }, [id, handleAgentEvent, handleExecutionUpdate]);

  const handlePause = async () => {
    if (!id) return;
    setIsActing(true);
    try {
      await api.post(`/executions/${id}/pause`);
    } catch (err) {
      console.error('Pause failed:', err);
    } finally {
      setIsActing(false);
    }
  };

  const handleResume = async () => {
    if (!id) return;
    setIsActing(true);
    try {
      await api.post(`/executions/${id}/resume`);
    } catch (err) {
      console.error('Resume failed:', err);
    } finally {
      setIsActing(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to cancel this running execution?')) return;
    setIsActing(true);
    try {
      await api.post(`/executions/${id}/cancel`);
    } catch (err) {
      console.error('Cancel failed:', err);
    } finally {
      setIsActing(false);
    }
  };

  const isRunning = activeExecution?.status === 'RUNNING' || activeExecution?.status === 'RETRYING';
  const isPaused = activeExecution?.status === 'PAUSED';
  const isCompleted = activeExecution?.status === 'COMPLETED';
  const isFailed = activeExecution?.status === 'FAILED';

  return (
    <ProtectedRoute>
      <AppShell pageTitle={`Execution ${id}`}>
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
          {/* Top Inspector Toolbar */}
          <div className="h-16 border-b border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between z-30 shrink-0">
            <div className="flex items-center gap-4">
              <NextLink
                href="/executions"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </NextLink>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-sm font-bold text-white tracking-tight">
                    {activeExecution?.workflowSnapshot?.name || 'Execution Run'}
                  </h1>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase font-bold border ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : isFailed
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : isPaused
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse'
                    }`}
                  >
                    {activeExecution?.status || 'PENDING'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  Execution ID: {id} • Started {activeExecution?.createdAt ? new Date(activeExecution.createdAt).toLocaleTimeString() : 'Now'}
                </p>
              </div>
            </div>

            {/* Execution Controls (Pause, Resume, Cancel) */}
            <div className="flex items-center gap-2.5">
              {isRunning && (
                <button
                  onClick={handlePause}
                  disabled={isActing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-xs font-semibold transition"
                >
                  <PauseCircle className="w-3.5 h-3.5" />
                  <span>Pause Run</span>
                </button>
              )}

              {isPaused && (
                <button
                  onClick={handleResume}
                  disabled={isActing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 text-xs font-semibold transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Run</span>
                </button>
              )}

              {(isRunning || isPaused) && (
                <button
                  onClick={handleCancel}
                  disabled={isActing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Run</span>
                </button>
              )}
            </div>
          </div>

          {/* Main 2-Column Split: Snapshot Canvas on Left, Real-Time Agent Stream on Right */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Left Column (6 cols): Runtime Snapshot Graph */}
            <div className="lg:col-span-6 border-r border-slate-800 relative h-full">
              <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-2">
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>Runtime DAG Snapshot</span>
              </div>
              <WorkflowCanvas readOnly={true} />
            </div>

            {/* Right Column (6 cols): Granular Agent Timeline & Inspector Tabs */}
            <div className="lg:col-span-6 flex flex-col h-full bg-slate-900/60 overflow-hidden">
              {/* Tab Navigation */}
              <div className="h-11 border-b border-slate-800 px-4 flex items-center gap-4 bg-slate-900">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`text-xs font-medium font-mono pb-1 border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'timeline'
                      ? 'border-indigo-400 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Agent Timeline ({executionLogs.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('payload')}
                  className={`text-xs font-medium font-mono pb-1 border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === 'payload'
                      ? 'border-cyan-400 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileJson className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Context Outputs</span>
                </button>

                {activeExecution?.error && (
                  <button
                    onClick={() => setActiveTab('errors')}
                    className={`text-xs font-medium font-mono pb-1 border-b-2 transition flex items-center gap-1.5 ${
                      activeTab === 'errors'
                        ? 'border-rose-400 text-rose-300'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5 text-rose-400" />
                    <span>Recovery Diagnosis</span>
                  </button>
                )}
              </div>

              {/* Tab Panels */}
              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
                {/* Timeline Tab */}
                {activeTab === 'timeline' && (
                  <div className="space-y-3">
                    {executionLogs.length === 0 ? (
                      <div className="text-center py-20 text-slate-500 text-xs">
                        Awaiting agent orchestration stream...
                      </div>
                    ) : (
                      executionLogs.map((log, idx) => {
                        const isPlanner = log.agent === 'planner';
                        const isExecution = log.agent === 'execution';
                        const isValidation = log.agent === 'validation';
                        const isRecovery = log.agent === 'recovery';
                        const isMonitoring = log.agent === 'monitoring';

                        const badgeStyle = isPlanner
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
                            key={log.id || log._id || idx}
                            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2 shadow-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] px-2 py-0.5 rounded-full border uppercase font-bold ${badgeStyle}`}>
                                  {log.agent} Agent
                                </span>
                                {log.nodeId && (
                                  <span className="text-[10px] text-slate-500">
                                    Step: {log.nodeId}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                            </div>

                            <p className="text-slate-200 text-xs font-sans leading-relaxed">
                              {log.message}
                            </p>

                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <pre className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-[10px] text-slate-300 overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Outputs Tab */}
                {activeTab === 'payload' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        Workflow Step Outputs
                      </span>
                      <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs overflow-x-auto">
                        {JSON.stringify(activeExecution?.outputs || {}, null, 2)}
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                        Initial Trigger Inputs
                      </span>
                      <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-xs overflow-x-auto">
                        {JSON.stringify(activeExecution?.inputs || {}, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Errors & Recovery Tab */}
                {activeTab === 'errors' && activeExecution?.error && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-rose-300">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <h4 className="font-bold text-xs">Failure Classification: {activeExecution.error.classification}</h4>
                      </div>
                      <p className="text-xs font-sans">{activeExecution.error.message}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 uppercase">
                        Recommended Recovery Resolution
                      </span>
                      <p className="text-xs font-sans text-slate-400">
                        {activeExecution.error.classification === 'AUTH_EXPIRED'
                          ? 'Navigate to the Integrations hub to reconnect expired tokens.'
                          : activeExecution.error.classification === 'MISSING_FIELDS'
                          ? 'Inspect the node configuration parameters and ensure mandatory variables are supplied.'
                          : 'Transient upstream error. Automated backoff retries exhausted.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
