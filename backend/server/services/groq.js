/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export async function generateEmail(params) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key is not configured. Please add GROQ_API_KEY to your .env file. Get a free key at https://console.groq.com/keys');
  }

  const { clientName, companyName, emailPurpose, tone, additionalContext } = params;

  const prompt = 'You are an advanced AI assistant integrated into ClientSphere CRM.\n' +
    'Your task is to generate a professional email with a subject and body.\n\n' +
    'Client Name: ' + clientName + '\n' +
    'Company Name: ' + companyName + '\n' +
    'Email Purpose: ' + emailPurpose + '\n' +
    'Tone: ' + tone + '\n' +
    (additionalContext ? 'Additional Context: ' + additionalContext + '\n' : '') +
    '\n' +
    'Generate a clear, compelling, and relevant subject line and a structured email body. Keep the email copy clean, engaging, and directly tailored to the recipient and the goal. Do not include placeholders like "[Your Name]" or "[Your Title]" or bracketed fields in the output; instead, write standard email sign-offs or logical context. Use spacing and paragraphs for readability.\n\n' +
    'Respond with a JSON object only — no markdown, no code fences. The object must have exactly two keys: "subject" (string) and "body" (string).';

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
      temperature: 0.7,
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
      subject: parsed.subject || '',
      body: parsed.body || '',
    };
  } catch {
    throw new Error('Failed to parse model output: ' + content);
  }
}

export async function chatWithAssistant(params) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key is not configured. Please add GROQ_API_KEY to your .env file. Get a free key at https://console.groq.com/keys');
  }

  const { userMessage, crmContext, conversationHistory } = params;

  const systemPrompt = `You are an AI-powered CRM assistant integrated into ClientSphere CRM. Your role is to help users interact with their CRM data using natural language.

You have access to the following CRM data:
- Clients: ${JSON.stringify(crmContext.clients, null, 2)}
- Leads: ${JSON.stringify(crmContext.leads, null, 2)}
- Tasks: ${JSON.stringify(crmContext.tasks, null, 2)}
- Pipeline Deals: ${JSON.stringify(crmContext.pipelines, null, 2)}

Your capabilities include:
1. Querying and analyzing CRM data
2. Generating insights and summaries
3. Recommending actions and follow-ups
4. Generating content like emails or meeting notes

Rules:
- Be professional, concise, and data-driven
- Use emojis to make responses more engaging
- Do not modify any data without explicit user confirmation
- Always base your responses on the provided CRM data
- If you don't have enough information, ask the user for clarification
- Format your responses in a clear, readable way with bullet points when appropriate`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.7,
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

  return content;
}