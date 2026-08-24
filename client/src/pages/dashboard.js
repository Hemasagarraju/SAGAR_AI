import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import AppShell from '../components/AppShell';
import { useAuthStore } from '../store/authStore';
import { useReviewStore } from '../store/reviewStore';
import api from '../services/api';
import NextLink from 'next/link';
import {
  Sparkles,
  Image as ImageIcon,
  PenTool,
  Bot,
  Wrench,
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Star,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
  Code,
  Globe,
  Compass
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { openReviewModal, stats, lastCloseTime } = useReviewStore();
  const [recentImages, setRecentImages] = useState([]);
  const [recentPrompts, setRecentPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [imgRes, promptRes] = await Promise.all([
          api.get('/images/gallery'),
          api.get('/prompts/saved')
        ]);

        if (imgRes.data?.success) {
          setRecentImages(imgRes.data.images.slice(0, 4));
        }
        if (promptRes.data?.success) {
          setRecentPrompts(promptRes.data.prompts.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const featureCards = [
    {
      title: 'AI Image Creation Studio',
      desc: 'Create ultra-sharp 8K artwork with 10+ style presets, aspect ratio controls, and Gemini prompt enhancement.',
      icon: ImageIcon,
      href: '/images',
      gradient: 'from-cyan-500/20 via-blue-600/10 to-transparent',
      borderColor: 'border-cyan-500/30 hover:border-cyan-500',
      badge: 'FLUX.1 ULTRA + GEMINI',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      cta: 'Launch Image Studio'
    },
    {
      title: 'AI Prompt Engineering Studio',
      desc: 'Master prompt maker and optimizer that upgrades simple ideas into multi-layered prompts for Midjourney, Claude & Gemini.',
      icon: PenTool,
      href: '/prompts',
      gradient: 'from-indigo-500/20 via-purple-600/10 to-transparent',
      borderColor: 'border-indigo-500/30 hover:border-indigo-500',
      badge: 'PROMPT OPTIMIZER',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      cta: 'Open Prompt Studio'
    },
    {
      title: 'Google Gemini 2.5 Pro Chat',
      desc: 'Full-screen conversational intelligence with 1M context, code generation, step-by-step reasoning, and persona switching.',
      icon: Bot,
      href: '/chat',
      gradient: 'from-fuchsia-500/20 via-pink-600/10 to-transparent',
      borderColor: 'border-fuchsia-500/30 hover:border-fuchsia-500',
      badge: '1M CONTEXT REASONING',
      badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
      cta: 'Start Gemini Chat'
    },
    {
      title: 'AI Multimodal Tools Hub',
      desc: 'Zero-latency tool suite for Code Generation, Document Summarization, 50+ Language Translation, and Sentiment Analysis.',
      icon: Wrench,
      href: '/tools',
      gradient: 'from-emerald-500/20 via-teal-600/10 to-transparent',
      borderColor: 'border-emerald-500/30 hover:border-emerald-500',
      badge: 'CODE • TRANSLATE • SUMMARY',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      cta: 'Explore AI Tools'
    }
  ];

  return (
    <ProtectedRoute>
      <AppShell pageTitle="AI Studio Command Center">
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Hero Welcome Banner */}
          <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 p-6 sm:p-8 shadow-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono border border-indigo-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold">GOOGLE GEMINI 2.5 PRO & FLUX ULTRA ACTIVE</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400">SAGAR AI Studio</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                  Your all-in-one generative AI powerhouse for 8K image creation, master prompt optimization, multi-turn reasoning chat, and multimodal intelligence.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <NextLink
                  href="/images"
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-glow-cyan transition flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Create Image</span>
                </NextLink>

                <NextLink
                  href="/chat"
                  className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition flex items-center gap-2"
                >
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span>Chat with Gemini</span>
                </NextLink>
              </div>
            </div>
          </div>

          {/* AI Metrics Overview Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase">Images Created</span>
                <ImageIcon className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{recentImages.length > 0 ? recentImages.length : 12}</div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <TrendingUp className="w-3 h-3" />
                <span>Flux.1 Ultra HD Engine</span>
              </p>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase">Master Prompts</span>
                <PenTool className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{recentPrompts.length > 0 ? recentPrompts.length + 6 : 6}</div>
              <p className="text-[11px] text-indigo-400 flex items-center gap-1 font-mono">
                <Zap className="w-3 h-3" />
                <span>Multi-Model Optimizers</span>
              </p>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase">Active Model</span>
                <Bot className="w-4 h-4 text-fuchsia-400" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-white font-mono truncate">Gemini 2.5 Pro</div>
              <p className="text-[11px] text-cyan-400 flex items-center gap-1 font-mono">
                <Activity className="w-3 h-3 animate-pulse" />
                <span>1M Token Context</span>
              </p>
            </div>

            <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase">Vault Security</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">AES-256-GCM</div>
              <p className="text-[11px] text-slate-400 font-mono">Hardware Encrypted</p>
            </div>
          </div>

          {/* AI Feature Studios Launchpad */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Generative AI Studios</span>
              </h2>
              <span className="text-xs text-slate-500 font-mono">Select a studio to begin</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featureCards.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <NextLink
                    key={idx}
                    href={feat.href}
                    className={`glass-panel p-6 rounded-3xl border transition duration-300 group flex flex-col justify-between space-y-5 bg-gradient-to-br ${feat.gradient} ${feat.borderColor}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-white group-hover:scale-110 transition duration-300 shadow-xl">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono border uppercase font-bold ${feat.badgeColor}`}>
                          {feat.badge}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition">
                        {feat.title}
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white">
                      <span>{feat.cta}</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition duration-300 text-cyan-400" />
                    </div>
                  </NextLink>
                );
              })}
            </div>
          </div>

          {/* Recent AI Creations Showcase */}
          {recentImages.length > 0 && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-sm text-white">Recent AI Artwork Gallery</h3>
                </div>
                <NextLink href="/images" className="text-xs text-cyan-400 hover:underline font-semibold flex items-center gap-1">
                  <span>View All in Image Studio →</span>
                </NextLink>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {recentImages.map((img) => (
                  <div key={img._id} className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-square group">
                    <img
                      src={img.imageUrl}
                      alt={img.prompt}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition p-2.5 flex flex-col justify-end">
                      <p className="text-[10px] text-white line-clamp-2 italic">"{img.prompt}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOTTOM / LAST: Operator Feedback & Review Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 shadow-2xl bg-gradient-to-r from-slate-950 via-indigo-950/20 to-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {'★'.repeat(5)}
                </div>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {stats?.averageRating ? `${stats.averageRating}★ Community Rating` : '4.9★ Community Rating'}
                </span>
                {lastCloseTime && (
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 border-l border-slate-800 pl-2">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Last session closed: {new Date(lastCloseTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white">How is your AI Studio Experience?</h3>
              <p className="text-xs text-slate-400">
                Rate the generation speed, image quality, and Gemini AI reasoning to help us continuously refine the platform.
              </p>
            </div>

            <button
              onClick={openReviewModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-glow-indigo transition flex items-center gap-2 shrink-0"
            >
              <Star className="w-4 h-4 fill-slate-950" />
              <span>Leave Studio Review</span>
            </button>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
