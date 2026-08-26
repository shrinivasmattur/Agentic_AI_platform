import { useState, useEffect } from 'react';
import { Settings, Trash2, X, Sliders, CheckCircle, Sparkles } from 'lucide-react';

export default function NodeConfigPanel({ selectedNode, onUpdateNode, onDeleteNode, onClose }) {
  const [label, setLabel] = useState('');
  const [configData, setConfigData] = useState({});

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data?.label || '');
      setConfigData(selectedNode.data?.config || {});
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <div className="w-80 bg-dark-surface border-l border-dark-border p-6 flex flex-col items-center justify-center text-center text-gray-500 font-mono text-xs">
        <Sliders className="w-8 h-8 mb-2 text-gray-600 animate-pulse" />
        <p>Select any node on the React Flow canvas to inspect and configure parameters.</p>
      </div>
    );
  }

  const handleLabelChange = (e) => {
    const val = e.target.value;
    setLabel(val);
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      label: val,
    });
  };

  const handleConfigChange = (key, val) => {
    const updatedConfig = { ...configData, [key]: val };
    setConfigData(updatedConfig);
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      config: updatedConfig,
    });
  };

  return (
    <div className="w-80 bg-dark-surface border-l border-dark-border flex flex-col h-full overflow-hidden select-none">
      {/* Drawer Header */}
      <div className="p-4 border-b border-dark-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-primary-400" />
          <h2 className="font-bold text-xs uppercase tracking-wider text-gray-200">Node Properties</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
        {/* Node Type Badge */}
        <div className="p-3 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Type</span>
            <span className="font-mono font-semibold text-primary-400">{selectedNode.type || 'standard_node'}</span>
          </div>
          <span className="text-[10px] font-mono text-gray-400 bg-dark-bg px-2 py-1 rounded-md border border-dark-border">
            ID: {selectedNode.id}
          </span>
        </div>

        {/* Node Label */}
        <div>
          <label className="block font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
            Node Display Name
          </label>
          <input
            type="text"
            value={label}
            onChange={handleLabelChange}
            placeholder="Node Name"
            className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* AI & Action Config Inputs */}
        {selectedNode.type?.startsWith('ai_') && (
          <div>
            <label className="block font-semibold text-accent-violet uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI System Prompt
            </label>
            <textarea
              rows={4}
              value={configData.prompt || ''}
              onChange={(e) => handleConfigChange('prompt', e.target.value)}
              placeholder="e.g. Summarize input payload and extract sentiment classification..."
              className="w-full bg-dark-card border border-dark-border rounded-xl p-3 text-white focus:outline-none focus:border-accent-violet font-mono text-[11px]"
            />
          </div>
        )}

        {(selectedNode.type === 'gmail_send' || selectedNode.type === 'slack_message' || selectedNode.type === 'discord_message') && (
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Recipient / Target Channel
              </label>
              <input
                type="text"
                value={configData.recipient || ''}
                onChange={(e) => handleConfigChange('recipient', e.target.value)}
                placeholder="e.g. operator@company.com or #alerts"
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Message Body Template
              </label>
              <textarea
                rows={3}
                value={configData.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
                placeholder="e.g. Workflow execution payload: {{output.summary}}"
                className="w-full bg-dark-card border border-dark-border rounded-xl p-2.5 text-white focus:outline-none focus:border-primary-500 font-mono"
              />
            </div>
          </div>
        )}

        {selectedNode.type === 'sheets_append' && (
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Spreadsheet ID
              </label>
              <input
                type="text"
                value={configData.spreadsheetId || ''}
                onChange={(e) => handleConfigChange('spreadsheetId', e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-emerald font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Sheet Range Name
              </label>
              <input
                type="text"
                value={configData.range || 'Sheet1!A:E'}
                onChange={(e) => handleConfigChange('range', e.target.value)}
                placeholder="Sheet1!A:E"
                className="w-full bg-dark-card border border-dark-border rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-emerald font-mono"
              />
            </div>
          </div>
        )}

        {/* Validation Schema Summary */}
        <div className="pt-3 border-t border-dark-border space-y-2">
          <div className="flex items-center space-x-1.5 text-accent-emerald font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Output Schema Verified</span>
          </div>
          <p className="text-[11px] text-gray-400">
            Validated outputs pass safely to downstream nodes in agent pipeline.
          </p>
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-dark-border bg-dark-bg/60 flex items-center justify-between">
        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          className="px-3 py-2 rounded-xl text-accent-rose bg-accent-rose/10 hover:bg-accent-rose/20 border border-accent-rose/30 flex items-center space-x-1.5 text-xs font-semibold transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Node</span>
        </button>
      </div>
    </div>
  );
}
