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
  if (/\b(lead|prospect|score|hottest|warm|cold|conversion|qualified|unqualified|top leads|highest scoring|how many.*lead|total.*lead|lead.*total)\b/.test(msg)) {
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
 * For 'general' intent, only fetch aggregated counts — no detail rows.
 */
export async function buildContext(intent, db) {
  const context = {};

  try {
    if (intent === 'lead_analysis' || intent === 'email_generation') {
      const leads = await db.leads.findMany();
      context.leads = leads.map(l => ({
        name: l.name,
        company: l.company || '',
        status: l.status,
        source: l.source,
        leadScore: l.leadScore,
        aiScore: l.aiScore,
        aiCategory: l.aiCategory,
        conversionProbability: l.conversionProbability,
        createdAt: l.createdAt,
      }));
    }

    if (intent === 'task_query') {
      const tasks = await db.tasks.findMany();
      const now = new Date();
      context.tasks = tasks.map(t => ({
        title: t.title,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate,
        isOverdue: t.status !== 'Completed' && new Date(t.dueDate) < now,
      }));
    }

    if (intent === 'client_query') {
      const clients = await db.clients.findMany();
      context.clients = clients.map(c => ({
        name: c.name,
        company: c.company,
        status: c.status,
      }));
    }

    if (intent === 'pipeline_query') {
      const pipelines = await db.pipelines.findMany();
      context.pipeline = pipelines.map(p => ({
        title: p.title,
        value: p.value,
        stage: p.stage,
      }));
    }

    // For 'general', only provide high-level counts — no detail records
    if (intent === 'general') {
      const [leads, tasks, clients, pipelines] = await Promise.all([
        db.leads.findMany(),
        db.tasks.findMany(),
        db.clients.findMany(),
        db.pipelines.findMany(),
      ]);
      const now = new Date();
      context.summary = {
        totalLeads: leads.length,
        totalTasks: tasks.length,
        activeTasks: tasks.filter(t => t.status !== 'Completed').length,
        overdueTasks: tasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate) < now).length,
        totalClients: clients.length,
        activeClients: clients.filter(c => c.status === 'Active').length,
        totalDeals: pipelines.length,
        wonDeals: pipelines.filter(p => p.stage === 'Won').length,
        wonRevenue: pipelines.filter(p => p.stage === 'Won').reduce((s, p) => s + p.value, 0),
        pipelineValue: pipelines.filter(p => !['Won','Lost'].includes(p.stage)).reduce((s, p) => s + p.value, 0),
        hotLeads: leads.filter(l => l.aiCategory === 'Hot').length,
        warmLeads: leads.filter(l => l.aiCategory === 'Warm').length,
        coldLeads: leads.filter(l => l.aiCategory === 'Cold').length,
      };
    }
  } catch (err) {
    console.error('Context builder error:', err);
  }

  return context;
}

// Max detail records per entity — keeps prompts well within 12k TPM
const MAX_DETAIL_RECORDS = 8;

/**
 * Format CRM context as a structured string to inject into the system prompt.
 * general intent → summary stats only (no detail rows)
 * specific intents → summary + up to MAX_DETAIL_RECORDS rows
 */
