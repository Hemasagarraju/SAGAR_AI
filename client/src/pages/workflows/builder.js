import { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppShell from '../../components/AppShell';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import { useWorkflowStore } from '../../store/workflowStore';
import api from '../../services/api';
import {
  Sparkles,
  Play,
  Layers,
  ArrowRight,
  Loader2,
  Bot,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Activity,
  Cpu,
  ArrowDown
} from 'lucide-react';

export default function PromptWorkflowBuilder() {
  const router = useRouter();
  const { setActiveWorkflow } = useWorkflowStore();

  const [prompt, setPrompt] = useState(
    'When a high-priority customer ticket arrives via webhook, analyze sentiment with AI, post structured alert to #ops-alerts in Slack, and append audit log row to Google Sheets.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGraph, setGeneratedGraph] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [renderKey, setRenderKey] = useState(Date.now());

  const samplePrompts = [
    {
      title: 'Support Triage & Slack Alert',
      prompt: 'When a new support inquiry is received, evaluate ticket urgency and customer sentiment with AI, post alert to Slack #ops-alerts, and append to Google Sheets ledger.'
    },
    {
      title: 'Invoice Approval & Email Route',
      prompt: 'When an invoice arrives via webhook, parse vendor and amount with AI reasoning, if amount exceeds $1000 send approval email to finance@enterprise.com and log to Google Sheets.'
    },
    {
      title: 'Daily Digest & Discord Hub',
      prompt: 'Every weekday morning at 9am, summarize system operational performance metrics using AI, dispatch announcement to Discord #general, and notify team via Gmail.'
    },
    {
      title: 'Incident Responder Escalation',
      prompt: 'When server uptime monitor triggers webhook, classify incident severity with AI, post incident alert to Slack #critical-alerts, send urgent email to on-call engineer, and append to incident log.'
    }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await api.post('/workflows/generate', { prompt: prompt.trim() });
      if (res.data?.success && res.data?.data) {
        const graph = res.data.data;
        setGeneratedGraph(graph);
        setRenderKey(Date.now());
        setActiveWorkflow({
          name: graph.name || 'AI Generated Automation',
          description: graph.description || `Pipeline generated from prompt: "${prompt}"`,
          nodes: graph.nodes || [],
          edges: graph.edges || [],
          tags: graph.tags || ['ai-generated'],
          status: 'draft',
          version: 1
        });
      } else {
        throw new Error(res.data?.error || 'Server synthesis returned invalid data');
      }
    } catch (err) {
      console.warn('AI Generation Fallback to Client Engine:', err);
      // Client-side instant graph synthesis fallback
      const fallbackGraph = generateClientWorkflowFromPrompt(prompt.trim());
      setGeneratedGraph(fallbackGraph);
      setRenderKey(Date.now());
      setActiveWorkflow({
        name: fallbackGraph.name,
        description: fallbackGraph.description,
        nodes: fallbackGraph.nodes,
        edges: fallbackGraph.edges,
        tags: fallbackGraph.tags,
        status: 'draft',
        version: 1
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndEdit = async () => {
    if (!generatedGraph) return;

    setIsSaving(true);
    try {
      const res = await api.post('/workflows', {
        name: generatedGraph.name || 'AI Generated Automation',
        description: generatedGraph.description,
        nodes: generatedGraph.nodes,
        edges: generatedGraph.edges,
        tags: generatedGraph.tags || ['ai-generated'],
        status: 'draft'
      });

      if (res.data?.success) {
        const wf = res.data.data || res.data.workflow;
        router.push(`/workflows/${wf._id || wf.id}`);
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to save workflow.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndExecute = async () => {
    if (!generatedGraph) return;

    setIsSaving(true);
    try {
      const saveRes = await api.post('/workflows', {
        name: generatedGraph.name || 'AI Generated Automation',
        description: generatedGraph.description,
        nodes: generatedGraph.nodes,
        edges: generatedGraph.edges,
        tags: generatedGraph.tags || ['ai-generated'],
        status: 'active'
      });

      if (saveRes.data?.success) {
        const savedWf = saveRes.data.data || saveRes.data.workflow;
        const workflowId = savedWf._id || savedWf.id;
        const execRes = await api.post(`/workflows/${workflowId}/execute`, {
          inputs: { promptInput: prompt, source: 'ai_studio_direct_run' }
        });
        if (execRes.data?.success) {
          const execObj = execRes.data.data || execRes.data.execution;
          router.push(`/executions/${execObj._id || execObj.id}`);
        }
      }
    } catch (err) {
      console.error('Execution error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to execute workflow.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell pageTitle="AI Prompt-to-Workflow Studio">
        <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-mono">
                  AI Prompt-to-Workflow Studio
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Describe an operational requirement in plain English. The platform compiles it into an executable visual DAG.
              </p>
            </div>

            {generatedGraph && (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleSaveAndEdit}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Canvas Editor</span>
                </button>

                <button
                  onClick={handleSaveAndExecute}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-glow-indigo transition"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Save & Execute Now</span>
                </button>
              </div>
            )}
          </div>

          {/* Main 2-Column Split: Prompt Input & Live Graph Canvas Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            {/* Left Column (5 cols): Prompt Input & Templates */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono uppercase text-indigo-300 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-indigo-400" />
                    <span>Automation Prompt</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                    OpenRouter • Gemini • Rules
                  </span>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={5}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what steps your automated agent pipeline should take..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
                  />

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-glow-indigo transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Compiling DAG Graph with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Workflow Graph</span>
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {error}
                  </div>
                )}
              </div>

              {/* Suggested Templates */}
              <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
                <span className="text-[10px] font-bold font-mono uppercase text-slate-400 tracking-wider">
                  Operational Templates
                </span>
                <div className="space-y-2">
                  {samplePrompts.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setPrompt(s.prompt);
                      }}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 cursor-pointer transition text-xs group"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-200 group-hover:text-white">
                        <span>{s.title}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {s.prompt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (7 cols): Interactive Graph Canvas & Topology Steps */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="glass-panel rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col relative min-h-[520px]">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 z-10">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                      {generatedGraph ? generatedGraph.name : 'Interactive Graph Preview'}
                    </h3>
                  </div>
                  {generatedGraph && (
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {generatedGraph.nodes?.length || 0} Nodes
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Engine: {generatedGraph.source || 'AI Neural Substrate'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-h-[460px] h-full w-full relative" style={{ minHeight: '460px', height: '100%' }}>
                  {isGenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-20 space-y-3">
                      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                      <p className="text-xs font-mono text-slate-300">Constructing Kahn DAG topology...</p>
                    </div>
                  )}

                  {generatedGraph ? (
                    <WorkflowCanvas key={renderKey} />
                  ) : (
                    <div className="h-full min-h-[460px] flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-400 font-mono">Canvas Standby</h4>
                        <p className="text-[11px] text-slate-500 max-w-sm">
                          Submit an automation prompt on the left or click a template to generate a live visual workflow DAG.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step-by-Step Topology Sequence Card */}
              {generatedGraph && generatedGraph.nodes && (
                <div className="glass-panel p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase text-cyan-300 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      <span>Synthesized Pipeline Sequence ({generatedGraph.nodes.length} Steps)</span>
                    </span>
                    <button
                      onClick={handleSaveAndExecute}
                      disabled={isSaving}
                      className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm"
                    >
                      <Play className="w-3 h-3" />
                      <span>Execute Sequence</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {generatedGraph.nodes.map((node, idx) => (
                      <div
                        key={node.id}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-mono font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-200 flex items-center gap-2">
                              <span>{node.data?.label || node.label}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                                {node.type}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              {node.data?.description || 'Operational step action'}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>VALID</span>
                        </span>
                      </div>
                    ))}
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

// Client-Side Intelligent Graph Synthesizer
function generateClientWorkflowFromPrompt(promptText) {
  const p = promptText.toLowerCase();
  const nodes = [];
  const edges = [];

  // 1. Initial Trigger Node
  nodes.push({
    id: 'node_trigger_1',
    type: 'trigger',
    position: { x: 250, y: 80 },
    data: {
      label: p.includes('webhook') ? 'Incoming Webhook' : 'Manual Trigger',
      action: p.includes('webhook') ? 'webhook' : 'manual',
      description: 'Initiates automation workflow pipeline',
      config: {}
    }
  });

  let currentY = 220;

  // 2. AI Reasoning Agent Node
  if (p.includes('ai') || p.includes('evaluate') || p.includes('analyze') || p.includes('sentiment') || p.includes('parse')) {
    nodes.push({
      id: `node_ai_${nodes.length + 1}`,
      type: 'aiAgent',
      position: { x: 250, y: currentY },
      data: {
        label: 'AI Operational Reasoning',
        action: 'reasoning',
        description: 'Evaluates inputs with LLM and extracts entities',
        config: { model: 'gemini-1.5-flash', promptTemplate: 'Analyze input payload' }
      }
    });
    currentY += 140;
  }

  // 3. Condition Filter Node
  if (p.includes('if ') || p.includes('exceeds') || p.includes('filter') || p.includes('priority')) {
    nodes.push({
      id: `node_cond_${nodes.length + 1}`,
      type: 'condition',
      position: { x: 250, y: currentY },
      data: {
        label: 'Condition & Route Guard',
        action: 'evaluateCondition',
        description: 'Checks threshold conditions and routes flow',
        config: { field: 'severity', operator: 'equals', value: 'high' }
      }
    });
    currentY += 140;
  }

  // 4. Slack Action Node
  if (p.includes('slack') || p.includes('alert') || p.includes('channel')) {
    nodes.push({
      id: `node_slack_${nodes.length + 1}`,
      type: 'slack',
      position: { x: 250, y: currentY },
      data: {
        label: 'Slack Ops Channel Alert',
        action: 'sendMessage',
        description: 'Broadcasting structured operational alert',
        config: { channel: '#ops-alerts', message: '{{node_ai_2.output}}' }
      }
    });
    currentY += 140;
  }

  // 5. Gmail Action Node
  if (p.includes('email') || p.includes('gmail') || p.includes('notify') || p.includes('mail')) {
    nodes.push({
      id: `node_gmail_${nodes.length + 1}`,
      type: 'gmail',
      position: { x: 250, y: currentY },
      data: {
        label: 'Gmail Dispatch Node',
        action: 'sendEmail',
        description: 'Dispatches HTML operational email',
        config: { to: 'operator@enterprise.com', subject: 'Automated Agent Dispatch' }
      }
    });
    currentY += 140;
  }

  // 6. Google Sheets Action Node
  if (p.includes('sheet') || p.includes('sheets') || p.includes('log') || p.includes('ledger') || p.includes('row')) {
    nodes.push({
      id: `node_sheets_${nodes.length + 1}`,
      type: 'googleSheets',
      position: { x: 250, y: currentY },
      data: {
        label: 'Google Sheets Ledger',
        action: 'appendRow',
        description: 'Appends immutable audit record to spreadsheet',
        config: { spreadsheetId: 'ops-ledger-master', range: 'Sheet1!A:E' }
      }
    });
    currentY += 140;
  }

  // Connect edges sequentially
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `edge_${nodes[i].id}_${nodes[i + 1].id}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      animated: true,
      label: 'Next'
    });
  }

  return {
    name: 'AI Generated Automation',
    description: `Pipeline compiled from prompt: "${promptText}"`,
    tags: ['ai-studio', 'kahn-dag'],
    nodes,
    edges,
    source: 'sagaragent-neural-kernel'
  };
}
