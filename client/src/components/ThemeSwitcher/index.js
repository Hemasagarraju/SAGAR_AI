import { useState, useRef, useEffect } from 'react';
import { useThemeStore, THEMES } from '../../store/themeStore';
import { Palette, Check, Sparkles } from 'lucide-react';

export default function ThemeSwitcher() {
  const { currentTheme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeTheme = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button with Active Theme Color Dots */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition shadow-sm text-xs font-medium group"
        title="Change Platform Color Theme"
      >
        <Palette className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
        
        {/* Dynamic Dual Color Dot Indicator */}
        <div className="flex items-center -space-x-1">
          <span
            className="w-2.5 h-2.5 rounded-full border border-slate-900 shadow-sm"
            style={{ backgroundColor: activeTheme.colors[0] }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-slate-900 shadow-sm"
            style={{ backgroundColor: activeTheme.colors[1] }}
          />
        </div>

        <span className="hidden sm:inline font-mono">{activeTheme.name}</span>
      </button>

      {/* Floating Theme Palette Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-2 py-1.5 mb-1 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-white uppercase tracking-wider font-mono">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Theme Studio</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
              6 PALETTES
            </span>
          </div>

          <div className="space-y-1">
            {THEMES.map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 text-white border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Dual Gradient Capsule */}
                    <div className="flex items-center -space-x-1 p-0.5 rounded-full bg-slate-950/80 border border-slate-800">
                      <span
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: theme.colors[0] }}
                      />
                      <span
                        className="w-3 h-3 rounded-full shadow-sm"
                        style={{ backgroundColor: theme.colors[1] }}
                      />
                    </div>
                    <span className="font-sans">{theme.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950/60 text-slate-400 font-mono border border-slate-800">
                      {theme.badge}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
