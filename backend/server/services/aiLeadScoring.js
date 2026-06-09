/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AI Lead Scoring Service
 *
 * Uses Groq's LLM to evaluate lead data and return:
 * - Score (0-100)
 * - Category (Hot/Warm/Cold)
 * - Conversion probability
 * - Reasoning
 * - Recommended next action
 */

function buildLeadScoringPrompt(lead) {
  return 'You are an expert B2B lead scoring AI for ClientSphere CRM. ' +
    'Analyze the following lead data and generate a lead score from 0 to 100, a category, ' +
    'conversion probability, reasoning, and a recommended next action.\n\n' +
    'Lead Data:\n' +
    '- Name: ' + (lead.name || 'Unknown') + '\n' +
    '- Email: ' + (lead.email || 'Unknown') + '\n' +
    '- Company: ' + (lead.company || 'Not specified') + '\n' +
    '- Industry: ' + (lead.industry || 'Not specified') + '\n' +
    '- Company Size: ' + (lead.companySize || 'Not specified') + '\n' +
    '- Budget: ' + (lead.budget || 'Not specified') + '\n' +
    '- Lead Source: ' + (lead.source || 'Not specified') + '\n' +
    '- Job Title: ' + (lead.jobTitle || 'Not specified') + '\n' +
    '- Geographic Region: ' + (lead.geoRegion || 'Not specified') + '\n' +
    '- Engagement Level: ' + (lead.engagementLevel || 'Not specified') + '\n' +
    '- Previous Interactions: ' + (lead.previousInteractions || 'None') + '\n' +
    '- Additional Notes: ' + (lead.notes || 'None') + '\n' +
    '- Current Lead Score (manual): ' + (lead.leadScore ?? 'N/A') + '\n' +
    '- Status: ' + (lead.status || 'New') + '\n\n' +
    'Scoring Guidelines:\n' +
    '- Score 80-100: Hot Lead 🔥. Decision maker role, high budget, strong engagement, ideal target industry.\n' +
    '- Score 50-79: Warm Lead 🟡. Some positive signals but needs more nurturing.\n' +
    '- Score 0-49: Cold Lead ❄️. Low engagement, poor fit, or early stage.\n\n' +
    'Respond with a JSON object only — no markdown, no code fences. ' +
    'The object must have exactly these keys:\n' +
    '- "score": integer between 0 and 100\n' +
    '- "category": one of "Hot", "Warm", "Cold"\n' +
    '- "conversionProbability": string like "75%"\n' +
    '- "reasons": array of strings explaining the score (2-5 reasons)\n' +
    '- "recommendedAction": string suggesting the next step (e.g., "Schedule a product demo", "Send proposal", "Follow up via email", "Nurture campaign")';
}

export async function scoreLeadWithAI(lead) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key is not configured. Please add GROQ_API_KEY to your .env file. Get a free key at https://console.groq.com/keys');
  }

  const prompt = buildLeadScoringPrompt(lead);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No content returned from Groq.');
  }

  // Strip markdown code fences if present
  const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      score: Math.min(100, Math.max(0, Math.round(parsed.score || 50))),
      category: ['Hot', 'Warm', 'Cold'].includes(parsed.category) ? parsed.category : 'Warm',
      conversionProbability: parsed.conversionProbability || '50%',
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons : ['Analysis complete'],
      recommendedAction: parsed.recommendedAction || 'Follow up via email',
    };
  } catch {
    throw new Error('Failed to parse AI scoring output: ' + content);
  }
}

export function determineCategory(score) {
  if (score >= 80) return 'Hot';
  if (score >= 50) return 'Warm';
  return 'Cold';
}