import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import NodePalette from '../../components/NodePalette/NodePalette';
import NodeConfigPanel from '../../components/NodeConfigPanel/NodeConfigPanel';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import api from '../../utils/api';
import { addEdge, useNodesState, useEdgesState } from '@xyflow/react';
import {
  Save,
  Play,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GitFork,
  ArrowLeft,
  Radio
} from 'lucide-react';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;

  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const fetchWorkflow = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/workflows/${id}`);
      if (res.data?.success) {
        const wf = res.data.data;
        setWorkflow(wf);
        setNodes(wf.nodes || []);
        setEdges(wf.edges || []);
      }
    } catch (err) {
      console.error('Failed to load workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflow();
  }, [id]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366F1' } }, eds)),
    [setEdges]
  );

  const handleDropNode = useCallback(
    ({ type, label, position }) => {
      const newNodeId = `node_${Date.now()}`;
      const newNode = {
        id: newNodeId,
        type,
        position,
        data: {
          label,
          config: {},
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const handleUpdateNode = (nodeId, updatedData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: updatedData };
        }
        return node;
      })
    );
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode((prev) => ({ ...prev, data: updatedData }));
    }
  };

  const handleDeleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNode(null);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const res = await api.put(`/workflows/${id}`, {
        nodes,
        edges,
        incrementVersion: true,
      });
      if (res.data?.success) {
        setWorkflow(res.data.data);
      }
    } catch (err) {
      console.error('Failed to save workflow:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    if (!id) return;
    setExecuting(true);
    setExecutionResult(null);
    try {
      const res = await api.post(`/workflows/${id}/execute`, {
        input: { trigger: 'Manual Operator Trigger' },
      });
      if (res.data?.success) {
        setExecutionResult(res.data.data);
      }
    } catch (err) {
      console.error('Failed to execute workflow:', err);
      setExecutionResult({
        error: err.response?.data?.message || 'Execution error encountered',
      });
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell title="Workflow Canvas Editor">
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
            <p className="text-sm font-mono">Loading React Flow Canvas & Nodes...</p>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell title={workflow ? `Canvas Editor: ${workflow.name}` : 'Canvas Editor'}>
        <div className="h-[calc(100vh-6rem)] flex flex-col -m-6 overflow-hidden">
          {/* Top Canvas Editor Toolbar */}
          <div className="h-14 bg-dark-surface border-b border-dark-border px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/workflows')}
                className="p-1.5 text-gray-400 hover:text-white bg-dark-card hover:bg-dark-hover border border-dark-border rounded-lg"
                title="Back to Workflows"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center space-x-2">
                <GitFork className="w-4 h-4 text-primary-400" />
                <span className="font-bold text-sm text-white">{workflow?.name}</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30">
                  v{workflow?.version || 1}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-200 bg-dark-card hover:bg-dark-hover border border-dark-border flex items-center space-x-1.5 transition-all"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-accent-cyan" />}
                <span>{saving ? 'Saving...' : 'Save Workflow'}</span>
              </button>

              <button
                onClick={handleExecute}
                disabled={executing}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-accent-emerald to-accent-cyan hover:opacity-90 shadow-md shadow-accent-emerald/20 flex items-center space-x-1.5 transition-all"
              >
                {executing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{executing ? 'Orchestrating...' : 'Trigger Execution'}</span>
              </button>
            </div>
          </div>

          {/* Canvas Workspace Layout (Left Palette, Center Canvas, Right Panel) */}
          <div className="flex-1 flex overflow-hidden relative">
            <NodePalette />
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(node) => setSelectedNode(node)}
              onDropNode={handleDropNode}
            />
            <NodeConfigPanel
              selectedNode={selectedNode}
              onUpdateNode={handleUpdateNode}
              onDeleteNode={handleDeleteNode}
              onClose={() => setSelectedNode(null)}
            />
          </div>

          {/* Execution Result Drawer Footer Notification */}
          {executionResult && (
            <div className="p-4 bg-dark-surface border-t border-dark-border text-xs flex items-center justify-between z-30">
              <div className="flex items-center space-x-3">
                {executionResult.error ? (
                  <AlertCircle className="w-5 h-5 text-accent-rose shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-accent-emerald shrink-0" />
                )}
                <div>
                  <span className="font-mono font-bold text-white block">
                    Execution Status: {executionResult.status || (executionResult.error ? 'FAILED' : 'COMPLETED')}
                  </span>
                  <p className="text-gray-400 font-mono text-[11px]">
                    {executionResult.error || `Execution ID: ${executionResult.executionId || executionResult._id}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/executions`)}
                className="px-3 py-1.5 rounded-lg bg-primary-600/20 text-primary-300 border border-primary-500/30 text-xs font-semibold"
              >
                View Live Timeline Logs
              </button>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
