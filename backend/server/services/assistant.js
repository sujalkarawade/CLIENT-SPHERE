/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AI CRM Assistant Service
 * Handles intent detection, context building, and Groq LLM interaction
 * for conversational CRM queries.
 */

// ── Rate limiter: max 8 requests per 15-second window ────────────────────────
const rateLimiter = {
  requests: [],
  maxRequests: 8,
  windowMs: 15_000,
  check() {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);
    if (this.requests.length >= this.maxRequests) {
      const oldest = this.requests[0];
      const waitMs = this.windowMs - (now - oldest);
      throw new Error(
        'Rate limit reached. Please wait ' + Math.ceil(waitMs / 1000) + ' second(s) before sending another message.'
      );
    }
    this.requests.push(now);
  },
};

/**
 * Detect user intent from message text.
 * Returns one of: lead_analysis | task_query | client_query | pipeline_query | email_generation | general
 */
export function detectIntent(message) {
  const msg = message.toLowerCase();

  if (/\b(email|write|draft|compose|generate.*email|follow[- ]?up email|outreach)\b/.test(msg)) {
    return 'email_generation';
  }
  if (/\b(lead|prospect|score|hottest|warm|cold|conversion|qualified|unqualified|top leads|highest scoring)\b/.test(msg)) {
    return 'lead_analysis';
  }
  if (/\b(task|todo|overdue|due|pending|deadline|complete|priority|urgent)\b/.test(msg)) {
    return 'task_query';
  }
  if (/\b(client|customer|contact|account|inactive|active|last contact)\b/.test(msg)) {
    return 'client_query';
  }
  if (/\b(pipeline|deal|stage|revenue|won|lost|proposal|opportunity|sales)\b/.test(msg)) {
    return 'pipeline_query';
  }
  return 'general';
}

/**
 * Build CRM context object from database data based on detected intent.
 */
export async function buildContext(intent, db) {
  const context = {};

  try {
    if (intent === 'lead_analysis' || intent === 'general' || intent === 'email_generation') {
      const leads = await db.leads.findMany();
      context.leads = leads.map(l => ({
        id: l.id,
        name: l.name,
        company: l.company || '',
        email: l.email,
        status: l.status,
        source: l.source,
        leadScore: l.leadScore,
        aiScore: l.aiScore,
        aiCategory: l.aiCategory,
        conversionProbability: l.conversionProbability,
        recommendedAction: l.recommendedAction,
        industry: l.industry || '',
        budget: l.budget || '',
        engagementLevel: l.engagementLevel || '',
        createdAt: l.createdAt,
      }));
    }

    if (intent === 'task_query' || intent === 'general') {
      const tasks = await db.tasks.findMany();
      const now = new Date();
      context.tasks = tasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate,
        isOverdue: t.status !== 'Completed' && new Date(t.dueDate) < now,
        description: t.description,
      }));
    }

    if (intent === 'client_query' || intent === 'general') {
      const clients = await db.clients.findMany();
      context.clients = clients.map(c => ({
        id: c.id,
        name: c.name,
        company: c.company,
        email: c.email,
        status: c.status,
        notes: c.notes,
        createdAt: c.createdAt,
      }));
    }

    if (intent === 'pipeline_query' || intent === 'general') {
      const pipelines = await db.pipelines.findMany();
      context.pipeline = pipelines.map(p => ({
        id: p.id,
        title: p.title,
        value: p.value,
        stage: p.stage,
        createdAt: p.createdAt,
      }));
    }
  } catch (err) {
    console.error('Context builder error:', err);
  }

  return context;
}

/**
 * Format CRM context as a structured string to inject into the system prompt.
 */
