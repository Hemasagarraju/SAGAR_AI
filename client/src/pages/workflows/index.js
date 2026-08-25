import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import api from '../../services/api';
import {
  GitFork,
  Sparkles,
  Plus,
  Play,
  Copy,
  Trash2,
  Search,
  Tag,
  Clock,
  Layers,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sliders
} from 'lucide-react';

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [executingId, setExecutingId] = useState(null);
  const [allTags, setAllTags] = useState([]);

  const fetchWorkflows = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedTag) params.tag = selectedTag;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/workflows', { params });
      if (res.data?.success) {
        setWorkflows(res.data.data.workflows);
        
        // Aggregate unique tags
        const tags = new Set();
        (res.data.data.workflows || []).forEach((w) => {
          (w.tags || []).forEach((t) => tags.add(t));
        });
        setAllTags(Array.from(tags));
      }
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [selectedTag, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorkflows();
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/workflows/${id}/duplicate`);
      if (res.data?.success) {
        fetchWorkflows();
      }
    } catch (err) {
      console.error('Failed to duplicate workflow:', err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      const res = await api.delete(`/workflows/${id}`);
      if (res.data?.success) {
        setWorkflows((prev) => prev.filter((w) => w._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete workflow:', err);
    }
  };

  const handleExecute = async (id, e) => {
    e.stopPropagation();
    setExecutingId(id);
    try {
      const res = await api.post(`/workflows/${id}/execute`, {
        inputs: { triggerSource: 'manual_list_run', timestamp: new Date().toISOString() }
      });
      if (res.data?.success) {
        const execObj = res.data.data || res.data.execution;
        router.push(`/executions/${execObj._id || execObj.id}`);
      }
    } catch (err) {
      console.error('Failed to trigger execution:', err);
      setExecutingId(null);
    }
  };

  const handleCreateNew = async () => {
    try {
      const res = await api.post('/workflows', {
        name: 'New Operations Workflow',
        description: 'Visual workflow created via Operator Studio canvas.'
      });
      if (res.data?.success) {
        const wfObj = res.data.data || res.data.workflow;
        router.push(`/workflows/${wfObj._id || wfObj.id}`);
      }
    } catch (err) {
      console.error('Failed to create workflow:', err);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell pageTitle="Workflows Directory">
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <GitFork className="w-6 h-6 text-indigo-400" />
                <span>Workflow Directory</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage, execute, version, and inspect your visual automation pipelines.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <NextLink
                href="/workflows/builder"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-glow-indigo transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Prompt Studio</span>
              </NextLink>

              <button
                onClick={handleCreateNew}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
              >
                <Plus className="w-4 h-4" />
                <span>New Workflow</span>
              </button>
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearch} className="w-full sm:w-96 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search workflows by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
              </select>

              {allTags.length > 0 && (
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Tags</option>
                  {allTags.map((t) => (
                    <option key={t} value={t}>
                      #{t}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Workflow Cards Grid */}
          {isLoading ? (
            <div className="text-center py-20 text-slate-500 space-y-2">
              <Loader2 className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
              <p className="text-xs font-mono">Loading workflow registry...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                <GitFork className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No Workflows Found</h3>
                <p className="text-xs text-slate-400">
                  You haven't built any workflows yet. Use our AI Prompt Studio or create one manually on the React Flow canvas.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <NextLink
                  href="/workflows/builder"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-glow-indigo transition"
                >
                  Generate with AI Prompt
                </NextLink>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((wf) => {
                const nodeCount = wf.nodes?.length || 0;
                const edgeCount = wf.edges?.length || 0;
                const isRunning = executingId === wf._id;

                return (
                  <div
                    key={wf._id}
                    onClick={() => router.push(`/workflows/${wf._id}`)}
                    className="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between cursor-pointer group space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] px-2.5 py-0.5 rounded-full font-mono uppercase font-semibold border ${
                            wf.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : wf.status === 'paused'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {wf.status || 'draft'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">v{wf.version || 1}</span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                          {wf.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {wf.description || 'No description provided.'}
                        </p>
                      </div>

                      {/* Tags */}
                      {wf.tags && wf.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {wf.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-indigo-300/80 font-mono border border-slate-800"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Stats & Controls */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-500" />
                          {nodeCount} Nodes
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleExecute(wf._id, e)}
                          disabled={isRunning}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition flex items-center gap-1"
                          title="Trigger Execution"
                        >
                          {isRunning ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                          <span>Run</span>
                        </button>

                        <button
                          onClick={(e) => handleDuplicate(wf._id, e)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleDelete(wf._id, e)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
