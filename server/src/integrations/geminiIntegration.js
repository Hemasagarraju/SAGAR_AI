const BaseIntegration = require('./baseIntegration');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

class GeminiIntegration extends BaseIntegration {
  constructor() {
    super('gemini');
  }

  async testConnection(credentials) {
    try {
      const apiKey = credentials?.apiKey || credentials?.accessToken || env.geminiApiKey;
      if (!apiKey || apiKey.startsWith('mock-')) {
        return {
          success: true,
          message: 'Google Gemini Pro / Flash linked (Sandbox Mode)',
          accountIdentifier: 'Google AI Studio Pro Account'
        };
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const testPrompt = 'Say "SAGARAGENT_AI Gemini Connected"';
      const result = await model.generateContent(testPrompt);
      const text = result.response.text();

      return {
        success: true,
        message: 'Google Gemini AI Pro / Flash connected successfully',
        accountIdentifier: 'Google AI Studio (Gemini Pro/Flash)',
        details: { response: text.trim() }
      };
    } catch (err) {
      return {
        success: false,
        message: `Gemini connection failed: ${err.message}`
      };
    }
  }

  async executeAction(action, params = {}, credentials = {}) {
    const apiKey = credentials?.apiKey || credentials?.accessToken || env.geminiApiKey;
    if (!apiKey) {
      throw new Error('Google Gemini API Key is not configured. Please add your key in Integrations.');
    }

    const {
      prompt = '',
      systemInstruction = '',
      model: modelName = 'gemini-1.5-flash',
      temperature = 0.7,
      maxOutputTokens = 2048
    } = params;

    if (!prompt) {
      throw new Error('Prompt is required for Gemini AI action.');
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction || undefined,
        generationConfig: {
          temperature,
          maxOutputTokens
        }
      });

      const result = await model.generateContent(prompt);
      const outputText = result.response.text();

      return {
        success: true,
        data: {
          model: modelName,
          output: outputText.trim(),
          timestamp: new Date().toISOString()
        }
      };
    } catch (err) {
      console.error('[GeminiIntegration] Execution error:', err);
      throw new Error(`Gemini execution failed: ${err.message}`);
    }
  }
}

module.exports = new GeminiIntegration();
