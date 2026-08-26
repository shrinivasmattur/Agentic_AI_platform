import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../utils/api';
import {
  GitFork,
  Search,
  Plus,
  Copy,
  Trash2,
  Play,
  ExternalLink,
  Sparkles,
  Tag,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Workflow Form State
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workflows', {
        params: { search, status: statusFilter },
      });
      if (res.data?.success) {
        setWorkflows(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [search, statusFilter]);

  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    if (!newWfName.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/workflows', {
        name: newWfName,
        description: newWfDesc,
        status: 'active',
        nodes: [
          {
            id: 'node-1',
            type: 'manual_trigger',
            position: { x: 250, y: 100 },
            data: { label: 'Manual Trigger', config: {} },
          },
        ],
        edges: [],
      });
      if (res.data?.success) {
        setCreateModalOpen(false);
        setNewWfName('');
        setNewWfDesc('');
        fetchWorkflows();
      }
    } catch (err) {
      console.error('Failed to create workflow:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await api.post(`/workflows/${id}/duplicate`);
      fetchWorkflows();
    } catch (err) {
      console.error('Failed to duplicate workflow:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/workflows/${id}`);
      fetchWorkflows();
    } catch (err) {
      console.error('Failed to delete workflow:', err);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="Workflow Management">
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header Action Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Workflows</h2>
              <p className="text-sm text-gray-400">Manage automation visual graphs, tags, versions, & manual execution triggers</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/workflows/builder"
                className="px-4 py-2.5 rounded-xl font-semibold text-accent-violet bg-accent-violet/10 hover:bg-accent-violet/20 border border-accent-violet/30 transition-all flex items-center space-x-2 text-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Prompt Builder</span>
              </Link>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-600/30 transition-all flex items-center space-x-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Workflow</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-dark-surface border border-dark-border">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search workflows by name..."
                className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter('')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === '' ? 'bg-primary-600 text-white' : 'bg-dark-card text-gray-400 hover:text-white'}`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === 'active' ? 'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30' : 'bg-dark-card text-gray-400 hover:text-white'}`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${statusFilter === 'draft' ? 'bg-accent-amber/20 text-accent-amber border border-accent-amber/30' : 'bg-dark-card text-gray-400 hover:text-white'}`}
              >
                Draft
              </button>
            </div>
          </div>

          {/* Workflow List Grid */}
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-2" />
              <p className="text-xs font-mono">Loading Workflows...</p>
            </div>
          ) : workflows.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((wf) => (
                <div
                  key={wf._id || wf.id}
                  className="glass-card p-5 rounded-2xl border border-dark-border hover:border-gray-600 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-base text-white group-hover:text-primary-400 transition-colors truncate">
                            {wf.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 shrink-0">
                            v{wf.version || 1}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{wf.description || 'No description'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {wf.tags?.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-dark-bg border border-dark-border text-[10px] font-mono text-gray-400 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-accent-violet" />
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dark-border/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/workflows/${wf._id || wf.id}`}
                        className="px-3.5 py-1.5 rounded-xl bg-primary-600/20 hover:bg-primary-600 text-primary-300 hover:text-white border border-primary-500/30 text-xs font-semibold transition-all flex items-center space-x-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Edit Canvas</span>
                      </Link>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleDuplicate(wf._id || wf.id)}
                        title="Duplicate Workflow"
                        className="p-2 text-gray-400 hover:text-white bg-dark-card hover:bg-dark-hover border border-dark-border rounded-lg transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(wf._id || wf.id)}
                        title="Delete Workflow"
                        className="p-2 text-gray-400 hover:text-accent-rose bg-dark-card hover:bg-accent-rose/10 border border-dark-border hover:border-accent-rose/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center text-gray-400 space-y-4">
              <GitFork className="w-10 h-10 text-gray-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Workflows Found</h3>
              <p className="text-xs max-w-sm mx-auto">Create a workflow manually or use the prompt builder to generate visual graphs.</p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-xs"
              >
                Create Workflow Now
              </button>
            </div>
          )}

          {/* Create Workflow Modal */}
          {createModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="glass-panel p-6 rounded-2xl border border-dark-border w-full max-w-md space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-dark-border">
                  <h3 className="font-bold text-base text-white">Create New Workflow</h3>
                  <button onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateWorkflow} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                      Workflow Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newWfName}
                      onChange={(e) => setNewWfName(e.target.value)}
                      placeholder="e.g. Gmail Invoice Auto-Router"
                      className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={newWfDesc}
                      onChange={(e) => setNewWfDesc(e.target.value)}
                      placeholder="Describe what this workflow automates..."
                      className="w-full bg-dark-card border border-dark-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setCreateModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-primary-600 hover:bg-primary-500 flex items-center space-x-2"
                    >
                      {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Initialize Canvas</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
