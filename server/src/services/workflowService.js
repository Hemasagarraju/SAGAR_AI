const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');

class WorkflowService {
  /**
   * List workflows with search, tag filter, and pagination
   */
  async listWorkflows(userId, { search = '', tag = '', status = '', page = 1, limit = 20 } = {}) {
    const query = { owner: userId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    if (status) {
      query.status = status;
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [workflows, total] = await Promise.all([
      Workflow.find(query).sort({ updatedAt: -1 }).skip(skip).limit(take).lean(),
      Workflow.countDocuments(query)
    ]);

    return {
      workflows,
      pagination: {
        page: parseInt(page, 10),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    };
  }

  /**
   * Get single workflow by ID
   */
  async getWorkflowById(userId, workflowId) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const error = new Error('Workflow not found');
      error.statusCode = 404;
      throw error;
    }
    return workflow;
  }

  /**
   * Create a new workflow manually or from builder
   */
  async createWorkflow(userId, data) {
    const defaultNodes = data.nodes && data.nodes.length > 0 ? data.nodes : [
      {
        id: 'node_trigger',
        type: 'trigger',
        position: { x: 100, y: 150 },
        data: { label: 'Manual Trigger', action: 'manual', config: {}, description: 'Start workflow on-demand' }
      }
    ];

    const workflow = await Workflow.create({
      name: data.name || 'Untitled Agent Workflow',
      description: data.description || '',
      owner: userId,
      status: data.status || 'draft',
      triggerConfig: data.triggerConfig || { type: 'manual' },
      nodes: defaultNodes,
      edges: data.edges || [],
      tags: data.tags || ['automation'],
      version: 1
    });

    return workflow;
  }

  /**
   * Update workflow structure and bump version
   */
  async updateWorkflow(userId, workflowId, updateData) {
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) {
      const error = new Error('Workflow not found');
      error.statusCode = 404;
      throw error;
    }

    if (updateData.name !== undefined) workflow.name = updateData.name;
    if (updateData.description !== undefined) workflow.description = updateData.description;
    if (updateData.status !== undefined) workflow.status = updateData.status;
    if (updateData.triggerConfig !== undefined) workflow.triggerConfig = updateData.triggerConfig;
    if (updateData.nodes !== undefined) workflow.nodes = updateData.nodes;
    if (updateData.edges !== undefined) workflow.edges = updateData.edges;
    if (updateData.tags !== undefined) workflow.tags = updateData.tags;

    // Bump version
    workflow.version = (workflow.version || 1) + 1;

    await workflow.save();
    return workflow;
  }

  /**
   * Duplicate / Clone an existing workflow
   */
  async duplicateWorkflow(userId, workflowId) {
    const original = await this.getWorkflowById(userId, workflowId);
    
    const clone = await Workflow.create({
      name: `${original.name} (Copy)`,
      description: original.description,
      owner: userId,
      status: 'draft',
      triggerConfig: original.triggerConfig,
      nodes: original.nodes,
      edges: original.edges,
      tags: original.tags,
      version: 1
    });

    return clone;
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(userId, workflowId) {
    const workflow = await Workflow.findOneAndDelete({ _id: workflowId, owner: userId });
    if (!workflow) {
      const error = new Error('Workflow not found');
      error.statusCode = 404;
      throw error;
    }
    return { success: true, message: 'Workflow deleted successfully' };
  }

  /**
   * Aggregated Dashboard Statistics
   */
  async getDashboardStats(userId) {
    const [totalWorkflows, activeWorkflows, executions, recentLogs] = await Promise.all([
      Workflow.countDocuments({ owner: userId }),
      Workflow.countDocuments({ owner: userId, status: 'active' }),
      Execution.find({ owner: userId }).sort({ createdAt: -1 }).limit(50).lean(),
      ExecutionLog.find().sort({ timestamp: -1 }).limit(10).lean()
    ]);

    const totalRuns = executions.length;
    const completedRuns = executions.filter((e) => e.status === 'COMPLETED').length;
    const failedRuns = executions.filter((e) => e.status === 'FAILED').length;
    const runningRuns = executions.filter((e) => e.status === 'RUNNING' || e.status === 'RETRYING').length;
    const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 100;

    const totalDuration = executions.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    const avgDurationMs = totalRuns > 0 ? Math.round(totalDuration / totalRuns) : 0;

    // Recent 24h summary
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last24hRuns = executions.filter((e) => new Date(e.createdAt) > oneDayAgo).length;

    return {
      metrics: {
        totalWorkflows,
        activeWorkflows,
        totalExecutions: totalRuns,
        activeRuns: runningRuns,
        completedRuns,
        failedRuns,
        successRate,
        avgDurationMs,
        last24hExecutions: last24hRuns
      },
      recentExecutions: executions.slice(0, 6),
      recentActivity: recentLogs
    };
  }
}

module.exports = new WorkflowService();
