// ═══════════════════════════════════════════════════════
// zicao.dev — Backend API (Vercel Serverless Function)
// Motor de cascata: Claude → Groq → Gemini → Mistral → OpenRouter → xAI
// As chaves ficam seguras no servidor, nunca expostas no browser
// ═══════════════════════════════════════════════════════

export const config = { maxDuration: 30 };

// ── Helpers ──
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// ── Claude (Primário — sempre tentado primeiro) ──
async function tryClaude(system, messages) {
  const key = process.env.CLAUDE_API_KEY;
  if (!key) throw new Error('no_key');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system,
      messages,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.type || `claude_${res.status}`);
  return { reply: data.content?.map(b => b.text || '').join('') || '', provider: 'claude' };
}

// ── Groq (Fallback 1 — mais rápida, grátis) ──
async function tryGroq(system, messages) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('no_key');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4000,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `groq_${res.status}`);
  return { reply: data.choices?.[0]?.message?.content || '', provider: 'groq' };
}

// ── Gemini (Fallback 2 — generoso, grátis) ──
async function tryGemini(system, messages) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('no_key');

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents,
        generationConfig: { maxOutputTokens: 4000 },
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `gemini_${res.status}`);
  return { reply: data.candidates?.[0]?.content?.parts?.[0]?.text || '', provider: 'gemini' };
}

// ── Mistral (Fallback 3 — 1B tokens/mês grátis) ──
async function tryMistral(system, messages) {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new Error('no_key');

  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'mistral-large-latest',
      max_tokens: 4000,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `mistral_${res.status}`);
  return { reply: data.choices?.[0]?.message?.content || '', provider: 'mistral' };
}

// ── OpenRouter (Fallback 4 — 100+ modelos grátis) ──
async function tryOpenRouter(system, messages) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('no_key');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
      'HTTP-Referer': 'https://zicao.dev',
      'X-Title': 'zicao.dev',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      max_tokens: 4000,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `openrouter_${res.status}`);
  return { reply: data.choices?.[0]?.message?.content || '', provider: 'openrouter' };
}

// ── xAI Grok (Fallback 5 — $25 grátis no cadastro) ──
async function tryXai(system, messages) {
  const key = process.env.XAI_API_KEY;
  if (!key) throw new Error('no_key');

  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model: 'grok-3-mini',
      max_tokens: 4000,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `xai_${res.status}`);
  return { reply: data.choices?.[0]?.message?.content || '', provider: 'xai' };
}

// ── ENGINE: Cascata automática ──
const CASCADE = [
  { name: 'claude',      fn: tryClaude },
  { name: 'groq',        fn: tryGroq },
  { name: 'gemini',      fn: tryGemini },
  { name: 'mistral',     fn: tryMistral },
  { name: 'openrouter',  fn: tryOpenRouter },
  { name: 'xai',         fn: tryXai },
];

async function askWithFallback(system, messages) {
  const errors = [];

  for (const provider of CASCADE) {
    try {
      const result = await provider.fn(system, messages);
      if (result.reply) return result;
    } catch (e) {
      if (e.message === 'no_key') continue; // sem chave, pula
      errors.push(`${provider.name}: ${e.message}`);
      // rate limit ou erro temporário → tenta próxima
    }
  }

  throw new Error(`Todas as APIs falharam: ${errors.join(' | ')}`);
}

// ── Handler principal ──
export default async function handler(req) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Método não permitido' }, 405);
  }

  try {
    const body = await req.json();
    const { system, messages } = body;

    if (!system || !messages?.length) {
      return json({ error: 'Parâmetros inválidos: system e messages são obrigatórios' }, 400);
    }

    const result = await askWithFallback(system, messages);
    return json({ reply: result.reply, provider: result.provider, ok: true });

  } catch (e) {
    console.error('zicao.dev API error:', e.message);
    return json({ error: e.message, ok: false }, 500);
  }
}
