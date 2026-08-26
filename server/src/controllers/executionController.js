const asyncHandler = require('../utils/asyncHandler');
const executionService = require('../services/executionService');

const triggerWorkflowExecution = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const workflowId = req.params.id;
  const result = await executionService.triggerExecution(userId, workflowId, req.body.input);
  res.status(200).json({
    success: true,
    message: `Workflow execution completed with status ${result.execution.status}`,
    data: {
      ...result.execution,
      langGraph: result.langGraph,
    },
  });
});

const getExecutions = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { workflowId, status } = req.query;
  const list = await executionService.listExecutions(userId, { workflowId, status });
  res.status(200).json({
    success: true,
    count: list.length,
    data: list,
  });
});

const getExecutionById = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const session = await executionService.getExecutionById(userId, req.params.id);
  res.status(200).json({
    success: true,
    data: session,
  });
});

const getExecutionTimeline = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const timeline = await executionService.getExecutionTimeline(userId, req.params.id);
  res.status(200).json({
    success: true,
    count: timeline.length,
    data: timeline,
  });
});

const pauseExecution = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const updated = await executionService.pauseExecution(userId, req.params.id);
  res.status(200).json({
    success: true,
    message: 'Execution paused successfully',
    data: updated,
  });
});

const resumeExecution = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const updated = await executionService.resumeExecution(userId, req.params.id);
  res.status(200).json({
    success: true,
    message: 'Execution resumed successfully',
    data: updated,
  });
});

const cancelExecution = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const updated = await executionService.cancelExecution(userId, req.params.id);
  res.status(200).json({
    success: true,
    message: 'Execution cancelled successfully',
    data: updated,
  });
});

module.exports = {
  triggerWorkflowExecution,
  getExecutions,
  getExecutionById,
  getExecutionTimeline,
  pauseExecution,
  resumeExecution,
  cancelExecution,
};
