import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Bot,
  Layers,
  ArrowRight,
  GitFork,
  CheckCircle2,
  Terminal,
  Cpu,
  Boxes
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 selection:bg-primary-500 selection:text-white font-sans overflow-x-hidden">
      {/* Background Radial Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary-600/20 via-accent-violet/10 to-transparent blur-3xl pointer-events-none" />

      {/* Landing Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-accent-violet to-accent-cyan flex items-center justify-center font-bold text-white shadow-lg shadow-primary-500/30">
            A
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">Agentflow<span className="text-primary-500">_AI</span></span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-dark-card transition-all border border-transparent hover:border-dark-border"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-lg shadow-primary-600/25 transition-all flex items-center space-x-2"
          >
            <span>Launch Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Showcase Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary-600/10 border border-primary-500/30 text-primary-400 text-xs font-mono font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Autonomous Operations Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto mb-6">
          Describe Automations in <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-accent-cyan to-accent-violet">Natural Language</span>. Run with Multi-Agent Intelligence.
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Agentflow_AI turns prompts into visual React Flow workflow graphs, orchestrated by cooperating AI agents (Planner, Execution, Validation, Recovery, Monitoring) with real-time Socket.IO updates.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-accent-violet hover:from-primary-500 hover:to-accent-violet/90 shadow-xl shadow-primary-600/30 transition-all flex items-center justify-center space-x-3 text-base"
          >
            <span>Start Building Automations</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-gray-300 hover:text-white bg-dark-surface hover:bg-dark-card border border-dark-border transition-all flex items-center justify-center space-x-2 text-base"
          >
            <span>Operator Login</span>
          </Link>
        </div>

        {/* Visual Showcase Card */}
        <div className="glass-panel rounded-2xl p-6 border border-dark-border/80 shadow-2xl relative overflow-hidden text-left">
          <div className="flex items-center justify-between pb-4 border-b border-dark-border/60 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-accent-rose/80" />
              <div className="w-3 h-3 rounded-full bg-accent-amber/80" />
              <div className="w-3 h-3 rounded-full bg-accent-emerald/80" />
              <span className="text-xs font-mono text-gray-400 ml-2">agentflow-orchestrator.v1</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-accent-emerald">
              <CheckCircle2 className="w-4 h-4" />
              <span>Multi-Agent Engine Ready</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dark-card/80 p-4 rounded-xl border border-dark-border space-y-2">
              <div className="flex items-center justify-between text-xs text-accent-cyan font-mono font-semibold">
                <span className="flex items-center gap-1.5"><Bot className="w-4 h-4" /> 1. Planner Agent</span>
                <span className="text-gray-400">98% Confidence</span>
              </div>
              <p className="text-xs text-gray-300">Generated topological node graph from prompt: <span className="text-white italic">"Route high-value Gmail invoices to Slack & Sheets"</span></p>
            </div>

            <div className="bg-dark-card/80 p-4 rounded-xl border border-dark-border space-y-2">
              <div className="flex items-center justify-between text-xs text-accent-violet font-mono font-semibold">
                <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4" /> 2. Execution Agent</span>
                <span className="text-accent-emerald">OAuth Verified</span>
              </div>
              <p className="text-xs text-gray-300">Invoked Gmail API reader, parsed invoice total ($4,500), appended row to Google Sheets.</p>
            </div>

            <div className="bg-dark-card/80 p-4 rounded-xl border border-dark-border space-y-2">
              <div className="flex items-center justify-between text-xs text-accent-emerald font-mono font-semibold">
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> 3. Recovery & Monitor</span>
                <span className="text-gray-400">0 Errors</span>
              </div>
              <p className="text-xs text-gray-300">Emitted timeline step logs over Socket.IO to operator console timeline drawer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-dark-border/40">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">Enterprise AI Operations Features</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Built for high reliability, full auditability, and instant drag-and-drop workflow editing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 rounded-2xl border border-dark-border space-y-4 hover:border-primary-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary-600/20 text-primary-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Prompt-to-Workflow Engine</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              OpenRouter & Google Gemini SDK generate visual node graphs from plain text. Features deterministic offline fallback builder.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-dark-border space-y-4 hover:border-accent-violet/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-accent-violet/20 text-accent-violet flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">5-Stage Agent Chain</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Cooperating agents (Planner, Execution, Validation, Recovery, Monitoring) handle complex workflow state and exception backoff.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-dark-border space-y-4 hover:border-accent-cyan/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-accent-cyan/20 text-accent-cyan flex items-center justify-center">
              <Boxes className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">OAuth Integrations</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Connect Gmail, Slack, Discord, and Google Sheets over OAuth with AES-256 encrypted access & refresh token storage at rest.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border/60 py-8 px-6 text-center text-xs text-gray-500 font-mono">
        <p>© 2026 Agentflow_AI. Agentic AI Operations Automation Platform. Single Source of Truth Specification.</p>
      </footer>
    </div>
  );
}
