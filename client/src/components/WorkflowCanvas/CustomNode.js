import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useWorkflowStore } from '../../store/workflowStore';
import {
  Play,
  Webhook,
  Clock,
  Sparkles,
  Mail,
  MessageSquare,
  Hash,
  Table,
  GitBranch,
  FileCode,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
  Trash2,
  Sliders
} from 'lucide-react';

const typeIcons = {
  trigger: Play,
  aiAgent: Sparkles,
  gmail: Mail,
  slack: MessageSquare,
  discord: Hash,
  googleSheets: Table,
  condition: GitBranch,
  transform: FileCode
};

const typeColors = {
  trigger: {
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    iconBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    border: 'border-indigo-500/40'
  },
  aiAgent: {
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    iconBg: 'bg-violet-500/20 text-violet-400 border-violet-500/40',
    border: 'border-violet-500/40'
  },
  gmail: {
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    border: 'border-rose-500/40'
  },
  slack: {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    border: 'border-emerald-500/40'
  },
  discord: {
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    iconBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    border: 'border-indigo-500/40'
  },
  googleSheets: {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    border: 'border-emerald-500/40'
  },
  condition: {
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    border: 'border-amber-500/40'
  },
  transform: {
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    border: 'border-cyan-500/40'
  }
};

function CustomNode({ id, type, data, selected }) {
  const { currentNodeId, activeExecution, removeNode, setSelectedNodeId } = useWorkflowStore();

  const isCurrentStep = currentNodeId === id;
  const isExecutionActive = Boolean(activeExecution && (activeExecution.status === 'RUNNING' || activeExecution.status === 'RETRYING'));
  const isCompleted = Boolean(Array.isArray(activeExecution?.orchestrationMetadata?.completedNodes) && activeExecution.orchestrationMetadata.completedNodes.includes(id));
  const isFailed = isCurrentStep && activeExecution?.status === 'FAILED';
  const isRetrying = isCurrentStep && activeExecution?.status === 'RETRYING';

  const Icon = typeIcons[type] || Sparkles;
  const theme = typeColors[type] || typeColors.trigger;

  // Extract preview config snippet
  const config = data?.config || {};
  let snippet = '';
  if (type === 'gmail') snippet = config.to ? `To: ${config.to}` : 'Ready';
  else if (type === 'slack') snippet = config.channel ? `Channel: ${config.channel}` : 'Ready';
  else if (type === 'discord') snippet = config.channelId ? `Channel: #${config.channelId}` : 'Ready';
  else if (type === 'googleSheets') snippet = config.spreadsheetId ? `Sheet: ${config.spreadsheetId}` : 'Ready';
  else if (type === 'aiAgent') snippet = config.model || 'gemini-1.5-flash';
  else if (type === 'condition') snippet = config.expression ? `${config.expression.substring(0, 22)}...` : 'Logic';
  else snippet = data?.action || 'Manual Trigger';

  return (
    <div
      onClick={() => setSelectedNodeId(id)}
      className={`relative w-64 rounded-2xl transition-all duration-200 shadow-xl ${
        selected
          ? 'ring-2 ring-indigo-400 border-indigo-400 bg-slate-900 shadow-glow-indigo'
          : isCurrentStep
          ? 'ring-2 ring-cyan-400 border-cyan-400 bg-slate-900 shadow-glow-cyan animate-pulse-slow'
          : 'border border-slate-800 bg-slate-900/90 hover:border-slate-700'
      }`}
    >
      {/* Target Handle (Top) */}
      {type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-indigo-400 !w-3 !h-3 !border-2 !border-slate-900"
        />
      )}

      {/* Node Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-1.5 rounded-xl border ${theme.iconBg} shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{data?.label || 'Step'}</h4>
            <span className="text-[10px] text-slate-400 font-mono block truncate uppercase">
              {type} • {data?.action || 'run'}
            </span>
          </div>
        </div>

        {/* Status Chip */}
        <div>
          {isRetrying ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
              <RotateCcw className="w-2.5 h-2.5 animate-spin" />
              <span>Retry</span>
            </span>
          ) : isCurrentStep && isExecutionActive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              <span>Running</span>
            </span>
          ) : isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>Done</span>
            </span>
          ) : isFailed ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono border border-rose-500/30">
              <AlertCircle className="w-2.5 h-2.5" />
              <span>Failed</span>
            </span>
          ) : (
            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono ${theme.badge}`}>
              {type}
            </span>
          )}
        </div>
      </div>

      {/* Node Body Preview */}
      <div className="p-3 text-[11px] text-slate-300 space-y-2">
        <p className="text-slate-400 text-[10px] line-clamp-2 leading-relaxed">
          {data?.description || 'Autonomous node step'}
        </p>

        <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/60 font-mono text-[10px] text-slate-300 flex items-center justify-between">
          <span className="text-slate-500 uppercase">Config</span>
          <span className="text-indigo-300 truncate max-w-[140px]">{snippet}</span>
        </div>
      </div>

      {/* Node Actions Bar (Hover) */}
      <div className="px-3 pb-2 flex items-center justify-end gap-1.5 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedNodeId(id);
          }}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          title="Configure Node"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeNode(id);
          }}
          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
          title="Delete Node"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Source Handles (Bottom) */}
      {type === 'condition' ? (
        <>
          <Handle
            id="true"
            type="source"
            position={Position.Bottom}
            style={{ left: '30%' }}
            className="!bg-emerald-400 !w-3 !h-3 !border-2 !border-slate-900"
          />
          <Handle
            id="false"
            type="source"
            position={Position.Bottom}
            style={{ left: '70%' }}
            className="!bg-rose-400 !w-3 !h-3 !border-2 !border-slate-900"
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-indigo-400 !w-3 !h-3 !border-2 !border-slate-900"
        />
      )}
    </div>
  );
}

export default memo(CustomNode);
