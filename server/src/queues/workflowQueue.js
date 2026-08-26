const { Queue } = require('bullmq');
const { getRedis, isRedisAvailable } = require('./redis');

let workflowQueue = null;

const initWorkflowQueue = () => {
  const connection = getRedis();
  if (!connection || !isRedisAvailable()) {
    return;
  }

  try {
    workflowQueue = new Queue('workflow-schedules', { connection });
  } catch (error) {
    console.warn(`⚠️ Failed to initialize workflow scheduling queue: ${error.message}`);
  }
};

module.exports = {
  initWorkflowQueue,
  getWorkflowQueue: () => workflowQueue,
};
