/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

let ai: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.');
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function generateEmail(params: {
  clientName: string;
  companyName: string;
  emailPurpose: string;
  tone: string;
  additionalContext?: string;
}): Promise<{ subject: string; body: string }> {
  const aiClient = getGeminiClient();
  const { clientName, companyName, emailPurpose, tone, additionalContext } = params;

  const prompt = `
You are an advanced AI assistant integrated into ClientSphere CRM.
Your task is to generate a professional email with a subject and body.

Client Name: ${clientName}
Company Name: ${companyName}
Email Purpose: ${emailPurpose}
Tone: ${tone}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Generate a clear, compelling, and relevant subject line and a structured email body. Keep the email copy clean, engaging, and directly tailored to the recipient and the goal. Do not include placeholders like "[Your Name]" or "[Your Title]" or bracketed fields in the output; instead, write standard email sign-offs or logical context. Use spacing and paragraphs for readability.
`;

  const response = await aiClient.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'object',
        properties: {
          subject: { type: 'string' },
          body: { type: 'string' },
        },
        required: ['subject', 'body'],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('No content returned from Gemini.');
  }

  // Strip markdown code fences if present (e.g. ```json ... ```)
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      subject: parsed.subject || '',
      body: parsed.body || '',
    };
  } catch (err) {
    throw new Error(`Failed to parse Gemini output: ${text}`);
  }
}
