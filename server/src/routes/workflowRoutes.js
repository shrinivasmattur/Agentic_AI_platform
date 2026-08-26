const express = require('express');
const { body } = require('express-validator');
const workflowController = require('../controllers/workflowController');
const executionController = require('../controllers/executionController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validator');

const router = express.Router();

// Apply auth middleware to all workflow routes
router.use(protect);

router.get('/dashboard', workflowController.getDashboardMetrics);

router.get('/', workflowController.getWorkflows);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Workflow name is required'),
    validate,
  ],
  workflowController.createWorkflow
);

router.post(
  '/generate',
  [
    body('prompt').trim().notEmpty().withMessage('Prompt string is required'),
    validate,
  ],
  workflowController.generateWorkflow
);

router.get('/:id', workflowController.getWorkflowById);

router.put('/:id', workflowController.updateWorkflow);

router.post('/:id/duplicate', workflowController.duplicateWorkflow);

router.post('/:id/execute', executionController.triggerWorkflowExecution);

router.delete('/:id', workflowController.deleteWorkflow);

module.exports = router;
