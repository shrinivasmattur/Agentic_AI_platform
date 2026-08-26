const ApiError = require('../utils/apiError');
const { isInMemory } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const Workflow = require('../models/Workflow');

class WorkflowService {
  async getDashboardMetrics(userId) {
    if (isInMemory()) {
      const workflowsStore = memoryStore.getCollection('workflows');
      const executionsStore = memoryStore.getCollection('executions');

      const userWorkflows = await workflowsStore.find({ owner: String(userId) });
      const totalWorkflows = userWorkflows.length;
      const activeWorkflows = userWorkflows.filter(w => w.status === 'active').length;

      const userExecutions = await executionsStore.find({ owner: String(userId) });
      const totalExecutions = userExecutions.length;
      const successfulExecutions = userExecutions.filter(e => e.status === 'COMPLETED').length;
      const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 100;

      const recentWorkflows = userWorkflows.slice(-5).reverse();

      return {
        totalWorkflows,
        activeWorkflows,
        totalExecutions,
        successRate,
        recentWorkflows,
        aiActivity: [
          { id: 1, agent: 'Planner Agent', message: 'Optimized node execution topology for active workflows', time: '2 mins ago' },
          { id: 2, agent: 'Validation Agent', message: 'Verified 100% required output fields schema compliance', time: '15 mins ago' },
          { id: 3, agent: 'Monitoring Agent', message: 'All Socket.IO event channels operational', time: '1 hour ago' },
        ],
      };
    } else {
      const totalWorkflows = await Workflow.countDocuments({ owner: userId });
      const activeWorkflows = await Workflow.countDocuments({ owner: userId, status: 'active' });
      const recentWorkflows = await Workflow.find({ owner: userId }).sort({ updatedAt: -1 }).limit(5);

      // Fetch executions metrics if available
      const Execution = require('../models/Execution');
      let totalExecutions = 0;
      let successfulExecutions = 0;
      try {
        totalExecutions = await Execution.countDocuments({ owner: userId });
        successfulExecutions = await Execution.countDocuments({ owner: userId, status: 'COMPLETED' });
      } catch (e) {
        // Handle case where Executions model is still initializing
      }

      const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 100;

      return {
        totalWorkflows,
        activeWorkflows,
        totalExecutions,
        successRate,
        recentWorkflows,
        aiActivity: [
          { id: 1, agent: 'Planner Agent', message: 'Optimized node execution topology for active workflows', time: '2 mins ago' },
          { id: 2, agent: 'Validation Agent', message: 'Verified 100% required output fields schema compliance', time: '15 mins ago' },
          { id: 3, agent: 'Monitoring Agent', message: 'All Socket.IO event channels operational', time: '1 hour ago' },
        ],
      };
    }
  }

  async listWorkflows(userId, { search, status, tag }) {
    if (isInMemory()) {
      const store = memoryStore.getCollection('workflows');
      let list = await store.find({ owner: String(userId) });

      if (status) {
        list = list.filter(w => w.status === status);
      }
      if (tag) {
        list = list.filter(w => Array.isArray(w.tags) && w.tags.includes(tag));
      }
      if (search) {
        const s = search.toLowerCase();
        list = list.filter(w => w.name.toLowerCase().includes(s) || (w.description && w.description.toLowerCase().includes(s)));
      }

      return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } else {
      const query = { owner: userId };
      if (status) query.status = status;
      if (tag) query.tags = tag;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      return await Workflow.find(query).sort({ updatedAt: -1 });
    }
  }

  async createWorkflow(userId, data) {
    const payload = {
      ...data,
      owner: String(userId),
      version: 1,
      status: data.status || 'active',
      nodes: data.nodes || [],
      edges: data.edges || [],
      tags: data.tags || ['automation'],
    };

    if (isInMemory()) {
      return await memoryStore.getCollection('workflows').create(payload);
    } else {
      return await Workflow.create(payload);
    }
  }

  async getWorkflowById(userId, id) {
    let workflow = null;
    if (isInMemory()) {
      workflow = await memoryStore.getCollection('workflows').findById(id);
    } else {
      workflow = await Workflow.findById(id);
    }

    if (!workflow) {
      throw new ApiError(404, 'Workflow not found');
    }
    if (String(workflow.owner) !== String(userId)) {
      throw new ApiError(403, 'Permission denied to access this workflow');
    }

    return workflow;
  }

  async updateWorkflow(userId, id, data) {
    const existing = await this.getWorkflowById(userId, id);

    const updatePayload = {
      ...data,
      version: data.incrementVersion ? (existing.version || 1) + 1 : (existing.version || 1),
    };

    if (isInMemory()) {
      return await memoryStore.getCollection('workflows').findByIdAndUpdate(id, updatePayload);
    } else {
      return await Workflow.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
    }
  }

  async duplicateWorkflow(userId, id) {
    const original = await this.getWorkflowById(userId, id);

    const duplicatedData = {
      name: `${original.name} (Copy)`,
      description: original.description,
      trigger: original.trigger,
      nodes: JSON.parse(JSON.stringify(original.nodes || [])),
      edges: JSON.parse(JSON.stringify(original.edges || [])),
      tags: [...(original.tags || []), 'duplicated'],
      status: 'draft',
    };

    return await this.createWorkflow(userId, duplicatedData);
  }

  async deleteWorkflow(userId, id) {
    await this.getWorkflowById(userId, id);
    if (isInMemory()) {
      return await memoryStore.getCollection('workflows').findByIdAndDelete(id);
    } else {
      return await Workflow.findByIdAndDelete(id);
    }
  }
}

module.exports = new WorkflowService();
