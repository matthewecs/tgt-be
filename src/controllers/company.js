const Anthropic = require('@anthropic-ai/sdk');
const OpenAI    = require('openai');
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

async function proxyRequest(res, method, path, body, query) {
  let url = `${siteUrl()}/api/content${path}`;
  if (query && Object.keys(query).length > 0) {
    url += '?' + new URLSearchParams(query).toString();
  }
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

const listPortfolio   = wrap((req, res) => proxyRequest(res, 'GET',    '/portfolio', null, req.query));
const createPortfolio = wrap((req, res) => proxyRequest(res, 'POST',   '/portfolio',                    req.body));
const updatePortfolio = wrap((req, res) => proxyRequest(res, 'PUT',    `/portfolio/${req.params.id}`,   req.body));
const deletePortfolio = wrap((req, res) => proxyRequest(res, 'DELETE', `/portfolio/${req.params.id}`));

// ── FAQ ──────────────────────────────────────────────────────────────────────

const listFaq   = wrap((req, res) => proxyRequest(res, 'GET',    '/faq'));
const createFaq = wrap((req, res) => proxyRequest(res, 'POST',   '/faq',                    req.body));
const updateFaq = wrap((req, res) => proxyRequest(res, 'PUT',    `/faq/${req.params.id}`,   req.body));
const deleteFaq = wrap((req, res) => proxyRequest(res, 'DELETE', `/faq/${req.params.id}`));

// ── Articles ─────────────────────────────────────────────────────────────────

const listArticles   = wrap((req, res) => proxyRequest(res, 'GET',    '/articles', null, req.query));
const getArticle     = wrap((req, res) => proxyRequest(res, 'GET',    `/articles/${req.params.id}`));
const createArticle  = wrap((req, res) => proxyRequest(res, 'POST',   '/articles',                    req.body));
const updateArticle  = wrap((req, res) => proxyRequest(res, 'PUT',    `/articles/${req.params.id}`,   req.body));
const deleteArticle  = wrap((req, res) => proxyRequest(res, 'DELETE', `/articles/${req.params.id}`));

// ── Gallery Items ─────────────────────────────────────────────────────────────

const listGalleryItems   = wrap((req, res) => proxyRequest(res, 'GET',    '/gallery-items', null, req.query));
const createGalleryItem  = wrap((req, res) => proxyRequest(res, 'POST',   '/gallery-items',                    req.body));
const updateGalleryItem  = wrap((req, res) => proxyRequest(res, 'PUT',    `/gallery-items/${req.params.id}`,   req.body));
const deleteGalleryItem  = wrap((req, res) => proxyRequest(res, 'DELETE', `/gallery-items/${req.params.id}`));

// ── Products ──────────────────────────────────────────────────────────────────

const listProducts   = wrap((req, res) => proxyRequest(res, 'GET',    '/products', null, req.query));
const getProduct     = wrap((req, res) => proxyRequest(res, 'GET',    `/products/${req.params.id}`));
const createProduct  = wrap((req, res) => proxyRequest(res, 'POST',   '/products',                    req.body));
const updateProduct  = wrap((req, res) => proxyRequest(res, 'PUT',    `/products/${req.params.id}`,   req.body));
const deleteProduct  = wrap((req, res) => proxyRequest(res, 'DELETE', `/products/${req.params.id}`));

// ── AI Content Suggestion (SSE streaming) ────────────────────────────────────

const SYSTEM_PROMPT = `Anda adalah asisten konten untuk PT Tirta Gesang Tunggal, perusahaan solusi air di Indonesia.

Profil perusahaan:
- Spesialisasi: Air Minum Dalam Kemasan (AMDK), pengolahan air bersih, dan IPAL
- Produk unggulan: Mesin filling SUNHAI kapasitas 2.000–7.000 botol/jam
- Layanan: Pembangunan pabrik AMDK, konsultasi SNI & izin edar BPOM, sistem IPAL
- Workshop di Bekasi dan Yogyakarta, melayani seluruh Indonesia
- Target: Pengusaha AMDK pemula, industri, fasilitas kesehatan

Panduan penulisan:
- Bahasa Indonesia profesional namun mudah dipahami
- Fokus pada nilai bisnis dan manfaat praktis bagi calon pelanggan
- Sertakan informasi teknis relevan (kapasitas, sertifikasi, regulasi) bila sesuai
- Jangan menyebut nama kompetitor`;

const PROMPTS = {
  faq: (topic) => `Buat 5 pasang pertanyaan dan jawaban FAQ untuk topik: "${topic}".
Format setiap item:
Q: [pertanyaan]
A: [jawaban lengkap]

Pisahkan setiap item dengan baris kosong.`,

  article: (topic) => `Tulis artikel lengkap dalam Markdown tentang: "${topic}".

Format output:
# [Judul Artikel]

**Deskripsi:** [1-2 kalimat ringkasan untuk SEO]

**Tags:** [tag1, tag2, tag3]

---

[Isi artikel dengan heading ##, paragraf, dan poin relevan. Minimum 400 kata.]`,

  'product-description': (topic) => `Tulis deskripsi produk untuk: "${topic}".

Format output:
[2-3 paragraf deskripsi produk yang menarik dan informatif. Jelaskan fungsi, keunggulan, dan cocok untuk siapa. Tidak perlu heading.]`,
};

const MAX_TOKENS = { faq: 1500, article: 3000, 'product-description': 1500 };

async function aiSuggest(req, res) {
  const { type, topic } = req.body;
  if (!type || !topic) return fail(res, 400, 'type and topic are required');
  if (!PROMPTS[type])
    return fail(res, 400, 'type must be "faq", "article", or "product-description"');

  const useAnthropic  = !!process.env.ANTHROPIC_API_KEY;
  const useOpenRouter = !!process.env.OPENROUTER_API_KEY;

  if (!useAnthropic && !useOpenRouter)
    return fail(res, 503, 'No AI provider configured. Set ANTHROPIC_API_KEY or OPENROUTER_API_KEY.');

  const userMessage = PROMPTS[type](topic);
  const maxTokens   = MAX_TOKENS[type];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let ended = false;
  const endOnce = () => { if (!ended) { ended = true; res.end(); } };

  // Path A: Anthropic SDK — takes priority if both keys are set
  if (useAnthropic) {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    stream.on('text', (text) => { if (!ended) res.write(`data: ${JSON.stringify({ text })}\n\n`); });
    stream.on('error', (err) => {
      console.error(`[ai/anthropic] stream error (type=${type}, topic=${topic}):`, err.message);
      if (!ended) res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      endOnce();
    });
    stream.on('end', () => {
      console.log(`[ai/anthropic] stream complete (type=${type}, topic=${topic})`);
      if (!ended) res.write('data: [DONE]\n\n');
      endOnce();
    });
    return;
  }

  // Path B: OpenRouter — free Claude access via openrouter.ai
  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  });

  try {
    const stream = await openai.chat.completions.create({
      model: 'anthropic/claude-sonnet-4-5',
      max_tokens: maxTokens,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userMessage },
      ],
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text && !ended) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }

    if (!ended) res.write('data: [DONE]\n\n');
    console.log(`[ai/openrouter] stream complete (type=${type}, topic=${topic})`);
    endOnce();
  } catch (err) {
    console.error(`[ai/openrouter] stream error (type=${type}, topic=${topic}):`, err.message);
    if (!ended) res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    endOnce();
  }
}

module.exports = {
  listPortfolio, createPortfolio, updatePortfolio, deletePortfolio,
  listFaq, createFaq, updateFaq, deleteFaq,
  listArticles, getArticle, createArticle, updateArticle, deleteArticle,
  listGalleryItems, createGalleryItem, updateGalleryItem, deleteGalleryItem,
  listProducts, getProduct, createProduct, updateProduct, deleteProduct,
  aiSuggest,
};
