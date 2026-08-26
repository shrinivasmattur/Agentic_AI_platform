const { Queue, Worker } = require('bullmq');
const { getRedis, isRedisAvailable } = require('./redis');
const orchestrator = require('../agents/orchestrator');

let executionQueue = null;
let executionWorker = null;

const initExecutionQueue = () => {
  const connection = getRedis();
  if (!connection || !isRedisAvailable()) {
    console.log('ℹ️  BullMQ Execution Queue operating in synchronous in-memory dispatch mode.');
    return;
  }

  try {
    executionQueue = new Queue('workflow-executions', { connection });

    executionWorker = new Worker(
      'workflow-executions',
      async (job) => {
        const { executionSession, workflowSnapshot } = job.data;
        return await orchestrator.runWorkflow(executionSession, workflowSnapshot);
      },
      { connection }
    );

    executionWorker.on('completed', (job) => {
      console.log(`✅ Queue Job [${job.id}] completed execution successfully.`);
    });

    executionWorker.on('failed', (job, err) => {
      console.error(`❌ Queue Job [${job.id}] failed: ${err.message}`);
    });
  } catch (error) {
    console.warn(`⚠️ Failed to initialize BullMQ worker: ${error.message}`);
  }
};

const enqueueExecution = async (executionSession, workflowSnapshot) => {
  if (executionQueue && isRedisAvailable()) {
    return await executionQueue.add('execute-workflow', { executionSession, workflowSnapshot });
  } else {
    // In-memory immediate fallback execution
    return await orchestrator.runWorkflow(executionSession, workflowSnapshot);
  }
};

module.exports = {
  initExecutionQueue,
  enqueueExecution,
};
