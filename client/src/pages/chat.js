import { useState, useRef, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import NextLink from 'next/link';
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Code,
  Zap,
  Trash2,
  Plus,
  MessageSquare,
  Image as ImageIcon,
  PenTool,
  Wrench,
  ChevronDown,
  Terminal,
  Cpu,
  Loader2,
  Compass,
  ArrowRight
} from 'lucide-react';

const SUGGESTIONS = [
  {
    title: 'Code Generation',
    desc: 'Write a full Node.js WebSocket server with auto-reconnect & JWT auth',
    icon: Code
  },
  {
    title: 'Image Prompt Engineering',
    desc: 'Craft a Midjourney v6 prompt for an ethereal floating solar city in 8K',
    icon: ImageIcon
  },
  {
    title: 'First Principles Reasoning',
    desc: 'Explain how Neural Attention & Transformers work with clear analogies',
    icon: Sparkles
  },
  {
    title: 'SaaS Growth Strategy',
    desc: 'Create a direct-response landing page copy structure with 3 value pillars',
    icon: PenTool
  }
];

const MODELS = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', desc: 'Ultra-fast throughput & low latency (1M tokens)', badge: 'FAST' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'Next-Gen multimodal intelligence (1M tokens)', badge: 'NEXT-GEN' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: 'Complex reasoning, coding & architecture (2M tokens)', badge: 'REASONING' }
];

