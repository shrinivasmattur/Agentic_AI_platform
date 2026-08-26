import { useState } from 'react';
import {
  Zap,
  Play,
  Mail,
  MessageSquare,
  Bot,
  Sparkles,
  GitBranch,
  Clock,
  Code,
  FileSpreadsheet,
  Layers
} from 'lucide-react';

const NODE_CATALOG = [
  {
    category: 'Triggers',
    color: 'border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan',
    items: [
      { type: 'manual_trigger', label: 'Manual Trigger', icon: Play, desc: 'Trigger workflow on demand' },
      { type: 'webhook_trigger', label: 'Webhook Event', icon: Zap, desc: 'Listen for HTTP Webhook payload' },
      { type: 'schedule_trigger', label: 'Cron Schedule', icon: Clock, desc: 'Recurring timer execution' },
      { type: 'gmail_trigger', label: 'Gmail Email Trigger', icon: Mail, desc: 'Trigger on new email message' },
    ],
  },
  {
    category: 'Actions',
    color: 'border-accent-emerald/40 bg-accent-emerald/10 text-accent-emerald',
    items: [
      { type: 'gmail_send', label: 'Send Email (Gmail)', icon: Mail, desc: 'Send recipient email message' },
      { type: 'slack_message', label: 'Post Slack Message', icon: MessageSquare, desc: 'Send Slack channel message' },
      { type: 'discord_message', label: 'Discord Bot Message', icon: MessageSquare, desc: 'Send Discord channel message' },
      { type: 'sheets_append', label: 'Append Google Sheet', icon: FileSpreadsheet, desc: 'Append data row to Google Sheet' },
    ],
  },
  {
    category: 'AI Nodes',
    color: 'border-accent-violet/40 bg-accent-violet/10 text-accent-violet',
    items: [
      { type: 'ai_llm', label: 'LLM Prompt Node', icon: Bot, desc: 'OpenRouter / Gemini AI prompt' },
      { type: 'ai_classifier', label: 'Intent Classifier', icon: Sparkles, desc: 'Categorize text or email intent' },
      { type: 'ai_code', label: 'AI Code Generator', icon: Code, desc: 'Generate and execute dynamic script' },
    ],
  },
  {
    category: 'Logic Nodes',
    color: 'border-primary-500/40 bg-primary-500/10 text-primary-400',
    items: [
      { type: 'logic_condition', label: 'Branch Condition', icon: GitBranch, desc: 'Evaluate If/Else true branch' },
      { type: 'logic_delay', label: 'Delay Timer', icon: Clock, desc: 'Pause execution for N seconds' },
    ],
  },
];

export default function NodePalette() {
  const [activeTab, setActiveTab] = useState('All');

  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-72 bg-dark-surface border-r border-dark-border flex flex-col h-full overflow-hidden select-none">
      <div className="p-4 border-b border-dark-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-primary-400" />
          <h2 className="font-bold text-xs uppercase tracking-wider text-gray-200">Node Palette</h2>
        </div>
        <span className="text-[10px] font-mono bg-dark-card border border-dark-border text-gray-400 px-2 py-0.5 rounded-md">
          Drag & Drop
        </span>
      </div>

      <div className="p-3 overflow-y-auto space-y-5 flex-1">
        {NODE_CATALOG.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="text-[11px] font-mono uppercase tracking-wider font-semibold text-gray-400 px-1">
              {group.category}
            </h3>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.type, item.label)}
                    className="p-2.5 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border hover:border-gray-600 cursor-grab active:cursor-grabbing transition-all duration-150 flex items-start space-x-3 group"
                  >
                    <div className={`p-2 rounded-lg border shrink-0 ${group.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-gray-200 group-hover:text-white truncate">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
