import { site } from './content/site.mjs';
import { categories } from './content/menu.mjs';
import { googleRating, mentions, reviews } from './content/reviews.mjs';
import { LANGS, LANG_META, dictFor, formatPrice } from './content/i18n.mjs';
import { icon, logoMark, sealSvg } from './icons.mjs';

// Replaced by the server at request time with the public origin (SITE_URL / Railway domain).
export const SITE_URL = '__SITE_URL__';

// Runs before first paint: enables reveal animations and honours a saved language
// preference when someone lands on the default (Albanian) URL.
export const INLINE_BOOT =
  "(function(){var d=document.documentElement;d.classList.add('js');try{var p=localStorage.getItem('al-lang'),m={sq:'/',en:'/en/',it:'/it/'};if(p&&m[p]&&p!==d.lang&&location.pathname==='/')location.replace(m[p]+location.search+location.hash)}catch(e){}})();";

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const IMG = {
  hero: { widths: [960, 1440, 1920, 2560], w: 1920, h: 1205 },
  heroMobile: { widths: [640, 930], w: 930, h: 1654 },
  about: { widths: [800, 1200, 1600, 2000], w: 1600, h: 1200 },
  exterior: { widths: [960, 1440, 1920], w: 1440, h: 880 },
};

const STAR = 'M12 2.8l2.75 5.57 6.15.9-4.45 4.33 1.05 6.12L12 16.83l-5.5 2.89 1.05-6.12L3.1 9.27l6.15-.9z';

// Five-star row with fractional fill (e.g. 4.8 → last star 80% filled).
function stars(value, { id, cls = 'h-6 w-32', on = '#ddbd92', off = 'rgb(221 189 146 / .22)' }) {
  const full = Math.floor(value);
  const end = full >= 5 ? 128 : 26 * full + 24 * (value - full);
  const pct = ((end / 128) * 100).toFixed(2);
  const paths = [0, 1, 2, 3, 4].map((i) => `<path transform="translate(${i * 26} 0)" d="${STAR}"/>`).join('');
  return `<svg class="${cls}" viewBox="0 0 128 24" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" x2="128" y1="0" y2="0"><stop offset="${pct}%" stop-color="${on}"/><stop offset="${pct}%" stop-color="${off}"/></linearGradient></defs><g fill="url(#${id})">${paths}</g></svg>`;
}

const srcset = (name, widths, ext) => widths.map((w) => `/images/${name}-${w}.${ext} ${w}w`).join(', ');

function picture(name, spec, { sizes, alt, altKey, imgClass = '', loading = 'lazy' }) {
  const fallback = spec.widths.includes(spec.w) ? spec.w : spec.widths[spec.widths.length - 1];
  return `<picture>
    <source type="image/avif" srcset="${srcset(name, spec.widths, 'avif')}" sizes="${sizes}">
    <source type="image/webp" srcset="${srcset(name, spec.widths, 'webp')}" sizes="${sizes}">
    <img src="/images/${name}-${fallback}.jpg" srcset="${srcset(name, spec.widths, 'jpg')}" sizes="${sizes}" width="${spec.w}" height="${spec.h}" alt="${esc(alt)}" data-i18n-attr="alt:${altKey}" loading="${loading}" decoding="async" class="${imgClass}">
  </picture>`;
}

