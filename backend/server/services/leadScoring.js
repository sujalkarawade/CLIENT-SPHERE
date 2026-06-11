/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Lead Scoring Service — uses Groq LLM to analyse a lead and return
 * a structured JSON score with category, conversion probability, key
 * reasons and a recommended next action.
 */

// Simple in-memory rate limiter: max 5 requests per 10-second window
const rateLimiter = {
  requests: [],
  maxRequests: 5,
  windowMs: 10_000,
  check() {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);
    if (this.requests.length >= this.maxRequests) {
      const oldest = this.requests[0];
      const waitMs = this.windowMs - (now - oldest);
      throw new Error(
        'Rate limit reached. Please wait ' + Math.ceil(waitMs / 1000) + ' second(s) before scoring more leads.'
      );
    }
    this.requests.push(now);
  },
};

/**
 * Score a single lead using Groq.
 * @param {Object} lead - Lead data object
 * @returns {Promise<{score, category, conversionProbability, reasons, recommendedAction}>}
 */
export async function scoreLead(lead) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Groq API key is not configured. Add GROQ_API_KEY to your .env file. Get a free key at https://console.groq.com/keys'
    );
  }

  rateLimiter.check();

  const prompt =
    'You are an expert CRM sales analyst integrated into ClientSphere.\n' +
    'Analyze the following lead data and return a JSON object with exactly these keys:\n' +
    '  "score" (integer 0-100),\n' +
    '  "category" (exactly one of: "Hot", "Warm", "Cold"),\n' +
    '  "conversionProbability" (integer 0-100, realistic % chance of converting),\n' +
    '  "reasons" (array of 3-5 concise strings explaining the score),\n' +
    '  "recommendedAction" (single actionable string for the sales rep).\n\n' +
    'Scoring rules:\n' +
    '  Hot = score 80-100, Warm = score 50-79, Cold = score 0-49.\n' +
    '  Higher scores for: decision-maker job titles, large budgets, high engagement, referral sources, enterprise company size.\n' +
    '  Lower scores for: unknown/missing data, low engagement, cold outreach source, small budget.\n\n' +
    'Lead Data:\n' +
    '  Name: ' + (lead.name || 'Unknown') + '\n' +
    '  Company: ' + (lead.company || 'Unknown') + '\n' +
    '  Industry: ' + (lead.industry || 'Unknown') + '\n' +
    '  Company Size: ' + (lead.companySize || 'Unknown') + '\n' +
    '  Budget: ' + (lead.budget || 'Unknown') + '\n' +
    '  Job Title: ' + (lead.jobTitle || 'Unknown') + '\n' +
    '  Lead Source: ' + (lead.source || 'Unknown') + '\n' +
    '  Region: ' + (lead.region || 'Unknown') + '\n' +
    '  Engagement Level: ' + (lead.engagementLevel || 'Unknown') + '\n' +
    '  Notes: ' + (lead.notes || 'None') + '\n' +
    '  Current Lead Status: ' + (lead.status || 'New') + '\n\n' +
    'Return ONLY valid JSON — no markdown, no code fences, no extra text.';

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error('Groq API error: ' + errorBody);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No content returned from Groq.');
  }

  // Strip potential markdown fences
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse Groq response: ' + content);
  }

  // Enforce category from score if LLM returns wrong value
  const score = Math.min(100, Math.max(0, parseInt(parsed.score) || 0));
  let category = parsed.category || '';
  if (!['Hot', 'Warm', 'Cold'].includes(category)) {
    category = score >= 80 ? 'Hot' : score >= 50 ? 'Warm' : 'Cold';
  }

  return {
    score,
    category,
    conversionProbability: Math.min(100, Math.max(0, parseInt(parsed.conversionProbability) || 0)),
    reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 5) : [],
    recommendedAction: parsed.recommendedAction || '',
  };
}
