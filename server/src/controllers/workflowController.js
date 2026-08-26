const asyncHandler = require('../utils/asyncHandler');
const workflowService = require('../services/workflowService');
const aiGeneratorService = require('../services/aiGeneratorService');

const getDashboardMetrics = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const metrics = await workflowService.getDashboardMetrics(userId);
  res.status(200).json({
    success: true,
    data: metrics,
  });
});

const getWorkflows = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { search, status, tag } = req.query;
  const workflows = await workflowService.listWorkflows(userId, { search, status, tag });
  res.status(200).json({
    success: true,
    count: workflows.length,
    data: workflows,
  });
});

const createWorkflow = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const workflow = await workflowService.createWorkflow(userId, req.body);
  res.status(201).json({
    success: true,
    message: 'Workflow created successfully',
    data: workflow,
  });
});

const getWorkflowById = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const workflow = await workflowService.getWorkflowById(userId, req.params.id);
  res.status(200).json({
    success: true,
    data: workflow,
  });
});

const updateWorkflow = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const workflow = await workflowService.updateWorkflow(userId, req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Workflow updated successfully',
    data: workflow,
  });
});

const duplicateWorkflow = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const duplicated = await workflowService.duplicateWorkflow(userId, req.params.id);
  res.status(201).json({
    success: true,
    message: 'Workflow duplicated successfully',
    data: duplicated,
  });
});

const deleteWorkflow = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  await workflowService.deleteWorkflow(userId, req.params.id);
  res.status(200).json({
    success: true,
    message: 'Workflow deleted successfully',
  });
});

const generateWorkflow = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  const generatedGraph = await aiGeneratorService.generateWorkflowFromPrompt(prompt);
  res.status(200).json({
    success: true,
    message: `Workflow graph generated successfully via ${generatedGraph.providerUsed}`,
    data: generatedGraph,
  });
});

module.exports = {
  getDashboardMetrics,
  getWorkflows,
  createWorkflow,
  generateWorkflow,
  getWorkflowById,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow,
};
