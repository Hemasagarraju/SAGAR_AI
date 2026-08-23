import { create } from 'zustand';

export const THEMES = [
  {
    id: 'pure-white',
    name: 'Pure White (Light)',
    badge: 'CLEAN LIGHT',
    colors: ['#ffffff', '#3b82f6'],
    accentBg: 'from-blue-600 to-indigo-600',
    glowColor: 'rgba(59, 130, 246, 0.2)',
    borderClass: 'border-slate-300'
  },
  {
    id: 'cyber-indigo',
    name: 'Cyber Indigo',
    badge: 'DEFAULT',
    colors: ['#6366f1', '#06b6d4'],
    accentBg: 'from-indigo-600 to-cyan-500',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    borderClass: 'border-indigo-500/30'
  },
  {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    badge: 'NEON',
    colors: ['#10b981', '#84cc16'],
    accentBg: 'from-emerald-600 to-lime-500',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    borderClass: 'border-emerald-500/30'
  },
  {
    id: 'royal-violet',
    name: 'Royal Nebula',
    badge: 'COSMIC',
    colors: ['#8b5cf6', '#d946ef'],
    accentBg: 'from-violet-600 to-fuchsia-500',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    borderClass: 'border-violet-500/30'
  },
  {
    id: 'solar-amber',
    name: 'Solar Flare',
    badge: 'WARM',
    colors: ['#f59e0b', '#ef4444'],
    accentBg: 'from-amber-500 to-rose-600',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    borderClass: 'border-amber-500/30'
  },
  {
    id: 'oceanic-azure',
    name: 'Oceanic Azure',
    badge: 'DEEP SEA',
    colors: ['#0284c7', '#14b8a6'],
    accentBg: 'from-sky-600 to-teal-500',
    glowColor: 'rgba(2, 132, 199, 0.4)',
    borderClass: 'border-sky-500/30'
  },
  {
    id: 'titanium-mono',
    name: 'Titanium Mono',
    badge: 'STEALTH',
    colors: ['#94a3b8', '#e2e8f0'],
    accentBg: 'from-slate-600 to-zinc-400',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    borderClass: 'border-slate-500/30'
  }
];

export const useThemeStore = create((set, get) => ({
  currentTheme: 'pure-white',

  initializeTheme: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sagaragent_theme') || 'pure-white';
      set({ currentTheme: saved });
      document.documentElement.setAttribute('data-theme', saved);
    }
  },

  setTheme: (themeId) => {
    set({ currentTheme: themeId });
    if (typeof window !== 'undefined') {
      localStorage.setItem('sagaragent_theme', themeId);
      document.documentElement.setAttribute('data-theme', themeId);
    }
  }
}));
