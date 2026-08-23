import { memo } from 'react';

function PlatformLogo({ size = 'md', animated = true, showBadge = true, textClass = 'text-lg' }) {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex items-center gap-3 group select-none">
      {/* High-Tech Hexagonal Cyber Nexus Icon */}
      <div className={`relative ${currentSize} shrink-0`}>
        {/* Ambient Gradient Glow Halo */}
        <div
          className={`absolute -inset-1 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-violet-500 opacity-70 blur-md group-hover:opacity-100 transition duration-300 ${
            animated ? 'animate-pulse' : ''
          }`}
        />

        {/* Outer Beveled Chassis */}
        <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-indigo-500 via-cyan-400 to-violet-600 p-[1.5px] shadow-2xl transition-transform duration-300 group-hover:scale-105">
          {/* Inner Obsidian Core */}
          <div className="w-full h-full bg-slate-950/90 backdrop-blur-xl rounded-[10px] flex items-center justify-center p-1.5 overflow-hidden">
            {/* Precision Futuristic Neural SVG Mark */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-full h-full text-cyan-400 group-hover:text-cyan-300 transition-colors"
            >
              {/* Central AI Quantum Core */}
              <circle cx="12" cy="12" r="2.5" fill="currentColor" className="text-cyan-400" />
              
              {/* Triangular / Hexagonal Multi-Agent Nodes */}
              <circle cx="12" cy="4" r="1.5" fill="#818cf8" />
              <circle cx="19" cy="16" r="1.5" fill="#38bdf8" />
              <circle cx="5" cy="16" r="1.5" fill="#a78bfa" />

              {/* Interconnected Neural Stream Pathways */}
              <path
                d="M12 5.5V9.5M17.8 15L14.2 13M6.2 15L9.8 13"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-indigo-400/90"
              />

              {/* Outer Orbit Rings */}
              <path
                d="M12 2a10 10 0 0 1 8.66 15M3.34 17A10 10 0 0 1 12 2"
                strokeWidth="1.25"
                strokeDasharray="2 3"
                strokeLinecap="round"
                className="text-cyan-500/60"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Brand Title & Status Badge */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-black tracking-tight text-white font-mono uppercase bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent ${textClass}`}>
            SAGARAGENT<span className="text-cyan-400 font-bold">_AI</span>
          </span>
          {showBadge && (
            <span className="hidden sm:inline-flex text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/40 uppercase tracking-widest shadow-sm">
              v2.0 PRO
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(PlatformLogo);