export default function ChatStudioPage() {
  const { user } = useAuthStore();
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [chatSessions, setChatSessions] = useState([
    { id: 'sess-1', title: 'New Conversation', active: true, createdAt: new Date() }
  ]);
  const [activeSessionId, setActiveSessionId] = useState('sess-1');

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hello **${user?.name || 'Operator'}**! I am **ChatGPT-style AI Assistant** powered by **Google Gemini AI**.\n\n` +
        `I am ready to assist you with:\n` +
        `• 💻 **Fullstack Software Engineering & Bug Fixing**\n` +
        `• 🎨 **Master AI Prompt Engineering for Images & Video**\n` +
        `• 🧠 **Deep Reasoning, Business Strategy & Analysis**\n` +
        `• ✍️ **Copywriting, Translations & Executive Summaries**\n\n` +
        `What would you like to build or explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini-1.5-flash'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleNewChat = () => {
    const newId = `sess-${Date.now()}`;
    const newSession = {
      id: newId,
      title: 'New Conversation',
      active: true,
      createdAt: new Date()
    };

    setChatSessions((prev) => [newSession, ...prev.map((s) => ({ ...s, active: false }))]);
    setActiveSessionId(newId);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `👋 New conversation started. Ask me anything, or pick one of the quick prompts below!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: selectedModel.id
      }
    ]);
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    // Update title of active session if it's the first message
    setChatSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId && s.title === 'New Conversation'
          ? { ...s, title: text.length > 28 ? `${text.substring(0, 28)}...` : text }
          : s
      )
    );

    const userMsg = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-8).map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      const res = await api.post('/ai/assistant', {
        message: text,
        conversationHistory,
        userName: user?.name || 'Operator',
        modelPreference: selectedModel.id
      });

      if (res.data?.success) {
        const aiMsg = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: res.data.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: res.data.data.source || selectedModel.id,
          latencyMs: res.data.data.latencyMs
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Neural connection notice: ${err.response?.data?.error || err.message || 'Processed request.'}\n\nHere is what I recommend for "${text}": Break the problem into modular steps and execute each component cleanly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'gemini-fallback'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <ProtectedRoute>
      <AppShell pageTitle="ChatGPT AI Assistant">
        <div className="h-[calc(100vh-4.5rem)] flex overflow-hidden">
          {/* ChatGPT Left Sidebar: Sessions & Navigation */}
          <aside className="w-64 border-r border-slate-800 bg-slate-950 p-4 flex flex-col justify-between hidden md:flex shrink-0">
            <div className="space-y-4">
              {/* New Chat Button */}
              <button
                onClick={handleNewChat}
                className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-glow-indigo transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>

              {/* Chat Sessions History */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold px-2">Recent Chats</span>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  {chatSessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSessionId(s.id)}
                      className={`w-full p-2.5 rounded-xl text-left text-xs transition flex items-center gap-2 truncate ${
                        s.id === activeSessionId
                          ? 'bg-slate-900 text-white font-semibold border border-slate-800'
                          : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{s.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick AI Studios Navigation */}
              <div className="space-y-1 pt-2 border-t border-slate-900">
                <span className="text-[10px] uppercase font-mono text-slate-500 font-bold px-2">AI Studios</span>
                <NextLink
                  href="/images"
                  className="w-full p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 text-xs transition flex items-center gap-2"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Image Creator</span>
                </NextLink>

                <NextLink
                  href="/prompts"
                  className="w-full p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 text-xs transition flex items-center gap-2"
                >
                  <PenTool className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Prompt Studio</span>
                </NextLink>

                <NextLink
                  href="/tools"
                  className="w-full p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 text-xs transition flex items-center gap-2"
                >
                  <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI Tools Hub</span>
                </NextLink>
              </div>
            </div>

            {/* Model Info Badge */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Engine</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-slate-200 font-mono">{selectedModel.name}</p>
              <p className="text-[10px] text-slate-500">Google AI Studio Pro Linked</p>
            </div>
          </aside>

          {/* Main ChatGPT Conversation Stage */}
          <main className="flex-1 flex flex-col bg-slate-950 justify-between overflow-hidden">
            {/* Top Bar */}
            <div className="h-14 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between bg-slate-900/40 backdrop-blur-md shrink-0">
              {/* Model Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedModel.id}
                  onChange={(e) => setSelectedModel(MODELS.find((m) => m.id === e.target.value) || MODELS[0])}
                  className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.badge})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMessages([messages[0]])}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs flex items-center gap-1"
                  title="Clear Chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-4xl mx-auto w-full">
              {messages.length === 1 && (
                <div className="space-y-6 py-4">
                  {/* Suggestions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SUGGESTIONS.map((s, idx) => {
                      const Icon = s.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSend(s.desc)}
                          className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/60 text-left transition duration-200 group flex items-start gap-3 bg-slate-900/40"
                        >
                          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 group-hover:scale-110 transition">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-white group-hover:text-cyan-300 transition">{s.title}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{s.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-glow-cyan mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] rounded-3xl p-4 sm:p-5 text-xs sm:text-sm space-y-3 ${
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-glow-indigo rounded-br-none'
                        : 'glass-panel border border-slate-800/90 text-slate-100 rounded-bl-none shadow-xl bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] opacity-75 font-mono pb-2 border-b border-white/10">
                      <span className="font-bold">{m.role === 'user' ? user?.name || 'You' : 'Gemini AI Assistant'}</span>
                      <div className="flex items-center gap-2">
                        {m.latencyMs && <span>{m.latencyMs}ms</span>}
                        <span>{m.timestamp}</span>
                      </div>
                    </div>

                    <div className="leading-relaxed whitespace-pre-wrap font-sans space-y-2">
                      {m.content}
                    </div>

                    {m.role === 'assistant' && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                        <span className="text-[10px] font-mono text-cyan-400/80">{m.source}</span>
                        <button
                          onClick={() => handleCopy(m.id, m.content)}
                          className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition flex items-center gap-1"
                        >
                          {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-1 font-bold text-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3.5 justify-start items-center">
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0 animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-cyan-400 font-mono">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini 2.5 Pro reasoning and drafting response...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Floating ChatGPT Input Box */}
            <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="glass-panel p-2 rounded-3xl border border-slate-800/90 shadow-2xl bg-slate-900/90 backdrop-blur-xl flex items-center gap-2"
              >
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Message Gemini AI... (Press Enter to send, Shift+Enter for new line)"
                  className="flex-1 bg-transparent px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none resize-none"
                />

                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-glow-cyan transition disabled:opacity-40"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-center text-slate-500 mt-2">
                Powered by Google Gemini 2.5 Pro Neural Foundation • Responses synthesized in real time
              </p>
            </div>
          </main>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
