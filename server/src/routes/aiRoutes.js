const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const { optionalAuth } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/ai/assistant
 * @desc    ChatGPT-Style AI Assistant powered by Google Gemini Pro & Flash
 * @access  Public / Optional Auth
 */
router.post('/assistant', optionalAuth, async (req, res) => {
  try {
    const { message, conversationHistory = [], userName, modelPreference = 'gemini-2.5-pro' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required.' });
    }

    const trimmed = message.trim();
    const effectiveUserName = userName || (req.user ? req.user.name : 'User');
    const startTime = Date.now();

    const qRes = await aiService.answerQuestion(trimmed, conversationHistory, effectiveUserName);
    let reply = '';
    let source = 'gemini-2.5-pro';

    if (typeof qRes === 'object' && qRes !== null) {
      reply = qRes.reply;
      source = qRes.source || source;
    } else {
      reply = qRes;
    }

    const latencyMs = Math.max(15, Date.now() - startTime);

    return res.status(200).json({
      success: true,
      data: {
        reply,
        source,
        latencyMs,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[AI Assistant Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal AI assistant error'
    });
  }
});

module.exports = router;
