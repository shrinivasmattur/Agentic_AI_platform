import { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import api from '../utils/api';
import {
  Boxes,
  Mail,
  MessageSquare,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Loader2,
  Lock
} from 'lucide-react';

const PROVIDER_METADATA = {
  gmail: {
    name: 'Gmail API',
    category: 'Email Automation',
    icon: Mail,
    color: 'border-accent-rose/40 text-accent-rose bg-accent-rose/10',
    desc: 'Send emails, read inbox threads, parse incoming message attachments.',
  },
  slack: {
    name: 'Slack Web API',
    category: 'Team Communication',
    icon: MessageSquare,
    color: 'border-accent-emerald/40 text-accent-emerald bg-accent-emerald/10',
    desc: 'Post channel messages, subscribe to bot events, trigger alerts.',
  },
  'google-sheets': {
    name: 'Google Sheets API',
    category: 'Spreadsheets & Audit Logs',
    icon: FileSpreadsheet,
    color: 'border-accent-cyan/40 text-accent-cyan bg-accent-cyan/10',
    desc: 'Append data rows, read range values, write structured execution logs.',
  },
  discord: {
    name: 'Discord Bot API',
    category: 'Community Notifications',
    icon: MessageSquare,
    color: 'border-accent-violet/40 text-accent-violet bg-accent-violet/10',
    desc: 'Post channel notifications and monitor server events.',
  },
  openrouter: {
    name: 'OpenRouter AI API',
    category: 'Primary LLM Orchestrator',
    icon: Boxes,
    color: 'border-primary-500/40 text-primary-400 bg-primary-500/10',
    desc: 'Multi-model LLM access via OPENROUTER_API_KEY environment configuration.',
  },
  gemini: {
    name: 'Google Gemini SDK',
    category: 'Fallback LLM Provider',
    icon: Boxes,
    color: 'border-accent-amber/40 text-accent-amber bg-accent-amber/10',
    desc: 'Native Gemini 1.5 Flash via GEMINI_API_KEY environment configuration.',
  },
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/integrations');
      if (res.data?.success) {
        setIntegrations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch integrations status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleConnectOAuth = async (provider) => {
    try {
      const res = await api.get(`/integrations/oauth/${provider}/start`);
      if (res.data?.success && res.data.data?.authUrl) {
        window.location.href = res.data.data.authUrl;
      }
    } catch (err) {
      console.error(`OAuth trigger failed for ${provider}:`, err);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="Third-Party Integrations">
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">OAuth Integrations Hub</h2>
              <p className="text-sm text-gray-400">Connect Gmail, Slack, Discord, & Google Sheets over OAuth with AES-256 encrypted tokens at rest</p>
            </div>
            <button
              onClick={fetchIntegrations}
              className="p-2.5 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white transition-colors flex items-center space-x-2 text-xs font-semibold self-start sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Health</span>
            </button>
          </div>

          {/* Security Banner */}
          <div className="glass-panel p-4 rounded-2xl border border-accent-emerald/30 bg-accent-emerald/5 flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs">
              <ShieldCheck className="w-5 h-5 text-accent-emerald shrink-0" />
              <p className="text-gray-300">
                <strong className="text-white">Encrypted Credential Lifecycle:</strong> All OAuth tokens are encrypted at rest using AES-256 with <code className="font-mono text-accent-cyan">CREDENTIAL_ENCRYPTION_KEY</code>. Decrypted secrets are never logged.
              </p>
            </div>
          </div>

          {/* Provider Grid */}
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
              <p className="text-xs font-mono">Loading Integration Diagnostics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((item) => {
                const meta = PROVIDER_METADATA[item.provider] || {
                  name: item.provider,
                  category: 'Integration Provider',
                  icon: Boxes,
                  color: 'border-gray-500 text-gray-400 bg-gray-500/10',
                  desc: 'Third-party integration service provider.',
                };
                const Icon = meta.icon;

                return (
                  <div
                    key={item.provider}
                    className="glass-card p-6 rounded-2xl border border-dark-border hover:border-gray-600 transition-all flex flex-col justify-between space-y-5 shadow-lg"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-2xl border ${meta.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        {item.connected ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-gray-800 text-gray-400 border border-dark-border">
                            Not Connected
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-white">{meta.name}</h3>
                        <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-wider block">
                          {meta.category}
                        </span>
                        <p className="text-xs text-gray-400 leading-relaxed pt-1">{meta.desc}</p>
                      </div>

                      {item.accountEmail && (
                        <div className="p-2.5 rounded-xl bg-dark-card border border-dark-border text-[11px] font-mono text-gray-300 flex items-center space-x-2">
                          <Lock className="w-3.5 h-3.5 text-accent-emerald shrink-0" />
                          <span className="truncate">{item.accountEmail}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-dark-border/60">
                      {item.provider === 'openrouter' || item.provider === 'gemini' ? (
                        <span className="text-xs font-mono text-gray-400 block text-center">
                          Configured via Process Environment
                        </span>
                      ) : (
                        <button
                          onClick={() => handleConnectOAuth(item.provider)}
                          className={`
                            w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2
                            ${item.connected
                              ? 'bg-dark-card hover:bg-dark-hover border border-dark-border text-gray-200 hover:text-white'
                              : 'bg-primary-600 hover:bg-primary-500 text-white shadow-md shadow-primary-600/30'}
                          `}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{item.connected ? 'Reconnect OAuth' : 'Connect Provider'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
