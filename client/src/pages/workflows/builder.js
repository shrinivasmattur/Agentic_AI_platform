import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import WorkflowCanvas from '../../components/WorkflowCanvas/WorkflowCanvas';
import api from '../../utils/api';
import { useNodesState, useEdgesState } from '@xyflow/react';
import {
  Sparkles,
  Bot,
  Play,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  RefreshCw,
  Wand2,
  Sliders
} from 'lucide-react';

const PROMPT_PRESETS = [
  'Route high-value Gmail invoices to Slack #finance and append to Google Sheet',
  'Listen for Webhook payload, classify sentiment using Gemini AI, and send Discord bot alert',
  'Cron schedule every hour to check inventory, format code with LLM, and send email digest',
];

export default function AIWorkflowBuilderPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [providerUsed, setProviderUsed] = useState(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDesc, setWorkflowDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const handleGenerate = async (promptOverride) => {
    const targetPrompt = promptOverride || prompt;
    if (!targetPrompt.trim()) return;
    setGenerating(true);
    setProviderUsed(null);
    try {
      const res = await api.post('/workflows/generate', { prompt: targetPrompt });
      if (res.data?.success) {
        const graph = res.data.data;
        setNodes(graph.nodes || []);
        setEdges(graph.edges || []);
        setWorkflowName(graph.name || 'AI Generated Workflow');
        setWorkflowDesc(graph.description || targetPrompt);
        setProviderUsed(graph.providerUsed || 'AI Orchestrator');
      }
    } catch (err) {
      console.error('Failed to generate workflow:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveWorkflow = async () => {
    if (!nodes.length) return;
    setSaving(true);
    try {
      const res = await api.post('/workflows', {
        name: workflowName || 'AI Generated Workflow',
        description: workflowDesc,
        nodes,
        edges,
        tags: ['ai-generated', providerUsed || 'openrouter'],
        status: 'active',
      });
      if (res.data?.success) {
        const createdWf = res.data.data;
        router.push(`/workflows/${createdWf._id || createdWf.id}`);
      }
    } catch (err) {
      console.error('Failed to save generated workflow:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="AI Workflow Builder">
        <div className="h-[calc(100vh-6rem)] flex flex-col -m-6 overflow-hidden">
          {/* Top Generator Header Toolbar */}
          <div className="h-16 bg-dark-surface border-b border-dark-border px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-violet to-primary-600 flex items-center justify-center text-white shadow-md">
                <Wand2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white">Prompt-to-Workflow Engine</h2>
                <p className="text-[11px] text-gray-400">OpenRouter • Gemini SDK • Deterministic Fallback</p>
              </div>
            </div>

            {nodes.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono text-accent-emerald flex items-center gap-1.5 bg-accent-emerald/10 border border-accent-emerald/20 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Generated via {providerUsed}
                </span>

                <button
                  onClick={handleSaveWorkflow}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-accent-violet hover:from-primary-500 hover:to-accent-violet/90 shadow-md shadow-primary-600/30 flex items-center space-x-2 transition-all"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save & Edit on Canvas</span>
                </button>
              </div>
            )}
          </div>

          {/* Builder Workspace Layout */}
          <div className="flex-1 flex overflow-hidden">
            {/* Prompt Input Sidebar Panel */}
            <div className="w-96 bg-dark-surface border-r border-dark-border p-6 flex flex-col justify-between overflow-y-auto shrink-0 space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent-violet" />
                    Describe Your Automation
                  </label>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Enter any business prompt in natural language. The AI agent will assemble nodes, data connections, and configs automatically.
                  </p>
                </div>

                <div className="space-y-3">
                  <textarea
                    rows={5}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. When a new email arrives in Gmail, analyze invoice details with Gemini, append row to Google Sheets, and notify Slack..."
                    className="w-full bg-dark-card border border-dark-border rounded-2xl p-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent-violet transition-colors font-mono leading-relaxed"
                  />

                  <button
                    onClick={() => handleGenerate()}
                    disabled={generating || !prompt.trim()}
                    className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 via-accent-violet to-accent-cyan hover:opacity-95 shadow-lg shadow-primary-600/30 transition-all flex items-center justify-center space-x-2 text-xs disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Synthesizing Workflow Graph...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>Generate Workflow Graph</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Prompt Presets List */}
                <div className="space-y-2.5 pt-4 border-t border-dark-border">
                  <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider font-semibold block">
                    Quick Preset Templates
                  </span>
                  <div className="space-y-2">
                    {PROMPT_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPrompt(preset);
                          handleGenerate(preset);
                        }}
                        className="w-full text-left p-3 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border hover:border-gray-500 transition-all text-xs text-gray-300 hover:text-white font-mono space-y-1 block group"
                      >
                        <div className="flex items-center justify-between text-[10px] text-accent-cyan font-bold">
                          <span>Preset #{idx + 1}</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="line-clamp-2 leading-tight text-[11px] text-gray-400">{preset}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-dark-card border border-dark-border text-[11px] text-gray-400 font-mono space-y-1">
                <span className="text-accent-emerald font-bold block">✓ LangGraph Substrate Supported</span>
                <p>Generated graphs export cleanly to React Flow visual format.</p>
              </div>
            </div>

            {/* Graph Preview Canvas */}
            <div className="flex-1 flex flex-col h-full bg-dark-bg relative">
              {nodes.length > 0 ? (
                <WorkflowCanvas
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={() => {}}
                  onNodeClick={() => {}}
                  onDropNode={() => {}}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500 font-mono text-xs space-y-3">
                  <Bot className="w-12 h-12 text-primary-500/40 animate-bounce" />
                  <h3 className="text-base font-bold text-gray-300">Prompt Graph Preview Canvas</h3>
                  <p className="max-w-md text-gray-400">
                    Type an automation prompt on the left sidebar or select a quick template to generate your visual workflow node graph.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
