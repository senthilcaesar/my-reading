// Cloudflare Worker that lets "Ask the Library" use the site's OpenAI key without
// exposing it. The key lives only in the Worker's OPENAI_API_KEY secret.
//
// POST /embeddings  { question }                 -> OpenAI embeddings JSON
// POST /librarian   { question, books, weak }    -> streamed chat completion (SSE)
//
// Request bodies are built server-side (src/utils/askApi.js), so callers can't pick
// the model, prompt or length. Requests are limited per IP and to ALLOWED_ORIGINS.

import { buildEmbeddingRequest, buildLibrarianRequest, cleanQuestion } from '../../src/utils/askApi.js';

const OPENAI = 'https://api.openai.com/v1';
const MAX_BODY_BYTES = 20_000;

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(status, body, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...(origin ? corsHeaders(origin) : {}) },
  });
}

async function callOpenAI(env, path, body) {
  return fetch(`${OPENAI}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
    body: JSON.stringify(body),
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
    if (!allowed.includes(origin)) return json(403, { error: 'Origin not allowed' });

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (request.method !== 'POST') return json(405, { error: 'Method not allowed' }, origin);

    const url = new URL(request.url);
    if (url.pathname !== '/embeddings' && url.pathname !== '/librarian') {
      return json(404, { error: 'Not found' }, origin);
    }

    if (env.RATE_LIMITER) {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const { success } = await env.RATE_LIMITER.limit({ key: `${ip}:${url.pathname}` });
      if (!success) return json(429, { error: 'Too many requests — please wait a minute.' }, origin);
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json(413, { error: 'Request too large' }, origin);
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return json(400, { error: 'Invalid JSON' }, origin);
    }
    if (!cleanQuestion(payload?.question)) return json(400, { error: 'Missing question' }, origin);

    const upstream =
      url.pathname === '/embeddings'
        ? await callOpenAI(env, '/embeddings', buildEmbeddingRequest(payload.question))
        : await callOpenAI(
            env,
            '/chat/completions',
            buildLibrarianRequest({ question: payload.question, books: payload.books, weak: Boolean(payload.weak) }),
          );

    if (!upstream.ok) {
      // Don't relay OpenAI's error details (they can mention the account).
      console.error('OpenAI error', upstream.status, await upstream.text());
      return json(502, { error: `Upstream error (${upstream.status})` }, origin);
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'no-store',
        ...corsHeaders(origin),
      },
    });
  },
};
