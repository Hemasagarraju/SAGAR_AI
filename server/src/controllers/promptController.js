const SavedPrompt = require('../models/SavedPrompt');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

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
    const { prompt, category = 'general', targetModel = 'gemini-2.5-pro' } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'Prompt text is required' });
    }

    const trimmed = prompt.trim();
    let optimized = '';

    if (env.geminiApiKey) {
      try {
        const genAI = new GoogleGenerativeAI(env.geminiApiKey);
        const candidateModels = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
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
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const resAI = await model.generateContent(
          `Create a professional system instruction for an AI Agent named "${name}" whose primary mission is "${goal}". Desired tone: "${tone}". Output ONLY the system instruction.`
        );
        systemInstruction = resAI.response.text();
      } catch (err) {
        console.warn('[PromptController:SystemPrompt] Gemini fallback:', err.message);
      }
    }

    if (!systemInstruction) {
      systemInstruction = `You are ${name}, a top-tier specialist dedicated to: ${goal}.\nMaintain a ${tone} demeanor at all times. Deliver concise, factual, and deeply reasoned answers.`;
    }

    return res.status(200).json({
      success: true,
      systemInstruction: systemInstruction.trim()
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
    const query = req.user ? { owner: req.user._id } : {};
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
      targetModel: targetModel || 'gemini-2.5-pro',
      tags: tags || []
    });

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
    await SavedPrompt.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Prompt deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
