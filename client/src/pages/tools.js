import { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import api from '../services/api';
import {
  Wrench,
  Code,
  FileText,
  Languages,
  Smile,
  Copy,
  Check,
  Zap,
  Sparkles,
  Loader2,
  Terminal,
  BarChart3,
  Globe
} from 'lucide-react';

const LANGUAGES = [
  'Spanish', 'French', 'German', 'Hindi', 'Telugu', 'Japanese', 'Chinese (Mandarin)',
  'Korean', 'Russian', 'Arabic', 'Portuguese', 'Italian', 'Dutch', 'Turkish'
];

const CODE_LANGUAGES = [
  'JavaScript (Node.js)', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'SQL', 'Bash'
];

export default function ToolsHubPage() {
  const [activeTab, setActiveTab] = useState('code'); // 'code', 'summarize', 'translate', 'sentiment'
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Code Gen state
  const [codePrompt, setCodePrompt] = useState('');
  const [codeLang, setCodeLang] = useState('TypeScript');
  const [codeOutput, setCodeOutput] = useState('');

  // Summarizer state
  const [summaryInput, setSummaryInput] = useState('');
  const [summaryFormat, setSummaryFormat] = useState('bullet-points');
  const [summaryOutput, setSummaryOutput] = useState('');

  // Translator state
  const [transInput, setTransInput] = useState('');
  const [targetLang, setTargetLang] = useState('Spanish');
  const [transOutput, setTransOutput] = useState('');

  // Sentiment state
  const [sentInput, setSentInput] = useState('');
  const [sentResult, setSentResult] = useState(null);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateCode = async (e) => {
    if (e) e.preventDefault();
    if (!codePrompt.trim() || isLoading) return;
    try {
      setIsLoading(true);
      const res = await api.post('/tools/code', { prompt: codePrompt.trim(), language: codeLang });
      if (res.data?.success) {
        setCodeOutput(res.data.code);
      }
    } catch (err) {
      console.error('Code gen error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarize = async (e) => {
    if (e) e.preventDefault();
    if (!summaryInput.trim() || isLoading) return;
    try {
      setIsLoading(true);
      const res = await api.post('/tools/summarize', { text: summaryInput.trim(), format: summaryFormat });
      if (res.data?.success) {
        setSummaryOutput(res.data.summary);
      }
    } catch (err) {
      console.error('Summary error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async (e) => {
    if (e) e.preventDefault();
    if (!transInput.trim() || isLoading) return;
    try {
      setIsLoading(true);
      const res = await api.post('/tools/translate', { text: transInput.trim(), targetLanguage: targetLang });
      if (res.data?.success) {
        setTransOutput(res.data.translation);
      }
    } catch (err) {
      console.error('Translate error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeSentiment = async (e) => {
    if (e) e.preventDefault();
    if (!sentInput.trim() || isLoading) return;
    try {
      setIsLoading(true);
      const res = await api.post('/tools/sentiment', { text: sentInput.trim() });
      if (res.data?.success) {
        setSentResult(res.data.result);
      }
    } catch (err) {
      console.error('Sentiment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell pageTitle="AI Multimodal Tools Hub">
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <span className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-600 shadow-glow-cyan">
                  <Wrench className="w-6 h-6 text-white" />
                </span>
                <span>AI Multimodal Tools Hub</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Zero-latency utilities powered by Google Gemini Pro and Gemini Flash models.
              </p>
            </div>

            {/* Tool Category Selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start sm:self-auto overflow-x-auto">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'code'
                    ? 'bg-emerald-600 text-white shadow-glow-emerald'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Code Architect</span>
              </button>

              <button
                onClick={() => setActiveTab('summarize')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'summarize'
                    ? 'bg-cyan-600 text-white shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Summarizer</span>
              </button>

              <button
                onClick={() => setActiveTab('translate')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'translate'
                    ? 'bg-indigo-600 text-white shadow-glow-indigo'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>50+ Translator</span>
              </button>

              <button
                onClick={() => setActiveTab('sentiment')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'sentiment'
                    ? 'bg-purple-600 text-white shadow-glow-purple'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Sentiment & Tone</span>
              </button>
            </div>
          </div>

          {/* TOOL 1: CODE ARCHITECT */}
          {activeTab === 'code' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-5">
                <form onSubmit={handleGenerateCode} className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Programming Language</label>
                    <select
                      value={codeLang}
                      onChange={(e) => setCodeLang(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    >
                      {CODE_LANGUAGES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Code Requirement / Functionality</label>
                    <textarea
                      rows={6}
                      placeholder="e.g. Write an asynchronous queue worker with exponential backoff retry and Redis persistence..."
                      value={codePrompt}
                      onChange={(e) => setCodePrompt(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 resize-none font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !codePrompt.trim()}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-glow-emerald transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Code className="w-4 h-4" />}
                    <span>Generate Clean Code with Gemini Pro</span>
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7">
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <h3 className="font-bold text-sm text-white">Generated Code Output ({codeLang})</h3>
                    </div>
                    {codeOutput && (
                      <button
                        onClick={() => handleCopy(codeOutput)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    )}
                  </div>

                  {codeOutput ? (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-emerald-400 whitespace-pre-wrap max-h-[460px] overflow-y-auto leading-relaxed">
                      {codeOutput}
                    </div>
                  ) : (
                    <div className="h-64 rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 flex flex-col items-center justify-center gap-2 text-center p-8">
                      <Code className="w-10 h-10 text-slate-700" />
                      <p className="font-bold text-sm text-slate-300">Code Architect Ready</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Enter your technical specification on the left to synthesize modular, typed, production code.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TOOL 2: SUMMARIZER */}
          {activeTab === 'summarize' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-5">
                <form onSubmit={handleSummarize} className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Summary Format</label>
                    <select
                      value={summaryFormat}
                      onChange={(e) => setSummaryFormat(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="bullet-points">📌 Bullet Points & Action Items</option>
                      <option value="executive">👔 Executive Brief (3 Sentences)</option>
                      <option value="detailed">📑 Multi-Section Structured Digest</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Source Text / Article</label>
                    <textarea
                      rows={8}
                      placeholder="Paste any article, document, meeting notes, or transcript here..."
                      value={summaryInput}
                      onChange={(e) => setSummaryInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 resize-none font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !summaryInput.trim()}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-glow-cyan transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    <span>Summarize with Gemini Flash</span>
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7">
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-white">Executive Summary Digest</h3>
                    {summaryOutput && (
                      <button
                        onClick={() => handleCopy(summaryOutput)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>

                  {summaryOutput ? (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {summaryOutput}
                    </div>
                  ) : (
                    <div className="h-64 rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 flex flex-col items-center justify-center gap-2 text-center p-8">
                      <FileText className="w-10 h-10 text-slate-700" />
                      <p className="font-bold text-sm text-slate-300">Summarizer Ready</p>
                      <p className="text-xs text-slate-500 max-w-sm">Paste any text on the left to extract key insights in seconds.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TOOL 3: TRANSLATOR */}
          {activeTab === 'translate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-5">
                <form onSubmit={handleTranslate} className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Target Language</label>
                    <select
                      value={targetLang}
                      onChange={(e) => setTargetLang(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Original Text</label>
                    <textarea
                      rows={6}
                      placeholder="Type or paste text in any language..."
                      value={transInput}
                      onChange={(e) => setTransInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 resize-none font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !transInput.trim()}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-glow-indigo transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    <span>Translate to {targetLang}</span>
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7">
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-white">Translated Text ({targetLang})</h3>
                    {transOutput && (
                      <button
                        onClick={() => handleCopy(transOutput)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>

                  {transOutput ? (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                      {transOutput}
                    </div>
                  ) : (
                    <div className="h-64 rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 flex flex-col items-center justify-center gap-2 text-center p-8">
                      <Languages className="w-10 h-10 text-slate-700" />
                      <p className="font-bold text-sm text-slate-300">Translator Ready</p>
                      <p className="text-xs text-slate-500 max-w-sm">Neural translation supporting 50+ languages with native cultural phrasing.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TOOL 4: SENTIMENT */}
          {activeTab === 'sentiment' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-5">
                <form onSubmit={handleAnalyzeSentiment} className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Customer Feedback / Message</label>
                    <textarea
                      rows={6}
                      placeholder="Paste customer reviews, emails, or chat logs..."
                      value={sentInput}
                      onChange={(e) => setSentInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-slate-100 text-xs focus:outline-none focus:border-purple-500 resize-none font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !sentInput.trim()}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-glow-purple transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smile className="w-4 h-4" />}
                    <span>Analyze Emotional Tone</span>
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7">
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-sm text-white">Sentiment & Psychological Analysis</h3>
                  </div>

                  {sentResult ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                          <span className="text-slate-500 text-[10px] uppercase font-mono">Primary Sentiment</span>
                          <p className={`text-lg font-extrabold ${
                            sentResult.sentiment === 'POSITIVE' ? 'text-emerald-400' :
                            sentResult.sentiment === 'NEGATIVE' ? 'text-rose-400' : 'text-amber-400'
                          }`}>
                            {sentResult.sentiment}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                          <span className="text-slate-500 text-[10px] uppercase font-mono">Confidence Score</span>
                          <p className="text-lg font-extrabold text-cyan-400 font-mono">
                            {Math.round((sentResult.score || 0.9) * 100)}%
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                        <span className="text-slate-500 text-[10px] uppercase font-mono">Primary Emotional Triggers</span>
                        <div className="flex flex-wrap gap-2">
                          {(sentResult.primaryEmotions || ['Confidence', 'Clarity']).map((e, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
                              {e}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-300 pt-2 border-t border-slate-900 leading-relaxed">
                          {sentResult.analysis}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 flex flex-col items-center justify-center gap-2 text-center p-8">
                      <Smile className="w-10 h-10 text-slate-700" />
                      <p className="font-bold text-sm text-slate-300">Sentiment Engine Ready</p>
                      <p className="text-xs text-slate-500 max-w-sm">Evaluates tone, polarity, and emotional triggers with high accuracy.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
