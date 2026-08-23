const workflowService = require('../services/workflowService');
const aiService = require('../services/aiService');
const executionService = require('../services/executionService');

class WorkflowController {
  async getDashboard(req, res, next) {
    try {
      const stats = await workflowService.getDashboardStats(req.user._id);
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err) {
      next(err);
    }
  }

  async listWorkflows(req, res, next) {
    try {
      const { search, tag, status, page, limit } = req.query;
      const result = await workflowService.listWorkflows(req.user._id, { search, tag, status, page, limit });
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.getWorkflowById(req.user._id, req.params.id);
      return res.status(200).json({
        success: true,
        data: workflow
      });
    } catch (err) {
      next(err);
    }
  }

  async createWorkflow(req, res, next) {
    try {
      const workflow = await workflowService.createWorkflow(req.user._id, req.body);
      return res.status(201).json({
        success: true,
        data: workflow
      });
    } catch (err) {
      next(err);
    }
  }

  async updateWorkflow(req, res, next) {
    try {
      const updated = await workflowService.updateWorkflow(req.user._id, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async duplicateWorkflow(req, res, next) {
    try {
      const duplicated = await workflowService.duplicateWorkflow(req.user._id, req.params.id);
      return res.status(201).json({
        success: true,
        data: duplicated
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteWorkflow(req, res, next) {
    try {
      const result = await workflowService.deleteWorkflow(req.user._id, req.params.id);
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async generateWorkflow(req, res, next) {
    try {
      const { prompt } = req.body;
      const userId = req.user ? (req.user._id || req.user.id) : null;
      const generatedGraph = await aiService.generateWorkflow(prompt, { userId });
      return res.status(200).json({
        success: true,
        data: generatedGraph
      });
    } catch (err) {
      next(err);
    }
  }

  async executeWorkflow(req, res, next) {
    try {
      const { inputs } = req.body;
      const execution = await executionService.triggerExecution(req.user._id, req.params.id, {
        inputs: inputs || {},
        triggerType: 'manual'
      });
      return res.status(201).json({
        success: true,
        data: execution
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WorkflowController();