function jsonLd(lang, d) {
  const path = LANG_META[lang].path;
  const offer = (item) => {
    if (typeof item.price === 'number') return { '@type': 'Offer', price: String(item.price), priceCurrency: 'ALL' };
    const values = item.priceRange || item.priceOptions;
    return {
      '@type': 'Offer',
      priceSpecification: { '@type': 'PriceSpecification', minPrice: values[0], maxPrice: values[values.length - 1], priceCurrency: 'ALL' },
    };
  };
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${SITE_URL}/#restaurant`,
    name: site.name,
    alternateName: site.legalName,
    description: d['meta.description'],
    url: `${SITE_URL}${path}`,
    telephone: site.phone,
    image: [
      `${SITE_URL}/images/exterior-1440.jpg`,
      `${SITE_URL}/images/about-1600.jpg`,
      `${SITE_URL}/images/hero-1920.jpg`,
    ],
    logo: `${SITE_URL}/icons/icon-512.png`,
    priceRange: '60–2200 ALL',
    currenciesAccepted: 'ALL',
    servesCuisine: ['Pizza', 'Fast Food', 'Albanian', 'Grill', 'Mediterranean'],
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.mapsUrl,
    areaServed: { '@type': 'City', name: 'Sarandë' },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: site.hours.opens,
        closes: site.hours.closes,
      },
    ],
    sameAs: [site.instagram, site.facebook, site.wolt],
    hasMenu: {
      '@type': 'Menu',
      name: `${site.name} — ${d['nav.menu']}`,
      url: `${SITE_URL}${path}#menu`,
      inLanguage: lang,
      hasMenuSection: categories.map((cat) => ({
        '@type': 'MenuSection',
        name: cat.name[lang],
        description: cat.blurb[lang],
        hasMenuItem: cat.items.map((item) => ({
          '@type': 'MenuItem',
          name: item.name[lang],
          ...(item.ingredients.length ? { description: item.ingredients.map((i) => d[`ing.${i}`]).join(', ') } : {}),
          offers: offer(item),
        })),
      })),
    },
    potentialAction: {
      '@type': 'OrderAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}${path}#order`,
        inLanguage: lang,
        actionPlatform: ['https://schema.org/DesktopWebPlatform', 'https://schema.org/MobileWebPlatform'],
      },
      deliveryMethod: ['http://purl.org/goodrelations/v1#DeliveryModePickUp', 'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet'],
    },
  };
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function renderPage({ lang, assets, buildYear }) {
  const meta = LANG_META[lang];
  const d = dictFor(lang);
  const t = (k) => esc(d[k] ?? k);
  // Text node bound to a dictionary key (re-translated client-side without reload).
  const T = (k, tag = 'span', cls = '') => `<${tag}${cls ? ` class="${cls}"` : ''} data-i18n="${k}">${t(k)}</${tag}>`;
  const price = (n) => esc(formatPrice(lang, n));
  const wa = (key) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(d[key])}`;
  const tel = `tel:${site.phone}`;
  const hoursText = `${site.hours.opens} – ${site.hours.closes}`;
  const totalItems = categories.reduce((n, c) => n + c.items.length, 0);

  const langOptions = (cls) =>
    LANGS.map(
      (l) => `<li><a href="${LANG_META[l].path}" hreflang="${l}" lang="${l}" data-lang-option="${l}" class="${cls}"${
        l === lang ? ' aria-current="true"' : ''
      }><span class="lang-code">${LANG_META[l].label}</span><span class="lang-name">${LANG_META[l].name}</span>${icon('check', 'size-4 lang-check')}</a></li>`,
    ).join('');

  const navLinks = [
    ['menu', 'nav.menu'],
    ['about', 'nav.about'],
    ['order', 'nav.order'],
    ['visit', 'nav.visit'],
  ];

  const itemCard = (item, index) => {
    const orderable = typeof item.price === 'number';
    const values = orderable ? [item.price] : item.priceRange || item.priceOptions;
    const sep = item.priceRange ? '–' : ' / ';
    const badges = [
      item.spicy ? `<span class="badge badge-spicy">${icon('flame', 'size-3.5')}${T('menu.spicy')}</span>` : '',
      item.portion ? `<span class="badge">${T(`item.${item.id}.portion`)}</span>` : '',
      item.note ? `<span class="badge badge-soft">${T(`item.${item.id}.note`)}</span>` : '',
    ].join('');
    const control = orderable
      ? `<div class="qty">
          <button type="button" class="add-btn" data-add="${item.id}" aria-label="${t('menu.add')}: ${t(`item.${item.id}.name`)}">${icon('plus', 'size-4')}${T('menu.add')}</button>
          <div class="stepper">
            <button type="button" class="step-btn" data-dec="${item.id}" aria-label="${t('a11y.decrease')}" data-i18n-attr="aria-label:a11y.decrease">${icon('minus', 'size-4')}</button>
            <span class="step-count" data-count-for="${item.id}">0</span>
            <button type="button" class="step-btn" data-inc="${item.id}" aria-label="${t('a11y.increase')}" data-i18n-attr="aria-label:a11y.increase">${icon('plus', 'size-4')}</button>
          </div>
        </div>`
      : `<span class="text-xs font-semibold text-char-500" data-i18n="menu.inStore">${t('menu.inStore')}</span>`;
    return `<li class="reveal h-full">
      <article class="menu-card" data-item="${item.id}">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <span class="card-index">${String(index + 1).padStart(2, '0')}</span>
            <h4 class="mt-1 font-display text-[1.3rem] leading-tight font-bold tracking-tight text-char-900">${T(`item.${item.id}.name`)}</h4>
            <p class="item-sub" data-i18n="item.${item.id}.sub">${t(`item.${item.id}.sub`)}</p>
          </div>
          <p class="price-tag"><span data-prices="${values.join('|')}" data-sep="${sep}">${values.map(price).join(sep)}</span><span class="price-unit">${T('menu.currency')}</span></p>
        </div>
        ${
          item.ingredients.length
            ? `<ul class="mt-4 flex flex-wrap gap-1.5" role="list">${item.ingredients.map((i) => `<li class="chip" data-i18n="ing.${i}">${t(`ing.${i}`)}</li>`).join('')}</ul>`
            : ''
        }
        <div class="mt-auto flex items-center justify-between gap-3 pt-5">
          <div class="flex flex-wrap gap-1.5">${badges}</div>
          ${control}
        </div>
      </article>
    </li>`;
  };

  const field = ({ id, type = 'text', label, ph, autocomplete, inputmode, rows, maxlength, hint, optional }) => {
    const describedBy = [hint ? `f-${id}-hint` : '', `f-${id}-error`].filter(Boolean).join(' ');
    const common = `id="f-${id}" name="${id}" class="field-input" placeholder="${t(ph)}" data-i18n-attr="placeholder:${ph}" aria-describedby="${describedBy}"${
      autocomplete ? ` autocomplete="${autocomplete}"` : ''
    }${inputmode ? ` inputmode="${inputmode}"` : ''}${maxlength ? ` maxlength="${maxlength}"` : ''}`;
    return `<div class="field" data-field="${id}">
      <label for="f-${id}" class="field-label">${T(label)}${optional ? ` <span class="field-optional">(${T('order.optional')})</span>` : ''}</label>
      ${rows ? `<textarea ${common} rows="${rows}"></textarea>` : `<input type="${type}" ${common}>`}
      ${hint ? `<p class="field-hint" id="f-${id}-hint" data-i18n="${hint}">${t(hint)}</p>` : ''}
      <p class="field-error" id="f-${id}-error" data-error-for="${id}" hidden></p>
    </div>`;
  };

  const marqueeWords = ['Sufllaqe', 'Skepasti', 'Kalzone', 'Shishqebab', 'Pizza', 'Qofte', 'Arabe', 'Xaxiq', 'Sanduiç'];
  const marqueeRun = marqueeWords.map((w) => `<span class="marquee-item">${w}</span><span class="marquee-sep">✦</span>`).join('');

  return `<!doctype html>
