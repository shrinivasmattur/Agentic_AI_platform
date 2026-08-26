const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const ApiError = require('../utils/apiError');

class AIGeneratorService {
  async generateWorkflowFromPrompt(promptText) {
    if (!promptText || !promptText.trim()) {
      throw new ApiError(400, 'Prompt text is required');
    }

    const p = promptText.trim();

    // 1. Try OpenRouter API if API Key is set
    if (env.OPENROUTER_API_KEY) {
      try {
        console.log('🤖 Invoking OpenRouter API for prompt-to-workflow generation...');
        const result = await this._callOpenRouter(p);
        if (result) return { ...result, providerUsed: 'openrouter' };
      } catch (err) {
        console.warn('⚠️ OpenRouter API failed, attempting Gemini fallback:', err.message);
      }
    }

    // 2. Try Google Gemini SDK if API Key is set
    if (env.GEMINI_API_KEY) {
      try {
        console.log('🤖 Invoking Google Gemini SDK for prompt-to-workflow generation...');
        const result = await this._callGemini(p);
        if (result) return { ...result, providerUsed: 'gemini' };
      } catch (err) {
        console.warn('⚠️ Gemini API failed, attempting Rule-Based fallback:', err.message);
      }
    }

    // 3. Fallback to Deterministic Rule-Based Builder
    console.log('⚡ Using Deterministic Rule-Based Builder for prompt graph generation...');
    const result = this._deterministicRuleBuilder(p);
    return { ...result, providerUsed: 'rule-based' };
  }

  async _callOpenRouter(promptText) {
    const systemPrompt = `You are an AI Workflow Architect for Agentflow_AI. Convert user automation prompts into a structured JSON workflow graph with nodes, positions, edges, name, description, and tags.
Return ONLY valid JSON matching this schema:
{
  "name": "Workflow Name",
  "description": "Description",
  "trigger": { "type": "manual|email|webhook|schedule", "config": {} },
  "nodes": [
    {
      "id": "node-1",
      "type": "gmail_trigger|webhook_trigger|schedule_trigger|gmail_send|slack_message|discord_message|sheets_append|ai_llm|ai_classifier|logic_condition",
      "position": { "x": 250, "y": 100 },
      "data": { "label": "Node Name", "config": {} }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "node-1", "target": "node-2", "animated": true }
  ],
  "tags": ["tag1", "tag2"]
}`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptText },
        ],
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content);
  }

  async _callGemini(promptText) {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `You are an AI Workflow Architect for Agentflow_AI. Convert user automation prompts into a structured JSON workflow graph with nodes, positions, edges, name, description, and tags.
Return ONLY valid JSON without markdown wrapping.`;

    const result = await model.generateContent(`${systemPrompt}\nPrompt: ${promptText}`);
    const text = result.response.text();
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  }

  _deterministicRuleBuilder(promptText) {
    const p = promptText.toLowerCase();
    const nodes = [];
    const edges = [];
    let yPos = 100;

    // Determine Trigger
    let triggerType = 'manual_trigger';
    let triggerLabel = 'Manual Trigger';

    if (p.includes('gmail') || p.includes('email') || p.includes('inbox')) {
      triggerType = 'gmail_trigger';
      triggerLabel = 'Gmail New Email Trigger';
    } else if (p.includes('webhook') || p.includes('api')) {
      triggerType = 'webhook_trigger';
      triggerLabel = 'Incoming Webhook Event';
    } else if (p.includes('cron') || p.includes('schedule') || p.includes('every')) {
      triggerType = 'schedule_trigger';
      triggerLabel = 'Cron Schedule Trigger';
    }

    nodes.push({
      id: 'node-1',
      type: triggerType,
      position: { x: 250, y: yPos },
      data: { label: triggerLabel, config: {} },
    });

    let lastNodeId = 'node-1';
    let nodeCount = 1;

    // AI Analysis Step if requested or prompt involves classification/summarization
    if (p.includes('classify') || p.includes('summarize') || p.includes('ai') || p.includes('invoice') || p.includes('sentiment')) {
      nodeCount++;
      yPos += 120;
      const aiNodeId = `node-${nodeCount}`;
      const isClassifier = p.includes('classify') || p.includes('sentiment');
      nodes.push({
        id: aiNodeId,
        type: isClassifier ? 'ai_classifier' : 'ai_llm',
        position: { x: 250, y: yPos },
        data: {
          label: isClassifier ? 'Intent & Sentiment Classifier' : 'AI Reasoning & LLM Processor',
          config: { prompt: `Process payload from ${lastNodeId}: ${promptText}` },
        },
      });

      edges.push({
        id: `e-${lastNodeId}-${aiNodeId}`,
        source: lastNodeId,
        target: aiNodeId,
        animated: true,
      });

      lastNodeId = aiNodeId;
    }

    // Sheet Append Step
    if (p.includes('sheet') || p.includes('excel') || p.includes('log') || p.includes('table') || p.includes('row')) {
      nodeCount++;
      yPos += 120;
      const sheetNodeId = `node-${nodeCount}`;
      nodes.push({
        id: sheetNodeId,
        type: 'sheets_append',
        position: { x: 250, y: yPos },
        data: {
          label: 'Append Google Sheet Row',
          config: { range: 'Sheet1!A:E' },
        },
      });

      edges.push({
        id: `e-${lastNodeId}-${sheetNodeId}`,
        source: lastNodeId,
        target: sheetNodeId,
        animated: true,
      });

      lastNodeId = sheetNodeId;
    }

    // Notification Action (Slack / Email / Discord)
    if (p.includes('slack')) {
      nodeCount++;
      yPos += 120;
      const slackId = `node-${nodeCount}`;
      nodes.push({
        id: slackId,
        type: 'slack_message',
        position: { x: 250, y: yPos },
        data: {
          label: 'Post Slack Notification',
          config: { recipient: '#ops-alerts', message: 'Workflow notification payload' },
        },
      });
      edges.push({
        id: `e-${lastNodeId}-${slackId}`,
        source: lastNodeId,
        target: slackId,
        animated: true,
      });
    } else if (p.includes('discord')) {
      nodeCount++;
      yPos += 120;
      const discordId = `node-${nodeCount}`;
      nodes.push({
        id: discordId,
        type: 'discord_message',
        position: { x: 250, y: yPos },
        data: {
          label: 'Post Discord Bot Alert',
          config: { recipient: 'general', message: 'Workflow notification payload' },
        },
      });
      edges.push({
        id: `e-${lastNodeId}-${discordId}`,
        source: lastNodeId,
        target: discordId,
        animated: true,
      });
    } else if (p.includes('send email') || p.includes('reply') || p.includes('notify email')) {
      nodeCount++;
      yPos += 120;
      const sendEmailId = `node-${nodeCount}`;
      nodes.push({
        id: sendEmailId,
        type: 'gmail_send',
        position: { x: 250, y: yPos },
        data: {
          label: 'Send Email Notification',
          config: { recipient: 'operator@company.com', message: 'Automated workflow notification' },
        },
      });
      edges.push({
        id: `e-${lastNodeId}-${sendEmailId}`,
        source: lastNodeId,
        target: sendEmailId,
        animated: true,
      });
    }

    // Derive name and tags
    const titleWords = promptText.slice(0, 45).split(' ');
    const name = titleWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Automation';

    return {
      name,
      description: promptText,
      trigger: { type: triggerType, config: {} },
      nodes,
      edges,
      tags: ['ai-generated', triggerType.split('_')[0]],
    };
  }
}

module.exports = new AIGeneratorService();
