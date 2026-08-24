import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import api from '../services/api';
import {
  Sparkles,
  PenTool,
  Wand2,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Send,
  Layers,
  Code,
  Image as ImageIcon,
  MessageSquare,
  Compass,
  Zap,
  Loader2,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/router';

const CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: Compass },
  { id: 'image', label: 'Image Creation', icon: ImageIcon },
  { id: 'coding', label: 'Software & Code', icon: Code },
  { id: 'copywriting', label: 'Copywriting & Content', icon: PenTool },
  { id: 'persona', label: 'System Instructions', icon: Layers },
  { id: 'reasoning', label: 'Logic & Reasoning', icon: Sparkles }
];

export default function PromptStudioPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('optimizer'); // 'optimizer', 'persona', 'templates', 'saved'
  const [promptInput, setPromptInput] = useState('');
  const [targetCategory, setTargetCategory] = useState('image');
  const [targetModel, setTargetModel] = useState('gemini-1.5-pro');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // System persona state
  const [personaName, setPersonaName] = useState('');
  const [personaGoal, setPersonaGoal] = useState('');
  const [personaTone, setPersonaTone] = useState('Authoritative & Precise');
  const [generatedPersona, setGeneratedPersona] = useState('');
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);

  // Templates & Saved
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateCat, setSelectedTemplateCat] = useState('all');
  const [savedPrompts, setSavedPrompts] = useState([]);

  useEffect(() => {
    fetchTemplates();
    fetchSavedPrompts();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/prompts/templates');
      if (res.data?.success) {
        setTemplates(res.data.templates);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const fetchSavedPrompts = async () => {
    try {
      const res = await api.get('/prompts/saved');
      if (res.data?.success) {
        setSavedPrompts(res.data.prompts);
      }
    } catch (err) {
      console.error('Failed to load saved prompts:', err);
    }
  };

  const handleOptimize = async (e) => {
    if (e) e.preventDefault();
    if (!promptInput.trim() || isOptimizing) return;

    try {
      setIsOptimizing(true);
      const res = await api.post('/prompts/optimize', {
        prompt: promptInput.trim(),
        category: targetCategory,
        targetModel
      });

      if (res.data?.success) {
        setOptimizedResult(res.data);
      }
    } catch (err) {
      console.error('Optimization failed:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGeneratePersona = async (e) => {
    if (e) e.preventDefault();
    if (!personaGoal.trim() || isGeneratingPersona) return;

    try {
      setIsGeneratingPersona(true);
      const res = await api.post('/prompts/system-persona', {
        personaName,
        goal: personaGoal,
        tone: personaTone
      });

      if (res.data?.success) {
        setGeneratedPersona(res.data.systemInstruction);
      }
    } catch (err) {
      console.error('Persona generation failed:', err);
    } finally {
      setIsGeneratingPersona(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToLibrary = async () => {
    if (!optimizedResult) return;
    try {
      setIsSaving(true);
      await api.post('/prompts/saved', {
        title: `${targetCategory.toUpperCase()} Master Prompt - ${promptInput.substring(0, 30)}...`,
        category: targetCategory,
        prompt: promptInput,
        optimizedPrompt: optimizedResult.optimized,
        targetModel,
        tags: [targetCategory, targetModel]
      });
      setSavedSuccess(true);
      fetchSavedPrompts();
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save prompt:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSaved = async (id) => {
    try {
      await api.delete(`/prompts/saved/${id}`);
      setSavedPrompts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error('Failed to delete saved prompt:', err);
    }
  };

  const filteredTemplates = selectedTemplateCat === 'all'
    ? templates
    : templates.filter((t) => t.category === selectedTemplateCat);

  return (
    <ProtectedRoute>
      <AppShell pageTitle="AI Prompt Engineering Studio">
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span className="p-2 rounded-2xl bg-gradient-to-tr from-indigo-500 to-fuchsia-600 shadow-glow-indigo">
                  <PenTool className="w-6 h-6 text-white" />
                </span>
                <span>AI Prompt Engineering Studio</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Master prompt maker, multi-model optimizer, and system instructions architect.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start sm:self-auto overflow-x-auto">
              <button
                onClick={() => setActiveTab('optimizer')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'optimizer'
                    ? 'bg-indigo-600 text-white shadow-glow-indigo'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Prompt Optimizer</span>
              </button>

              <button
                onClick={() => setActiveTab('persona')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'persona'
                    ? 'bg-indigo-600 text-white shadow-glow-indigo'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>System Personas</span>
              </button>

              <button
                onClick={() => setActiveTab('templates')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'templates'
                    ? 'bg-indigo-600 text-white shadow-glow-indigo'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Master Templates</span>
              </button>

              <button
                onClick={() => setActiveTab('saved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'saved'
                    ? 'bg-indigo-600 text-white shadow-glow-indigo'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Vault ({savedPrompts.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: PROMPT OPTIMIZER */}
          {activeTab === 'optimizer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Form */}
              <div className="lg:col-span-5 space-y-6">
                <form onSubmit={handleOptimize} className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Original Prompt Idea</span>
                    </label>
                    <textarea
                      rows={5}
                      placeholder="e.g. Write a python script to scrape prices and send discord webhook alert..."
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-400">Domain Category</label>
                      <select
                        value={targetCategory}
                        onChange={(e) => setTargetCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="image">🎨 Image Creation</option>
                        <option value="coding">💻 Software & Coding</option>
                        <option value="copywriting">✍️ Copywriting & SaaS</option>
                        <option value="persona">🤖 Agent Persona</option>
                        <option value="reasoning">🧠 Complex Logic</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-slate-400">Target Model</label>
                      <select
                        value={targetModel}
                        onChange={(e) => setTargetModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      >
                        <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                        <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
                        <option value="gemini-2.0-flash">Google Gemini 2.0 Flash</option>
                        <option value="midjourney-v6">Midjourney v6 / Flux</option>
                        <option value="gpt-4o">GPT-4o / Claude 3.5</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isOptimizing || !promptInput.trim()}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-glow-indigo transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isOptimizing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Architecting Master Prompt...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>Optimize Prompt with Gemini</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Output */}
              <div className="lg:col-span-7 space-y-6">
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <PenTool className="w-4 h-4 text-indigo-400" />
                      <h3 className="font-bold text-sm text-white">Master Engineered Prompt</h3>
                    </div>

                    {optimizedResult && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(optimizedResult.optimized)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={handleSaveToLibrary}
                          disabled={isSaving || savedSuccess}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-glow-indigo"
                        >
                          {savedSuccess ? (
                            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-300" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                          <span>{savedSuccess ? 'Saved to Vault!' : 'Save Prompt'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {isOptimizing ? (
                    <div className="h-64 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center gap-3 text-center p-8">
                      <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-400 animate-spin" />
                      <p className="font-bold text-sm text-white animate-pulse">Deconstructing & Upgrading Prompt Structure...</p>
                    </div>
                  ) : optimizedResult ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs space-y-3 font-mono">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-900 pb-2">
                          <span>Target: <strong className="text-indigo-400">{optimizedResult.targetModel}</strong></span>
                          <span>Domain: <strong className="text-cyan-400">{optimizedResult.category}</strong></span>
                        </div>
                        <pre className="text-slate-200 whitespace-pre-wrap font-sans text-xs leading-relaxed max-h-[380px] overflow-y-auto">
                          {optimizedResult.optimized}
                        </pre>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        {optimizedResult.category === 'image' && (
                          <button
                            onClick={() => router.push('/images')}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white text-xs font-bold hover:from-cyan-500 hover:to-indigo-500 transition flex items-center gap-1.5"
                          >
                            <span>Generate in Image Studio</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => router.push('/chat')}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Test in Gemini Chat</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 flex flex-col items-center justify-center gap-2 text-center p-8">
                      <PenTool className="w-10 h-10 text-slate-700" />
                      <p className="font-bold text-sm text-slate-300">Prompt Optimizer Ready</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Enter your rough prompt on the left to transform it into a high-tier prompt formatted for Gemini, Midjourney, or Claude.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM PERSONAS */}
          {activeTab === 'persona' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-6">
                <form onSubmit={handleGeneratePersona} className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">AI Agent / Persona Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sentinel Security Auditor, Growth Strategist"
                      value={personaName}
                      onChange={(e) => setPersonaName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Core Mission & Directives</label>
                    <textarea
                      rows={4}
                      placeholder="e.g. Audit cloud infrastructure, identify security vulnerabilities, recommend zero-trust fixes..."
                      value={personaGoal}
                      onChange={(e) => setPersonaGoal(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Desired Tone & Personality</label>
                    <input
                      type="text"
                      placeholder="e.g. Direct, Technical, Authoritative, Witty"
                      value={personaTone}
                      onChange={(e) => setPersonaTone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGeneratingPersona || !personaGoal.trim()}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-glow-indigo transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingPersona ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Synthesizing System Instructions...</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4" />
                        <span>Generate System Prompt</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7">
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-white">System Prompt Output</h3>
                    {generatedPersona && (
                      <button
                        onClick={() => handleCopy(generatedPersona)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>

                  {generatedPersona ? (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {generatedPersona}
                    </div>
                  ) : (
                    <div className="h-64 rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 flex flex-col items-center justify-center gap-2 text-center p-8">
                      <Layers className="w-10 h-10 text-slate-700" />
                      <p className="font-bold text-sm text-slate-300">No System Prompt Generated</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Define your agent name and directives on the left to generate production-ready system instructions.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CURATED TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedTemplateCat(c.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                        selectedTemplateCat === c.id
                          ? 'bg-indigo-600 text-white shadow-glow-indigo'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Template Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTemplates.map((t) => (
                  <div
                    key={t.id}
                    className="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition duration-300 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30 uppercase font-bold">
                          {t.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{t.targetModel}</span>
                      </div>

                      <h4 className="font-bold text-sm text-white">{t.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-3 italic">"{t.prompt}"</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {t.tags.map((tag, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 text-[9px] text-slate-500">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => handleCopy(t.prompt)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Copy Prompt"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SAVED PROMPT VAULT */}
          {activeTab === 'saved' && (
            <div className="space-y-6">
              {savedPrompts.length === 0 ? (
                <div className="glass-panel p-12 rounded-3xl border border-dashed border-slate-800 text-center space-y-3">
                  <Bookmark className="w-12 h-12 text-slate-700 mx-auto" />
                  <h3 className="font-bold text-white text-base">Your Prompt Library is Empty</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Use the Prompt Optimizer to create master prompts, then save them here for 1-click access anytime.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {savedPrompts.map((p) => (
                    <div
                      key={p._id}
                      className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono uppercase font-bold">
                            {p.category}
                          </span>
                          <button
                            onClick={() => handleDeleteSaved(p._id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-bold text-sm text-white">{p.title}</h4>
                        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto p-3 rounded-xl bg-slate-950">
                          {p.optimizedPrompt || p.prompt}
                        </pre>
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopy(p.optimizedPrompt || p.prompt)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Prompt</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
