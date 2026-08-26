const mongoose = require('mongoose');

const executionLogSchema = new mongoose.Schema(
  {
    execution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Execution',
      required: true,
    },
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
    },
    nodeId: {
      type: String,
      default: '',
    },
    agent: {
      type: String,
      enum: ['planner', 'execution', 'validation', 'recovery', 'monitoring', 'orchestrator'],
      required: true,
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'error', 'success'],
      default: 'info',
    },
    eventType: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

let ExecutionLog;
try {
  ExecutionLog = mongoose.model('ExecutionLog');
} catch {
  ExecutionLog = mongoose.model('ExecutionLog', executionLogSchema);
}

module.exports = ExecutionLog;