function formatContextForPrompt(context) {
  const lines = [];

  if (context.leads?.length) {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const addedThisMonth = context.leads.filter(l => {
      const d = new Date(l.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    const hot = context.leads.filter(l => l.aiCategory === 'Hot').length;
    const warm = context.leads.filter(l => l.aiCategory === 'Warm').length;
    const cold = context.leads.filter(l => l.aiCategory === 'Cold').length;
    const scored = context.leads.filter(l => l.aiScore !== null && l.aiScore !== undefined);
    const avgScore = scored.length
      ? Math.round(scored.reduce((s, l) => s + l.aiScore, 0) / scored.length)
      : null;
    const topLeads = [...context.leads]
      .filter(l => l.aiScore !== null && l.aiScore !== undefined)
      .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))
      .slice(0, 5);

    lines.push('=== LEADS DATA ===');
    lines.push('Total leads: ' + context.leads.length);
    lines.push('Added this month: ' + addedThisMonth);
    lines.push('AI Scored: Hot=' + hot + ', Warm=' + warm + ', Cold=' + cold);
    if (avgScore !== null) lines.push('Average AI Score: ' + avgScore);
    lines.push('Status breakdown: ' + [
      ...new Set(context.leads.map(l => l.status))
    ].map(s => s + '=' + context.leads.filter(l => l.status === s).length).join(', '));
    if (topLeads.length) {
      lines.push('Top scored leads: ' + topLeads.map(l =>
        l.name + (l.company ? ' (' + l.company + ')' : '') + ' Score:' + l.aiScore + ' Cat:' + l.aiCategory
      ).join(' | '));
    }
    lines.push('All leads: ' + context.leads.map(l =>
      l.name + (l.company ? '/' + l.company : '') +
      ' [' + l.status + ']' +
      (l.aiScore !== null && l.aiScore !== undefined ? ' AI:' + l.aiScore + '/' + l.aiCategory : '') +
      (l.recommendedAction ? ' Action: ' + l.recommendedAction : '')
    ).join('\n'));
    lines.push('');
  }

  if (context.tasks?.length) {
    const overdue = context.tasks.filter(t => t.isOverdue);
    const pending = context.tasks.filter(t => t.status === 'Pending');
    const inProgress = context.tasks.filter(t => t.status === 'In Progress');
    const completed = context.tasks.filter(t => t.status === 'Completed');

    lines.push('=== TASKS DATA ===');
    lines.push('Total tasks: ' + context.tasks.length);
    lines.push('Overdue: ' + overdue.length + ', Pending: ' + pending.length + ', In Progress: ' + inProgress.length + ', Completed: ' + completed.length);
    if (overdue.length) {
      lines.push('Overdue tasks: ' + overdue.map(t => t.title + ' (due ' + t.dueDate + ', priority: ' + t.priority + ')').join('; '));
    }
    lines.push('All tasks: ' + context.tasks.map(t =>
      '"' + t.title + '" [' + t.status + '] Priority:' + t.priority + ' Due:' + t.dueDate + (t.isOverdue ? ' OVERDUE' : '')
    ).join('\n'));
    lines.push('');
  }

  if (context.clients?.length) {
    const active = context.clients.filter(c => c.status === 'Active').length;
    const pending = context.clients.filter(c => c.status === 'Pending').length;
    const inactive = context.clients.filter(c => c.status === 'Inactive').length;

    lines.push('=== CLIENTS DATA ===');
    lines.push('Total clients: ' + context.clients.length);
    lines.push('Active: ' + active + ', Pending: ' + pending + ', Inactive: ' + inactive);
    lines.push('All clients: ' + context.clients.map(c =>
      c.name + ' / ' + c.company + ' [' + c.status + ']' + (c.notes ? ' Notes: ' + c.notes.slice(0, 80) : '')
    ).join('\n'));
    lines.push('');
  }

  if (context.pipeline?.length) {
    const won = context.pipeline.filter(p => p.stage === 'Won');
    const lost = context.pipeline.filter(p => p.stage === 'Lost');
    const active = context.pipeline.filter(p => !['Won', 'Lost'].includes(p.stage));
    const totalRevenue = won.reduce((s, p) => s + p.value, 0);
    const pipelineValue = active.reduce((s, p) => s + p.value, 0);

    lines.push('=== PIPELINE DATA ===');
    lines.push('Total deals: ' + context.pipeline.length);
    lines.push('Won deals: ' + won.length + ' (revenue: $' + totalRevenue.toLocaleString() + ')');
    lines.push('Active deals: ' + active.length + ' (pipeline value: $' + pipelineValue.toLocaleString() + ')');
    lines.push('Lost deals: ' + lost.length);
    lines.push('Stage breakdown: ' + [
      ...new Set(context.pipeline.map(p => p.stage))
    ].map(s => s + '=' + context.pipeline.filter(p => p.stage === s).length).join(', '));
    lines.push('All deals: ' + context.pipeline.map(p =>
      '"' + p.title + '" Stage:' + p.stage + ' Value:$' + p.value.toLocaleString()
    ).join('\n'));
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Build the system prompt for the AI assistant.
 */
function buildSystemPrompt(context, intent) {
  const crmData = formatContextForPrompt(context);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    'You are ClientSphere AI, an expert CRM assistant embedded in the ClientSphere platform.\n' +
    'Today is ' + today + '.\n\n' +
    'YOUR ROLE:\n' +
    '- Answer questions about CRM data (leads, clients, tasks, pipeline deals)\n' +
    '- Provide actionable insights and recommendations\n' +
    '- Generate professional email drafts and outreach content\n' +
    '- Summarize trends and suggest next best actions\n' +
    '- Be concise, professional, and data-driven\n\n' +
    'FORMATTING RULES:\n' +
    '- Use bullet points (•) for lists\n' +
    '- Use emoji headers like 📊 📋 🔥 ✅ 📧 💡 to organize sections\n' +
    '- Keep responses focused and actionable\n' +
    '- When listing data, show the most important items first\n' +
    '- Always end with a "Recommended Action" when relevant\n' +
    '- Never modify data — only read and analyze\n' +
    '- If asked about something not in the CRM data, say so clearly\n\n' +
    'DETECTED INTENT: ' + intent.replace('_', ' ').toUpperCase() + '\n\n' +
    'LIVE CRM DATA (as of ' + today + '):\n' +
    (crmData || 'No data available in CRM.') + '\n\n' +
    'Respond in the user\'s language. Be direct and professional. Max response ~300 words unless generating email content.'
  );
}

/**
 * Main assistant chat function.
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous messages [{role, content}]
 * @param {Object} db - Database instance
 * @returns {Promise<{response: string, intent: string}>}
 */
export async function assistantChat(userMessage, conversationHistory, db) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Groq API key is not configured. Add GROQ_API_KEY to your .env file. Get a free key at https://console.groq.com/keys'
    );
  }

  rateLimiter.check();

  // Detect intent and build context
  const intent = detectIntent(userMessage);
  const context = await buildContext(intent, db);
  const systemPrompt = buildSystemPrompt(context, intent);

  // Build message history for Groq (limit to last 10 messages to control tokens)
  const historySlice = conversationHistory.slice(-10).map(m => ({
    role: m.role,
    content: m.content,
  }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...historySlice,
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.6,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsedError;
    try {
      parsedError = JSON.parse(errorBody);
    } catch {
      parsedError = null;
    }
    // Fall back to smaller model if the 70b model is unavailable
    if (response.status === 429 || response.status === 503) {
      return assistantChatFallback(userMessage, messages, apiKey, intent);
    }
    throw new Error(parsedError?.error?.message || 'Groq API error: ' + errorBody);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No response returned from Groq.');
  }

  return { response: content.trim(), intent };
}

/**
 * Fallback to a smaller model if primary is unavailable.
 */
async function assistantChatFallback(userMessage, messages, apiKey, intent) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.6,
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error('Groq API error: ' + errorBody);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No response returned from Groq.');

  return { response: content.trim(), intent };
}