function formatContextForPrompt(context) {
  const lines = [];

  // General/overview — summary only, no detail rows
  if (context.summary) {
    const s = context.summary;
    lines.push('CRM SNAPSHOT:');
    lines.push('Leads: ' + s.totalLeads + ' total | Hot:' + s.hotLeads + ' Warm:' + s.warmLeads + ' Cold:' + s.coldLeads);
    lines.push('Tasks: ' + s.totalTasks + ' total | Active:' + s.activeTasks + ' | Overdue:' + s.overdueTasks);
    lines.push('Clients: ' + s.totalClients + ' total | Active:' + s.activeClients);
    lines.push('Pipeline: ' + s.totalDeals + ' deals | Won:' + s.wonDeals + ' ($' + s.wonRevenue.toLocaleString() + ') | Active value:$' + s.pipelineValue.toLocaleString());
    return lines.join('\n');
  }

  if (context.leads?.length) {
    const hot = context.leads.filter(l => l.aiCategory === 'Hot').length;
    const warm = context.leads.filter(l => l.aiCategory === 'Warm').length;
    const cold = context.leads.filter(l => l.aiCategory === 'Cold').length;
    const scored = context.leads.filter(l => l.aiScore != null);
    const avgScore = scored.length ? Math.round(scored.reduce((s, l) => s + l.aiScore, 0) / scored.length) : null;
    const statusCounts = {};
    context.leads.forEach(l => { statusCounts[l.status] = (statusCounts[l.status] || 0) + 1; });
    const top = [...scored].sort((a, b) => b.aiScore - a.aiScore).slice(0, 5);

    lines.push('LEADS: ' + context.leads.length + ' total | Hot:' + hot + ' Warm:' + warm + ' Cold:' + cold + (avgScore !== null ? ' | Avg AI:' + avgScore : ''));
    lines.push('Status: ' + Object.entries(statusCounts).map(([s, n]) => s + '=' + n).join(', '));
    if (top.length) lines.push('Top: ' + top.map(l => l.name + (l.company ? '/' + l.company : '') + ' S:' + l.aiScore).join(' | '));
    context.leads.slice(0, MAX_DETAIL_RECORDS).forEach(l => {
      lines.push('• ' + l.name + (l.company ? '/' + l.company : '') + ' [' + l.status + ']' + (l.aiScore != null ? ' AI:' + l.aiScore + '/' + l.aiCategory : '') + (l.source ? ' ' + l.source : ''));
    });
    if (context.leads.length > MAX_DETAIL_RECORDS) lines.push('...and ' + (context.leads.length - MAX_DETAIL_RECORDS) + ' more leads');
    lines.push('');
  }

  if (context.tasks?.length) {
    const overdue   = context.tasks.filter(t => t.isOverdue);
    const byStatus  = {};
    context.tasks.forEach(t => { byStatus[t.status] = (byStatus[t.status] || 0) + 1; });

    lines.push('TASKS: ' + context.tasks.length + ' total | ' + Object.entries(byStatus).map(([s, n]) => s + ':' + n).join(' | '));
    if (overdue.length) lines.push('Overdue (' + overdue.length + '): ' + overdue.slice(0, 5).map(t => '"' + t.title + '" due:' + t.dueDate + ' ' + t.priority).join('; '));
    context.tasks.slice(0, MAX_DETAIL_RECORDS).forEach(t => {
      lines.push('• "' + t.title + '" [' + t.status + '] P:' + t.priority + ' Due:' + t.dueDate + (t.isOverdue ? ' ⚠OVERDUE' : ''));
    });
    if (context.tasks.length > MAX_DETAIL_RECORDS) lines.push('...and ' + (context.tasks.length - MAX_DETAIL_RECORDS) + ' more tasks');
    lines.push('');
  }

  if (context.clients?.length) {
    const byStatus = {};
    context.clients.forEach(c => { byStatus[c.status] = (byStatus[c.status] || 0) + 1; });

    lines.push('CLIENTS: ' + context.clients.length + ' total | ' + Object.entries(byStatus).map(([s, n]) => s + ':' + n).join(' | '));
    context.clients.slice(0, MAX_DETAIL_RECORDS).forEach(c => {
      lines.push('• ' + c.name + ' / ' + c.company + ' [' + c.status + ']');
    });
    if (context.clients.length > MAX_DETAIL_RECORDS) lines.push('...and ' + (context.clients.length - MAX_DETAIL_RECORDS) + ' more clients');
    lines.push('');
  }

  if (context.pipeline?.length) {
    const won    = context.pipeline.filter(p => p.stage === 'Won');
    const active = context.pipeline.filter(p => !['Won','Lost'].includes(p.stage));
    const lost   = context.pipeline.filter(p => p.stage === 'Lost');
    const stageCounts = {};
    context.pipeline.forEach(p => { stageCounts[p.stage] = (stageCounts[p.stage] || 0) + 1; });

    lines.push('PIPELINE: ' + context.pipeline.length + ' deals | Won:' + won.length + ' ($' + won.reduce((s,p)=>s+p.value,0).toLocaleString() + ') | Active:' + active.length + ' ($' + active.reduce((s,p)=>s+p.value,0).toLocaleString() + ') | Lost:' + lost.length);
    lines.push('Stages: ' + Object.entries(stageCounts).map(([s, n]) => s + '=' + n).join(', '));
    context.pipeline.slice(0, MAX_DETAIL_RECORDS).forEach(p => {
      lines.push('• "' + p.title + '" [' + p.stage + '] $' + p.value.toLocaleString());
    });
    if (context.pipeline.length > MAX_DETAIL_RECORDS) lines.push('...and ' + (context.pipeline.length - MAX_DETAIL_RECORDS) + ' more deals');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Build the system prompt for the AI assistant.
 */
function buildSystemPrompt(context, intent) {
  const crmData = formatContextForPrompt(context);
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    'You are ClientSphere AI, a CRM assistant. Today: ' + today + '.\n' +
    'Answer questions about CRM data, give actionable insights, draft emails.\n' +
    'Use bullet points (•) and emoji headers (📊 🔥 ✅ 📧 💡). Be concise.\n' +
    'Never modify data. Max ~250 words unless writing email content.\n' +
    'Intent: ' + intent.replace('_', ' ').toUpperCase() + '\n\n' +
    'CRM DATA:\n' +
    (crmData || 'No data available.') + '\n'
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

  // Build message history for Groq (limit to last 4 messages to control tokens)
  const historySlice = conversationHistory.slice(-4).map(m => ({
    role: m.role,
    content: m.content,
  }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...historySlice,
    { role: 'user', content: userMessage },
  ];

  // Rough token estimate: ~4 chars per token. Hard cap at 9000 tokens to stay under 12k TPM.
  const rawText = messages.map(m => m.content).join(' ');
  const estimatedTokens = Math.ceil(rawText.length / 4);
  if (estimatedTokens > 9000) {
    // Rebuild with summary-only context regardless of intent
    const summaryContext = await buildContext('general', db);
    const trimmedPrompt = buildSystemPrompt(summaryContext, intent);
    messages[0] = { role: 'system', content: trimmedPrompt };
  }

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
    try { parsedError = JSON.parse(errorBody); } catch { parsedError = null; }

    const errMsg = parsedError?.error?.message || errorBody;
    // Fallback to 8b model for token-limit or availability errors
    if (response.status === 429 || response.status === 503 || errMsg.toLowerCase().includes('too large') || errMsg.toLowerCase().includes('context')) {
      return assistantChatFallback(userMessage, messages, apiKey, intent);
    }
    throw new Error(errMsg || 'Groq API error ' + response.status);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No response returned from Groq.');
  }

  return { response: content.trim(), intent };
}

/**
 * Fallback to a smaller, faster model (8b) if primary is overloaded or request is too large.
 */
async function assistantChatFallback(userMessage, messages, apiKey, intent) {
  // For the 8b model, further trim the system prompt to just the data section
  const systemMsg = messages[0];
  if (systemMsg && systemMsg.content.length > 3000) {
    // Keep only the first 3000 chars of the system prompt (summary stats always come first)
    systemMsg.content = systemMsg.content.slice(0, 3000) + '\n[Data truncated for token limits]';
  }

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
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsed;
    try { parsed = JSON.parse(errorBody); } catch { parsed = null; }
    throw new Error(parsed?.error?.message || 'Groq API error: ' + errorBody);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No response returned from Groq.');

  return { response: content.trim(), intent };
}
