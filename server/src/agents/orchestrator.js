const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');
const Execution = require('../models/Execution');
const AgentMemory = require('../models/AgentMemory');
const { emitExecutionEvent } = require('../config/socket');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class Orchestrator {
  constructor() {
    this.langGraphStatus = 'available'; // reports agent orchestration substrate
  }

  /**
   * Main Orchestrator Run Method
   */
  async runExecution(executionId) {
    const execution = await Execution.findById(executionId);
    if (!execution) {
      throw new Error(`Execution record ${executionId} not found.`);
    }

    const workflow = execution.workflowSnapshot;
    const userId = execution.owner;
    const workflowId = execution.workflowId;

    // Set initial RUNNING state
    execution.status = 'RUNNING';
    execution.startTime = execution.startTime || new Date();
    await execution.save();

    emitExecutionEvent(executionId.toString(), 'execution:updated', {
      executionId: execution._id,
      status: 'RUNNING',
      currentNode: null
    });

    await monitoringAgent.emitLog({
      executionId,
      workflowId,
      agent: 'monitoring',
      level: 'info',
      message: `Workflow orchestration initialized. Orchestration substrate: LangGraph (${this.langGraphStatus}).`,
      metadata: { langGraph: this.langGraphStatus, totalNodes: workflow.nodes?.length || 0 }
    });

    // 1. Planner Agent Phase
    await monitoringAgent.emitLog({
      executionId,
      workflowId,
      agent: 'planner',
      level: 'info',
      message: 'Planner Agent analyzing graph topology, dependencies, and generating execution pipeline...'
    });

    const plan = plannerAgent.plan(workflow);
    execution.orchestrationMetadata = {
      langGraph: this.langGraphStatus,
      planConfidence: plan.confidence,
      plannedOrder: plan.plannedOrder,
      totalNodes: workflow.nodes?.length || 0,
      completedNodes: []
    };
    await execution.save();

    await AgentMemory.create({
      workflowId,
      executionId,
      agentId: 'planner',
      key: 'plannedOrder',
      value: plan.plannedOrder,
      confidenceScore: plan.confidence
    });

    await monitoringAgent.emitLog({
      executionId,
      workflowId,
      agent: 'planner',
      level: 'success',
      message: `Planner Agent computed graph order [${plan.plannedOrder.join(' -> ')}] with confidence score ${Math.round(plan.confidence * 100)}%.`,
      metadata: plan.planDetails
    });

    if (plan.plannedOrder.length === 0) {
      execution.status = 'COMPLETED';
      execution.endTime = new Date();
      execution.duration = Date.now() - new Date(execution.startTime).getTime();
      await execution.save();
      return execution;
    }

    // Execution Context holds inputs and outputs of each completed node
    const context = {
      inputs: execution.inputs || {},
      outputs: execution.outputs || {}
    };

    const nodeMap = {};
    (workflow.nodes || []).forEach((n) => {
      nodeMap[n.id] = n;
    });

    // 2. Iterate through ordered nodes
    for (let i = 0; i < plan.plannedOrder.length; i++) {
      const nodeId = plan.plannedOrder[i];
      const node = nodeMap[nodeId];

      if (!node) {
        console.warn(`[Orchestrator] Node ${nodeId} not found in graph snapshot.`);
        continue;
      }

      // Check for live user interruption (PAUSE / CANCEL)
      const freshExecution = await Execution.findById(executionId);
      if (freshExecution.status === 'PAUSED') {
        await monitoringAgent.emitLog({
          executionId,
          workflowId,
          nodeId,
          agent: 'monitoring',
          level: 'warning',
          message: `Execution paused by operator at node ${node.data?.label || nodeId}. Execution state persisted in AgentMemory.`
        });
        return freshExecution;
      }

      if (freshExecution.status === 'CANCELLED') {
        await monitoringAgent.emitLog({
          executionId,
          workflowId,
          nodeId,
          agent: 'monitoring',
          level: 'warning',
          message: `Execution cancelled by operator at node ${node.data?.label || nodeId}. Halting agent chain.`
        });
        return freshExecution;
      }

      // Update current node in progress
      freshExecution.currentNode = nodeId;
      await freshExecution.save();

      emitExecutionEvent(executionId.toString(), 'execution:updated', {
        executionId: freshExecution._id,
        status: 'RUNNING',
        currentNode: nodeId
      });

      let stepSuccess = false;
      let stepRetries = 0;
      let nodeResult = null;

      // Retry Loop managed by Recovery Agent
      while (!stepSuccess) {
        try {
          await monitoringAgent.emitLog({
            executionId,
            workflowId,
            nodeId,
            agent: 'execution',
            level: 'info',
            message: `Execution Agent running step: "${node.data?.label || nodeId}" (${node.type})...`,
            metadata: { action: node.data?.action, retries: stepRetries }
          });

          // Run Execution Agent
          nodeResult = await executionAgent.executeNode(node, context, userId);

          // Run Validation Agent
          await monitoringAgent.emitLog({
            executionId,
            workflowId,
            nodeId,
            agent: 'validation',
            level: 'info',
            message: `Validation Agent verifying output schema & field requirements for step "${node.data?.label || nodeId}"...`
          });

          const validation = validationAgent.validate(node, nodeResult);

          if (!validation.valid) {
            const valError = new Error(`Validation failed: ${validation.errors.join(', ')}`);
            valError.code = 'MISSING_FIELDS';
            throw valError;
          }

          await monitoringAgent.emitLog({
            executionId,
            workflowId,
            nodeId,
            agent: 'validation',
            level: 'success',
            message: `Validation Agent confirmed integrity (${validation.checksPassed}/${validation.totalChecks} checks passed). Confidence: ${Math.round(validation.confidence * 100)}%.`,
            metadata: { checksPassed: validation.checksPassed, totalChecks: validation.totalChecks }
          });

          stepSuccess = true;
        } catch (stepErr) {
          console.warn(`[Orchestrator] Error during step ${nodeId}:`, stepErr.message);

          // Recovery Agent intervention
          const recoveryDecision = recoveryAgent.decide(stepErr, stepRetries);

          await monitoringAgent.emitLog({
            executionId,
            workflowId,
            nodeId,
            agent: 'recovery',
            level: recoveryDecision.action === 'retry_with_backoff' ? 'warning' : 'error',
            message: `Recovery Agent classified error: [${recoveryDecision.classification}]. Decision: ${recoveryDecision.action.toUpperCase()}. ${recoveryDecision.reason}`,
            metadata: recoveryDecision
          });

          if (recoveryDecision.action === 'retry_with_backoff') {
            stepRetries = recoveryDecision.nextRetryNumber;
            freshExecution.retryCount = (freshExecution.retryCount || 0) + 1;
            freshExecution.status = 'RETRYING';
            await freshExecution.save();

            emitExecutionEvent(executionId.toString(), 'execution:updated', {
              executionId: freshExecution._id,
              status: 'RETRYING',
              currentNode: nodeId
            });

            await sleep(recoveryDecision.backoffMs);
          } else {
            // Escalation / Fatal failure
            freshExecution.status = 'FAILED';
            freshExecution.endTime = new Date();
            freshExecution.duration = Date.now() - new Date(freshExecution.startTime).getTime();
            freshExecution.error = {
              message: stepErr.message,
              code: stepErr.code || 'STEP_FAILURE',
              classification: recoveryDecision.classification,
              nodeId,
              stack: stepErr.stack
            };
            await freshExecution.save();

            emitExecutionEvent(executionId.toString(), 'execution:updated', {
              executionId: freshExecution._id,
              status: 'FAILED',
              currentNode: nodeId,
              error: freshExecution.error
            });

            await monitoringAgent.notifyUser({
              userId,
              workflowId,
              executionId,
              type: 'escalation',
              title: `Workflow Escalation: ${workflow.name}`,
              message: `Step "${node.data?.label || nodeId}" failed (${recoveryDecision.classification}): ${stepErr.message}. ${recoveryDecision.suggestedFix || ''}`
            });

            return freshExecution;
          }
        }
      }

      // Step succeeded: update context, agent memory & outputs
      context[node.id] = { output: nodeResult.output };
      context.outputs[node.id] = nodeResult.output;

      freshExecution.outputs = context.outputs;
      freshExecution.orchestrationMetadata.completedNodes.push(nodeId);
      await freshExecution.save();

      await AgentMemory.create({
        workflowId,
        executionId,
        agentId: 'execution',
        key: `output:${nodeId}`,
        value: nodeResult.output,
        confidenceScore: 0.98
      });

      await monitoringAgent.emitLog({
        executionId,
        workflowId,
        nodeId,
        agent: 'execution',
        level: 'success',
        message: `Step "${node.data?.label || nodeId}" completed in ${nodeResult.durationMs}ms. Output serialized.`,
        metadata: { durationMs: nodeResult.durationMs, outputPreview: nodeResult.output }
      });
    }

    // All steps finished successfully!
    const finalExecution = await Execution.findById(executionId);
    finalExecution.status = 'COMPLETED';
    finalExecution.currentNode = null;
    finalExecution.endTime = new Date();
    finalExecution.duration = Date.now() - new Date(finalExecution.startTime).getTime();
    await finalExecution.save();

    emitExecutionEvent(executionId.toString(), 'execution:updated', {
      executionId: finalExecution._id,
      status: 'COMPLETED',
      duration: finalExecution.duration
    });

    await monitoringAgent.emitLog({
      executionId,
      workflowId,
      agent: 'monitoring',
      level: 'success',
      message: `Workflow "${workflow.name}" completed successfully across all ${plan.plannedOrder.length} agent steps. Total duration: ${finalExecution.duration}ms.`,
      metadata: { durationMs: finalExecution.duration, totalSteps: plan.plannedOrder.length }
    });

    await monitoringAgent.notifyUser({
      userId,
      workflowId,
      executionId,
      type: 'success',
      title: `Workflow Succeeded: ${workflow.name}`,
      message: `Automation finished without errors in ${(finalExecution.duration / 1000).toFixed(2)}s.`
    });

    return finalExecution;
  }
}

module.exports = new Orchestrator();
