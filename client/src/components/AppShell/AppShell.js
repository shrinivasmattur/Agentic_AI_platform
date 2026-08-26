import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Sparkles,
  GitFork,
  Activity,
  Boxes,
  Settings,
  Bell,
  LogOut,
  Shield,
  Menu,
  X,
  Radio,
  CheckCircle2
} from 'lucide-react';

export default function AppShell({ children, title = 'Operator Console' }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Generator', href: '/workflows/builder', icon: Sparkles, badge: 'AI' },
    { label: 'Workflows', href: '/workflows', icon: GitFork },
    { label: 'Executions', href: '/executions', icon: Activity },
    { label: 'Integrations', href: '/integrations', icon: Boxes },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col md:flex-row font-sans selection:bg-primary-500 selection:text-white">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-dark-surface border-b border-dark-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-violet flex items-center justify-center font-bold text-white shadow-lg">
            A
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Agentflow<span className="text-primary-500">_AI</span></span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-400 hover:text-white rounded-lg focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Navigation Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-dark-surface border-r border-dark-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static flex flex-col justify-between
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo & Platform Title */}
          <div className="hidden md:flex items-center space-x-3 px-6 py-5 border-b border-dark-border/60">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 via-accent-violet to-accent-cyan flex items-center justify-center font-bold text-white shadow-lg shadow-primary-500/20">
              A
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-tight">Agentflow<span className="text-primary-500">_AI</span></span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent-cyan block">Autonomous Ops</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                    ${isActive
                      ? 'bg-primary-600/15 text-primary-400 border border-primary-500/30 font-semibold shadow-inner'
                      : 'text-gray-400 hover:bg-dark-hover hover:text-gray-200'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-primary-400' : 'text-gray-400 group-hover:text-gray-200'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded-md bg-accent-violet/20 text-accent-violet border border-accent-violet/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account & Logout Footer */}
        <div className="p-4 border-t border-dark-border/60 bg-dark-bg/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-primary-700/40 border border-primary-500/40 flex items-center justify-center font-bold text-xs text-primary-300">
                {user?.name?.charAt(0).toUpperCase() || 'O'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-gray-200 truncate">{user?.name || 'Operator'}</p>
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-accent-emerald" />
                  <span className="text-[10px] font-mono text-gray-400 uppercase">{user?.role || 'operator'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Logout session"
              className="p-1.5 text-gray-400 hover:text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-dark-surface/80 backdrop-blur-md border-b border-dark-border/60 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold text-gray-100 tracking-tight">{title}</h1>
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-[11px] font-mono font-medium">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Real-time Engine Live</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-gray-400 hover:text-white bg-dark-card hover:bg-dark-hover border border-dark-border rounded-xl transition-all"
              title="Notifications Drawer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-cyan animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-cyan" />
            </button>
          </div>
        </header>

        {/* Dynamic Notifications Slide-over Drawer */}
        {notificationsOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setNotificationsOpen(false)} />
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-sm bg-dark-surface border-l border-dark-border shadow-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-dark-border">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-5 h-5 text-primary-400" />
                      <h2 className="font-bold text-white text-base">Execution Alerts</h2>
                    </div>
                    <button onClick={() => setNotificationsOpen(false)} className="text-gray-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="p-3 rounded-xl bg-dark-card border border-dark-border text-xs space-y-1">
                      <div className="flex items-center justify-between text-accent-emerald font-semibold">
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Monitoring Agent</span>
                        <span className="text-[10px] text-gray-400 font-mono">Just now</span>
                      </div>
                      <p className="text-gray-300">System initialized. Socket.IO connection active and waiting for agent events.</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-dark-border text-center">
                  <span className="text-xs text-gray-400 font-mono">Agentflow_AI Notification Service</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
