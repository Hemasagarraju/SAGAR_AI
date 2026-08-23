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
        model: 'google/gemini-2.5-flash',
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

  async _generateWithGemini(promptText) {
    const genAI = new GoogleGenerativeAI(env.geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const fullPrompt = `${WORKFLOW_PROMPT_SYSTEM}\n\nUser Requirement:\n"${promptText}"\n\nGenerate valid JSON workflow graph.`;
    const response = await model.generateContent(fullPrompt);
    const text = response.response.text();
    return this._parseJsonFromLLM(text);
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
   * Deterministic Rule Engine for parsing prompts and generating complete graphs
   */
  _generateWithRuleEngine(prompt) {
    const lower = prompt.toLowerCase();
    const nodes = [];
    const edges = [];

    let currentX = 100;
    const currentY = 180;
    const stepX = 280;

    // 1. Initial Trigger Node
    const triggerId = 'node_trigger';
    let triggerType = 'manual';
    let triggerLabel = 'Manual Trigger';
    let triggerConfig = { mode: 'on_demand' };

    if (lower.includes('webhook') || lower.includes('api call') || lower.includes('incoming')) {
      triggerType = 'webhook';
      triggerLabel = 'Webhook Inbound Listener';
      triggerConfig = { webhookPath: '/v1/inbound-events', method: 'POST' };
    } else if (lower.includes('every') || lower.includes('daily') || lower.includes('schedule') || lower.includes('hourly') || lower.includes('morning')) {
      triggerType = 'schedule';
      triggerLabel = 'Cron Schedule Trigger';
      triggerConfig = { cronSchedule: '0 9 * * 1-5', timezone: 'UTC' };
    }

    nodes.push({
      id: triggerId,
      type: 'trigger',
      position: { x: currentX, y: currentY },
      data: {
        label: triggerLabel,
        action: triggerType,
        config: triggerConfig,
        description: 'Initiates workflow pipeline execution'
      }
    });

    let prevNodeId = triggerId;

    // 2. AI Analysis / Processing step if requested
    const needsAI = lower.includes('ai') || lower.includes('summar') || lower.includes('analy') || lower.includes('classif') || lower.includes('extract') || lower.includes('gpt') || lower.includes('gemini') || lower.includes('prompt') || lower.includes('smart') || lower.includes('triage');

    if (needsAI || (!lower.includes('email') && !lower.includes('slack') && !lower.includes('sheet'))) {
      currentX += stepX;
      const aiNodeId = 'node_ai_agent';
      nodes.push({
        id: aiNodeId,
        type: 'aiAgent',
        position: { x: currentX, y: currentY },
        data: {
          label: 'AI Operational Agent',
          action: lower.includes('classif') ? 'classify' : (lower.includes('summar') ? 'summarize' : 'analyze'),
          config: {
            prompt: `Process and extract key operational insights from input payload: "${prompt}"`,
            model: 'gemini-1.5-flash',
            expectedFields: ['summary', 'sentiment', 'recommendedAction', 'confidence']
          },
          description: 'Uses LLM reasoning to evaluate context and synthesize next steps'
        }
      });

      edges.push({
        id: `edge_${prevNodeId}_${aiNodeId}`,
        source: prevNodeId,
        target: aiNodeId,
        animated: true,
        label: 'Payload Stream'
      });

      prevNodeId = aiNodeId;
    }

    // 3. Condition / Filter step
    const needsCondition = lower.includes('if') || lower.includes('condition') || lower.includes('filter') || lower.includes('urgent') || lower.includes('priority') || lower.includes('approve');
    if (needsCondition) {
      currentX += stepX;
      const condNodeId = 'node_condition';
      nodes.push({
        id: condNodeId,
        type: 'condition',
        position: { x: currentX, y: currentY },
        data: {
          label: 'Logic Router & Filter',
          action: 'evaluate',
          config: {
            expression: '{{node_ai_agent.output.priority}} === "HIGH" || {{inputs.amount}} > 1000',
            description: 'Evaluate rule predicates before downstream dispatch'
          },
          description: 'Branches or filters data based on dynamic assertions'
        }
      });

      edges.push({
        id: `edge_${prevNodeId}_${condNodeId}`,
        source: prevNodeId,
        target: condNodeId,
        animated: true,
        label: 'Evaluated Context'
      });

      prevNodeId = condNodeId;
    }

    // 4. Integrations steps
    // Email / Gmail
    if (lower.includes('email') || lower.includes('mail') || lower.includes('gmail') || lower.includes('invoice') || lower.includes('notify client')) {
      currentX += stepX;
      const gmailNodeId = 'node_gmail';
      nodes.push({
        id: gmailNodeId,
        type: 'gmail',
        position: { x: currentX, y: currentY - (needsCondition ? 60 : 0) },
        data: {
          label: 'Gmail Dispatcher',
          action: 'sendEmail',
          config: {
            to: 'team-leads@enterprise.com',
            subject: 'Automated Operations Notification: New Event Processed',
            body: '<p>Workflow completed processing. <strong>Summary:</strong> {{node_ai_agent.output.summary || "All checks passed successfully."}}</p>'
          },
          description: 'Sends automated HTML email notification via Gmail API'
        }
      });

      edges.push({
        id: `edge_${prevNodeId}_${gmailNodeId}`,
        source: prevNodeId,
        target: gmailNodeId,
        animated: true,
        label: needsCondition ? 'Pass Condition' : 'Send Mail'
      });
    }

    // Slack
    if (lower.includes('slack') || lower.includes('channel') || lower.includes('alert team') || lower.includes('ops alert')) {
      currentX += stepX;
      const slackNodeId = 'node_slack';
      nodes.push({
        id: slackNodeId,
        type: 'slack',
        position: { x: currentX, y: currentY + (needsCondition ? 60 : 0) },
        data: {
          label: 'Slack Alerts Bot',
          action: 'postMessage',
          config: {
            channel: '#ops-alerts',
            message: '⚡ *Agentflow Automation Event*: Operation processed successfully.\n> Details: {{node_ai_agent.output.summary || "Event completed without errors."}}'
          },
          description: 'Posts structured updates to Slack channel'
        }
      });

      edges.push({
        id: `edge_${prevNodeId}_${slackNodeId}`,
        source: prevNodeId,
        target: slackNodeId,
        animated: true,
        label: 'Notify Slack'
      });
    }

    // Discord
    if (lower.includes('discord') || lower.includes('community') || lower.includes('webhook alert')) {
      currentX += stepX;
      const discordNodeId = 'node_discord';
      nodes.push({
        id: discordNodeId,
        type: 'discord',
        position: { x: currentX, y: currentY },
        data: {
          label: 'Discord Operations Hub',
          action: 'postMessage',
          config: {
            channelId: 'announcements',
            message: '📢 **Operations Update**: Automated event successfully logged.'
          },
          description: 'Dispatches real-time notification to Discord channel'
        }
      });

      edges.push({
        id: `edge_${prevNodeId}_${discordNodeId}`,
        source: prevNodeId,
        target: discordNodeId,
        animated: true,
        label: 'Post Discord'
      });
    }

    // Google Sheets
    if (lower.includes('sheet') || lower.includes('spreadsheet') || lower.includes('record') || lower.includes('log') || lower.includes('csv') || lower.includes('store') || lower.includes('audit')) {
      currentX += stepX;
      const sheetsNodeId = 'node_sheets';
      nodes.push({
        id: sheetsNodeId,
        type: 'googleSheets',
        position: { x: currentX, y: currentY + 70 },
        data: {
          label: 'Google Sheets Audit Ledger',
          action: 'appendRow',
          config: {
            spreadsheetId: 'ops_audit_log_2026',
            range: 'Automations!A:E',
            values: ['{{execution.id}}', '{{execution.timestamp}}', 'SUCCESS', '{{node_ai_agent.output.summary || "Processed"}}']
          },
          description: 'Appends audit record row to Google Sheets spreadsheet'
        }
      });

      edges.push({
        id: `edge_${prevNodeId}_${sheetsNodeId}`,
        source: prevNodeId,
        target: sheetsNodeId,
        animated: true,
        label: 'Append Row'
      });
    }

    // Default fallback node if no specific integration mentioned
    if (nodes.length <= 2) {
      currentX += stepX;
      const defaultNotifyId = 'node_slack_default';
      nodes.push({
        id: defaultNotifyId,
        type: 'slack',
        position: { x: currentX, y: currentY },
        data: {
          label: 'Slack Ops Channel',
          action: 'postMessage',
          config: {
            channel: '#ops-feed',
            message: '🚀 *Workflow Executed*: Pipeline finished. Result: {{node_ai_agent.output.summary || "Task completed."}}'
          },
          description: 'Broadcasting operational update to team'
        }
      });

      edges.push({
        id: `edge_${prevNodeId}_${defaultNotifyId}`,
        source: prevNodeId,
        target: defaultNotifyId,
        animated: true,
        label: 'Broadcast'
      });
    }

    // Generate readable Title & Description
    const words = prompt.split(' ').slice(0, 6).join(' ');
    const name = words.charAt(0).toUpperCase() + words.slice(1) + ' Automation';

    return {
      name,
      description: `Automated agent pipeline generated for requirement: "${prompt}"`,
      tags: ['ai-generated', 'autonomous', 'production'],
      nodes,
      edges
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
}

module.exports = new AIService();
