import { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import {
  User,
  Shield,
  Key,
  Lock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
  Cpu,
  Server,
  Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await api.get('/health');
      setHealthData(res.data);
    } catch (err) {
      console.error('Failed to fetch health settings status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <ProtectedRoute>
      <AppShell title="Platform & Operator Settings">
        <div className="space-y-8 max-w-5xl mx-auto">
          {/* Page Header */}
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">System & Operator Settings</h2>
            <p className="text-sm text-gray-400">Manage operator profile, security credentials, encryption health, and API key statuses</p>
          </div>

          {/* User Profile Card */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-border space-y-6">
            <div className="flex items-center space-x-2 pb-4 border-b border-dark-border">
              <User className="w-5 h-5 text-primary-400" />
              <h3 className="font-bold text-base text-white">Operator Profile</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <label className="text-gray-400 uppercase tracking-wider font-semibold">Operator Name</label>
                <div className="p-3 rounded-xl bg-dark-card border border-dark-border font-bold text-white text-sm">
                  {user?.name || 'Operator'}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 uppercase tracking-wider font-semibold">Email Address</label>
                <div className="p-3 rounded-xl bg-dark-card border border-dark-border font-mono text-gray-200 text-sm">
                  {user?.email || 'operator@agentflow.ai'}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 uppercase tracking-wider font-semibold">Platform Role</label>
                <div className="p-3 rounded-xl bg-dark-card border border-dark-border font-mono text-accent-emerald text-sm flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span className="uppercase font-bold">{user?.role || 'operator'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 uppercase tracking-wider font-semibold">Authentication Substrate</label>
                <div className="p-3 rounded-xl bg-dark-card border border-dark-border font-mono text-accent-cyan text-sm">
                  JWT Signed Token (7-day Session)
                </div>
              </div>
            </div>
          </div>

          {/* Encryption & Security Health Checks */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-border space-y-6">
            <div className="flex items-center space-x-2 pb-4 border-b border-dark-border">
              <Lock className="w-5 h-5 text-accent-emerald" />
              <h3 className="font-bold text-base text-white">Security & Encryption Diagnostics</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-white text-sm block">CREDENTIAL_ENCRYPTION_KEY</span>
                  <p className="text-gray-400 font-mono text-[11px]">AES-256-CBC token encryption at rest</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30 font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
                </span>
              </div>

              <div className="p-4 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-white text-sm block">OpenRouter API Configuration</span>
                  <p className="text-gray-400 font-mono text-[11px]">Primary LLM Workflow Generator Provider</p>
                </div>
                {healthData?.openRouterConfigured ? (
                  <span className="px-3 py-1 rounded-full bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Configured
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-accent-amber/15 text-accent-amber border border-accent-amber/30 font-mono font-bold">
                    Using Rule-Based Fallback
                  </span>
                )}
              </div>

              <div className="p-4 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-white text-sm block">Google Gemini SDK Configuration</span>
                  <p className="text-gray-400 font-mono text-[11px]">Secondary Fallback LLM Provider</p>
                </div>
                {healthData?.geminiConfigured ? (
                  <span className="px-3 py-1 rounded-full bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30 font-mono font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Configured
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-accent-amber/15 text-accent-amber border border-accent-amber/30 font-mono font-bold">
                    Using Rule-Based Fallback
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Session Actions */}
          <div className="flex items-center justify-between p-6 rounded-2xl bg-dark-surface border border-dark-border">
            <div>
              <h4 className="font-bold text-sm text-white">Operator Session Controls</h4>
              <p className="text-xs text-gray-400">Clear persistent local tokens and terminate session</p>
            </div>
            <button
              onClick={() => logout()}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-accent-rose hover:bg-accent-rose/90 shadow-lg shadow-accent-rose/20 flex items-center space-x-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Session</span>
            </button>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
