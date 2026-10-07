// Another Level — production web server (Railway-ready)
// Serves the pre-rendered multilingual site and handles online orders via the Resend API.
import 'dotenv/config';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { site } from './src/content/site.mjs';
import { orderableItems } from './src/content/menu.mjs';
import { LANGS, LANG_META, formatPrice } from './src/content/i18n.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const isProd = process.env.NODE_ENV === 'production';

const config = {
  port: Number(process.env.PORT) || 3000,
  resendKey: process.env.RESEND_API_KEY || '',
  from: process.env.RESEND_FROM || 'Another Level <porosi@radari.site>',
  to: (process.env.ORDER_TO_EMAIL || 'delivered@resend.dev').split(',').map((s) => s.trim()).filter(Boolean),
  siteUrl: (process.env.SITE_URL || '').replace(/\/$/, ''),
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean),
};

if (!existsSync(path.join(DIST, 'build.json'))) {
  console.error('✗ dist/ is missing — run `npm run build` first.');
  process.exit(1);
}
const build = JSON.parse(readFileSync(path.join(DIST, 'build.json'), 'utf8'));
const templates = Object.fromEntries(LANGS.map((l) => [l, readFileSync(path.join(DIST, 'pages', `${l}.html`), 'utf8')]));
const notFoundPage = readFileSync(path.join(DIST, 'pages', '404.html'), 'utf8');

if (!config.resendKey) console.warn('⚠ RESEND_API_KEY is not set — orders cannot be e-mailed.');

/* ------------------------------------------------------------------ */
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // Railway sits behind one proxy hop
app.set('strict routing', true);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", ...build.scriptHashes],
        'style-src': ["'self'"],
        'img-src': ["'self'", 'data:'],
        'font-src': ["'self'"],
        'connect-src': ["'self'"],
        'frame-src': ['https://maps.google.com', 'https://www.google.com'],
        'form-action': ["'self'"],
        'frame-ancestors': ["'self'"],
        'base-uri': ["'self'"],
        'object-src': ["'none'"],
        'upgrade-insecure-requests': isProd ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    strictTransportSecurity: isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
  }),
);
app.use(compression());

/* ---------- Public origin (used for canonical / hreflang / sitemap) ---------- */
function baseUrl(req) {
  if (config.siteUrl) return config.siteUrl;
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  return `${req.protocol}://${req.get('host')}`;
}

const pageCache = new Map();
function renderPage(lang, req) {
  const base = baseUrl(req);
  const key = `${lang}|${base}`;
  if (!pageCache.has(key)) pageCache.set(key, templates[lang].replaceAll('__SITE_URL__', base));
  return pageCache.get(key);
}

/* ---------- Health ---------- */
app.get('/health', (_req, res) => res.json({ ok: true, builtAt: build.builtAt }));

/* ---------- Static assets ---------- */
app.use(
  express.static(path.join(DIST, 'public'), {
    index: false,
    redirect: false,
    setHeaders(res, filePath) {
      const rel = path.relative(path.join(DIST, 'public'), filePath).replaceAll('\\', '/');
      if (rel.startsWith('assets/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      else if (rel.startsWith('images/') || rel.startsWith('icons/')) res.setHeader('Cache-Control', 'public, max-age=2592000');
      else res.setHeader('Cache-Control', 'public, max-age=86400');
    },
  }),
);

/* ---------- Pages (one canonical URL per language) ---------- */
function sendPage(lang) {
  return (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.setHeader('Content-Language', lang);
    res.type('html').send(renderPage(lang, req));
  };
}
const qs = (req) => (req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '');

app.get('/', sendPage('sq'));
app.get('/en/', sendPage('en'));
app.get('/it/', sendPage('it'));
app.get(['/en', '/it'], (req, res) => res.redirect(301, `${req.path}/${qs(req)}`));
app.get(['/sq', '/sq/', '/al', '/al/'], (req, res) => res.redirect(301, `/${qs(req)}`));

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${baseUrl(req)}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (req, res) => {
  const base = baseUrl(req);
  const lastmod = build.builtAt.slice(0, 10);
  const alternates = [
    ...LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${base}${LANG_META[l].path}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${base}/en/"/>`,
  ].join('\n');
  const urls = LANGS.map(
    (l) => `  <url>\n    <loc>${base}${LANG_META[l].path}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternates}\n  </url>`,
  ).join('\n');
  res
    .type('application/xml')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
    );
});

/* ------------------------------------------------------------------
   Orders API
------------------------------------------------------------------- */
const isLocalOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);
function originAllowed(req) {
  const origin = req.get('origin');
  if (!origin) return true; // same-origin navigations / server-to-server / curl
  const o = origin.replace(/\/$/, '');
  return o === baseUrl(req) || o === `${req.protocol}://${req.get('host')}` || config.allowedOrigins.includes(o) || (!isProd && isLocalOrigin(o));
}

app.use(
  '/api',
  cors((req, cb) =>
    cb(null, {
      origin: originAllowed(req) ? req.get('origin') || false : false,
      methods: ['POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Accept'],
      maxAge: 86400,
    }),
  ),
);

