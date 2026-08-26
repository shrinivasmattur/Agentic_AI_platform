const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');
const env = require('../config/env');

let langGraphStatus = 'not-installed';
try {
  require('@langchain/langgraph');
  langGraphStatus = 'available';
} catch (e) {
  langGraphStatus = 'not-installed';
}

class MultiAgentOrchestrator {
  getLangGraphStatus() {
    return langGraphStatus;
  }

  async runWorkflow(executionSession, workflowSnapshot, options = {}) {
    const executionId = executionSession._id || executionSession.id;
    const workflowId = workflowSnapshot._id || workflowSnapshot.id;
    const userId = executionSession.owner;
    const startTime = Date.now();

    // 1. Initial Orchestration Startup Log
    await monitoringAgent.emitAndLogEvent({
      executionId,
      workflowId,
      agent: 'orchestrator',
      level: 'info',
      eventType: 'ORCHESTRATION_STARTED',
      message: `Multi-Agent chain initialized for workflow [${workflowSnapshot.name}]. Substrate LangGraph: ${langGraphStatus}`,
      metadata: { langGraph: langGraphStatus },
    });

    // 2. PLANNER AGENT: Topological Plan & Confidence Score
    await monitoringAgent.emitAndLogEvent({
      executionId,
      workflowId,
      agent: 'planner',
      level: 'info',
      eventType: 'PLANNING_STARTED',
      message: 'Planner Agent analyzing graph topology and generating execution order...',
    });

    const plan = await plannerAgent.planExecution(workflowSnapshot);

    await monitoringAgent.emitAndLogEvent({
      executionId,
      workflowId,
      agent: 'planner',
      level: 'success',
      eventType: 'PLANNING_COMPLETED',
      message: `Planner Agent compiled topology with ${plan.orderedNodeIds.length} steps. Confidence score: ${(plan.confidenceScore * 100).toFixed(0)}%`,
      metadata: { plan },
    });

    // 3. Sequential Node Execution Loop
    let currentInput = executionSession.inputPayload || {};
    let finalOutputs = {};
    let hasFailure = false;

    for (const nodeId of plan.orderedNodeIds) {
      const node = workflowSnapshot.nodes.find(n => n.id === nodeId);
      if (!node) continue;

      // EXECUTION AGENT
      await monitoringAgent.emitAndLogEvent({
        executionId,
        workflowId,
        nodeId,
        agent: 'execution',
        level: 'info',
        eventType: 'NODE_EXECUTION_START',
        message: `Execution Agent running node [${node.data?.label || nodeId}] (${node.type})...`,
      });

      const execResult = await executionAgent.executeNode(node, currentInput, {
        userId,
        openRouterKey: env.OPENROUTER_API_KEY,
        geminiKey: env.GEMINI_API_KEY,
      });

      // VALIDATION AGENT
      await monitoringAgent.emitAndLogEvent({
        executionId,
        workflowId,
        nodeId,
        agent: 'validation',
        level: 'info',
        eventType: 'VALIDATION_START',
        message: `Validation Agent auditing output schema for node [${node.id}]...`,
      });

      const valResult = await validationAgent.validateStepOutput(node, execResult.output);

      if (valResult.valid) {
        await monitoringAgent.emitAndLogEvent({
          executionId,
          workflowId,
          nodeId,
          agent: 'validation',
          level: 'success',
          eventType: 'VALIDATION_PASSED',
          message: `Validation Agent confirmed 100% schema output compliance for node [${node.id}].`,
        });

        currentInput = execResult.output;
        finalOutputs[nodeId] = execResult.output;
      } else {
        // RECOVERY AGENT
        await monitoringAgent.emitAndLogEvent({
          executionId,
          workflowId,
          nodeId,
          agent: 'recovery',
          level: 'warning',
          eventType: 'RECOVERY_CLASSIFICATION',
          message: `Recovery Agent evaluating failure code: ${valResult.error}. ${valResult.details}`,
        });

        const recDecision = recoveryAgent.classifyAndResolveFailure({ error: valResult.details });

        await monitoringAgent.emitAndLogEvent({
          executionId,
          workflowId,
          nodeId,
          agent: 'recovery',
          level: recDecision.strategy === 'retry_with_backoff' ? 'warning' : 'error',
          eventType: 'RECOVERY_DECISION',
          message: `Recovery Agent strategy: ${recDecision.strategy.toUpperCase()}. ${recDecision.recommendation}`,
          metadata: { recDecision },
        });

        if (recDecision.strategy === 'escalate') {
          hasFailure = true;
          break;
        }
      }
    }

    const totalDurationMs = Date.now() - startTime;
    const finalStatus = hasFailure ? 'FAILED' : 'COMPLETED';

    await monitoringAgent.emitAndLogEvent({
      executionId,
      workflowId,
      agent: 'monitoring',
      level: hasFailure ? 'error' : 'success',
      eventType: 'ORCHESTRATION_FINISHED',
      message: `Workflow orchestration completed with status ${finalStatus} in ${totalDurationMs}ms.`,
      metadata: { status: finalStatus, durationMs: totalDurationMs, langGraph: langGraphStatus },
    });

    return {
      status: finalStatus,
      outputs: finalOutputs,
      durationMs: totalDurationMs,
      langGraph: langGraphStatus,
    };
  }
}

module.exports = new MultiAgentOrchestrator();
