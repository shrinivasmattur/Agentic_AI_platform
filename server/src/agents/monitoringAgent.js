const { emitAgentEvent } = require('../config/socket');
const { isInMemory } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const ExecutionLog = require('../models/ExecutionLog');

class MonitoringAgent {
  async emitAndLogEvent({ executionId, workflowId, nodeId, agent, level, eventType, message, metadata = {} }) {
    const timestamp = new Date();

    const logPayload = {
      execution: String(executionId),
      workflow: String(workflowId),
      nodeId: nodeId || '',
      agent, // 'planner' | 'execution' | 'validation' | 'recovery' | 'monitoring' | 'orchestrator'
      level, // 'info' | 'warning' | 'error' | 'success'
      eventType,
      message,
      metadata,
      createdAt: timestamp,
    };

    // 1. Broadcast Socket.IO real-time event to connected browser clients
    emitAgentEvent(executionId, {
      workflowId,
      nodeId,
      agent,
      level,
      eventType,
      message,
      metadata,
    });

    // 2. Persist audit log record
    try {
      if (isInMemory()) {
        await memoryStore.getCollection('executionLogs').create(logPayload);
      } else {
        await ExecutionLog.create(logPayload);
      }
    } catch (err) {
      console.error('Failed to persist ExecutionLog record:', err.message);
    }

    return logPayload;
  }
}

module.exports = new MonitoringAgent();
