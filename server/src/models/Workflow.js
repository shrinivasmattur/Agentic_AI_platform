const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workflow name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'archived'],
      default: 'active',
    },
    trigger: {
      type: {
        type: String,
        enum: ['manual', 'webhook', 'schedule', 'email', 'slack_event'],
        default: 'manual',
      },
      config: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    nodes: {
      type: Array,
      default: [],
    },
    edges: {
      type: Array,
      default: [],
    },
    version: {
      type: Number,
      default: 1,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    lastExecutedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

let Workflow;
try {
  Workflow = mongoose.model('Workflow');
} catch {
  Workflow = mongoose.model('Workflow', workflowSchema);
}

module.exports = Workflow;
