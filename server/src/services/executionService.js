const ApiError = require('../utils/apiError');
const { isInMemory } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const orchestrator = require('../agents/orchestrator');

class ExecutionService {
  async triggerExecution(userId, workflowId, inputPayload = {}) {
    const workflowService = require('./workflowService');
    const workflow = await workflowService.getWorkflowById(userId, workflowId);

    const snapshot = JSON.parse(JSON.stringify(workflow));

    const executionData = {
      workflow: String(workflowId),
      owner: String(userId),
      snapshot,
      status: 'RUNNING',
      startedAt: new Date(),
      inputPayload,
      retryCount: 0,
    };

    let session = null;
    if (isInMemory()) {
      session = await memoryStore.getCollection('executions').create(executionData);
    } else {
      session = await Execution.create(executionData);
    }

    // Run multi-agent orchestrator asynchronously or inline
    const runResult = await orchestrator.runWorkflow(session, snapshot);

    // Update execution session status
    const updateData = {
      status: runResult.status,
      completedAt: new Date(),
      durationMs: runResult.durationMs,
      outputPayload: runResult.outputs,
    };

    let updatedSession = null;
    if (isInMemory()) {
      updatedSession = await memoryStore.getCollection('executions').findByIdAndUpdate(session._id, updateData);
    } else {
      updatedSession = await Execution.findByIdAndUpdate(session._id, updateData, { new: true });
    }

    return {
      execution: updatedSession,
      langGraph: runResult.langGraph,
    };
  }

  async listExecutions(userId, { workflowId, status }) {
    if (isInMemory()) {
      let list = await memoryStore.getCollection('executions').find({ owner: String(userId) });
      if (workflowId) list = list.filter(e => String(e.workflow) === String(workflowId));
      if (status) list = list.filter(e => e.status === status);
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      const query = { owner: userId };
      if (workflowId) query.workflow = workflowId;
      if (status) query.status = status;
      return await Execution.find(query).populate('workflow', 'name version').sort({ createdAt: -1 });
    }
  }

  async getExecutionById(userId, executionId) {
    let session = null;
    if (isInMemory()) {
      session = await memoryStore.getCollection('executions').findById(executionId);
    } else {
      session = await Execution.findById(executionId).populate('workflow', 'name version');
    }

    if (!session) throw new ApiError(404, 'Execution session not found');
    if (String(session.owner) !== String(userId)) throw new ApiError(403, 'Permission denied');

    return session;
  }

  async getExecutionTimeline(userId, executionId) {
    await this.getExecutionById(userId, executionId);

    if (isInMemory()) {
      const logs = await memoryStore.getCollection('executionLogs').find({ execution: String(executionId) });
      return logs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      return await ExecutionLog.find({ execution: executionId }).sort({ createdAt: 1 });
    }
  }

  async pauseExecution(userId, executionId) {
    await this.getExecutionById(userId, executionId);
    const update = { status: 'PAUSED' };
    if (isInMemory()) {
      return await memoryStore.getCollection('executions').findByIdAndUpdate(executionId, update);
    } else {
      return await Execution.findByIdAndUpdate(executionId, update, { new: true });
    }
  }

  async resumeExecution(userId, executionId) {
    await this.getExecutionById(userId, executionId);
    const update = { status: 'RUNNING' };
    if (isInMemory()) {
      return await memoryStore.getCollection('executions').findByIdAndUpdate(executionId, update);
    } else {
      return await Execution.findByIdAndUpdate(executionId, update, { new: true });
    }
  }

  async cancelExecution(userId, executionId) {
    await this.getExecutionById(userId, executionId);
    const update = { status: 'CANCELLED', completedAt: new Date() };
    if (isInMemory()) {
      return await memoryStore.getCollection('executions').findByIdAndUpdate(executionId, update);
    } else {
      return await Execution.findByIdAndUpdate(executionId, update, { new: true });
    }
  }
}

module.exports = new ExecutionService();
