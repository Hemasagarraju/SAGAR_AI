const SavedPrompt = require('../models/SavedPrompt');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const notificationService = require('../services/notificationService');

const CURATED_TEMPLATES = [
  {
    id: 'tmpl-1',
    title: 'Midjourney v6 Photorealistic Portrait',
    category: 'image',
    targetModel: 'Midjourney v6 / Flux',
    tags: ['Photography', 'Portrait', 'Lighting'],
    prompt: 'Cinematic portrait of an astronaut looking at an alien bioluminescent forest, 35mm lens, golden hour rim lighting, bokeh depth of field, 8k hyper-detailed --ar 16:9 --style raw'
  },
  {
    id: 'tmpl-2',
    title: 'Cyberpunk Neon Metropolis Landscape',
    category: 'image',
    targetModel: 'Flux.1 / DALL-E 3',
    tags: ['Cyberpunk', 'Sci-Fi', 'Environment'],
    prompt: 'Vast futuristic cyberpunk metropolis at night with flying speeders, neon holographic billboards in rain, towering brutalist glass monoliths, wet asphalt reflections, raytracing 8k'
  },
  {
    id: 'tmpl-3',
    title: 'Senior Fullstack Code Refactorer & Architect',
    category: 'coding',
    targetModel: 'Gemini 2.5 Pro',
    tags: ['Architecture', 'TypeScript', 'Clean Code'],
    prompt: 'You are a Principal Software Architect. Review the following code for: 1) Performance bottlenecks & time complexity, 2) Security vulnerabilities (OWASP Top 10), 3) Clean code principles (SOLID, DRY), and 4) Type safety. Provide the fully refactored, production-ready code with explanatory comments.'
  },
  {
    id: 'tmpl-4',
    title: 'High-Converting SaaS Landing Page Copy',
    category: 'copywriting',
    targetModel: 'Gemini 2.5 Pro',
    tags: ['Marketing', 'Conversion', 'SaaS'],
    prompt: 'Act as a world-class Direct Response Copywriter. Write a high-converting landing page structure for [Product Name]: 1) Attention-grabbing Hero Headline + Subhead, 2) Core Value Proposition with 3 key benefit pillars, 3) Social Proof framing, 4) Compelling Call-to-Action (CTA), and 5) FAQ addressing the top 3 buying objections.'
  },
  {
    id: 'tmpl-5',
    title: 'Autonomous AI Persona Prompt',
    category: 'persona',
    targetModel: 'Gemini 2.5 Pro',
    tags: ['Agentic AI', 'System Instructions', 'Reasoning'],
    prompt: 'You are SAGAR AI Engine, an omniscient AI reasoning assistant. Always reason step-by-step using First Principles. Break complex problems into modular steps, validate each output, and provide structured executable solutions.'
  },
  {
    id: 'tmpl-6',
    title: 'Executive Summary & Key Takeaways Extractor',
    category: 'reasoning',
    targetModel: 'Gemini 2.5 Flash',
    tags: ['Summarization', 'Executive', 'Business'],
    prompt: 'Analyze the following transcript/document and synthesize: 1) 3-sentence Executive Summary, 2) Top 5 Critical Takeaways (bullet points with bold keywords), 3) Actionable Next Steps with owners and deadlines, and 4) Key Risks or Red Flags identified.'
  }
];

/**
 * POST /api/prompts/optimize
 */
