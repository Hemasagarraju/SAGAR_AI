import { useState } from 'react';
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
  Search,
  Plus,
  Info
} from 'lucide-react';

export default function NodePalette() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addNode } = useWorkflowStore();

  const paletteCategories = [
    {
      name: 'Triggers',
      items: [
        {
          type: 'trigger',
          action: 'manual',
          label: 'Manual Trigger',
          icon: Play,
          color: 'indigo',
          description: 'Initiate workflow execution on-demand'
        },
        {
          type: 'trigger',
          action: 'webhook',
          label: 'Webhook Trigger',
          icon: Webhook,
          color: 'cyan',
          description: 'Listen for inbound HTTP POST events'
        },
        {
          type: 'trigger',
          action: 'schedule',
          label: 'Cron Scheduler',
          icon: Clock,
          color: 'amber',
          description: 'Trigger periodically on cron schedule'
        }
      ]
    },
    {
      name: 'AI Operations Agent',
      items: [
        {
          type: 'aiAgent',
          action: 'analyze',
          label: 'AI Reasoning Agent',
          icon: Sparkles,
          color: 'violet',
          description: 'Synthesize data & evaluate operational context via LLM'
        }
      ]
    },
    {
      name: 'Third-Party Integrations',
      items: [
        {
          type: 'gmail',
          action: 'sendEmail',
          label: 'Gmail Dispatcher',
          icon: Mail,
          color: 'rose',
          description: 'Send automated emails or fetch unread messages'
        },
        {
          type: 'slack',
          action: 'postMessage',
          label: 'Slack Bot',
          icon: MessageSquare,
          color: 'emerald',
          description: 'Post structured alerts to Slack channel'
        },
        {
          type: 'discord',
          action: 'postMessage',
          label: 'Discord Webhook',
          icon: Hash,
          color: 'indigo',
          description: 'Send formatted notifications to Discord'
        },
        {
          type: 'googleSheets',
          action: 'appendRow',
          label: 'Google Sheets',
          icon: Table,
          color: 'emerald',
          description: 'Append or read spreadsheet audit ledger rows'
        }
      ]
    },
    {
      name: 'Logic & Utility',
      items: [
        {
          type: 'condition',
          action: 'evaluate',
          label: 'Condition Router',
          icon: GitBranch,
          color: 'amber',
          description: 'Evaluate assertions and branch execution'
        },
        {
          type: 'transform',
          action: 'format',
          label: 'Data Transform',
          icon: FileCode,
          color: 'cyan',
          description: 'Reshape, extract or serialize payload variables'
        }
      ]
    }
  ];

  const onDragStart = (event, nodeItem) => {
    event.dataTransfer.setData('application/reactflow/type', nodeItem.type);
    event.dataTransfer.setData('application/reactflow/data', JSON.stringify({
      label: nodeItem.label,
      action: nodeItem.action,
      description: nodeItem.description
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const colorStyles = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 group-hover:border-indigo-400',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 group-hover:border-cyan-400',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30 group-hover:border-amber-400',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/30 group-hover:border-violet-400',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30 group-hover:border-rose-400',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 group-hover:border-emerald-400'
  };

  return (
    <div className="w-72 bg-slate-900/95 border-r border-slate-800 flex flex-col h-full select-none">
      {/* Header & Search */}
      <div className="p-4 border-b border-slate-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center justify-between">
          <span>Node Palette</span>
          <span className="text-[10px] text-slate-500 font-mono">Drag to canvas</span>
        </h3>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Palette List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {paletteCategories.map((category) => {
          const filteredItems = category.items.filter((item) =>
            item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={category.name} className="space-y-2">
              <span className="text-[10px] font-bold font-mono uppercase text-slate-400 tracking-wider">
                {category.name}
              </span>
              <div className="space-y-1.5">
                {filteredItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => onDragStart(e, item)}
                      className="glass-panel p-2.5 rounded-xl border border-slate-800/80 hover:border-slate-700 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg border ${colorStyles[item.color]} shrink-0 transition-colors`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => addNode(item.type, null, { label: item.label, action: item.action, description: item.description })}
                        className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-indigo-600 transition shrink-0 opacity-0 group-hover:opacity-100"
                        title="Add to canvas"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
