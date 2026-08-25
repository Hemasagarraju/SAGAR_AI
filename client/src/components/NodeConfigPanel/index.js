import { useState, useEffect } from 'react';
import { useWorkflowStore } from '../../store/workflowStore';
import {
  X,
  Trash2,
  Sparkles,
  Mail,
  MessageSquare,
  Hash,
  Table,
  GitBranch,
  Play,
  FileCode,
  Check,
  Code2,
  HelpCircle
} from 'lucide-react';

export default function NodeConfigPanel() {
  const { nodes, selectedNodeId, setSelectedNodeId, updateNodeData, removeNode } = useWorkflowStore();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [action, setAction] = useState('');
  const [config, setConfig] = useState({});

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data?.label || '');
      setDescription(selectedNode.data?.description || '');
      setAction(selectedNode.data?.action || '');
      setConfig(selectedNode.data?.config || {});
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const handleSave = (newConfig = config, newAction = action, newLabel = label, newDesc = description) => {
    updateNodeData(selectedNode.id, {
      label: newLabel,
      description: newDesc,
      action: newAction,
      config: newConfig
    });
  };

  const handleConfigChange = (key, value) => {
    const updated = { ...config, [key]: value };
    setConfig(updated);
    handleSave(updated);
  };

  const insertVariable = (fieldKey, variableName) => {
    const currentVal = config[fieldKey] || '';
    const updated = { ...config, [fieldKey]: `${currentVal} {{${variableName}}}` };
    setConfig(updated);
    handleSave(updated);
  };

  // Extract other nodes to provide variable helper suggestions
  const otherNodes = nodes.filter((n) => n.id !== selectedNode.id);

  return (
    <div className="w-80 bg-slate-900/95 border-l border-slate-800 flex flex-col h-full select-none z-20">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <span>Configure Step</span>
          </h3>
          <span className="text-[10px] text-indigo-400 font-mono">ID: {selectedNode.id}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => removeNode(selectedNode.id)}
            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition"
            title="Delete Step"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedNodeId(null)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Label */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-300">Step Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              handleSave(config, action, e.target.value, description);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-300">Step Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              handleSave(config, action, label, e.target.value);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
          />
        </div>

        {/* Action Type */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-slate-300">Action / Operation</label>
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              handleSave(config, e.target.value, label, description);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs"
          >
            {selectedNode.type === 'trigger' && (
              <>
                <option value="manual">Manual On-Demand</option>
                <option value="webhook">Webhook Inbound</option>
                <option value="schedule">Cron Schedule</option>
              </>
            )}
            {selectedNode.type === 'aiAgent' && (
              <>
                <option value="analyze">Analyze & Synthesize</option>
                <option value="summarize">Summarize Content</option>
                <option value="classify">Classify / Triage</option>
                <option value="generate">Generate Response</option>
              </>
            )}
            {selectedNode.type === 'gmail' && (
              <>
                <option value="sendEmail">Send Email</option>
                <option value="readInbox">Read Inbox Messages</option>
              </>
            )}
            {selectedNode.type === 'slack' && (
              <option value="postMessage">Post Message to Channel</option>
            )}
            {selectedNode.type === 'discord' && (
              <>
                <option value="postMessage">Post Message to Channel</option>
                <option value="sendNotification">Send Notification Webhook</option>
              </>
            )}
            {selectedNode.type === 'googleSheets' && (
              <>
                <option value="appendRow">Append Row to Sheet</option>
                <option value="readRange">Read Cell Range</option>
              </>
            )}
            {selectedNode.type === 'condition' && (
              <option value="evaluate">Evaluate Logic Expression</option>
            )}
            {selectedNode.type === 'transform' && (
              <option value="format">Format / Template Data</option>
            )}
          </select>
        </div>

        {/* Dynamic Contextual Inputs */}
        <div className="pt-2 border-t border-slate-800 space-y-3.5">
          <span className="text-[10px] font-bold font-mono uppercase text-slate-400 tracking-wider">
            Step Parameters
          </span>

          {/* Trigger Config */}
          {selectedNode.type === 'trigger' && action === 'webhook' && (
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-300">Webhook Path</label>
              <input
                type="text"
                placeholder="/v1/leads"
                value={config.webhookPath || ''}
                onChange={(e) => handleConfigChange('webhookPath', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs"
              />
            </div>
          )}
          {selectedNode.type === 'trigger' && action === 'schedule' && (
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-300">Cron Schedule</label>
              <input
                type="text"
                placeholder="0 9 * * 1-5"
                value={config.cronSchedule || ''}
                onChange={(e) => handleConfigChange('cronSchedule', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs"
              />
            </div>
          )}

          {/* AI Agent Config */}
          {selectedNode.type === 'aiAgent' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300">Model Selection</label>
                <select
                  value={config.model || 'gemini-1.5-flash'}
                  onChange={(e) => handleConfigChange('model', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Google SDK)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="google/gemini-2.5-flash">Gemini 2.5 Flash (OpenRouter)</option>
                  <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (OpenRouter)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300">AI Prompt Instruction</label>
                <textarea
                  rows={4}
                  placeholder="Analyze incoming incident and extract severity level..."
                  value={config.prompt || ''}
                  onChange={(e) => handleConfigChange('prompt', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs"
                />
              </div>
            </>
          )}

          {/* Gmail Config */}
          {selectedNode.type === 'gmail' && action === 'sendEmail' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300">Recipient Email (To)</label>
                <input
                  type="text"
                  placeholder="client@enterprise.com"
                  value={config.to || ''}
                  onChange={(e) => handleConfigChange('to', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300">Subject</label>
                <input
                  type="text"
                  placeholder="Automated Notification"
                  value={config.subject || ''}
                  onChange={(e) => handleConfigChange('subject', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300">Email HTML Body</label>
                <textarea
                  rows={4}
                  placeholder="<p>Event details: {{node_ai_agent.output.summary}}</p>"
                  value={config.body || ''}
                  onChange={(e) => handleConfigChange('body', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs"
                />
              </div>
            </>
          )}

          {/* Slack Config */}
          {selectedNode.type === 'slack' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300">Channel</label>
                <input
                  type="text"
                  placeholder="#ops-alerts"
                  value={config.channel || ''}
                  onChange={(e) => handleConfigChange('channel', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300">Message Text</label>
                <textarea
                  rows={3}
                  placeholder="⚡ Incident resolved: {{node_ai_agent.output.summary}}"
                  value={config.message || ''}
                  onChange={(e) => handleConfigChange('message', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs"
                />
              </div>
            </>
          )}

          {/* Discord Config */}
          {selectedNode.type === 'discord' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300">Channel ID / Name</label>
                <input
                  type="text"
                  placeholder="general"
                  value={config.channelId || ''}
                  onChange={(e) => handleConfigChange('channelId', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300">Message Content</label>
                <textarea
                  rows={3}
                  placeholder="📢 Operations update: {{node_ai_agent.output.summary}}"
                  value={config.content || ''}
                  onChange={(e) => handleConfigChange('content', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs"
                />
              </div>
            </>
          )}

          {/* Google Sheets Config */}
          {selectedNode.type === 'googleSheets' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300">Spreadsheet ID</label>
                <input
                  type="text"
                  placeholder="ops_audit_2026"
                  value={config.spreadsheetId || ''}
                  onChange={(e) => handleConfigChange('spreadsheetId', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-300">Sheet Range</label>
                <input
                  type="text"
                  placeholder="Sheet1!A:E"
                  value={config.range || ''}
                  onChange={(e) => handleConfigChange('range', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs"
                />
              </div>
            </>
          )}

          {/* Condition Config */}
          {selectedNode.type === 'condition' && (
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-300">Condition Expression (JS)</label>
              <input
                type="text"
                placeholder="{{inputs.priority}} === 'HIGH'"
                value={config.expression || ''}
                onChange={(e) => handleConfigChange('expression', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs"
              />
            </div>
          )}

          {/* Transform Config */}
          {selectedNode.type === 'transform' && (
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-300">Transformation Template</label>
              <textarea
                rows={3}
                placeholder="Result: {{node_1.output.summary}}"
                value={config.template || ''}
                onChange={(e) => handleConfigChange('template', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs"
              />
            </div>
          )}

          {/* Variable Injection Helper */}
          {otherNodes.length > 0 && (
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-indigo-400 font-mono text-[10px]">
                <Code2 className="w-3.5 h-3.5" />
                <span>Available Variables</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Click to copy path into active template:
              </p>
              <div className="flex flex-wrap gap-1 pt-1 max-h-24 overflow-y-auto">
                <span
                  onClick={() => navigator.clipboard.writeText('{{inputs}}')}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 font-mono text-[9px] cursor-pointer border border-slate-700"
                  title="Click to copy"
                >
                  {'{{inputs}}'}
                </span>
                {otherNodes.map((n) => (
                  <span
                    key={n.id}
                    onClick={() => navigator.clipboard.writeText(`{{${n.id}.output}}`)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 font-mono text-[9px] cursor-pointer border border-slate-700 truncate max-w-[120px]"
                    title={`Click to copy: {{${n.id}.output}}`}
                  >
                    {`{{${n.id}.output}}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
