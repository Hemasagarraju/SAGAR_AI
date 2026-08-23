const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/ai/assistant
 * @desc    Chat with SAGARAGENT_AI Assistant & Copilot (Workflow Advice, DAG Generation, Debugging)
 * @access  Public / Protected (Optional token)
 */
router.post('/assistant', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required.' });
    }

    const trimmed = message.trim();
    const lower = trimmed.toLowerCase();

    // Precise intent classification: Detect if user explicitly wants to synthesize a DAG graph
    const isWorkflowRequest = 
      lower.startsWith('create ') ||
      lower.startsWith('build ') ||
      lower.startsWith('generate ') ||
      lower.startsWith('automate ') ||
      lower.includes('create a workflow') ||
      lower.includes('build a workflow') ||
      lower.includes('generate workflow') ||
      lower.includes('create pipeline') ||
      lower.includes('build pipeline') ||
      lower.includes('new workflow') ||
      (lower.includes('workflow') && (lower.includes('when ') || lower.includes('alert') || lower.includes('trigger') || lower.includes('send ')));

    let workflowGraph = null;
    let reply = '';

    // If user prompt asks to create a workflow, compile DAG graph
    if (isWorkflowRequest) {
      try {
        workflowGraph = await aiService.generateWorkflow(trimmed, { user: req.user });
      } catch (err) {
        console.warn('[AI Assistant] Graph synthesis fallback:', err.message);
      }
    }

    // Synthesize contextual reply based on question
    if (workflowGraph && workflowGraph.nodes && workflowGraph.nodes.length > 0) {
      reply = `⚡ I've synthesized a **${workflowGraph.nodes.length}-node DAG workflow**: **"${workflowGraph.name}"** for your requirement!\n\n` +
        `**Topology Pipeline:**\n` +
        workflowGraph.nodes.map((n, i) => `${i + 1}. **${n.data.label}** (${n.type}) — *${n.data.description}*`).join('\n') +
        `\n\nClick **"Apply to AI Studio Canvas"** below to load this DAG directly into your canvas editor and execute it with real integrations.`;
    } else {
      reply = await aiService.answerQuestion(trimmed, conversationHistory);
    }

    return res.status(200).json({
      success: true,
      data: {
        reply,
        workflowGraph,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[AI Assistant Route Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal assistant error'
    });
  }
});

module.exports = router;
