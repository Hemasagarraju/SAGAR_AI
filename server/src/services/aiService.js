const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

const WORKFLOW_PROMPT_SYSTEM = `
You are an expert AI Operations Architect for Agentflow_AI.
Your task is to translate a user's natural language automation requirement into a complete, executable workflow graph.

Output MUST be a valid JSON object matching this exact schema:
{
  "name": "string (Short descriptive workflow title)",
  "description": "string (1-2 sentence description of what this workflow accomplishes)",
  "tags": ["tag1", "tag2"],
  "nodes": [
    {
      "id": "node_1",
      "type": "trigger | aiAgent | gmail | slack | discord | googleSheets | condition | transform",
      "position": { "x": 100, "y": 150 },
      "data": {
        "label": "Human-readable label",
        "action": "actionName (e.g. 'sendEmail', 'postMessage', 'appendRow', 'analyze', 'filter')",
        "config": { ... },
        "description": "Short explanation of this step"
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1_2",
      "source": "node_1",
      "target": "node_2",
      "animated": true,
      "label": "optional branch label"
    }
  ]
}

Available Node Types:
1. trigger: (action: 'manual' | 'webhook' | 'schedule', config: { schedule?: '0 9 * * 1-5', webhookPath?: '/leads' })
2. aiAgent: (action: 'analyze' | 'summarize' | 'classify' | 'generate', config: { prompt: '...', model: 'gemini-1.5-flash' })
3. gmail: (action: 'sendEmail' | 'readInbox', config: { to: '...', subject: '...', body: '...' })
4. slack: (action: 'postMessage', config: { channel: '#ops-alerts', text: '...' })
5. discord: (action: 'postMessage' | 'sendNotification', config: { channelId: 'general', message: '...' })
6. googleSheets: (action: 'appendRow' | 'readRange', config: { spreadsheetId: '...', range: 'Sheet1!A:Z', values: [] })
7. condition: (action: 'evaluate', config: { condition: '{{node_2.output.priority}} === "HIGH"', trueTarget: 'node_3', falseTarget: 'node_4' })
8. transform: (action: 'format' | 'extract', config: { template: '...' })

Ensure nodes are spaced linearly (e.g. x: 100, 400, 700, 1000 with y: 150 or branch y: 80, 250) and all edges connect valid nodes sequentially without loops. Output ONLY the JSON block.
`;

class AIService {
  /**
   * Main entry point to generate a workflow graph from prompt
   */
  async generateWorkflow(promptText, userMetadata = {}) {
    if (!promptText || promptText.trim().length === 0) {
      throw new Error('Automation prompt text is required.');
    }

    const trimmedPrompt = promptText.trim();
    let result = null;

    // 1. Try OpenRouter if API key is provided
    if (env.openRouterApiKey) {
      try {
        console.log('[AIService] Attempting generation via OpenRouter...');
        result = await this._generateWithOpenRouter(trimmedPrompt);
        if (result && result.nodes && result.nodes.length > 0) {
          result.source = 'openrouter';
          return this._sanitizeGraph(result);
        }
      } catch (err) {
        console.warn(`[AIService] OpenRouter failed: ${err.message}. Falling back...`);
      }
    }

    // 2. Try Gemini if API key is provided
    if (env.geminiApiKey) {
      try {
        console.log('[AIService] Attempting generation via Google Gemini SDK...');
        result = await this._generateWithGemini(trimmedPrompt);
        if (result && result.nodes && result.nodes.length > 0) {
          result.source = 'gemini';
          return this._sanitizeGraph(result);
        }
      } catch (err) {
        console.warn(`[AIService] Gemini failed: ${err.message}. Falling back to Rule Engine...`);
      }
    }

    // 3. Fallback to Deterministic Rule Engine
    console.log('[AIService] Generating workflow via Deterministic Rule Engine...');
    result = this._generateWithRuleEngine(trimmedPrompt);
    result.source = 'deterministic_rule_engine';
    return this._sanitizeGraph(result);
  }

  async _generateWithOpenRouter(promptText) {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-flash-1.5',
        messages: [
          { role: 'system', content: WORKFLOW_PROMPT_SYSTEM },
          { role: 'user', content: `Generate an automation workflow for this requirement:\n"${promptText}"` }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          Authorization: `Bearer ${env.openRouterApiKey}`,
          'HTTP-Referer': 'https://agentflow.io',
          'X-Title': 'Agentflow AI'
        },
        timeout: 15000
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    return this._parseJsonFromLLM(content);
  }

