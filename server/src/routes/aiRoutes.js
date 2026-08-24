const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const aiService = require('../services/aiService');
const env = require('../config/env');
const { optionalAuth } = require('../middleware/authMiddleware');

/**
 * Sanitize API Key input from user
 */
function sanitizeApiKey(key) {
  if (!key) return '';
  let cleaned = String(key).trim();
  // Remove wrapping single or double quotes
  cleaned = cleaned.replace(/^["']|["']$/g, '');
  // Remove variable name prefix if user pasted GEMINI_API_KEY=AIzaSy...
  cleaned = cleaned.replace(/^(export\s+)?(GEMINI_API_KEY|GOOGLE_API_KEY|API_KEY)\s*=\s*/i, '');
  // Final trim
  return cleaned.trim();
}

/**
 * Helper to verify Google AI Studio API Key across multiple model candidates
 */
async function verifyGeminiApiKey(rawKey) {
  const cleanKey = sanitizeApiKey(rawKey);

  if (!cleanKey) {
    throw new Error('Google AI Studio API Key is empty.');
  }

  // Model fallback candidates in order of universal availability
  const candidateModels = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-2.5-pro'
  ];

  const genAI = new GoogleGenerativeAI(cleanKey);
  let lastError = null;
  const startTime = Date.now();

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Say "Connected"');
      const text = result.response.text();
      const latencyMs = Math.max(10, Date.now() - startTime);

      return {
        success: true,
        model: modelName,
        latencyMs,
        reply: text ? text.trim() : 'Connected',
        cleanKey
      };
    } catch (err) {
      lastError = err;
      const errMsg = err.message || '';

      // If key is fundamentally invalid, stop immediately
      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
        throw new Error('The API key provided is invalid. Please copy your key from https://aistudio.google.com/app/apikey');
      }

      if (errMsg.includes('PERMISSION_DENIED')) {
        throw new Error('Permission denied. Please verify your Google AI Studio project is active.');
      }

      // If model not found, try the next model candidate
      if (errMsg.includes('not found') || errMsg.includes('404')) {
        continue;
      }
    }
  }

  // If all models failed, throw descriptive error
  throw new Error(lastError ? lastError.message : 'Google AI Studio verification failed across all models.');
}

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
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', type: 'Ultra-Fast Multimodal', context: '1M Tokens' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', type: 'Multimodal Foundation', context: '2M Tokens' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', type: 'Reasoning & Code Architect', context: '1M Tokens' }
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
      return res.status(400).json({
        success: false,
        error: 'Google AI Studio API Key is required. Please paste your key.'
      });
    }

    const verification = await verifyGeminiApiKey(keyToTest);

    return res.status(200).json({
      success: true,
      message: `Google AI Studio connected successfully with ${verification.model}!`,
      model: verification.model,
      latencyMs: verification.latencyMs,
      reply: verification.reply
    });
  } catch (err) {
    console.warn('[AI Studio Test Key Warn]:', err.message);
    return res.status(400).json({
      success: false,
      error: err.message || 'Google AI Studio verification failed.'
    });
  }
});

/**
 * @route   POST /api/ai/save-key
 * @desc    Save Google AI Studio API key to .env and runtime memory
 */
router.post('/save-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || !apiKey.trim()) {
      return res.status(400).json({ success: false, error: 'API key cannot be empty.' });
    }

    // Verify key with Google AI Studio across candidate models
    const verification = await verifyGeminiApiKey(apiKey);
    const cleanKey = verification.cleanKey;

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
      message: `Google AI Studio API Key saved and activated (${verification.model})!`,
      model: verification.model,
      maskedKey: `${cleanKey.substring(0, 6)}...${cleanKey.substring(cleanKey.length - 4)}`
    });
  } catch (err) {
    console.warn('[Save Key Warn]:', err.message);
    return res.status(400).json({
      success: false,
      error: err.message || 'Failed to save and verify Google AI Studio key'
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
    const { message, conversationHistory = [], userName, modelPreference = 'gemini-1.5-flash' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required.' });
    }

    const trimmed = message.trim();
    const effectiveUserName = userName || (req.user ? req.user.name : 'User');
    const startTime = Date.now();

    const qRes = await aiService.answerQuestion(trimmed, conversationHistory, effectiveUserName);
    let reply = '';
    let source = 'gemini-ai';

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
