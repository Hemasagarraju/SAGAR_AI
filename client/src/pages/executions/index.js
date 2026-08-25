import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import {
  PlayCircle,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Search,
  Filter,
  ChevronRight,
  Loader2,
  Zap,
  PauseCircle,
  XCircle,
  Radio
} from 'lucide-react';

export default function ExecutionsListPage() {
  const router = useRouter();
  const [executions, setExecutions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchExecutions = async () => {
    try {
      setIsLoading(true);
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/executions', { params });
      if (res.data?.success) {
        const payload = res.data.data || res.data;
        setExecutions(payload?.executions || []);
        setPagination(payload?.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Failed to load executions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, [statusFilter, page]);

  // Real-time update listener for execution state changes
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      const handleExecutionUpdated = (data) => {
        setExecutions((prev) =>
          prev.map((item) => {
            if (item._id === data.executionId) {
              return {
                ...item,
                status: data.status,
                currentNode: data.currentNode,
                duration: data.duration ?? item.duration
              };
            }
            return item;
          })
        );
      };

      socket.on('execution:updated', handleExecutionUpdated);
      return () => {
        socket.off('execution:updated', handleExecutionUpdated);
      };
    }
  }, []);

  return (
    <ProtectedRoute>
      <AppShell pageTitle="Workflow Execution Telemetry">
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <PlayCircle className="w-6 h-6 text-cyan-400" />
                <span>Execution Runs & Telemetry</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Monitor multi-agent execution lifecycles, retries, and granular agent audit streams in real time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Execution Statuses</option>
                <option value="RUNNING">RUNNING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="FAILED">FAILED</option>
                <option value="RETRYING">RETRYING</option>
                <option value="PAUSED">PAUSED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          {/* Table of Executions */}
          <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            {isLoading ? (
              <div className="text-center py-20 text-slate-500 space-y-2">
                <Loader2 className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
                <p className="text-xs font-mono">Fetching execution run logs...</p>
              </div>
            ) : executions.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <Activity className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                <p className="text-xs font-mono">No execution records found matching current criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5">Workflow</th>
                      <th className="py-3.5 px-5">Trigger Mode</th>
                      <th className="py-3.5 px-5">Duration</th>
                      <th className="py-3.5 px-5">Retries</th>
                      <th className="py-3.5 px-5">Started At</th>
                      <th className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {executions.map((exec) => {
                      const isSuccess = exec.status === 'COMPLETED';
                      const isFailed = exec.status === 'FAILED';
                      const isRunning = exec.status === 'RUNNING' || exec.status === 'RETRYING';
                      const isPaused = exec.status === 'PAUSED';
                      const isCancelled = exec.status === 'CANCELLED';

                      return (
                        <tr
                          key={exec._id}
                          onClick={() => router.push(`/executions/${exec._id}`)}
                          className="hover:bg-slate-850/60 cursor-pointer transition"
                        >
                          <td className="py-3.5 px-5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                                isSuccess
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                  : isFailed
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                  : isPaused
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                  : isCancelled
                                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse'
                              }`}
                            >
                              {isSuccess && <CheckCircle2 className="w-3 h-3" />}
                              {isFailed && <AlertCircle className="w-3 h-3" />}
                              {isRunning && <Zap className="w-3 h-3" />}
                              {isPaused && <PauseCircle className="w-3 h-3" />}
                              {isCancelled && <XCircle className="w-3 h-3" />}
                              <span>{exec.status}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-5">
                            <span className="font-bold text-white block">
                              {exec.workflowSnapshot?.name || exec.workflowId?.name || 'Automation Workflow'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ID: {exec._id}
                            </span>
                          </td>

                          <td className="py-3.5 px-5 font-mono text-[11px] text-slate-300">
                            {exec.triggerType || 'manual'}
                          </td>

                          <td className="py-3.5 px-5 font-mono text-[11px] text-slate-300">
                            {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : 'In Progress'}
                          </td>

                          <td className="py-3.5 px-5 font-mono text-[11px]">
                            {exec.retryCount > 0 ? (
                              <span className="text-amber-400">{exec.retryCount} Retries</span>
                            ) : (
                              <span className="text-slate-500">0</span>
                            )}
                          </td>

                          <td className="py-3.5 px-5 font-mono text-[11px] text-slate-400">
                            {new Date(exec.createdAt).toLocaleString()}
                          </td>

                          <td className="py-3.5 px-5 text-right">
                            <span className="text-indigo-400 hover:text-indigo-300 font-mono text-xs flex items-center justify-end gap-1">
                              <span>Inspect Stream</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Bar */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total runs)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 rounded bg-slate-800 text-white disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page >= pagination.totalPages}
                    className="px-3 py-1.5 rounded bg-slate-800 text-white disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
