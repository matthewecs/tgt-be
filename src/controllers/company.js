const Anthropic = require('@anthropic-ai/sdk');
const { ok, fail } = require('../helpers/response');

function siteUrl() {
  return (process.env.TGT_SITE_URL || '').replace(/\/$/, '');
}

function apiHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Api-Key': process.env.TGT_API_KEY || '',
  };
}

async function proxyRequest(res, method, path, body) {
  const url = `${siteUrl()}/api/content${path}`;
  console.log(`[proxy] ${method} ${url}`);
  try {
    const opts = { method, headers: apiHeaders() };
    if (body) opts.body = JSON.stringify(body);

    const upstream = await fetch(url, opts);
    const contentType = upstream.headers.get('content-type') || '';
    console.log(`[proxy] ${method} ${url} → ${upstream.status} (${contentType})`);

    if (!contentType.includes('application/json')) {
      console.error(`[proxy] non-JSON response from ${url}:`, upstream.status);
      return fail(res, upstream.status || 502, 'Upstream returned non-JSON response');
    }

    const json = await upstream.json();
    if (!upstream.ok) {
      console.error(`[proxy] upstream error ${upstream.status} from ${url}:`, json.message);
      return fail(res, upstream.status, json.message || 'Upstream error');
    }
    ok(res, json.data ?? json);
  } catch (err) {
    console.error(`[proxy] ${method} ${url} failed:`, err.message);
    fail(res, 502, 'Failed to reach upstream service');
  }
}

// wrap ensures async errors are caught and returned as 502 instead of crashing
const wrap = fn => (req, res, next) => fn(req, res).catch(next);

// ── Portfolio ────────────────────────────────────────────────────────────────

const listPortfolio   = wrap((req, res) => proxyRequest(res, 'GET',    '/portfolio'));
const createPortfolio = wrap((req, res) => proxyRequest(res, 'POST',   '/portfolio',                    req.body));
const updatePortfolio = wrap((req, res) => proxyRequest(res, 'PUT',    `/portfolio/${req.params.id}`,   req.body));
const deletePortfolio = wrap((req, res) => proxyRequest(res, 'DELETE', `/portfolio/${req.params.id}`));

// ── FAQ ──────────────────────────────────────────────────────────────────────

const listFaq   = wrap((req, res) => proxyRequest(res, 'GET',    '/faq'));
const createFaq = wrap((req, res) => proxyRequest(res, 'POST',   '/faq',                    req.body));
const updateFaq = wrap((req, res) => proxyRequest(res, 'PUT',    `/faq/${req.params.id}`,   req.body));
const deleteFaq = wrap((req, res) => proxyRequest(res, 'DELETE', `/faq/${req.params.id}`));

// ── Articles ─────────────────────────────────────────────────────────────────

const listArticles   = wrap((req, res) => proxyRequest(res, 'GET',    '/articles'));
const getArticle     = wrap((req, res) => proxyRequest(res, 'GET',    `/articles/${req.params.id}`));
const createArticle  = wrap((req, res) => proxyRequest(res, 'POST',   '/articles',                    req.body));
const updateArticle  = wrap((req, res) => proxyRequest(res, 'PUT',    `/articles/${req.params.id}`,   req.body));
const deleteArticle  = wrap((req, res) => proxyRequest(res, 'DELETE', `/articles/${req.params.id}`));

// ── AI Content Suggestion (SSE streaming) ────────────────────────────────────

const SYSTEM_PROMPT = `You are a helpful content writer for PT. Tirta Gesang Tunggal, an Indonesian water treatment company.
Write professional, informative content in Bahasa Indonesia or English as appropriate.
For FAQs, produce a clear question and a concise, factual answer.
For articles, produce a well-structured markdown article with a title, introduction, body sections, and a conclusion.`;

async function aiSuggest(req, res) {
  const { type, topic } = req.body;
  if (!type || !topic) {
    return fail(res, 400, 'type and topic are required');
  }
  if (!['faq', 'article'].includes(type)) {
    return fail(res, 400, 'type must be "faq" or "article"');
  }

  const userMessage = type === 'faq'
    ? `Write a FAQ entry about: ${topic}`
    : `Write a blog article about: ${topic}`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  stream.on('text', (text) => {
    res.write(`data: ${JSON.stringify({ text })}\n\n`);
  });

  stream.on('error', (err) => {
    console.error(`[ai] stream error (type=${type}, topic=${topic}):`, err.message);
    res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
    res.end();
  });

  stream.on('end', () => {
    console.log(`[ai] stream complete (type=${type}, topic=${topic})`);
    res.write('data: [DONE]\n\n');
    res.end();
  });
}

module.exports = {
  listPortfolio, createPortfolio, updatePortfolio, deletePortfolio,
  listFaq, createFaq, updateFaq, deleteFaq,
  listArticles, getArticle, createArticle, updateArticle, deleteArticle,
  aiSuggest,
};
