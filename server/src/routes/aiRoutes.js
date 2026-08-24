const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const aiService = require('../services/aiService');
const env = require('../config/env');
const { optionalAuth } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/ai/status
 * @desc    Get Google AI Studio & Gemini connection status
 */
router.get('/status', (req, res) => {
  const isConfigured = Boolean(env.geminiApiKey && env.geminiApiKey.length > 8);
  const maskedKey = isConfigured
    ? `${env.geminiApiKey.substring(0, 6)}...${env.geminiApiKey.substring(env.geminiApiKey.length - 4)}`
    : null;

  return res.status(200).json({
    success: true,
    isConfigured,
    maskedKey,
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', type: 'Reasoning & Code Architect', context: '1M Tokens' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', type: 'Ultra-Fast Multimodal', context: '1M Tokens' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', type: 'Multimodal Foundation', context: '2M Tokens' }
    ]
  });
});

/**
 * @route   POST /api/ai/test-key
 * @desc    Test Google AI Studio API Key
 */
router.post('/test-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const keyToTest = apiKey || env.geminiApiKey;

    if (!keyToTest || !keyToTest.trim()) {
      return res.status(400).json({ success: false, error: 'Google AI Studio API Key is required.' });
    }

    const genAI = new GoogleGenerativeAI(keyToTest.trim());
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const startTime = Date.now();

    const result = await model.generateContent('Verify SAGAR AI connection. Reply with "Connected" in 1 word.');
    const reply = result.response.text();
    const latencyMs = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      message: 'Google AI Studio connection verified successfully!',
      model: 'gemini-2.5-flash',
      latencyMs,
      reply: reply.trim()
    });
  } catch (err) {
    console.error('[AI Studio Test Key Error]:', err.message);
    return res.status(400).json({
      success: false,
      error: `Google AI Studio verification failed: ${err.message}`
    });
  }
});

/**
 * @route   POST /api/ai/save-key
 * @desc    Save Google AI Studio API key to .env and memory
 */
router.post('/save-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || !apiKey.trim()) {
      return res.status(400).json({ success: false, error: 'API key cannot be empty.' });
    }

    const cleanKey = apiKey.trim();

    // Verify key first
    try {
      const genAI = new GoogleGenerativeAI(cleanKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      await model.generateContent('Ping');
    } catch (testErr) {
      return res.status(400).json({
        success: false,
        error: `Invalid Google AI Studio Key: ${testErr.message}`
      });
    }

    // Update runtime memory
    env.geminiApiKey = cleanKey;
    process.env.GEMINI_API_KEY = cleanKey;

    // Persist to server/.env safely
    const envPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf8');
      if (content.includes('GEMINI_API_KEY=')) {
        content = content.replace(/GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY=${cleanKey}`);
      } else {
        content += `\nGEMINI_API_KEY=${cleanKey}\n`;
      }
      fs.writeFileSync(envPath, content, 'utf8');
    }

    return res.status(200).json({
      success: true,
      message: 'Google AI Studio API Key saved and activated successfully!',
      maskedKey: `${cleanKey.substring(0, 6)}...${cleanKey.substring(cleanKey.length - 4)}`
    });
  } catch (err) {
    console.error('[Save Key Error]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to save API key'
    });
  }
});

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
