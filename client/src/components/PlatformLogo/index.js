import { memo } from 'react';

function PlatformLogo({ size = 'md', animated = true, showBadge = true, textClass = 'text-lg' }) {
  const sizeMap = {
    xs: { frame: 'w-6 h-6', svg: 'w-4 h-4', text: 'text-xs' },
    sm: { frame: 'w-8 h-8', svg: 'w-5 h-5', text: 'text-sm' },
    md: { frame: 'w-10 h-10', svg: 'w-6 h-6', text: 'text-base' },
    lg: { frame: 'w-12 h-12', svg: 'w-8 h-8', text: 'text-xl' },
    xl: { frame: 'w-16 h-16', svg: 'w-10 h-10', text: 'text-2xl' }
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className="flex items-center gap-3 group select-none">
      {/* Sci-Fi Quantum Hologram Chassis */}
      <div className={`relative ${current.frame} shrink-0 flex items-center justify-center`}>
        {/* Dynamic 360° Rotating Laser Halo */}
        <div
          className={`absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 opacity-75 blur-md group-hover:opacity-100 transition duration-500 ${
            animated ? 'animate-pulse' : ''
          }`}
        />

        {/* Outer Angular Beveled HUD Frame */}
        <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-600 to-violet-600 p-[1.5px] shadow-glow-cyan transition-transform duration-300 group-hover:scale-110">
          {/* Obsidian Holographic Core */}
          <div className="w-full h-full bg-slate-950/90 backdrop-blur-2xl rounded-[10px] flex items-center justify-center p-1 relative overflow-hidden">
            {/* Ambient Background Grid Pattern inside icon */}
            <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:6px_6px] opacity-20" />

            {/* High-Tech Vector Holographic Quantum Node Mark */}
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`${current.svg} relative z-10 transition-transform duration-500 group-hover:rotate-45`}
            >
              {/* Outer Hexagonal Shield */}
              <polygon
                points="16,2 29,9 29,23 16,30 3,23 3,9"
                stroke="url(#paint0_linear)"
                strokeWidth="1.5"
                strokeDasharray="3 2"
                className="text-cyan-400"
              />

              {/* Inner Diamond Core */}
              <polygon
                points="16,7 24,16 16,25 8,16"
                stroke="url(#paint1_linear)"
                strokeWidth="1.5"
                fill="rgba(6, 182, 212, 0.15)"
              />

              {/* Central Pulsing AI Quantum Core */}
              <circle cx="16" cy="16" r="3" fill="#38bdf8" className="animate-ping origin-center" />
              <circle cx="16" cy="16" r="2.5" fill="#ffffff" />

              {/* 4 Agentic Neural Satellite Nodes */}
              <circle cx="16" cy="3" r="1.5" fill="#06b6d4" />
              <circle cx="28" cy="23" r="1.5" fill="#818cf8" />
              <circle cx="4" cy="23" r="1.5" fill="#c084fc" />

              {/* Gradients */}
              <defs>
                <linearGradient id="paint0_linear" x1="3" y1="2" x2="29" y2="30" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#06b6d4" />
                  <stop offset="0.5" stopColor="#6366f1" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="paint1_linear" x1="8" y1="7" x2="24" y2="25" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38bdf8" />
                  <stop offset="1" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Futuristic Typography & HUD Telemetry */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-black tracking-wider text-white font-mono uppercase bg-gradient-to-r from-white via-cyan-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(6,182,212,0.4)] ${textClass}`}>
            SAGARAGENT<span className="text-cyan-400 font-extrabold animate-pulse">_AI</span>
          </span>
          {showBadge && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono font-bold border border-cyan-500/40 uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>NEXUS HUD</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(PlatformLogo);
