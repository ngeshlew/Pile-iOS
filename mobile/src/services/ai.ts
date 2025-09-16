import { Secure } from './secure';

export type ReflectionOptions = {
  prompt: string;
  model?: string;
};

export async function generateReflection({ prompt, model = 'gpt-4o-mini' }: ReflectionOptions): Promise<string> {
  const apiKey = await Secure.getApiKey();
  if (!apiKey) throw new Error('Missing OpenAI API key');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a journaling reflection assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI error ${res.status}: ${text}`);
  }

  const json = await res.json();
  const content: string | undefined = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content in OpenAI response');
  return content.trim();
}