exports.optimizePrompt = async (req, res) => {
  try {
    const { prompt, category = 'general', targetModel = 'gemini-1.5-pro' } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'Prompt text is required' });
    }

    const trimmed = prompt.trim();
    let optimized = '';

    if (env.geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(env.geminiApiKey);
        const candidateModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash-8b', 'gemini-pro'];
        const systemPrompt = `You are a World-Class Master Prompt Engineer.
Transform the user's basic prompt into a highly structured, professional, multi-layered prompt designed for ${targetModel} in the "${category}" domain.
Include:
- Role & Context Specification
- Step-by-Step Execution Constraints
- Clear Input/Output Format Specifications
- Few-Shot Examples or Guardrails where helpful

Output ONLY the optimized prompt. Do not add introductory chit-chat.`;

        for (const m of candidateModels) {
          try {
            const model = genAI.getGenerativeModel({ model: m });
            const response = await model.generateContent(`${systemPrompt}\n\nOriginal Prompt:\n"${trimmed}"`);
            const text = response.response.text();
            if (text && text.trim().length > 20) {
              optimized = text.trim();
              break;
            }
          } catch (err) {
            console.warn(`[PromptController] Model ${m} fallback:`, err.message);
          }
        }
      } catch (e) {
        console.warn('[PromptController] Gemini call failed:', e.message);
      }
    }

    // Fallback rule-based prompt enhancement
    if (!optimized) {
      optimized = `[ROLE]: You are an elite domain expert specializing in ${category.toUpperCase()}.\n\n` +
        `[OBJECTIVE]: ${trimmed}\n\n` +
        `[INSTRUCTIONS]:\n` +
        `1. Analyze the context deeply using First Principles reasoning.\n` +
        `2. Structure the answer clearly with headings, code snippets, and key metrics.\n` +
        `3. Provide practical, actionable, and production-ready outputs.\n` +
        `4. Highlight potential edge cases and optimization opportunities.\n\n` +
        `[OUTPUT FORMAT]: Clean markdown formatting with bold highlights and bullet points.`;
    }

    if (req.user && req.user._id) {
      notificationService.createNotification({
        owner: req.user._id,
        title: '✍️ Master Prompt Engineered',
        message: `Optimized prompt for "${category}" targeting ${targetModel}.`,
        type: 'info'
      });
    }

    return res.status(200).json({
      success: true,
      original: trimmed,
      optimized,
      targetModel,
      category
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/prompts/system-persona
 */
exports.generateSystemPrompt = async (req, res) => {
  try {
    const { personaName, goal, tone = 'Professional & Authoritative' } = req.body;
    if (!goal || !goal.trim()) {
      return res.status(400).json({ success: false, error: 'Goal is required' });
    }

    const name = personaName || 'SAGAR AI Specialist';
    let systemInstruction = '';

    if (env.geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(env.geminiApiKey);
        const candidates = [
          'gemini-3.6-flash',
          'gemini-3.5-flash',
          'gemini-3.5-flash-lite',
          'gemini-3.1-flash-lite',
          'gemma-4-26b-a4b-it',
          'gemma-4-31b-it',
          'gemini-flash-latest',
          'gemini-3.7-flash',
          'gemini-pro-latest'
        ];

        for (const m of candidates) {
          try {
            const model = genAI.getGenerativeModel({ model: m });
            const promptText = `Generate a production-ready AI System Instruction Persona with name "${name}", goal "${goal}", tone "${tone}". Provide pure system instruction text.`;
            const result = await model.generateContent(promptText);
            const response = await result.response;
            const text = response.text();
            if (text && text.trim()) {
              systemInstruction = text.trim();
              break;
            }
          } catch (err) {
            console.warn(`[PromptController] Persona Model ${m} fallback:`, err.message);
          }
        }
      } catch (e) {
        console.warn('[PromptController] Gemini persona failed:', e.message);
      }
    }

    if (!systemInstruction) {
      systemInstruction = `You are ${name}, a world-class AI designed to ${goal}.\nMaintain a ${tone} demeanor at all times.\nAnalyze every request thoroughly and output pristine, verified solutions.`;
    }

    return res.status(200).json({
      success: true,
      personaName: name,
      goal,
      tone,
      systemInstruction
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/prompts/templates
 */
exports.getTemplates = (req, res) => {
  return res.status(200).json({
    success: true,
    templates: CURATED_TEMPLATES
  });
};

/**
 * GET /api/prompts/saved
 */
exports.getSavedPrompts = async (req, res) => {
  try {
    let query = {};
    if (req.user) {
      if (req.user.role === 'admin' && req.query.debug === 'true') {
        // Admin debug mode: inspect all system prompts
        query = {};
      } else {
        // Individual user isolation: only return the requesting user's saved prompts
        query = { owner: req.user._id };
      }
    } else {
      query = { owner: null };
    }

    const prompts = await SavedPrompt.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, prompts });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/prompts/saved
 */
exports.savePrompt = async (req, res) => {
  try {
    const { title, category, prompt, optimizedPrompt, targetModel, tags } = req.body;
    if (!title || !prompt) {
      return res.status(400).json({ success: false, error: 'Title and prompt are required' });
    }

    const saved = await SavedPrompt.create({
      owner: req.user ? req.user._id : null,
      title,
      category: category || 'general',
      prompt,
      optimizedPrompt: optimizedPrompt || prompt,
      targetModel: targetModel || 'gemini-1.5-pro',
      tags: tags || []
    });

    if (req.user && req.user._id) {
      notificationService.createNotification({
        owner: req.user._id,
        title: '💾 Prompt Saved to Vault',
        message: `Saved "${title}" into your prompt vault.`,
        type: 'success'
      });
    }

    return res.status(201).json({ success: true, prompt: saved });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * DELETE /api/prompts/saved/:id
 */
exports.deleteSavedPrompt = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { _id: id };
    if (req.user && req.user.role !== 'admin') {
      query.owner = req.user._id;
    }
    await SavedPrompt.findOneAndDelete(query);
    return res.status(200).json({ success: true, message: 'Prompt deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
