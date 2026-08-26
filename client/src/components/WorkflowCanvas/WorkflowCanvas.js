import { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Play,
  Zap,
  Mail,
  MessageSquare,
  Bot,
  Sparkles,
  GitBranch,
  Clock,
  Code,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';

const getNodeIcon = (type) => {
  if (type?.includes('trigger')) return Zap;
  if (type?.includes('gmail') || type?.includes('email')) return Mail;
  if (type?.includes('slack') || type?.includes('discord')) return MessageSquare;
  if (type?.includes('ai') || type?.includes('llm')) return Bot;
  if (type?.includes('sheets')) return FileSpreadsheet;
  if (type?.includes('condition')) return GitBranch;
  return Sparkles;
};

const getNodeColor = (type) => {
  if (type?.includes('trigger')) return 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan';
  if (type?.includes('ai')) return 'border-accent-violet bg-accent-violet/10 text-accent-violet';
  if (type?.includes('gmail') || type?.includes('sheets') || type?.includes('slack') || type?.includes('discord')) return 'border-accent-emerald bg-accent-emerald/10 text-accent-emerald';
  return 'border-primary-500 bg-primary-500/10 text-primary-400';
};

// Custom Node Renderer
const CustomNode = ({ data, selected, type }) => {
  const Icon = getNodeIcon(type);
  const colorClass = getNodeColor(type);

  return (
    <div
      className={`
        px-4 py-3 rounded-2xl bg-dark-card/90 border shadow-xl backdrop-blur-md min-w-[200px] transition-all duration-200
        ${selected ? 'border-primary-500 ring-2 ring-primary-500/50 shadow-primary-500/20' : 'border-dark-border hover:border-gray-500'}
      `}
    >
      {/* Target Connection Handle */}
      {!type?.includes('trigger') && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-primary-500 !border-2 !border-dark-bg !-top-1.5"
        />
      )}

      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-xl border shrink-0 ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-gray-100 truncate">{data.label || 'Workflow Node'}</p>
          <span className="text-[10px] font-mono text-gray-400 block truncate">{type || 'action'}</span>
        </div>
      </div>

      {data.status && (
        <div className="mt-2 pt-1.5 border-t border-dark-border/40 flex items-center justify-between text-[10px] font-mono">
          <span className="text-gray-400">Status:</span>
          <span className="text-accent-emerald flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {data.status}
          </span>
        </div>
      )}

      {/* Source Connection Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-primary-500 !border-2 !border-dark-bg !-bottom-1.5"
      />
    </div>
  );
};

const nodeTypes = {
  manual_trigger: CustomNode,
  webhook_trigger: CustomNode,
  schedule_trigger: CustomNode,
  gmail_trigger: CustomNode,
  gmail_send: CustomNode,
  slack_message: CustomNode,
  discord_message: CustomNode,
  sheets_append: CustomNode,
  ai_llm: CustomNode,
  ai_classifier: CustomNode,
  ai_code: CustomNode,
  logic_condition: CustomNode,
  logic_delay: CustomNode,
  standard_node: CustomNode,
};

export default function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onDropNode,
}) {
  const reactFlowWrapper = useRef(null);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData) return;

      const { type, label } = JSON.parse(rawData);
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 40,
      };

      onDropNode({ type, label, position });
    },
    [onDropNode]
  );

  return (
    <div className="flex-1 h-full w-full bg-dark-bg relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(e, node) => onNodeClick(node)}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        className="bg-dark-bg"
      >
        <Background color="#374151" gap={20} size={1} />
        <Controls className="!bg-dark-surface !border-dark-border" />
        <MiniMap
          nodeColor={(node) => '#6366F1'}
          maskColor="rgba(11, 15, 25, 0.7)"
          className="!bg-dark-surface !border-dark-border rounded-xl overflow-hidden"
        />
      </ReactFlow>
    </div>
  );
}
