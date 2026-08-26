const mongoose = require('mongoose');

const agentMemorySchema = new mongoose.Schema(
  {
    workflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
    },
    execution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Execution',
      required: true,
    },
    agentId: {
      type: String,
      required: true,
    },
    memoryKey: {
      type: String,
      required: true,
    },
    memoryValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    confidenceScore: {
      type: Number,
      default: 1.0,
    },
  },
  {
    timestamps: true,
  }
);

let AgentMemory;
try {
  AgentMemory = mongoose.model('AgentMemory');
} catch {
  AgentMemory = mongoose.model('AgentMemory', agentMemorySchema);
}

module.exports = AgentMemory;
