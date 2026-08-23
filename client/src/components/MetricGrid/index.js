import { GitFork, Activity, CheckCircle2, Zap, Clock, ShieldAlert } from 'lucide-react';

export default function MetricGrid({ metrics }) {
  const safeMetrics = metrics || {};
  const {
    totalWorkflows = 0,
    activeWorkflows = 0,
    totalExecutions = 0,
    activeRuns = 0,
    completedRuns = 0,
    failedRuns = 0,
    successRate = 100,
    avgDurationMs = 0,
    last24hExecutions = 0
  } = safeMetrics;

  const cards = [
    {
      title: 'Total Automations',
      value: totalWorkflows,
      subValue: `${activeWorkflows} active`,
      icon: GitFork,
      color: 'indigo',
      glow: 'glow-border-indigo',
      badge: 'Workflows'
    },
    {
      title: 'Total Executions',
      value: totalExecutions,
      subValue: `${activeRuns} running now`,
      icon: Activity,
      color: 'cyan',
      glow: 'glow-border-cyan',
      badge: 'Runs'
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      subValue: `${failedRuns} failed runs`,
      icon: CheckCircle2,
      color: 'emerald',
      glow: 'glow-border-emerald',
      badge: 'Reliability'
    },
    {
      title: 'Average Latency',
      value: avgDurationMs > 1000 ? `${(avgDurationMs / 1000).toFixed(1)}s` : `${avgDurationMs}ms`,
      subValue: 'Autonomous agent chain',
      icon: Clock,
      color: 'amber',
      glow: 'glow-border-amber',
      badge: 'Response'
    },
    {
      title: '24h Throughput',
      value: last24hExecutions,
      subValue: 'Jobs scheduled & run',
      icon: Zap,
      color: 'rose',
      glow: 'glow-border-rose',
      badge: 'Volume'
    }
  ];

  const colorStyles = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="glass-panel p-4 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{card.title}</span>
              <div className={`p-2 rounded-xl border ${colorStyles[card.color]} transition-transform group-hover:scale-110`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold font-mono text-white tracking-tight">{card.value}</div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{card.subValue}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {card.badge}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
