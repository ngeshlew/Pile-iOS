import type { AiPort, SecretsPort } from '../../ports';

export const openAiClient = (secrets: SecretsPort): AiPort => ({
  async reflect(prompt: string) {
    const key = await secrets.get('OPENAI_API_KEY');
    if (!key) throw new Error('Missing OpenAI API key');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? '';
  },

  async chatWithJournal(msg: string) {
    return this.reflect(msg);
  },
});
