const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const aiService = require('../services/aiService');
const { protect, optionalAuth, adminOnly } = require('../middleware/authMiddleware');

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
 * Robust Google AI Studio Key Verifier using dynamic Google Model Discovery
 */
async function verifyGeminiApiKey(rawKey) {
  const cleanKey = sanitizeApiKey(rawKey);

  if (!cleanKey) {
    throw new Error('Google AI Studio API Key is empty. Please paste your key.');
  }

  const startTime = Date.now();

  try {
    // 1. Direct discovery against Google's API to list models supported by this specific key
    const listRes = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const rawModels = listRes.data?.models || [];
    const modelNames = rawModels
      .filter((m) => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
      .map((m) => m.name.replace(/^models\//, ''));

    // Preference hierarchy for best available model on this key
    const preferredOrder = [
      'gemini-3.6-flash',
      'gemini-flash-latest',
      'gemini-pro-latest',
      'gemini-3.7-flash',
      'gemini-3.1-pro-preview',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro'
    ];

    const chosenModel = preferredOrder.find((p) => modelNames.includes(p)) || modelNames[0] || 'gemini-1.5-flash';

    // 2. Perform a fast 1-word generation test using the chosen model
    const genAI = new GoogleGenerativeAI(cleanKey);
    const model = genAI.getGenerativeModel({ model: chosenModel });
    const result = await model.generateContent('Say "Connected" in one word.');
    const text = result.response.text();
    const latencyMs = Math.max(10, Date.now() - startTime);

    return {
      success: true,
      model: chosenModel,
      latencyMs,
      reply: text ? text.trim() : 'Connected',
      cleanKey,
      availableModels: modelNames.slice(0, 5)
    };
  } catch (err) {
    const status = err.response?.status;
    const errorData = err.response?.data?.error || {};
    const errorMsg = errorData.message || err.message || '';
    const reason = errorData.details?.[0]?.reason || errorData.status || '';

    if (status === 400 || reason === 'API_KEY_INVALID' || errorMsg.includes('API key not valid') || errorMsg.includes('API_KEY_INVALID')) {
      throw new Error('Invalid API Key. Please verify you copied the entire key starting with "AIzaSy..." from https://aistudio.google.com/app/apikey');
    }

    if (status === 403 || reason === 'PERMISSION_DENIED' || errorMsg.includes('PERMISSION_DENIED')) {
      throw new Error('Permission denied. Please ensure the Generative Language API is enabled on your Google Cloud / AI Studio project.');
    }

    if (status === 429 || reason === 'RESOURCE_EXHAUSTED' || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      // Key is valid but rate-limited
      return {
        success: true,
        model: 'gemini-1.5-flash',
        latencyMs: Date.now() - startTime,
        reply: 'Rate limit active, but key is valid',
        cleanKey
      };
    }

    if (err.code === 'ECONNABORTED' || err.code === 'ENOTFOUND' || err.message.includes('timeout')) {
      throw new Error('Network timeout connecting to Google AI Studio. Please check your internet connection and retry.');
    }

    // Attempt SDK fallback if REST was blocked
    try {
      const genAI = new GoogleGenerativeAI(cleanKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('Ping');
      const text = result.response.text();
      return {
        success: true,
        model: 'gemini-1.5-flash',
        latencyMs: Math.max(10, Date.now() - startTime),
        reply: text ? text.trim() : 'Connected',
        cleanKey
      };
    } catch (sdkErr) {
      throw new Error(errorMsg || sdkErr.message || 'Google AI Studio verification failed.');
    }
  }
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
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', type: 'Next-Gen Ultra Fast', context: '1M Tokens' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', type: 'High Speed Multimodal', context: '1M Tokens' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', type: 'Deep Reasoning & Architecture', context: '2M Tokens' }
    ]
  });
});

/**
 * @route   POST /api/ai/test-key
 * @desc    Test Google AI Studio API Key
 */
router.post('/test-key', protect, adminOnly, async (req, res) => {
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
router.post('/save-key', protect, adminOnly, async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey || !apiKey.trim()) {
      return res.status(400).json({ success: false, error: 'API key cannot be empty.' });
    }

    // Verify key with Google AI Studio
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
