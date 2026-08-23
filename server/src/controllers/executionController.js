const executionService = require('../services/executionService');

class ExecutionController {
  async listExecutions(req, res, next) {
    try {
      const { status, workflowId, page, limit } = req.query;
      const result = await executionService.listExecutions(req.user._id, { status, workflowId, page, limit });
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async getExecution(req, res, next) {
    try {
      const execution = await executionService.getExecutionById(req.user._id, req.params.id);
      return res.status(200).json({
        success: true,
        data: execution
      });
    } catch (err) {
      next(err);
    }
  }

  async getTimeline(req, res, next) {
    try {
      const timeline = await executionService.getExecutionTimeline(req.user._id, req.params.id);
      return res.status(200).json({
        success: true,
        data: timeline
      });
    } catch (err) {
      next(err);
    }
  }

  async pauseExecution(req, res, next) {
    try {
      const updated = await executionService.pauseExecution(req.user._id, req.params.id);
      return res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async resumeExecution(req, res, next) {
    try {
      const updated = await executionService.resumeExecution(req.user._id, req.params.id);
      return res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  async cancelExecution(req, res, next) {
    try {
      const updated = await executionService.cancelExecution(req.user._id, req.params.id);
      return res.status(200).json({
        success: true,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ExecutionController();