const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 6,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ ok: false, error: 'rate_limited' }),
});

const str = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max) : '');

function validateOrder(body) {
  const errors = {};
  const data = {
    name: str(body.name, 80),
    phone: str(body.phone, 24),
    type: body.type === 'delivery' ? 'delivery' : 'pickup',
    address: str(body.address, 200),
    details: str(body.details, 1000),
    lang: LANGS.includes(body.lang) ? body.lang : 'sq',
    requestId: /^[A-Za-z0-9-]{8,64}$/.test(body.requestId || '') ? body.requestId : randomUUID(),
    items: [],
  };

  if (data.name.length < 2) errors.name = 'required';
  const digits = data.phone.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15 || !/^[+\d\s().\-/]+$/.test(data.phone)) errors.phone = 'invalid';
  if (data.type === 'delivery' && data.address.length < 5) errors.address = 'required';

  // Re-price every line from the server-side menu; never trust client prices.
  const raw = Array.isArray(body.items) ? body.items.slice(0, 40) : [];
  const merged = new Map();
  for (const line of raw) {
    const item = orderableItems[line?.id];
    const qty = Number(line?.qty);
    if (!item || !Number.isInteger(qty) || qty < 1 || qty > 20) {
      errors.items = 'invalid';
      continue;
    }
    merged.set(line.id, Math.min(20, (merged.get(line.id) || 0) + qty));
  }
  data.items = [...merged].map(([id, qty]) => ({ id, qty, price: orderableItems[id].price, name: orderableItems[id].name }));
  data.total = data.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  if (!data.items.length && data.details.length < 3) errors.details = 'required';

  return { data, errors };
}

const escHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const lek = (n) => `${formatPrice('sq', n)} L`;

// Turns what the customer typed into dial / WhatsApp links when the format is unambiguous.
function phoneLinks(raw) {
  let p = raw.replace(/[^\d+]/g, '');
  if (p.startsWith('00')) p = `+${p.slice(2)}`;
  else if (/^06\d{8}$/.test(p)) p = `+355${p.slice(1)}`; // Albanian mobile written locally
  else if (/^6\d{8}$/.test(p)) p = `+355${p}`;
  if (!p.startsWith('+')) return { tel: `tel:${p}`, wa: null };
  return { tel: `tel:${p}`, wa: `https://wa.me/${p.slice(1)}` };
}

