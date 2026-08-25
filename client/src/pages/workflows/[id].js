import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import NodePalette from '../../components/NodePalette';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import NodeConfigPanel from '../../components/NodeConfigPanel';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../services/api';
import { getSocket, joinExecutionRoom } from '../../services/socket';
import {
  Save,
  Play,
  Copy,
  Trash2,
  GitFork,
  Check,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Terminal,
  Activity,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;

  const {
    activeWorkflow,
    setActiveWorkflow,
    saveWorkflow,
    isDirty,
    isSaving,
    activeExecution,
    setActiveExecution,
    handleAgentEvent,
    handleExecutionUpdate,
    executionLogs,
    isExecutionDrawerOpen,
    toggleExecutionDrawer
  } = useWorkflowStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDesc, setWorkflowDesc] = useState('');
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    if (!id) return;

    const loadWorkflow = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/workflows/${id}`);
        if (res.data?.success) {
          const wf = res.data.data || res.data.workflow;
          if (wf) {
            setActiveWorkflow(wf);
            setWorkflowName(wf.name || 'Untitled Workflow');
            setWorkflowDesc(wf.description || '');
            setStatus(wf.status || 'draft');
          }
        }
      } catch (err) {
        console.error('Failed to load workflow:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkflow();
  }, [id, setActiveWorkflow]);

  // Handle Socket Events during execution
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on('agent:event', handleAgentEvent);
      socket.on('execution:updated', handleExecutionUpdate);

      return () => {
        socket.off('agent:event', handleAgentEvent);
        socket.off('execution:updated', handleExecutionUpdate);
      };
    }
  }, [handleAgentEvent, handleExecutionUpdate]);

  const handleSave = async () => {
    if (!activeWorkflow) return;
    const res = await saveWorkflow();
    if (res?.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleExecute = async () => {
    if (!id) return;
    setIsExecuting(true);
    toggleExecutionDrawer(true);

    try {
      // First save any unsaved canvas changes
      await saveWorkflow();

      const res = await api.post(`/workflows/${id}/execute`, {
        inputs: { triggerSource: 'canvas_editor_direct_run', timestamp: new Date().toISOString() }
      });

      if (res.data?.success) {
        const exec = res.data.execution;
        setActiveExecution(exec, []);
        joinExecutionRoom(exec._id);
      }
    } catch (err) {
      console.error('Execution failed:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell pageTitle="Workflow Editor Studio">
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden">
          {/* Studio Top Control Toolbar */}
          <div className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between z-30 shrink-0">
            {/* Left: Workflow Metadata */}
            <div className="flex items-center gap-3">
              <NextLink
                href="/workflows"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Back to Directory"
              >
                <ArrowLeft className="w-4 h-4" />
              </NextLink>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => {
                    setWorkflowName(e.target.value);
                    if (activeWorkflow) activeWorkflow.name = e.target.value;
                  }}
                  className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 text-sm font-bold text-white px-1 py-0.5 focus:outline-none transition"
                  placeholder="Workflow Name"
                />
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  v{activeWorkflow?.version || 1}
                </span>
                {isDirty && (
                  <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved changes" />
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  if (activeWorkflow) activeWorkflow.status = e.target.value;
                  handleSave();
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="draft">DRAFT</option>
                <option value="active">ACTIVE</option>
                <option value="paused">PAUSED</option>
              </select>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : saveSuccess ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{saveSuccess ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-glow-indigo transition disabled:opacity-50"
              >
                {isExecuting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>Run Workflow</span>
              </button>
            </div>
          </div>

          {/* Canvas Workspace Area with Palette, Canvas, and Config Panel */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left: Node Palette */}
            <NodePalette />

            {/* Center: React Flow Canvas */}
            <div className="flex-1 h-full relative">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mr-2" />
                  Loading workflow canvas graph...
                </div>
              ) : (
                <WorkflowCanvas />
              )}
            </div>

            {/* Right: Node Configuration Panel */}
            <NodeConfigPanel />
          </div>

          {/* Bottom Collapsible Real-Time Execution Drawer */}
          <div
            className={`border-t border-slate-800 bg-slate-900/95 transition-all duration-300 z-30 flex flex-col ${
              isExecutionDrawerOpen ? 'h-64' : 'h-10'
            }`}
          >
            {/* Drawer Toggle Header */}
            <div
              onClick={() => toggleExecutionDrawer()}
              className="h-10 px-4 border-b border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-850 select-none"
            >
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Live Agent Execution Timeline
                </span>
                {activeExecution && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-semibold border ${
                      activeExecution.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : activeExecution.status === 'FAILED'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }`}
                  >
                    {activeExecution.status}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {activeExecution && (
                  <NextLink
                    href={`/executions/${activeExecution._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono underline"
                  >
                    Open Deep Inspector →
                  </NextLink>
                )}
                {isExecutionDrawerOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {/* Logs Stream */}
            {isExecutionDrawerOpen && (
              <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
                {executionLogs.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No execution events in buffer. Click "Run Workflow" to trigger the agent chain.
                  </div>
                ) : (
                  executionLogs.map((log, idx) => (
                    <div
                      key={log.id || log._id || idx}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-3"
                    >
                      <span className="text-[10px] text-slate-500 font-mono shrink-0 mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold shrink-0 ${
                          log.agent === 'planner'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : log.agent === 'execution'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            : log.agent === 'validation'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : log.agent === 'recovery'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {log.agent}
                      </span>
                      <p className="text-slate-200 text-xs font-sans flex-1">
                        {log.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
