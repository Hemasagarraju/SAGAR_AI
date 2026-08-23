const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const Workflow = require('../models/Workflow');
const { addExecutionJob } = require('../queues/executionQueue');
const { emitExecutionEvent } = require('../config/socket');

class ExecutionService {
  /**
   * List all execution runs with filtering and pagination
   */
  async listExecutions(userId, { status = '', workflowId = '', page = 1, limit = 20 } = {}) {
    const query = { owner: userId };

    if (status) {
      query.status = status;
    }

    if (workflowId) {
      query.workflowId = workflowId;
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [executions, total] = await Promise.all([
      Execution.find(query).sort({ createdAt: -1 }).skip(skip).limit(take).populate('workflowId', 'name description').lean(),
      Execution.countDocuments(query)
    ]);

    return {
      executions,
      pagination: {
        page: parseInt(page, 10),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    };
  }

  /**
   * Get single execution run details
   */
  async getExecutionById(userId, executionId) {
    const execution = await Execution.findOne({ _id: executionId, owner: userId }).populate('workflowId', 'name description tags version');
    if (!execution) {
      const error = new Error('Execution not found');
      error.statusCode = 404;
      throw error;
    }
    return execution;
  }

  /**
   * Get timeline audit logs for an execution
   */
  async getExecutionTimeline(userId, executionId) {
    const execution = await this.getExecutionById(userId, executionId);
    const logs = await ExecutionLog.find({ executionId: execution._id }).sort({ timestamp: 1 }).lean();
    return {
      execution,
      logs
    };
  }

  /**
   * Trigger execution run for a workflow
   */
  async triggerExecution(userId, workflowId, { inputs = {}, triggerType = 'manual' } = {}) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const error = new Error('Workflow not found');
      error.statusCode = 404;
      throw error;
    }

    // Capture immutable snapshot at runtime
    const snapshot = {
      _id: workflow._id,
      name: workflow.name,
      description: workflow.description,
      triggerConfig: workflow.triggerConfig,
      nodes: workflow.nodes,
      edges: workflow.edges,
      version: workflow.version
    };

    const execution = await Execution.create({
      workflowId: workflow._id,
      workflowSnapshot: snapshot,
      status: 'PENDING',
      currentNode: null,
      startTime: new Date(),
      inputs,
      outputs: {},
      retryCount: 0,
      triggerType,
      owner: userId,
      orchestrationMetadata: {
        langGraph: 'available',
        planConfidence: 1.0,
        plannedOrder: [],
        totalNodes: workflow.nodes.length,
        completedNodes: []
      }
    });

    // Enqueue for background execution
    await addExecutionJob(execution._id.toString());

    return execution;
  }

  /**
   * Pause active execution
   */
  async pauseExecution(userId, executionId) {
    const execution = await this.getExecutionById(userId, executionId);
    if (execution.status !== 'RUNNING' && execution.status !== 'RETRYING') {
      const error = new Error(`Cannot pause execution with status ${execution.status}`);
      error.statusCode = 400;
      throw error;
    }

    execution.status = 'PAUSED';
    await execution.save();

    emitExecutionEvent(executionId.toString(), 'execution:updated', {
      executionId: execution._id,
      status: 'PAUSED',
      currentNode: execution.currentNode
    });

    return execution;
  }

  /**
   * Resume paused execution
   */
  async resumeExecution(userId, executionId) {
    const execution = await this.getExecutionById(userId, executionId);
    if (execution.status !== 'PAUSED') {
      const error = new Error(`Cannot resume execution with status ${execution.status}`);
      error.statusCode = 400;
      throw error;
    }

    execution.status = 'RUNNING';
    await execution.save();

    emitExecutionEvent(executionId.toString(), 'execution:updated', {
      executionId: execution._id,
      status: 'RUNNING',
      currentNode: execution.currentNode
    });

    // Re-enqueue to finish remaining steps
    await addExecutionJob(execution._id.toString());

    return execution;
  }

  /**
   * Cancel running execution
   */
  async cancelExecution(userId, executionId) {
    const execution = await this.getExecutionById(userId, executionId);
    if (execution.status === 'COMPLETED' || execution.status === 'CANCELLED') {
      const error = new Error(`Cannot cancel execution with status ${execution.status}`);
      error.statusCode = 400;
      throw error;
    }

    execution.status = 'CANCELLED';
    execution.endTime = new Date();
    execution.duration = Date.now() - new Date(execution.startTime).getTime();
    await execution.save();

    emitExecutionEvent(executionId.toString(), 'execution:updated', {
      executionId: execution._id,
      status: 'CANCELLED',
      duration: execution.duration
    });

    return execution;
  }
}

module.exports = new ExecutionService();