<html lang="${lang}" data-lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${t('meta.title')}</title>
<meta name="description" content="${t('meta.description')}">
<link rel="canonical" href="${SITE_URL}${meta.path}">
${LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${SITE_URL}${LANG_META[l].path}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${SITE_URL}/en/">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#111413">
<meta name="format-detection" content="telephone=no">
<meta name="geo.region" content="${site.address.regionCode}">
<meta name="geo.placename" content="Sarandë">
<meta name="geo.position" content="${site.geo.lat};${site.geo.lng}">
<meta name="ICBM" content="${site.geo.lat}, ${site.geo.lng}">
<meta property="og:type" content="restaurant">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${t('meta.title')}">
<meta property="og:description" content="${t('meta.description')}">
<meta property="og:url" content="${SITE_URL}${meta.path}">
<meta property="og:image" content="${SITE_URL}/images/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${t('meta.ogAlt')}">
<meta property="og:locale" content="${meta.ogLocale}">
${LANGS.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${LANG_META[l].ogLocale}">`).join('\n')}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t('meta.title')}">
<meta name="twitter:description" content="${t('meta.description')}">
<meta name="twitter:image" content="${SITE_URL}/images/og-image.jpg">
<meta name="al:api" content="">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/icons/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/bricolage-grotesque-latin-opsz-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" type="image/avif" media="(max-width: 767px)" imagesrcset="${srcset('hero-mobile', IMG.heroMobile.widths, 'avif')}" imagesizes="100vw" fetchpriority="high">
<link rel="preload" as="image" type="image/avif" media="(min-width: 768px)" imagesrcset="${srcset('hero', IMG.hero.widths, 'avif')}" imagesizes="100vw" fetchpriority="high">
<link rel="stylesheet" href="${assets.css}">
<script>${INLINE_BOOT}</script>
<script type="application/ld+json">${jsonLd(lang, d)}</script>
<script src="${assets.i18n}" defer></script>
<script src="${assets.js}" type="module"></script>
</head>
<body class="bg-cream text-char-900 antialiased">
<a href="#main" class="skip-link" data-i18n="a11y.skip">${t('a11y.skip')}</a>

<header id="site-header" class="site-header" data-theme="hero">
  <div class="mx-auto max-w-7xl px-3 pt-3 sm:px-6 sm:pt-4">
    <nav class="nav-shell" aria-label="${t('a11y.primaryNav')}" data-i18n-attr="aria-label:a11y.primaryNav">
      <a href="#top" class="brand" aria-label="${t('a11y.home')}" data-i18n-attr="aria-label:a11y.home">
        ${logoMark('brand-emblem size-11 shrink-0')}
        <span class="brand-text"><span class="brand-word">Another <span class="brand-accent">Level</span></span><span class="brand-tag">Pizzeria · Fast Food</span></span>
      </a>
      <ul class="hidden items-center gap-1 lg:flex" role="list">
        ${navLinks.map(([id, key]) => `<li><a class="nav-link" href="#${id}" data-spy-link="${id}">${T(key)}</a></li>`).join('')}
      </ul>
      <div class="flex items-center gap-1.5 sm:gap-2">
        <div class="lang" data-lang-switcher>
          <button type="button" class="lang-btn" aria-expanded="false" aria-controls="lang-menu" aria-label="${t('nav.language')}" data-i18n-attr="aria-label:nav.language" data-lang-toggle>
            ${icon('globe', 'size-4 opacity-80')}<span data-lang-label>${meta.label}</span>${icon('chevronDown', 'size-3.5 lang-chevron')}
          </button>
          <div id="lang-menu" class="lang-menu" data-lang-menu data-open="false">
            <ul class="p-1.5" role="list">${langOptions('lang-option')}</ul>
          </div>
        </div>
        <a href="#order" class="nav-cta hidden sm:inline-flex">${icon('bag', 'size-[1.1rem]')}${T('nav.order')}<span class="cart-badge" data-cart-count hidden>0</span></a>
        <button type="button" class="nav-burger lg:hidden" aria-expanded="false" aria-controls="mobile-menu" aria-label="${t('nav.openMenu')}" data-i18n-attr="aria-label:nav.openMenu" data-menu-toggle>
          <span class="burger" aria-hidden="true"><span></span><span></span></span>
        </button>
      </div>
    </nav>
  </div>
</header>

<div id="mobile-menu" class="mobile-menu lg:hidden" data-open="false" inert>
  <nav aria-label="${t('a11y.primaryNav')}" data-i18n-attr="aria-label:a11y.primaryNav">
    <ol class="mm-links" role="list">
      ${navLinks
        .map(([id, key], i) => `<li><a href="#${id}" class="mm-link" data-mm-link><span class="mm-index">0${i + 1}</span>${T(key)}</a></li>`)
        .join('')}
    </ol>
  </nav>
  <div class="mm-footer">
    <ul class="mm-lang" role="list">
      ${LANGS.map(
        (l) =>
          `<li><a href="${LANG_META[l].path}" hreflang="${l}" lang="${l}" data-lang-option="${l}" class="mm-lang-opt"${l === lang ? ' aria-current="true"' : ''}>${LANG_META[l].label}</a></li>`,
      ).join('')}
    </ul>
    <div class="mt-4 grid grid-cols-2 gap-2">
      <a href="${tel}" class="btn btn-glass">${icon('phone', 'size-[1.15rem]')}${T('bar.call')}</a>
      <a href="${wa('wa.text')}" data-wa="wa.text" target="_blank" rel="noopener" class="btn btn-oak">${icon('whatsapp', 'size-[1.15rem]')}WhatsApp</a>
    </div>
    <div class="mt-6 flex items-center justify-between text-sm text-white/60">
      <span class="flex items-center gap-2"><span class="status-dot" data-status-dot></span><span data-open-status>${t('visit.everyday')} ${hoursText}</span></span>
      <span class="flex gap-2">
        <a href="${site.instagram}" target="_blank" rel="noopener" class="social-btn" aria-label="Instagram">${icon('instagram', 'size-[1.1rem]')}</a>
        <a href="${site.facebook}" target="_blank" rel="noopener" class="social-btn" aria-label="Facebook">${icon('facebook', 'size-[1.1rem]')}</a>
      </span>
    </div>
  </div>
</div>

<main id="main">
  <!-- ============ HERO ============ -->
  <section id="top" class="hero relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-char-950 text-white">
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <picture>
        <source media="(max-width: 767px)" type="image/avif" srcset="${srcset('hero-mobile', IMG.heroMobile.widths, 'avif')}" sizes="100vw">
        <source media="(max-width: 767px)" type="image/webp" srcset="${srcset('hero-mobile', IMG.heroMobile.widths, 'webp')}" sizes="100vw">
        <source media="(max-width: 767px)" srcset="${srcset('hero-mobile', IMG.heroMobile.widths, 'jpg')}" sizes="100vw">
        <source type="image/avif" srcset="${srcset('hero', IMG.hero.widths, 'avif')}" sizes="100vw">
        <source type="image/webp" srcset="${srcset('hero', IMG.hero.widths, 'webp')}" sizes="100vw">
        <img src="/images/hero-1440.jpg" srcset="${srcset('hero', IMG.hero.widths, 'jpg')}" sizes="100vw" width="${IMG.hero.w}" height="${IMG.hero.h}" alt="${t('img.heroPizza')}" data-i18n-attr="alt:img.heroPizza" fetchpriority="high" decoding="async" class="hero-img h-full w-full object-cover object-[50%_45%] md:object-[65%_50%]">
      </picture>
      <div class="absolute inset-0 bg-gradient-to-t from-char-950 from-2% via-char-950/45 via-35% to-char-950/45"></div>
      <div class="absolute inset-0 hidden bg-gradient-to-r from-char-950/90 via-char-950/45 via-45% to-transparent to-75% md:block"></div>
      <div class="absolute inset-0 bg-char-950/25 md:hidden"></div>
      <div class="grain absolute inset-0"></div>
    </div>

    <div class="mx-auto w-full max-w-7xl px-5 pb-32 pt-36 sm:px-8 md:pb-20 lg:pb-24">
      <h1 class="max-w-5xl">
        <span class="hero-eyebrow hero-in d1"><span data-i18n="hero.eyebrow">${t('hero.eyebrow')}</span></span>
        <span class="hero-title block hero-in d2" data-i18n="hero.title1">${t('hero.title1')}</span>
        <span class="hero-title hero-title-accent block hero-in d3" data-i18n="hero.title2">${t('hero.title2')}</span>
      </h1>
      <p class="hero-in d4 mt-6 max-w-xl text-base/relaxed text-white/80 sm:text-lg/relaxed" data-i18n="hero.subtitle">${t('hero.subtitle')}</p>
      <div class="hero-in d5 mt-9 flex flex-col gap-3 sm:flex-row">
        <a href="#menu" class="btn btn-oak btn-lg">${T('hero.ctaMenu')}${icon('arrowDown', 'size-[1.1rem] icon-nudge-down')}</a>
        <a href="${wa('wa.text')}" data-wa="wa.text" target="_blank" rel="noopener" class="btn btn-glass btn-lg">${icon('whatsapp', 'size-5')}${T('hero.ctaOrder')}</a>
      </div>
      <ul class="hero-in d6 mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/75" role="list">
        <li class="flex items-center gap-2"><span class="status-dot" data-status-dot></span><span data-open-status>${t('visit.everyday')} ${hoursText}</span></li>
        <li><a href="#reviews" class="flex items-center gap-2 hover:text-white"><svg class="size-4 text-oak-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${STAR}"/></svg>${T('reviews.hero')}</a></li>
        <li class="flex items-center gap-2">${icon('mapPin', 'size-4 text-oak-300')}<span>Sarandë, ${T('visit.country')}</span></li>
        <li class="hidden items-center gap-2 sm:flex">${icon('bag', 'size-4 text-oak-300')}${T('hero.service')}</li>
      </ul>
    </div>

    <a href="#menu" class="hero-seal" aria-label="${t('hero.ctaMenu')}" data-i18n-attr="aria-label:hero.ctaMenu">${sealSvg({ cls: 'size-full', id: 'seal-hero', spin: true })}</a>
  </section>

  <div class="marquee bg-char-950 py-6" aria-hidden="true">
    <div class="marquee-track">${marqueeRun}${marqueeRun}</div>
  </div>

  <!-- ============ ABOUT ============ -->
  <section id="about" class="relative overflow-hidden py-24 sm:py-32" aria-labelledby="about-title">
    <div class="mx-auto grid max-w-7xl items-center gap-20 px-5 sm:px-8 lg:grid-cols-12 lg:gap-12">
      <div class="lg:col-span-5">
        <p class="eyebrow reveal">${T('about.eyebrow')}</p>
        <h2 id="about-title" class="section-title reveal" data-i18n="about.title">${t('about.title')}</h2>
        <p class="reveal mt-6 text-lg/relaxed text-char-600" data-i18n="about.body">${t('about.body')}</p>
        <ul class="mt-10 space-y-6" role="list">
          ${[
            ['leaf', 'about.f1'],
            ['flame', 'about.f2'],
            ['moon', 'about.f3'],
          ]
            .map(
              ([ic, key]) => `<li class="reveal flex gap-4">
            <span class="feature-icon">${icon(ic, 'size-[1.35rem]')}</span>
            <span><span class="block font-display text-lg font-bold tracking-tight" data-i18n="${key}.title">${t(`${key}.title`)}</span><span class="mt-1 block text-char-500" data-i18n="${key}.text">${t(`${key}.text`)}</span></span>
          </li>`,
            )
            .join('')}
        </ul>
      </div>

      <div class="relative pt-6 lg:col-span-7 lg:pt-0">
        <figure class="photo-frame reveal aspect-[4/3] w-full" data-parallax="0.05">
          ${picture('about', IMG.about, { sizes: '(min-width: 1280px) 720px, (min-width: 1024px) 56vw, 100vw', alt: d['img.about'], altKey: 'img.about', imgClass: 'h-full w-full object-cover' })}
        </figure>
        <div class="hours-badge reveal">
          ${icon('clock', 'size-5 text-oak-700')}
          <span><span class="block text-xs font-semibold uppercase tracking-wider text-char-500" data-i18n="about.hoursBadge">${t('about.hoursBadge')}</span><span class="block font-display text-lg font-bold tabular-nums">${hoursText}</span></span>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ MENU ============ -->
  <section id="menu" class="relative bg-paper pb-24 pt-24 sm:pb-32 sm:pt-32" aria-labelledby="menu-title">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <div class="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div class="lg:col-span-7">
          <p class="eyebrow reveal">${T('menu.eyebrow')}</p>
          <h2 id="menu-title" class="section-title reveal" data-i18n="menu.title">${t('menu.title')}</h2>
          <p class="reveal mt-5 max-w-xl text-lg/relaxed text-char-600" data-i18n="menu.subtitle">${t('menu.subtitle')}</p>
        </div>
        <aside class="pizza-card reveal lg:col-span-5">
          <div class="flex items-start gap-4">
            <span class="pizza-icon">${icon('pizza', 'size-7')}</span>
            <div>
              <h3 class="font-display text-xl font-bold tracking-tight" data-i18n="menu.pizza.title">${t('menu.pizza.title')}</h3>
              <p class="mt-2 text-sm/relaxed text-white/70" data-i18n="menu.pizza.text">${t('menu.pizza.text')}</p>
              <a href="${wa('wa.pizza')}" data-wa="wa.pizza" target="_blank" rel="noopener" class="btn btn-oak btn-sm mt-5">${icon('whatsapp', 'size-[1.1rem]')}${T('menu.pizza.cta')}</a>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <nav class="menu-tabs-wrap mt-14" aria-label="${t('a11y.menuCategories')}" data-i18n-attr="aria-label:a11y.menuCategories">
      <div class="mx-auto max-w-7xl px-3 sm:px-8">
        <div class="menu-tabs" data-menu-tabs>
          ${categories
            .map(
              (c, i) =>
                `<a href="#cat-${c.id}" class="menu-tab" data-tab="${c.id}"${i === 0 ? ' aria-current="true"' : ''}>${icon(c.icon, 'size-[1.1rem]')}${T(`cat.${c.id}.name`)}<span class="tab-count">${c.items.length}</span></a>`,
            )
            .join('')}
        </div>
      </div>
    </nav>

    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      ${categories
        .map(
          (c) => `<section id="cat-${c.id}" class="menu-cat" data-cat="${c.id}" aria-labelledby="cat-${c.id}-title">
        <header class="flex flex-col gap-3 border-b border-char-900/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div class="flex items-center gap-4">
            <span class="cat-icon">${icon(c.icon, 'size-6')}</span>
            <h3 id="cat-${c.id}-title" class="font-display text-3xl font-extrabold tracking-tight sm:text-4xl" data-i18n="cat.${c.id}.name">${t(`cat.${c.id}.name`)}</h3>
          </div>
          <p class="max-w-md text-char-500 sm:text-right" data-i18n="cat.${c.id}.blurb">${t(`cat.${c.id}.blurb`)}</p>
        </header>
        <ul class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="list">
          ${c.items.map(itemCard).join('')}
        </ul>
      </section>`,
        )
        .join('')}
    </div>
  </section>

  <!-- ============ REVIEWS ============ -->
  <section id="reviews" class="relative overflow-hidden py-24 sm:py-32" aria-labelledby="reviews-title">
    <div class="mx-auto max-w-7xl px-5 sm:px-8">
      <div class="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div class="lg:col-span-5">
          <p class="eyebrow reveal">${T('reviews.eyebrow')}</p>
          <h2 id="reviews-title" class="section-title reveal" data-i18n="reviews.title">${t('reviews.title')}</h2>
          <p class="reveal mt-5 max-w-md text-lg/relaxed text-char-600" data-i18n="reviews.subtitle">${t('reviews.subtitle')}</p>
          <a href="${googleRating.url}" target="_blank" rel="noopener" class="btn btn-dark reveal mt-8">${icon('mapPin', 'size-[1.1rem]')}${T('reviews.cta')}${icon('arrowUpRight', 'size-4')}</a>
        </div>
        <div class="lg:col-span-7">
          <div class="rating-card reveal">
            <div class="rating-score">
              <p class="flex items-end gap-3"><span class="score" data-i18n="reviews.score">${t('reviews.score')}</span><span class="pb-2 text-white/50" data-i18n="reviews.outOf">${t('reviews.outOf')}</span></p>
              <p class="mt-4" role="img" aria-label="${t('reviews.ratingLabel')}" data-i18n-attr="aria-label:reviews.ratingLabel">${stars(googleRating.value, { id: 'stars-total', cls: 'h-7 w-[9.5rem]' })}</p>
              <p class="mt-3 font-medium text-white/75" data-i18n="reviews.count">${t('reviews.count')}</p>
              <p class="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70">${icon('mapPin', 'size-3.5 text-oak-300')}Google Maps</p>
            </div>
            <div class="rating-mentions">
              <p class="text-xs font-bold uppercase tracking-[0.16em] text-oak-300" data-i18n="reviews.mentionsTitle">${t('reviews.mentionsTitle')}</p>
              <ul class="mt-5 space-y-4" role="list">
                ${mentions
                  .map(
                    (m) => `<li>
                  <div class="flex items-baseline justify-between gap-4 text-sm"><span class="font-semibold" data-i18n="mention.${m.id}">${t(`mention.${m.id}`)}</span><span class="shrink-0 tabular-nums text-white/55">${m.count} <span data-i18n="reviews.mentionUnit">${t('reviews.mentionUnit')}</span></span></div>
                  <svg class="bar mt-2 h-2 w-full" viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden="true" focusable="false"><rect width="100" height="2" fill="rgb(255 255 255 / .08)"/><rect class="bar-fill" width="${((m.count / mentions[0].count) * 100).toFixed(1)}" height="2" fill="#ddbd92"/></svg>
                </li>`,
                  )
                  .join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
      ${
        reviews.length
          ? `<ul class="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
        ${reviews
          .map(
            (r, i) => `<li class="reveal h-full"><figure class="review-card">
          ${stars(r.rating, { id: `stars-r${i}`, cls: 'h-4 w-[5.5rem]', off: 'rgb(17 20 19 / .12)', on: '#cda06b' })}
          <blockquote class="mt-4 flex-1 text-[0.975rem]/relaxed text-char-700" lang="${esc(r.lang)}"><p>“${esc(r.text)}”</p></blockquote>
          <figcaption class="mt-6 flex items-center gap-3 border-t border-char-900/5 pt-5">
            <span class="avatar">${esc(r.initials.replace(/[^\p{L}]/gu, ''))}</span>
            <span><span class="block font-semibold text-char-900">${esc(r.initials)}</span><span class="text-xs text-char-400" data-i18n="reviews.source">${t('reviews.source')}</span></span>
          </figcaption>
        </figure></li>`,
          )
          .join('')}
      </ul>`
          : ''
      }
    </div>
  </section>

  <!-- ============ ORDER ============ -->
  <section id="order" class="relative isolate overflow-hidden bg-char-950 py-24 text-white sm:py-32" aria-labelledby="order-title">
    <div class="order-glow" aria-hidden="true"></div>
    <div class="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-0">
      <div class="lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:pt-4">
        <p class="eyebrow eyebrow-light reveal">${T('order.eyebrow')}</p>
        <h2 id="order-title" class="section-title reveal" data-i18n="order.title">${t('order.title')}</h2>
        <p class="reveal mt-5 max-w-md text-lg/relaxed text-white/70" data-i18n="order.subtitle">${t('order.subtitle')}</p>
        <ol class="mt-10 space-y-3" role="list">
          ${['order.step1', 'order.step2', 'order.step3']
            .map((k, i) => `<li class="step reveal"><span class="step-num">${i + 1}</span>${T(k, 'span', 'font-medium')}</li>`)
            .join('')}
        </ol>
      </div>

      <div class="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1">
        <form id="order-form" class="order-card reveal" action="/api/order" method="post" novalidate data-order-form>
          <input type="hidden" name="lang" value="${lang}" data-lang-input>
          <div class="cart" data-cart>
            <div class="flex items-center justify-between gap-3">
              <h3 class="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight">${icon('bag', 'size-5 text-oak-300')}${T('order.cartTitle')}<span class="cart-pill" data-cart-label hidden></span></h3>
              <button type="button" class="cart-clear" data-cart-clear hidden>${T('order.clear')}</button>
            </div>
            <div class="cart-empty" data-cart-empty>
              <p data-i18n="order.cartEmpty">${t('order.cartEmpty')}</p>
              <a href="#menu" class="cart-browse">${T('order.browse')}${icon('arrowUp', 'size-4')}</a>
            </div>
            <ul class="cart-list" data-cart-list role="list"></ul>
            <div class="cart-total" data-cart-total hidden>
              <span class="text-white/70" data-i18n="order.total">${t('order.total')}</span>
              <strong><span data-cart-sum>0</span> <span class="text-sm font-semibold text-white/60" data-i18n="menu.currency">${t('menu.currency')}</span></strong>
            </div>
          </div>

          <fieldset class="mt-7">
            <legend class="field-label" data-i18n="order.typeLabel">${t('order.typeLabel')}</legend>
            <div class="seg">
              <label class="seg-opt"><input type="radio" name="type" value="pickup" checked class="sr-only"><span>${icon('bag', 'size-[1.1rem]')}${T('order.pickup')}</span></label>
              <label class="seg-opt"><input type="radio" name="type" value="delivery" class="sr-only"><span>${icon('navigation', 'size-[1.1rem]')}${T('order.delivery')}</span></label>
            </div>
          </fieldset>

          <div class="mt-6 grid gap-5 sm:grid-cols-2">
            ${field({ id: 'name', label: 'order.name', ph: 'order.namePh', autocomplete: 'name', maxlength: 80 })}
            ${field({ id: 'phone', type: 'tel', label: 'order.phone', ph: 'order.phonePh', autocomplete: 'tel', inputmode: 'tel', maxlength: 24 })}
          </div>

          <div class="expander" data-address-wrap data-open="false" inert>
            <div><div class="pt-5">
              ${field({ id: 'address', label: 'order.address', ph: 'order.addressPh', autocomplete: 'street-address', maxlength: 200 })}
            </div></div>
          </div>

          <div class="mt-5">
            ${field({ id: 'details', label: 'order.details', ph: 'order.detailsPh', rows: 4, maxlength: 1000, hint: 'order.detailsHint' })}
          </div>

          <div class="hp" aria-hidden="true">
            <label for="f-company">Company</label>
            <input type="text" id="f-company" name="company" tabindex="-1" autocomplete="off">
          </div>

          <button type="submit" class="btn btn-oak btn-lg mt-7 w-full" data-submit>
            <span class="btn-spinner" aria-hidden="true"></span>
            <span data-submit-label data-i18n="order.submit">${t('order.submit')}</span>
            ${icon('send', 'size-[1.1rem] submit-icon')}
          </button>
          <p class="mt-4 flex items-center justify-center gap-2 text-center text-xs text-white/50">${icon('lock', 'size-3.5 shrink-0')}${T('order.privacy')}</p>
        </form>
      </div>

      <div class="lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:self-start">
        <div class="talk-card reveal">
          <p class="font-display text-lg font-bold tracking-tight" data-i18n="order.talk">${t('order.talk')}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <a href="${tel}" class="btn btn-glass btn-sm">${icon('phone', 'size-4')}${T('order.call')}</a>
            <a href="${wa('wa.text')}" data-wa="wa.text" target="_blank" rel="noopener" class="btn btn-glass btn-sm">${icon('whatsapp', 'size-4')}WhatsApp</a>
            <a href="${site.wolt}" target="_blank" rel="noopener" class="btn btn-glass btn-sm">${icon('bag', 'size-4')}${T('order.wolt')}</a>
          </div>
          <a href="${tel}" class="mt-5 inline-block font-display text-2xl font-bold tracking-tight text-oak-200 tabular-nums hover:text-oak-100">${site.phoneDisplay}</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ VISIT ============ -->
  <section id="visit" class="relative py-24 sm:py-32" aria-labelledby="visit-title">
    <div class="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12">
      <div class="lg:col-span-5">
        <p class="eyebrow reveal">${T('visit.eyebrow')}</p>
        <h2 id="visit-title" class="section-title reveal" data-i18n="visit.title">${t('visit.title')}</h2>
        <p class="reveal mt-5 text-lg/relaxed text-char-600" data-i18n="visit.subtitle">${t('visit.subtitle')}</p>

        <div class="mt-10 grid gap-4">
          <div class="info-card reveal">
            <span class="info-icon">${icon('mapPin', 'size-[1.35rem]')}</span>
            <div class="min-w-0 flex-1">
              <h3 class="info-title" data-i18n="visit.address">${t('visit.address')}</h3>
              <address class="mt-1 not-italic text-char-700">Another Level · ${site.address.plusCode}<br>${site.address.postalCode} Sarandë, ${T('visit.country')}</address>
              <div class="mt-4 flex flex-wrap gap-2">
                <a href="${site.directionsUrl}" target="_blank" rel="noopener" class="btn btn-dark btn-sm">${icon('navigation', 'size-4')}${T('visit.directions')}</a>
                <a href="${site.mapsUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm">${T('visit.openMaps')}${icon('arrowUpRight', 'size-4')}</a>
              </div>
            </div>
          </div>
          <div class="info-card reveal">
            <span class="info-icon">${icon('clock', 'size-[1.35rem]')}</span>
            <div class="min-w-0 flex-1">
              <h3 class="info-title" data-i18n="visit.hours">${t('visit.hours')}</h3>
              <p class="mt-1 flex items-baseline justify-between gap-4 text-char-700"><span data-i18n="visit.everyday">${t('visit.everyday')}</span><span class="font-display text-lg font-bold tabular-nums text-char-900">${hoursText}</span></p>
              <p class="status-pill mt-3"><span class="status-dot" data-status-dot></span><span data-open-status>${t('visit.everyday')} ${hoursText}</span></p>
            </div>
          </div>
          <div class="info-card reveal">
            <span class="info-icon">${icon('phone', 'size-[1.35rem]')}</span>
            <div class="min-w-0 flex-1">
              <h3 class="info-title" data-i18n="visit.contact">${t('visit.contact')}</h3>
              <a href="${tel}" class="mt-1 inline-block font-display text-xl font-bold tracking-tight tabular-nums text-char-900 hover:text-oak-700">${site.phoneDisplay}</a>
              <div class="mt-4 flex flex-wrap items-center gap-2">
                <a href="${wa('wa.text')}" data-wa="wa.text" target="_blank" rel="noopener" class="btn btn-outline btn-sm">${icon('whatsapp', 'size-4')}WhatsApp</a>
                <a href="${site.instagram}" target="_blank" rel="noopener" class="icon-btn" aria-label="Instagram">${icon('instagram', 'size-5')}</a>
                <a href="${site.facebook}" target="_blank" rel="noopener" class="icon-btn" aria-label="Facebook">${icon('facebook', 'size-5')}</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="reveal lg:col-span-7">
        <div class="map-frame" data-map>
          ${picture('exterior', IMG.exterior, { sizes: '(min-width: 1024px) 55vw, 100vw', alt: d['img.hero'], altKey: 'img.hero', imgClass: 'map-photo' })}
          <div class="map-overlay">
            <span class="map-pin">${icon('mapPin', 'size-7')}</span>
            <p class="mt-5 font-display text-3xl font-extrabold tracking-tight">Another Level</p>
            <p class="mt-1 text-white/70">${site.address.plusCode} · Sarandë</p>
            <div class="mt-7 flex flex-wrap justify-center gap-2">
              <button type="button" class="btn btn-oak btn-sm" data-map-load>${icon('map', 'size-4')}${T('visit.showMap')}</button>
              <a href="${site.mapsUrl}" target="_blank" rel="noopener" class="btn btn-glass btn-sm">${T('visit.openMaps')}${icon('arrowUpRight', 'size-4')}</a>
            </div>
            <p class="mt-5 max-w-xs text-xs text-white/50" data-i18n="visit.mapNote">${t('visit.mapNote')}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

<footer class="relative overflow-hidden bg-char-950 pb-32 pt-20 text-white/70 md:pb-12">
  <div class="mx-auto max-w-7xl px-5 sm:px-8">
    <div class="grid gap-12 md:grid-cols-12">
      <div class="md:col-span-5">
        <a href="#top" class="inline-flex items-center gap-4 text-white" aria-label="${t('a11y.home')}" data-i18n-attr="aria-label:a11y.home">${sealSvg({ cls: 'footer-seal size-24 shrink-0', id: 'seal-footer', spin: true })}<span><span class="block font-display text-3xl font-extrabold tracking-tight">Another <span class="text-oak-300">Level</span></span><span class="mt-1 block text-xs font-bold uppercase tracking-[0.2em] text-white/50">Pizzeria · Fast Food</span></span></a>
        <p class="mt-5 max-w-sm" data-i18n="footer.tagline">${t('footer.tagline')}</p>
        <div class="mt-6 flex gap-2">
          <a href="${site.instagram}" target="_blank" rel="noopener" class="social-btn" aria-label="Instagram">${icon('instagram', 'size-5')}</a>
          <a href="${site.facebook}" target="_blank" rel="noopener" class="social-btn" aria-label="Facebook">${icon('facebook', 'size-5')}</a>
          <a href="${wa('wa.text')}" data-wa="wa.text" target="_blank" rel="noopener" class="social-btn" aria-label="WhatsApp">${icon('whatsapp', 'size-5')}</a>
          <a href="${site.mapsUrl}" target="_blank" rel="noopener" class="social-btn" aria-label="Google Maps">${icon('mapPin', 'size-5')}</a>
        </div>
      </div>
      <nav class="md:col-span-3" aria-label="${t('footer.explore')}" data-i18n-attr="aria-label:footer.explore">
        <h2 class="footer-heading" data-i18n="footer.explore">${t('footer.explore')}</h2>
        <ul class="mt-4 space-y-1" role="list">
          ${navLinks.map(([id, key]) => `<li><a href="#${id}" class="footer-link">${T(key)}</a></li>`).join('')}
        </ul>
      </nav>
      <div class="md:col-span-4">
        <h2 class="footer-heading" data-i18n="visit.hours">${t('visit.hours')}</h2>
        <p class="mt-4 flex items-baseline justify-between gap-4 border-b border-white/10 pb-3"><span data-i18n="visit.everyday">${t('visit.everyday')}</span><span class="font-semibold tabular-nums text-white">${hoursText}</span></p>
        <p class="mt-3"><a href="${tel}" class="footer-link tabular-nums">${icon('phone', 'size-4')}${site.phoneDisplay}</a></p>
        <p><a href="${site.mapsUrl}" target="_blank" rel="noopener" class="footer-link">${icon('mapPin', 'size-4')}<span>Sarandë, <span data-i18n="visit.country">${t('visit.country')}</span></span></a></p>
      </div>
    </div>

    <p class="footer-word" aria-hidden="true">Another Level</p>

    <div class="flex flex-col gap-5 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p>© <span data-year>${buildYear}</span> Another Level · Sarandë. <span data-i18n="footer.rights">${t('footer.rights')}</span></p>
      <ul class="flex items-center gap-1" role="list">
        ${LANGS.map(
          (l) =>
            `<li><a href="${LANG_META[l].path}" hreflang="${l}" lang="${l}" data-lang-option="${l}" class="footer-lang"${l === lang ? ' aria-current="true"' : ''}>${LANG_META[l].label}</a></li>`,
        ).join('')}
      </ul>
      <a href="#top" class="footer-link">${T('footer.top')}${icon('arrowUp', 'size-4')}</a>
    </div>
  </div>
</footer>

<nav class="bottom-bar md:hidden" aria-label="${t('a11y.quickActions')}" data-i18n-attr="aria-label:a11y.quickActions" data-bottom-bar data-hidden="false">
  <div class="bottom-bar-inner">
    <a href="${tel}" class="bar-btn">${icon('phone', 'size-5')}${T('bar.call')}</a>
    <a href="${wa('wa.text')}" data-wa="wa.text" target="_blank" rel="noopener" class="bar-btn">${icon('whatsapp', 'size-5')}${T('bar.whatsapp')}</a>
    <a href="#order" class="bar-btn bar-btn-primary">${icon('bag', 'size-5')}${T('bar.order')}<span class="cart-badge" data-cart-count hidden>0</span></a>
  </div>
</nav>

<div class="toasts" data-toasts aria-live="polite"></div>
<p class="sr-only" aria-live="polite" data-sr-live></p>

<template id="tpl-cart-row">
  <li class="cart-row">
    <div class="min-w-0 flex-1">
      <p class="cart-name"></p>
      <p class="cart-unit"></p>
    </div>
    <div class="stepper stepper-dark">
      <button type="button" class="step-btn" data-dec></button>
      <span class="step-count"></span>
      <button type="button" class="step-btn" data-inc></button>
    </div>
    <p class="cart-line"></p>
  </li>
</template>
<template id="tpl-icons">
  <span data-icon="plus">${icon('plus', 'size-4')}</span>
  <span data-icon="minus">${icon('minus', 'size-4')}</span>
  <span data-icon="success">${icon('checkCircle', 'size-5')}</span>
  <span data-icon="error">${icon('alert', 'size-5')}</span>
  <span data-icon="close">${icon('x', 'size-4')}</span>
  <span data-icon="globe">${icon('globe', 'size-5')}</span>
</template>
</body>
</html>`;
}

export function renderNotFound({ assets }) {
  return `<!doctype html>
<html lang="sq">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>404 · Another Level</title>
<meta name="robots" content="noindex">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${assets.css}">
</head>
<body class="grid min-h-svh place-items-center bg-char-950 px-6 text-center text-white">
  <main>
    ${sealSvg({ cls: 'mx-auto size-32', id: 'seal-404', spin: true })}
    <p class="mt-8 font-display text-8xl font-extrabold tracking-tight text-oak-300">404</p>
    <p class="mt-4 text-lg text-white/70">Faqja nuk u gjet · Page not found · Pagina non trovata</p>
    <div class="mt-8 flex flex-wrap justify-center gap-2">
      <a href="/" class="btn btn-oak btn-sm">Shqip</a>
      <a href="/en/" class="btn btn-glass btn-sm">English</a>
      <a href="/it/" class="btn btn-glass btn-sm">Italiano</a>
    </div>
  </main>
</body>
</html>`;
}
