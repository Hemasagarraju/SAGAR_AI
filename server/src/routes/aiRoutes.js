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
    const isWorkflowRequest = 
      trimmed.toLowerCase().includes('create') ||
      trimmed.toLowerCase().includes('build') ||
      trimmed.toLowerCase().includes('generate') ||
      trimmed.toLowerCase().includes('workflow') ||
      trimmed.toLowerCase().includes('pipeline') ||
      trimmed.toLowerCase().includes('dag') ||
      trimmed.toLowerCase().includes('slack') ||
      trimmed.toLowerCase().includes('gmail') ||
      trimmed.toLowerCase().includes('sheets');

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
        `\n\nClick **"Apply to Studio"** below to load this DAG directly into your canvas editor and execute it with real integrations.`;
    } else if (trimmed.toLowerCase().includes('agent') || trimmed.toLowerCase().includes('how it works') || trimmed.toLowerCase().includes('architecture')) {
      reply = `🧠 **SAGARAGENT_AI Multi-Agent Architecture Overview:**\n\n` +
        `1. **Planner Agent**: Evaluates graph topology using Kahn's algorithm, detects cycles, and generates execution plans with confidence scoring.\n` +
        `2. **Execution Agent**: Dispatches action steps against connected providers (Gmail, Slack, Discord, Google Sheets, Gemini AI).\n` +
        `3. **Validation Agent**: Enforces output schema integrity and JSON contracts before passing data downstream.\n` +
        `4. **Recovery Agent**: Self-heals transient errors with exponential backoff and alternate fallback routing.\n` +
        `5. **Monitoring Agent**: Streams 60fps real-time WebSocket telemetry and immutable audit logs.\n\n` +
        `Ask me to generate any workflow or connect an integration!`;
    } else if (trimmed.toLowerCase().includes('integration') || trimmed.toLowerCase().includes('slack') || trimmed.toLowerCase().includes('gmail')) {
      reply = `🔌 **Integrations Hub Guide:**\n\n` +
        `• **Gmail API**: Send HTML emails and listen for incoming messages.\n` +
        `• **Slack**: Post rich markdown alerts to public/private channels.\n` +
        `• **Discord**: Send rich embed webhooks to any server channel.\n` +
        `• **Google Sheets**: Append rows, read ranges, and update ledgers.\n` +
        `• **Google Gemini & OpenRouter**: Multimodal reasoning and content generation.\n\n` +
        `All secrets and OAuth tokens are secured in our **AES-256-GCM encrypted vault**.`;
    } else {
      reply = `👋 Hello! I am **SAGARAGENT_AI Copilot**, your autonomous operations assistant.\n\n` +
        `I can help you:\n` +
        `• **Generate executable visual workflows** from plain English prompts\n` +
        `• **Debug and analyze execution logs** in real time\n` +
        `• **Configure third-party integrations** (Gmail, Slack, Discord, Sheets)\n` +
        `• **Optimize DAG topologies** for latency and error resilience\n\n` +
        `Try asking: *"Build a customer ticket triage workflow that alerts Slack and writes to Google Sheets"*!`;
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
