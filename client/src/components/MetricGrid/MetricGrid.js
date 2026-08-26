import { GitFork, Activity, CheckCircle, Zap } from 'lucide-react';

export default function MetricGrid({ metrics }) {
  const cards = [
    {
      title: 'Total Workflows',
      value: metrics?.totalWorkflows ?? 0,
      change: '+12% this month',
      icon: GitFork,
      color: 'from-primary-600 to-accent-violet',
      textColor: 'text-primary-400',
    },
    {
      title: 'Active Workflows',
      value: metrics?.activeWorkflows ?? 0,
      change: 'Running in cluster',
      icon: Zap,
      color: 'from-accent-cyan to-primary-500',
      textColor: 'text-accent-cyan',
    },
    {
      title: 'Total Executions',
      value: metrics?.totalExecutions ?? 0,
      change: 'Real-time telemetry',
      icon: Activity,
      color: 'from-accent-violet to-accent-rose',
      textColor: 'text-accent-violet',
    },
    {
      title: 'Success Rate',
      value: `${metrics?.successRate ?? 100}%`,
      change: 'Zero unhandled faults',
      icon: CheckCircle,
      color: 'from-accent-emerald to-accent-cyan',
      textColor: 'text-accent-emerald',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="glass-card p-5 rounded-2xl border border-dark-border/70 hover:border-dark-border transition-all duration-200 relative overflow-hidden group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{card.title}</p>
                <h3 className="text-2xl font-extrabold text-white tracking-tight">{card.value}</h3>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md shadow-primary-500/10 group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-dark-border/40 flex items-center justify-between text-xs">
              <span className={`font-mono text-[11px] ${card.textColor}`}>{card.change}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
