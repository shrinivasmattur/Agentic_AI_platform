import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import api from '../utils/api';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  Pause,
  XCircle,
  Bot,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Sparkles,
  Loader2,
  X
} from 'lucide-react';

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL && process.env.NEXT_PUBLIC_SOCKET_URL.trim() !== '') {
    return process.env.NEXT_PUBLIC_SOCKET_URL.trim().replace(/\/+$/, '');
  }
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== '') {
    return process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/api\/?$/, '').replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin.replace(/\/+$/, '');
  }
  return 'http://localhost:5000';
};


const AGENT_BADGE_COLORS = {
  planner: 'bg-primary-600/20 text-primary-400 border-primary-500/30',
  execution: 'bg-accent-violet/20 text-accent-violet border-accent-violet/30',
  validation: 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30',
  recovery: 'bg-accent-amber/20 text-accent-amber border-accent-amber/30',
  monitoring: 'bg-accent-emerald/20 text-accent-emerald border-accent-emerald/30',
  orchestrator: 'bg-gray-800 text-gray-300 border-dark-border',
};

export default function ExecutionsPage() {
  const router = useRouter();
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [timelineLogs, setTimelineLogs] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/executions', {
        params: { status: statusFilter },
      });
      if (res.data?.success) {
        setExecutions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch execution history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, [statusFilter]);

  // Setup Socket.IO listener for live timeline updates
  useEffect(() => {
    const socket = io(getSocketUrl(), { transports: ['websocket', 'polling'] });

    socket.on('agent:event', (eventData) => {
      console.log('⚡ Socket Live Agent Event received:', eventData);

      // If user has open timeline drawer matching executionId, append live event
      if (selectedExecution && String(selectedExecution._id || selectedExecution.id) === String(eventData.executionId)) {
        setTimelineLogs((prev) => [...prev, eventData]);
      }

      // Refresh list to update status indicators
      fetchExecutions();
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedExecution]);

  const openTimelineDrawer = async (exec) => {
    setSelectedExecution(exec);
    setLoadingTimeline(true);
    try {
      const res = await api.get(`/executions/${exec._id || exec.id}/timeline`);
      if (res.data?.success) {
        setTimelineLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch timeline logs:', err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const handlePause = async (id) => {
    try {
      await api.post(`/executions/${id}/pause`);
      fetchExecutions();
    } catch (err) {
      console.error('Failed to pause execution:', err);
    }
  };

  const handleResume = async (id) => {
    try {
      await api.post(`/executions/${id}/resume`);
      fetchExecutions();
    } catch (err) {
      console.error('Failed to resume execution:', err);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.post(`/executions/${id}/cancel`);
      fetchExecutions();
    } catch (err) {
      console.error('Failed to cancel execution:', err);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="Live Execution Telemetry">
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Execution History & Live Timeline</h2>
              <p className="text-sm text-gray-400">Stream per-agent step events over Socket.IO with color-coded agent badges</p>
            </div>
            <button
              onClick={fetchExecutions}
              className="p-2.5 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white transition-colors flex items-center space-x-2 text-xs font-semibold self-start sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Runs</span>
            </button>
          </div>

          {/* Status Filter Bar */}
          <div className="flex items-center space-x-2 p-2 rounded-2xl bg-dark-surface border border-dark-border overflow-x-auto">
            {['', 'RUNNING', 'COMPLETED', 'FAILED', 'PAUSED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${statusFilter === st ? 'bg-primary-600 text-white' : 'bg-dark-card text-gray-400 hover:text-white'}`}
              >
                {st === '' ? 'All Executions' : st}
              </button>
            ))}
          </div>

          {/* Executions Table / Card List */}
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
              <p className="text-xs font-mono">Fetching Execution Telemetry...</p>
            </div>
          ) : executions.length > 0 ? (
            <div className="space-y-3">
              {executions.map((exec) => {
                const isCompleted = exec.status === 'COMPLETED';
                const isFailed = exec.status === 'FAILED';
                const isRunning = exec.status === 'RUNNING';
                const isPaused = exec.status === 'PAUSED';

                return (
                  <div
                    key={exec._id || exec.id}
                    className="glass-card p-4 rounded-2xl border border-dark-border hover:border-gray-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-bold text-sm text-white truncate">
                          {exec.workflow?.name || 'Workflow Run'}
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${isCompleted ? 'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30' : isFailed ? 'bg-accent-rose/10 text-accent-rose border-accent-rose/30' : isRunning ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30 animate-pulse' : 'bg-accent-amber/10 text-accent-amber border-accent-amber/30'}`}>
                          {exec.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-400 font-mono">
                        <span>ID: {(exec._id || exec.id).slice(-8)}</span>
                        <span>•</span>
                        <span>Duration: {exec.durationMs || 0}ms</span>
                        <span>•</span>
                        <span>Started: {new Date(exec.startedAt || exec.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {isRunning && (
                        <button
                          onClick={() => handlePause(exec._id || exec.id)}
                          className="p-2 rounded-xl bg-accent-amber/10 hover:bg-accent-amber/20 border border-accent-amber/30 text-accent-amber text-xs font-semibold flex items-center space-x-1"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause</span>
                        </button>
                      )}

                      {isPaused && (
                        <button
                          onClick={() => handleResume(exec._id || exec.id)}
                          className="p-2 rounded-xl bg-accent-emerald/10 hover:bg-accent-emerald/20 border border-accent-emerald/30 text-accent-emerald text-xs font-semibold flex items-center space-x-1"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Resume</span>
                        </button>
                      )}

                      {(isRunning || isPaused) && (
                        <button
                          onClick={() => handleCancel(exec._id || exec.id)}
                          className="p-2 rounded-xl bg-accent-rose/10 hover:bg-accent-rose/20 border border-accent-rose/30 text-accent-rose text-xs font-semibold flex items-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}

                      <button
                        onClick={() => openTimelineDrawer(exec)}
                        className="px-4 py-2 rounded-xl bg-primary-600/20 hover:bg-primary-600 text-primary-300 hover:text-white border border-primary-500/30 text-xs font-semibold transition-all flex items-center space-x-1.5"
                      >
                        <Activity className="w-3.5 h-3.5 text-accent-cyan" />
                        <span>Timeline Logs</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center text-gray-400 space-y-3">
              <Activity className="w-10 h-10 text-gray-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Executions Found</h3>
              <p className="text-xs max-w-sm mx-auto">Trigger workflow runs from the Canvas Editor to populate real-time agent execution telemetry.</p>
            </div>
          )}

          {/* Timeline Drawer Slide-Over */}
          {selectedExecution && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedExecution(null)} />
              <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-2xl bg-dark-surface border-l border-dark-border shadow-2xl p-6 flex flex-col justify-between">
                  {/* Drawer Header */}
                  <div className="pb-4 border-b border-dark-border flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-accent-cyan" />
                        <h2 className="font-bold text-base text-white">Multi-Agent Execution Timeline</h2>
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        Execution ID: {selectedExecution._id || selectedExecution.id}
                      </p>
                    </div>
                    <button onClick={() => setSelectedExecution(null)} className="text-gray-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Log Feed Body */}
                  <div className="my-4 flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-2">
                    {loadingTimeline ? (
                      <div className="p-8 text-center text-gray-400">
                        <Loader2 className="w-6 h-6 text-primary-500 animate-spin mx-auto mb-2" />
                        <p>Loading Agent Logs...</p>
                      </div>
                    ) : timelineLogs.length > 0 ? (
                      timelineLogs.map((log, idx) => {
                        const badgeStyle = AGENT_BADGE_COLORS[log.agent] || AGENT_BADGE_COLORS.orchestrator;
                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-dark-card border border-dark-border/80 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold border ${badgeStyle}`}>
                                {log.agent} Agent
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {new Date(log.createdAt || log.timestamp || Date.now()).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-gray-200 leading-relaxed">{log.message}</p>
                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                              <pre className="p-2 rounded-lg bg-dark-bg border border-dark-border/60 text-[10px] text-accent-cyan overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        No timeline logs recorded for this session.
                      </div>
                    )}
                  </div>

                  {/* Drawer Footer */}
                  <div className="pt-4 border-t border-dark-border text-center text-xs text-gray-400 font-mono flex items-center justify-between">
                    <span>Status: {selectedExecution.status}</span>
                    <span className="text-accent-emerald">Socket.IO Stream Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