function buildEmail(order) {
  const typeLabel = order.type === 'delivery' ? 'Dërgesë (Delivery)' : 'Marr vetë (Pickup)';
  const when = new Intl.DateTimeFormat('sq-AL', { timeZone: site.timezone, dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
  const links = phoneLinks(order.phone);
  const langName = LANG_META[order.lang].name;

  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #ece6db;font-size:15px;color:#1b1f1e"><strong>${i.qty}×</strong> ${escHtml(i.name.sq)}<br><span style="font-size:12px;color:#7f8784">${escHtml(i.name.en)}</span></td>
        <td style="padding:10px 0;border-bottom:1px solid #ece6db;font-size:13px;color:#7f8784;text-align:right;white-space:nowrap">${lek(i.price)}</td>
        <td style="padding:10px 0 10px 16px;border-bottom:1px solid #ece6db;font-size:15px;color:#1b1f1e;text-align:right;white-space:nowrap"><strong>${lek(i.price * i.qty)}</strong></td>
      </tr>`,
    )
    .join('');

  const field = (label, value) =>
    `<tr><td style="padding:6px 0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7f8784;width:150px;vertical-align:top">${label}</td><td style="padding:6px 0;font-size:15px;color:#1b1f1e">${value}</td></tr>`;

  const html = `<!doctype html><html><body style="margin:0;background:#f5f1e9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1e9;padding:24px 12px"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden">
      <tr><td style="background:#111413;padding:24px 28px">
        <div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#ddbd92;font-weight:700">Porosi e re · New order</div>
        <div style="margin-top:6px;font-size:26px;font-weight:800;color:#ffffff">${escHtml(order.name)}</div>
        <div style="margin-top:4px;font-size:14px;color:#a9afac">${escHtml(when)} · ${typeLabel}</div>
      </td></tr>
      <tr><td style="padding:24px 28px 8px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${field('Telefoni', `<a href="${escHtml(links.tel)}" style="color:#805433;font-weight:700;text-decoration:none">${escHtml(order.phone)}</a>${links.wa ? ` &nbsp;·&nbsp; <a href="${escHtml(links.wa)}" style="color:#5c6b45;text-decoration:none">WhatsApp</a>` : ''}`)}
          ${field('Mënyra', typeLabel)}
          ${order.type === 'delivery' ? field('Adresa', escHtml(order.address)) : ''}
          ${field('Gjuha', escHtml(langName))}
        </table>
      </td></tr>
      ${
        order.items.length
          ? `<tr><td style="padding:16px 28px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
          <tr><td colspan="2" style="padding:14px 0;font-size:14px;color:#7f8784">Totali · Total</td><td style="padding:14px 0;font-size:20px;font-weight:800;color:#1b1f1e;text-align:right;white-space:nowrap">${lek(order.total)}</td></tr>
        </table>
      </td></tr>`
          : ''
      }
      ${
        order.details
          ? `<tr><td style="padding:16px 28px 0">
        <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#7f8784">Shënime · Notes</div>
        <div style="margin-top:8px;padding:14px 16px;background:#fbf8f3;border-radius:12px;font-size:15px;line-height:1.5;color:#1b1f1e;white-space:pre-wrap">${escHtml(order.details)}</div>
      </td></tr>`
          : ''
      }
      <tr><td style="padding:24px 28px 28px">
        <a href="${escHtml(links.tel)}" style="display:inline-block;background:#ddbd92;color:#111413;font-weight:700;padding:12px 22px;border-radius:999px;text-decoration:none">Telefono klientin për konfirmim</a>
      </td></tr>
    </table>
    <div style="margin-top:14px;font-size:12px;color:#7f8784">Another Level · Sarandë — ref ${escHtml(order.requestId)}</div>
  </td></tr></table>
</body></html>`;

  const text = [
    `POROSI E RE / NEW ORDER — ${order.name}`,
    `${when} · ${typeLabel}`,
    `Telefoni: ${order.phone}`,
    order.type === 'delivery' ? `Adresa: ${order.address}` : '',
    `Gjuha: ${langName}`,
    '',
    ...order.items.map((i) => `${i.qty}× ${i.name.sq} (${i.name.en}) — ${lek(i.price * i.qty)}`),
    order.items.length ? `Totali: ${lek(order.total)}` : '',
    order.details ? `\nShënime: ${order.details}` : '',
    `\nref ${order.requestId}`,
  ]
    .filter((l) => l !== '')
    .join('\n');

  const itemCount = order.items.reduce((n, i) => n + i.qty, 0);
  const subject = `Porosi e re: ${order.name}${order.items.length ? ` · ${itemCount} artikuj · ${lek(order.total)}` : ''} · ${
    order.type === 'delivery' ? 'Dërgesë' : 'Marr vetë'
  }`;
  return { html, text, subject };
}

async function sendWithResend(order) {
  const { html, text, subject } = buildEmail(order);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.resendKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `order-${order.requestId}`,
    },
    body: JSON.stringify({
      from: config.from,
      to: config.to,
      subject: subject.slice(0, 250),
      html,
      text,
      tags: [
        { name: 'category', value: 'order' },
        { name: 'lang', value: order.lang },
      ],
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`Resend ${res.status}: ${body?.message || body?.name || 'unknown error'}`);
    err.status = res.status;
    throw err;
  }
  return body.id;
}

const wantsHtml = (req) => !req.is('application/json') && req.accepts(['json', 'html']) === 'html';

app.post(
  '/api/order',
  (req, res, next) => (originAllowed(req) ? next() : res.status(403).json({ ok: false, error: 'origin_not_allowed' })),
  orderLimiter,
  express.json({ limit: '16kb' }),
  express.urlencoded({ extended: false, limit: '16kb' }),
  async (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const lang = LANGS.includes(body.lang) ? body.lang : 'sq';
    const back = (status) => res.redirect(303, `${LANG_META[lang].path}?order=${status}#order`);

    // Honeypot: bots fill the hidden "company" field. Pretend success, send nothing.
    if (typeof body.company === 'string' && body.company.trim() !== '') {
      return wantsHtml(req) ? back('ok') : res.json({ ok: true });
    }

    const { data, errors } = validateOrder(body);
    if (Object.keys(errors).length) {
      return wantsHtml(req) ? back('error') : res.status(400).json({ ok: false, error: 'validation', errors });
    }
    if (!config.resendKey) {
      console.error('Order received but RESEND_API_KEY is missing');
      return wantsHtml(req) ? back('error') : res.status(503).json({ ok: false, error: 'email_not_configured' });
    }

    try {
      const id = await sendWithResend(data);
      console.log(`✓ order ${data.requestId} sent (resend id ${id}) · ${data.items.length} lines · ${data.total} ALL`);
      return wantsHtml(req) ? back('ok') : res.json({ ok: true, id: data.requestId });
    } catch (err) {
      console.error(`✗ order ${data.requestId} failed:`, err.message);
      return wantsHtml(req) ? back('error') : res.status(502).json({ ok: false, error: 'send_failed' });
    }
  },
);

app.all('/api/{*rest}', (_req, res) => res.status(404).json({ ok: false, error: 'not_found' }));

/* ---------- 404 + errors ---------- */
app.use((req, res) => {
  res.status(404).type('html').send(notFoundPage);
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  if (req.path.startsWith('/api/')) {
    return res.status(status).json({ ok: false, error: status === 413 ? 'payload_too_large' : status === 400 ? 'bad_request' : 'server_error' });
  }
  res.status(status).type('text/plain').send(status >= 500 ? 'Server error' : 'Bad request');
});

const server = app.listen(config.port, () => {
  console.log(`Another Level running on http://localhost:${config.port}`);
  console.log(`  e-mail: ${config.from} → ${config.to.join(', ')}`);
});

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    console.log(`${signal} received, shutting down…`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 8000).unref();
  });
}
