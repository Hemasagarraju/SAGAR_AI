const AiImage = require('../models/AiImage');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const notificationService = require('../services/notificationService');

// Dimension helper
const getDimensions = (aspectRatio) => {
  switch (aspectRatio) {
    case '16:9':
      return { width: 1280, height: 720 };
    case '9:16':
      return { width: 720, height: 1280 };
    case '4:3':
      return { width: 1024, height: 768 };
    case '3:4':
      return { width: 768, height: 1024 };
    case '1:1':
    default:
      return { width: 1024, height: 1024 };
  }
};

// Style prompt modifier
const applyStyleModifiers = (prompt, style) => {
  const styles = {
    photorealistic: 'hyperrealistic, 8k resolution, photorealistic shot, octane render, cinematic lighting, sharp focus, 35mm lens, masterpiece',
    cyberpunk: 'cyberpunk aesthetic, neon city lighting, holographic HUD elements, dark rain reflections, synthwave, futuristic, ultra-detailed',
    anime: 'masterpiece anime art style, studio ghibli and makoto shinkai aesthetic, vibrant colors, detailed illustration, dynamic lighting',
    '3d-render': 'pixar 3D style, octane render, smooth textures, soft ambient occlusion, cute character design, 4k ultra-detailed',
    cinematic: 'anamorphic cinematic film still, moody dramatic atmosphere, color graded, imax quality, shallow depth of field',
    'digital-art': 'trending on artstation, digital concept art, intricate brushstrokes, atmospheric fantasy lighting, high detail',
    surrealism: 'surrealistic dreamscape, salvador dali inspired, ethereal floating elements, mind-bending geometry, vivid dream atmosphere',
    minimalist: 'minimalist vector art, clean lines, elegant flat color palette, bauhaus style, modern aesthetic',
    watercolor: 'traditional watercolor painting on textured paper, soft ink bleeds, pastel gradients, artistic impressionism',
    fantasy: 'epic high fantasy art, dungeons and dragons concept art, magical glowing runes, mythical lighting, high fantasy masterpiece'
  };

  const styleText = styles[style] || styles.photorealistic;
  return `${prompt}, ${styleText}`;
};

/**
 * Enhance prompt using Google Gemini Pro/Flash
 */
async function enhancePromptWithGemini(userPrompt, style = 'photorealistic') {
  if (!env.geminiApiKey) {
    return applyStyleModifiers(userPrompt, style);
  }

  try {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const candidateModels = ['gemini-flash-latest', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it'];

    const systemInstruction = `You are an elite AI Art Prompt Engineer specializing in Midjourney v6, Flux.1, and DALL-E 3.
Convert the user's basic prompt into an extraordinary, detailed, visually striking art prompt with specific artistic composition, lighting, camera angles, color palette, and textures.
Target style: ${style}.
Output ONLY the enhanced prompt string. Do not include markdown quotes, explanations, or prefixes.`;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const res = await model.generateContent(`${systemInstruction}\n\nUser input: "${userPrompt}"`);
        const text = res.response.text();
        if (text && text.trim().length > 10) {
          return text.trim().replace(/^["']|["']$/g, '');
        }
      } catch (err) {
        console.warn(`[ImageController] Gemini prompt enhance fallback on ${modelName}:`, err.message);
      }
    }
  } catch (e) {
    console.warn('[ImageController] Gemini enhance failed:', e.message);
  }

  return applyStyleModifiers(userPrompt, style);
}

/**
 * POST /api/images/generate
 */
exports.generateImage = async (req, res) => {
  try {
    const {
      prompt,
      style = 'photorealistic',
      aspectRatio = '1:1',
      enhancePrompt = true,
      seed = Math.floor(Math.random() * 1000000)
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'Prompt text is required' });
    }

    const trimmedPrompt = prompt.trim();
    let finalPrompt = trimmedPrompt;
    let enhanced = '';

    if (enhancePrompt) {
      enhanced = await enhancePromptWithGemini(trimmedPrompt, style);
      finalPrompt = enhanced;
    } else {
      finalPrompt = applyStyleModifiers(trimmedPrompt, style);
    }

    const { width, height } = getDimensions(aspectRatio);

    // Build URL for generative AI engine (Flux / SDXL via Pollinations AI)
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

    // Persist in database
    const saved = await AiImage.create({
      owner: req.user ? req.user._id : null,
      prompt: trimmedPrompt,
      enhancedPrompt: enhanced || finalPrompt,
      style,
      aspectRatio,
      imageUrl,
      width,
      height,
      model: 'Flux.1-Ultra',
      seed
    });

    if (owner) {
      notificationService.createNotification({
        owner,
        title: '🎨 AI Artwork Generated',
        message: `Your artwork "${prompt.substring(0, 45)}..." was rendered successfully in Flux 8K.`,
        type: 'success'
      });
    }

    return res.status(201).json({
      success: true,
      image: saved
    });
  } catch (error) {
    console.error('[ImageController:generateImage]', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate image'
    });
  }
};

/**
 * POST /api/images/enhance
 */
exports.enhancePrompt = async (req, res) => {
  try {
    const { prompt, style = 'photorealistic' } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const enhanced = await enhancePromptWithGemini(prompt.trim(), style);
    return res.status(200).json({
      success: true,
      original: prompt.trim(),
      enhanced
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/images/gallery
 */
exports.getGallery = async (req, res) => {
  try {
    let query = {};
    if (req.user) {
      if (req.user.role === 'admin' && req.query.debug === 'true') {
        // Admin debug mode: inspect all system images
        query = {};
      } else {
        // Individual user isolation: only return the requesting user's images
        query = { owner: req.user._id };
      }
    } else {
      query = { owner: null };
    }

    const images = await AiImage.find(query).sort({ createdAt: -1 }).limit(50);
    return res.status(200).json({
      success: true,
      images
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * DELETE /api/images/:id
 */
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { _id: id };
    if (req.user && req.user.role !== 'admin') {
      query.owner = req.user._id;
    }
    await AiImage.findOneAndDelete(query);
    return res.status(200).json({ success: true, message: 'Image removed from gallery' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
