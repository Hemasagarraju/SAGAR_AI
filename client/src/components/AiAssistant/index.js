import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWorkflowStore } from '../../store/workflowStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Layers,
  Zap,
  HelpCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function AiAssistant() {
  const router = useRouter();
  const { setActiveWorkflow } = useWorkflowStore();
  const { isAuthenticated } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `👋 Greetings, Operator! I am **SAGARAGENT_AI Assistant**.\n\nI can automatically construct multi-agent DAG workflows, diagnose execution logs, and explain integration setups.\n\nWhat would you like to build or automate today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      workflowGraph: null
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/assistant', { message: text });
      if (res.data?.success) {
        const botData = res.data.data;
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: botData.reply,
          source: botData.source || 'neural-engine',
          latencyMs: botData.latencyMs || 24,
          workflowGraph: botData.workflowGraph,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(res.data?.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('AI Assistant Error:', err);
      const errMsg = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Error connecting to AI Substrate:** ${err.response?.data?.error || err.message || 'Please check your connection and retry.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToStudio = (graph) => {
    if (!graph) return;
    setActiveWorkflow({
      name: graph.name || 'AI Generated Automation',
      description: graph.description || 'Pipeline created via AI Assistant',
      nodes: graph.nodes,
      edges: graph.edges,
      tags: graph.tags || ['ai-assistant'],
      status: 'draft',
      version: 1
    });
    router.push('/workflows/builder');
    setIsOpen(false);
  };

  const quickPrompts = [
    'Build an automated lead processing workflow with Slack and Google Sheets',
    'Explain Python vs JavaScript for backend automation',
    'How does AES-256 Vault Encryption work in this system?',
    'How do the 5 autonomous agents (Planner, Exec, Valid, Recovery, Monitor) work?',
    'Who created SAGARAGENT_AI?'
  ];

  // Only render AI Assistant after user is authenticated and not on public auth screens
  if (!isAuthenticated || router.pathname === '/login' || router.pathname === '/register') {
    return null;
  }

  return (
    <>
      {/* Floating Futuristic Trigger Orb */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-violet-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-110 hover:shadow-[0_0_40px_rgba(99,102,241,0.8)] transition-all duration-300 group flex items-center gap-2.5"
            title="Open SAGARAGENT_AI Copilot"
          >
            {/* Ambient Pulse Ring */}
            <span className="absolute -inset-1 rounded-2xl bg-cyan-400 opacity-40 blur-sm group-hover:opacity-80 animate-ping" />

            <div className="relative flex items-center gap-2">
              <Bot className="w-5 h-5 text-white animate-bounce" />
              <span className="hidden sm:inline font-mono font-bold text-xs tracking-wider uppercase">
                AI Assistant
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Futuristic Holographic Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[440px] h-[600px] max-h-[85vh] rounded-3xl bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_15px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white font-mono">SAGARAGENT Copilot</h3>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40">
                    UNIVERSAL AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Ask any question or build workflows</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([messages[0]])}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Clear Chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                    <span>{isAssistant ? '🤖 SAGARAGENT AI' : '👤 Operator'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    {isAssistant && msg.latencyMs && (
                      <>
                        <span>•</span>
                        <span className="text-cyan-400 font-bold">⚡ {msg.latencyMs}ms</span>
                      </>
                    )}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-900/90 text-slate-200 border border-slate-800 shadow-sm'
                        : 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-medium shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Interactive Workflow Attachment Card */}
                    {msg.workflowGraph && msg.workflowGraph.nodes && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300 font-mono">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{msg.workflowGraph.name}</span>
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                            {msg.workflowGraph.nodes.length} Steps
                          </span>
                        </div>

                        <button
                          onClick={() => handleApplyToStudio(msg.workflowGraph)}
                          className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-[11px] shadow-sm transition flex items-center justify-center gap-1.5 font-mono"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Apply to AI Studio Canvas</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-cyan-300 text-xs font-mono">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Synthesizing agent reasoning & topology...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800/70 hover:bg-indigo-600/30 text-slate-300 hover:text-white border border-slate-700/60 hover:border-indigo-500/50 text-[10px] transition truncate max-w-[180px]"
                title={q}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or request a workflow..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white disabled:opacity-40 transition shadow-sm"
              title="Send Prompt"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
