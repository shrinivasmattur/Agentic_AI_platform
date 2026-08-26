import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import MetricGrid from '../components/MetricGrid/MetricGrid';
import api from '../utils/api';
import {
  Sparkles,
  GitFork,
  Play,
  Bot,
  Activity,
  ArrowRight,
  Plus,
  RefreshCw,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workflows/dashboard');
      if (res.data?.success) {
        setMetrics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <ProtectedRoute>
      <AppShell title="Operator Overview">
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Operator Dashboard</h2>
              <p className="text-sm text-gray-400">Autonomous workflow cluster telemetry & AI multi-agent activity</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchMetrics}
                className="p-2.5 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white transition-colors"
                title="Refresh Metrics"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/workflows/builder"
                className="px-4 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-accent-violet hover:from-primary-500 hover:to-accent-violet/90 shadow-lg shadow-primary-600/25 transition-all flex items-center space-x-2 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Prompt Generator</span>
              </Link>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <MetricGrid metrics={metrics} />

          {/* AI Prompt Generator Banner Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-primary-500/30 bg-gradient-to-r from-primary-950/40 via-dark-surface to-dark-surface relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-accent-violet/20 border border-accent-violet/30 text-accent-violet text-xs font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prompt-to-Workflow Engine</span>
              </div>
              <h3 className="text-xl font-bold text-white">Generate Automations from Plain English</h3>
              <p className="text-sm text-gray-300 max-w-2xl">
                Describe any workflow prompt (e.g. "Fetch unread invoices from Gmail, pass to Gemini classifier, and post Slack alerts") to materialize a visual graph in seconds.
              </p>
            </div>
            <Link
              href="/workflows/builder"
              className="px-6 py-3 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-600/30 transition-all flex items-center space-x-2 shrink-0 text-sm"
            >
              <span>Launch Builder</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Two-Column Activity & Workflows Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Workflows Column (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GitFork className="w-5 h-5 text-primary-400" />
                  <h3 className="font-bold text-base text-white">Recent Workflows</h3>
                </div>
                <Link href="/workflows" className="text-xs font-semibold text-primary-400 hover:underline flex items-center space-x-1">
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {metrics?.recentWorkflows?.length > 0 ? (
                  metrics.recentWorkflows.map((wf) => (
                    <div
                      key={wf._id || wf.id}
                      className="glass-card p-4 rounded-xl border border-dark-border/80 hover:border-gray-600 transition-all flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-white">{wf.name}</h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30 font-bold">
                            {wf.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate max-w-md">{wf.description || 'No description provided'}</p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Link
                          href={`/workflows/${wf._id || wf.id}`}
                          className="px-3 py-1.5 rounded-lg bg-dark-card hover:bg-dark-hover border border-dark-border text-xs font-semibold text-gray-200 transition-colors"
                        >
                          Open Canvas
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass-panel p-8 rounded-xl text-center text-gray-400 text-xs space-y-3">
                    <GitFork className="w-8 h-8 text-gray-600 mx-auto" />
                    <p>No workflows created yet. Click below to create your first workflow.</p>
                    <Link
                      href="/workflows/builder"
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary-600 text-white font-bold text-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Workflow</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* AI Multi-Agent Activity Panel (1 col) */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-accent-violet" />
                <h3 className="font-bold text-base text-white">AI Agent Reasoning Feed</h3>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-dark-border space-y-4">
                {metrics?.aiActivity?.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-dark-card border border-dark-border/60 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-accent-violet flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {act.agent}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {act.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-normal">{act.message}</p>
                  </div>
                ))}
                <div className="pt-2 text-center">
                  <span className="text-[11px] font-mono text-gray-400">Agent Chain Status: Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