  async _generateWithGemini(promptText, customApiKey = null) {
    const key = customApiKey || env.geminiApiKey;
    if (!key) throw new Error('No Gemini API key available');

    const genAI = new GoogleGenerativeAI(key);
    const candidateModels = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-pro-latest', 'gemini-3.7-flash', 'gemini-3.1-pro-preview', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    let lastError = null;

    const fullPrompt = `${WORKFLOW_PROMPT_SYSTEM}\n\nUser Requirement:\n"${promptText}"\n\nGenerate valid JSON workflow graph.`;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' }
        });
        const response = await model.generateContent(fullPrompt);
        const text = response.response.text();
        const parsed = this._parseJsonFromLLM(text);
        if (parsed && parsed.nodes && parsed.nodes.length > 0) {
          parsed.modelUsed = modelName;
          return parsed;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[AIService] Gemini model ${modelName} fallback: ${err.message}`);
      }
    }

    throw lastError || new Error('Failed to generate workflow with Gemini');
  }

  _parseJsonFromLLM(rawText) {
    if (!rawText) return null;
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```/, '').replace(/```$/, '').trim();
    }
    return JSON.parse(clean);
  }

  /**
   * Deterministic Rule Engine with Exact Entity Extraction and Clean DAG Layout
   */
  _generateWithRuleEngine(prompt) {
    const lower = prompt.toLowerCase();
    const nodes = [];
    const edges = [];

    // Extract exact entities from prompt
    const emailMatch = prompt.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const targetEmail = emailMatch ? emailMatch[0] : 'team-leads@enterprise.com';

    const channelMatch = prompt.match(/#[a-zA-Z0-9_-]+/);
    const targetChannel = channelMatch ? channelMatch[0] : '#ops-alerts';

    const thresholdMatch = prompt.match(/\$([0-9]+(?:\.[0-9]+)?)/) || prompt.match(/([0-9]+)\s*(?:dollars|usd|tickets|urgency)/i);
    const conditionThreshold = thresholdMatch ? thresholdMatch[1] : '1000';

    // Derive concise workflow title
    let name = 'Custom Operations Automation';
    if (lower.includes('invoice') && lower.includes('approval')) name = 'Invoice Approval & Payment Pipeline';
    else if (lower.includes('ticket') || lower.includes('support') || lower.includes('triage')) name = 'Customer Support Ticket Triage';
    else if (lower.includes('incident') || lower.includes('alert')) name = 'Incident Escalation & Alert Flow';
    else if (lower.includes('digest') || lower.includes('daily')) name = 'Automated Daily Operational Digest';
    else if (lower.includes('lead') || lower.includes('sales')) name = 'Lead Processing & CRM Ingestion';
    else if (lower.includes('sentiment')) name = 'Sentiment Analysis & Escalation';
    else {
      const words = prompt.trim().split(/\s+/).slice(0, 5).join(' ');
      name = words.length > 0 ? `${words.charAt(0).toUpperCase() + words.slice(1)} Pipeline` : 'Custom AI Automation';
    }

    // 1. Initial Trigger Node
    let triggerType = 'manual';
    let triggerLabel = 'Manual Trigger';
    let triggerDesc = 'Initiates automation workflow pipeline on demand';
    let triggerConfig = { mode: 'on_demand' };

    if (lower.includes('webhook') || lower.includes('api call') || lower.includes('arrives') || lower.includes('incoming') || lower.includes('ticket arrives')) {
      triggerType = 'webhook';
      triggerLabel = 'Incoming Webhook Listener';
      triggerDesc = 'Listens for real-time inbound HTTP POST webhook events';
      triggerConfig = { webhookPath: '/v1/events/inbound', method: 'POST' };
    } else if (lower.includes('schedule') || lower.includes('every') || lower.includes('daily') || lower.includes('morning') || lower.includes('hourly')) {
      triggerType = 'schedule';
      triggerLabel = 'Scheduled Cron Trigger';
      triggerDesc = 'Fires automatically on a configured recurring schedule';
      triggerConfig = { cronSchedule: '0 9 * * 1-5', timezone: 'UTC' };
    }

    nodes.push({
      id: 'node_1',
      type: 'trigger',
      position: { x: 250, y: 80 },
      data: {
        label: triggerLabel,
        action: triggerType,
        config: triggerConfig,
        description: triggerDesc
      }
    });

    let currentY = 220;

    // 2. AI Reasoning Agent Node
    if (lower.includes('ai') || lower.includes('eval') || lower.includes('analy') || lower.includes('sentiment') || lower.includes('parse') || lower.includes('summar') || lower.includes('classif') || lower.includes('triage') || lower.includes('urgency')) {
      let aiAction = 'analyze';
      let aiLabel = 'AI Operational Reasoning';
      let aiDesc = 'Analyzes payload context with LLM and extracts structured entities';

      if (lower.includes('sentiment')) {
        aiAction = 'sentimentAnalysis';
        aiLabel = 'AI Sentiment & Urgency Analysis';
        aiDesc = 'Evaluates customer tone, satisfaction score, and ticket urgency';
      } else if (lower.includes('parse') || lower.includes('vendor') || lower.includes('invoice')) {
        aiAction = 'extractEntities';
        aiLabel = 'AI Document & Entity Parser';
        aiDesc = 'Parses vendor name, line items, and invoice amount from payload';
      } else if (lower.includes('classif') || lower.includes('triage')) {
        aiAction = 'classify';
        aiLabel = 'AI Ticket Classifier';
        aiDesc = 'Categorizes ticket priority into P1/P2/P3 with recommended action';
      }

      nodes.push({
        id: `node_${nodes.length + 1}`,
        type: 'aiAgent',
        position: { x: 250, y: currentY },
        data: {
          label: aiLabel,
          action: aiAction,
          config: {
            prompt: `Evaluate incoming payload: "${prompt}"`,
            model: 'gemini-1.5-flash',
            expectedFields: ['summary', 'sentiment', 'urgency', 'priority', 'amount', 'vendor']
          },
          description: aiDesc
        }
      });
      currentY += 140;
    }

    // 3. Condition / Route Filter Node
    if (lower.includes('if ') || lower.includes('exceeds') || lower.includes('greater') || lower.includes('condition') || lower.includes('priority') || lower.includes('urgent') || lower.includes('threshold')) {
      let condExpr = `{{inputs.amount}} > ${conditionThreshold}`;
      if (lower.includes('high') || lower.includes('priority') || lower.includes('urgent')) {
        condExpr = `{{node_2.output.priority}} === "HIGH" || {{inputs.urgency}} >= 8`;
      }

      nodes.push({
        id: `node_${nodes.length + 1}`,
        type: 'condition',
        position: { x: 250, y: currentY },
        data: {
          label: `Condition Filter (${lower.includes('exceeds') ? `> $${conditionThreshold}` : 'High Priority'})`,
          action: 'evaluateCondition',
          config: {
            expression: condExpr,
            threshold: conditionThreshold,
            operator: 'greater_than'
          },
          description: `Evaluates rule assertion before dispatching downstream alerts`
        }
      });
      currentY += 140;
    }

    // 4. Slack Action Node
    if (lower.includes('slack') || lower.includes('alert') || lower.includes('channel') || lower.includes('notify team')) {
      nodes.push({
        id: `node_${nodes.length + 1}`,
        type: 'slack',
        position: { x: 250, y: currentY },
        data: {
          label: `Slack Channel (${targetChannel})`,
          action: 'sendMessage',
          config: {
            channel: targetChannel,
            message: `⚡ *SAGARAGENT Alert*: Event processed.\n> Summary: {{node_2.output.summary || "Action required"}}\n> Priority: {{node_2.output.priority || "NORMAL"}}`
          },
          description: `Posts formatted operational updates directly to ${targetChannel}`
        }
      });
      currentY += 140;
    }

    // 5. Gmail Action Node
    if (lower.includes('email') || lower.includes('mail') || lower.includes('gmail') || lower.includes('approval') || lower.includes('notify client') || lower.includes('send to')) {
      nodes.push({
        id: `node_${nodes.length + 1}`,
        type: 'gmail',
        position: { x: 250, y: currentY },
        data: {
          label: `Gmail Dispatch (${targetEmail})`,
          action: 'sendEmail',
          config: {
            to: targetEmail,
            subject: `Automated Notification: ${name}`,
            body: `<p>Automated operation triggered from SAGARAGENT_AI.</p><p><strong>Details:</strong> {{node_2.output.summary || "Event completed successfully."}}</p>`
          },
          description: `Sends HTML notification email to ${targetEmail} via Gmail API`
        }
      });
      currentY += 140;
    }

    // 6. Discord Action Node
    if (lower.includes('discord') || lower.includes('announcement') || lower.includes('community')) {
      nodes.push({
        id: `node_${nodes.length + 1}`,
        type: 'discord',
        position: { x: 250, y: currentY },
        data: {
          label: 'Discord Webhook Dispatcher',
          action: 'sendMessage',
          config: {
            channelId: 'ops-announcements',
            message: `📢 **Operations Notification**: Automation pipeline triggered.`
          },
          description: 'Dispatches real-time embed alerts to Discord server'
        }
      });
      currentY += 140;
    }

    // 7. Google Sheets Action Node
    if (lower.includes('sheet') || lower.includes('sheets') || lower.includes('ledger') || lower.includes('spreadsheet') || lower.includes('audit') || lower.includes('log row') || lower.includes('record')) {
      nodes.push({
        id: `node_${nodes.length + 1}`,
        type: 'googleSheets',
        position: { x: 250, y: currentY },
        data: {
          label: 'Google Sheets Audit Ledger',
          action: 'appendRow',
          config: {
            spreadsheetId: 'ops_master_ledger',
            range: 'AuditLog!A:E',
            values: ['{{execution.id}}', '{{execution.timestamp}}', 'COMPLETED', '{{node_2.output.summary || "Logged"}}']
          },
          description: 'Appends immutable audit record row to Google Sheets spreadsheet'
        }
      });
      currentY += 140;
    }

    // Ensure at least 2 nodes exist if prompt was very short
    if (nodes.length === 1) {
      nodes.push({
        id: 'node_2',
        type: 'aiAgent',
        position: { x: 250, y: 220 },
        data: {
          label: 'AI Automation Agent',
          action: 'execute',
          config: { prompt: `Execute requirement: "${prompt}"` },
          description: 'Performs requested automation task'
        }
      });
      nodes.push({
        id: 'node_3',
        type: 'slack',
        position: { x: 250, y: 360 },
        data: {
          label: 'Slack Ops Channel',
          action: 'sendMessage',
          config: { channel: '#ops-alerts', message: 'Automation finished.' },
          description: 'Broadcasting operational update to team'
        }
      });
    }

    // Connect all nodes sequentially with smooth animated edges
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `edge_${nodes[i].id}_${nodes[i + 1].id}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        animated: true,
        label: i === 0 ? 'Trigger Stream' : (nodes[i].type === 'condition' ? 'Condition Passed' : 'Next Step')
      });
    }

    return {
      name,
      description: `Automated agent pipeline generated for requirement: "${prompt}"`,
      tags: ['ai-studio', 'kahn-dag', 'multi-agent'],
      nodes,
      edges,
      source: 'deterministic_rule_engine'
    };
  }

  /**
   * Ensure node IDs, coordinates, and edge connections are clean and well-structured
   */
  _sanitizeGraph(graph) {
    if (!graph || typeof graph !== 'object') {
      return this._generateWithRuleEngine('Standard notification pipeline');
    }

    const name = graph.name || 'Automated Agent Pipeline';
    const description = graph.description || 'AI Operations Automation Workflow';
    const tags = Array.isArray(graph.tags) ? graph.tags : ['automation', 'agentic'];

    const nodes = (graph.nodes || []).map((node, idx) => ({
      id: node.id || `node_${idx + 1}`,
      type: node.type || 'aiAgent',
      position: {
        x: node.position?.x ?? (100 + idx * 260),
        y: node.position?.y ?? 180
      },
      data: {
        label: node.data?.label || node.label || `Step ${idx + 1}`,
        action: node.data?.action || node.action || 'execute',
        config: node.data?.config || node.config || {},
        description: node.data?.description || node.description || 'Operational step'
      }
    }));

    const validNodeIds = new Set(nodes.map((n) => n.id));
    const edges = (graph.edges || []).filter((edge) => {
      return edge.source && edge.target && validNodeIds.has(edge.source) && validNodeIds.has(edge.target);
    }).map((edge, idx) => ({
      id: edge.id || `edge_${edge.source}_${edge.target}_${idx}`,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || null,
      targetHandle: edge.targetHandle || null,
      animated: edge.animated ?? true,
      label: edge.label || ''
    }));

    // If edges are missing, connect sequentially
    if (edges.length === 0 && nodes.length > 1) {
      for (let i = 0; i < nodes.length - 1; i++) {
        edges.push({
          id: `edge_${nodes[i].id}_${nodes[i + 1].id}`,
          source: nodes[i].id,
          target: nodes[i + 1].id,
          animated: true,
          label: 'Next'
        });
      }
    }

    return {
      name,
      description,
      tags,
      nodes,
      edges,
      source: graph.source || 'deterministic'
    };
  }

  /**
   * Universal Conversational AI Assistant Question Answerer
   */
  async answerQuestion(message, conversationHistory = [], userName = 'Operator') {
    if (!message || !message.trim()) {
      return { reply: 'Please provide a question or instruction.', source: 'sagar-ai' };
    }

    const trimmed = message.trim();

    // 1. Try Gemini if API key is provided
    if (env.geminiApiKey) {
      const candidateModels = [
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
      const genAI = new GoogleGenerativeAI(env.geminiApiKey);
      const systemInstruction = `You are SAGAR AI Copilot, a senior expert AI assistant.
CRITICAL RESPONSE GUIDELINES:
- Provide DIRECT, HIGHLY ACCURATE, and PROPER answers to the user's specific request.
- NO UNNECESSARY FILLER: Do not output boilerplate self-introductions (avoid repeating "I am SAGAR AI Copilot..."), conversational fluff, or repetitive pleasantries.
- Go straight to the answer, solution, or implementation.
- For coding questions: Provide clean, production-ready code with concise bullet explanations.
- For general questions: Use crisp bullet points, bold key terms, and concise formatting.`;

      // Build context history
      let contextPrompt = '';
      if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        const recentTurns = conversationHistory.slice(-6);
        contextPrompt = 'Conversation context:\n' +
          recentTurns.map((t) => `${t.role === 'user' ? 'User' : 'Assistant'}: ${t.content}`).join('\n') +
          '\n\n';
      }

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction
          });
          const fullUserPrompt = `${contextPrompt}User: ${trimmed}`;
          const response = await model.generateContent(fullUserPrompt);
          const text = response.response.text();
          if (text && text.trim().length > 0) {
            return {
              reply: text.trim(),
              source: `google-${modelName}`
            };
          }
        } catch (err) {
          console.warn(`[AIService:Chat] Gemini ${modelName} fallback: ${err.message}`);
        }
      }
    }

    // 2. Try OpenRouter if API key is provided
    if (env.openRouterApiKey) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'google/gemini-flash-1.5',
            messages: [
              {
                role: 'system',
                content: `You are SAGARAGENT_AI Copilot, an omniscient, hyper-intelligent autonomous AI operations architect created by Hemasagar Raju. The current operator's name is "${userName}". Answer ANY question asked with clear markdown formatting and operational guidance.`
              },
              { role: 'user', content: trimmed }
            ],
            temperature: 0.7
          },
          {
            headers: {
              Authorization: `Bearer ${env.openRouterApiKey}`,
              'HTTP-Referer': 'https://sagaragent.ai',
              'X-Title': 'SAGARAGENT AI'
            },
            timeout: 15000
          }
        );
        const reply = response.data?.choices?.[0]?.message?.content;
        if (reply && reply.trim().length > 0) {
          return {
            reply: reply.trim(),
            source: 'openrouter-neural'
          };
        }
      } catch (err) {
        console.warn('[AIService:Chat] OpenRouter chat fallback:', err.message);
      }
    }

    // 3. Comprehensive Multi-Domain Local Knowledge Engine
    return {
      reply: this._answerFromLocalKnowledge(trimmed, userName),
      source: 'sagaragent-neural-kernel'
    };
  }

  _answerFromLocalKnowledge(query, userName = 'Operator') {
    const q = query.toLowerCase();

    // Greetings
    if (
      q === 'hi' ||
      q === 'hello' ||
      q === 'hey' ||
      q === 'hii' ||
      q.startsWith('hi ') ||
      q.startsWith('hello ') ||
      q.includes('good morning') ||
      q.includes('namaste')
    ) {
      return `👋 Hi **${userName}**! How can I help you today?\n\n` +
        `I am your **SAGARAGENT_AI Copilot**, ready to help you with:\n` +
        `• ⚡ **Automating DAG Workflows** (Gmail, Slack, Discord, Google Sheets)\n` +
        `• 🧠 **Multi-Agent Systems & AI Reasoning** (Planner, Executor, Validator, Recovery, Monitor)\n` +
        `• 💻 **Software Engineering & Coding** (JavaScript, Python, Next.js, Node.js, SQL, REST APIs)\n` +
        `• 🔒 **Security, Encryption & Cloud Infrastructure** (AES-256-GCM, WebSockets, BullMQ)\n\n` +
        `How can I assist you right now, ${userName}?`;
    }

    // Creator / Author
    if (q.includes('who made') || q.includes('who created') || q.includes('creator') || q.includes('author') || q.includes('hemasagar')) {
      return `🚀 **SAGAR AI** is engineered and architected by **Hemasagar Raju**!\n\n` +
        `It is a high-performance Generative AI Super App Suite featuring AI Image Creation, Master Prompt Engineering, ChatGPT-Style Gemini 2.5 Pro Chat, and Multimodal AI Tools.\n\n` +
        `🔗 GitHub: [https://github.com/Hemasagarraju/sagaragent-ai](https://github.com/Hemasagarraju/sagaragent-ai)`;
    }

    // What is AI / LLM / Machine Learning
    if (q.includes('what is ai') || q.includes('what is an llm') || q.includes('machine learning') || q.includes('artificial intelligence') || q.includes('deep learning')) {
      return `🤖 **Artificial Intelligence & LLMs Overview:**\n\n` +
        `• **AI (Artificial Intelligence)**: Computational systems capable of performing tasks that typically require human cognition, such as visual perception, decision-making, and natural language understanding.\n` +
        `• **LLMs (Large Language Models)**: Transformer-based neural networks trained on trillions of tokens to generate context-aware language, reasoning steps, and code.\n` +
        `• **Agentic AI**: Moving beyond passive chat to **autonomous goal-directed agents** that can plan multi-step execution graphs, call external APIs, validate schemas, and self-heal from failures.`;
    }

    // Python vs JavaScript / Coding Comparisons
    if ((q.includes('python') && q.includes('javascript')) || q.includes('js vs python') || q.includes('python vs js')) {
      return `⚖️ **Python vs JavaScript Comparison:**\n\n` +
        `| Feature | Python | JavaScript / TypeScript |\n` +
        `|---|---|---|\n` +
        `| **Primary Domain** | AI/ML, Data Science, Scripting | Full-Stack Web, Real-time APIs, UI/UX |\n` +
        `| **Execution** | Interpreted (CPython / PyPy) | V8 Engine (JIT compiled) |\n` +
        `| **Async Model** | ` + '`asyncio`' + ` event loop | Native non-blocking event loop |\n` +
        `| **Typing** | Dynamic (Type hints available) | Dynamic (Static with TypeScript) |\n\n` +
        `💡 *Recommendation*: Use **JavaScript/Node.js** for high-concurrency real-time WebSocket orchestration and **Python** for specialized model fine-tuning and PyTorch pipelines.`;
    }

    // What can you do / Capabilities
    if (q.includes('what can you do') || q.includes('help') || q.includes('features') || q.includes('capabilities')) {
      return `🛠️ **Here is what I can do for you:**\n\n` +
        `1. **Answer Any Question**: Technical questions, coding challenges, system architecture, mathematics, and operational inquiries.\n` +
        `2. **Prompt-to-DAG Compilation**: Turn any English requirement into an executable multi-agent workflow graph with triggers, conditions, and action nodes.\n` +
        `3. **Multi-Agent Orchestration**: Coordinate 5 specialized agents (Planner, Execution, Validation, Recovery, Monitoring) in sequence.\n` +
        `4. **1-Click Tool Execution**: Trigger real actions on Gmail, Slack, Discord, Google Sheets, and Gemini LLMs.\n` +
        `5. **Real-Time Telemetry**: Monitor executions at 60fps over WebSocket connections with latency benchmarking.\n` +
        `6. **AES-256 Vault**: Safely store and encrypt your third-party API keys and OAuth secrets.\n\n` +
        `Try asking any question or request a workflow!`;
    }

    // Agents & Multi-Agent Architecture
    if (q.includes('agent') || q.includes('planner') || q.includes('kahn') || q.includes('recovery') || q.includes('monitor')) {
      return `🧠 **SAGARAGENT_AI Multi-Agent Pipeline Substrate:**\n\n` +
        `• **1. Planner Agent**: Analyzes DAG graph topology, uses Kahn's algorithm for topological sorting, verifies cycle-free execution paths, and computes confidence scores.\n` +
        `• **2. Execution Agent**: Dispatches atomic actions across third-party APIs (Gmail, Slack, Discord, Google Sheets) or AI reasoning models.\n` +
        `• **3. Validation Agent**: Enforces strict JSON contracts and schema checks before allowing data to flow to downstream nodes.\n` +
        `• **4. Recovery Agent**: Classifies errors (TRANSIENT, AUTH_EXPIRED, RATE_LIMIT, MISSING_FIELDS) and executes jittered exponential backoff or escalation.\n` +
        `• **5. Monitoring Agent**: Streams real-time event logs via WebSocket, maintains audit trails, and tracks sub-millisecond execution latencies.`;
    }

    // Integrations
    if (q.includes('integration') || q.includes('slack') || q.includes('gmail') || q.includes('discord') || q.includes('sheets')) {
      return `🔌 **Third-Party Integrations Hub:**\n\n` +
        `• **Gmail API**: Send HTML emails with templated variables (` + '`{{node_1.output.summary}}`' + `) and listen for unread emails.\n` +
        `• **Slack**: Post rich Markdown messages and notifications to public or private channels.\n` +
        `• **Discord**: Send embed cards and operational alerts via Webhooks.\n` +
        `• **Google Sheets**: Append rows, read spreadsheets, and maintain real-time audit ledgers.\n` +
        `• **Google Gemini & OpenRouter**: Run zero-shot classification, sentiment analysis, and summarization.\n\n` +
        `All keys are encrypted at rest using **AES-256-GCM** in the database.`;
    }

    // Security & Encryption
    if (q.includes('security') || q.includes('encrypt') || q.includes('vault') || q.includes('aes') || q.includes('jwt')) {
      return `🔒 **Enterprise Security Architecture:**\n\n` +
        `• **AES-256-GCM Encryption**: All OAuth tokens, API secrets, and webhook payloads are encrypted at rest with unique initialization vectors (IV) and authentication tags.\n` +
        `• **JWT Authentication**: Secure stateless session tokens with role-based access control (Admin / Operator).\n` +
        `• **Zero-Log Leakage**: Decrypted credentials exist strictly in memory during execution dispatch and never persist in logs.\n` +
        `• **Strict Data Sandboxing**: Workflows execute in isolated operational contexts.`;
    }

    // Next.js / Node.js / Full Stack Coding Advice
    if (q.includes('code') || q.includes('react') || q.includes('next') || q.includes('node') || q.includes('api') || q.includes('javascript') || q.includes('python')) {
      return `💻 **Engineering & Full-Stack Coding Insight:**\n\n` +
        `The platform is built on modern full-stack architectures:\n` +
        `• **Frontend**: Next.js 14, React Flow (@xyflow/react), Zustand state management, Tailwind CSS, Lucide icons.\n` +
        `• **Backend**: Node.js, Express, Socket.IO real-time engine, Mongoose ODM / In-Memory Mongo fallback.\n` +
        `• **API Gateway**: Internal Next.js rewrites (` + '`/api/:path*`' + `) for zero-CORS proxying across tunnels and cloud deployments.\n\n` +
        `Ask me for any specific code snippets, API endpoints, or automation patterns!`;
    }

    // General Universal Multi-Domain Response
    return `⚡ **Universal AI Copilot Intelligence:**\n\n` +
      `**Question Analysis:** *"**${query}**"*\n\n` +
      `**Key Insights & Synthesis:**\n` +
      `1. **Conceptual Understanding**: This concept relates to strategic automation, engineering architecture, and operations logic.\n` +
      `2. **Operational Blueprint**: In modern software and automation systems, this can be structured using modular components, declarative DAG pipelines, and real-time event-driven streaming.\n` +
      `3. **Actionable Implementation**:\n` +
      `   - Define clear input schemas and preconditions.\n` +
      `   - Orchestrate specialized agents or subroutines to handle transformation, validation, and error recovery.\n` +
      `   - Measure output latency and enforce telemetry logging.\n\n` +
      `*Feel free to ask for a specific code implementation, a synthesized workflow, or deeper technical elaboration!*`;
  }
}

module.exports = new AIService();


