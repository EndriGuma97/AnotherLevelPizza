/* Another Level — client runtime
   - i18n: instant AL / EN / IT switching (no reload) with URL + meta tags kept in sync
   - menu → cart → order form (posts to the Resend-backed API)
   - scroll reveals, nav states, mobile menu, live opening status */

const AL = window.__AL__;
const root = document.documentElement;
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const store = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable (private mode) — not critical */
    }
  },
};

let lang = AL.dict[root.lang] ? root.lang : 'sq';

function t(key, vars) {
  let s = AL.dict[lang]?.[key] ?? AL.dict.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v);
  return s;
}
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, AL.meta[lang].group);
const waLink = (key) => `https://wa.me/${AL.site.whatsapp}?text=${encodeURIComponent(t(key))}`;
const langFromPath = (path) => (path.startsWith('/en') ? 'en' : path.startsWith('/it') ? 'it' : 'sq');
const iconTpl = (name) => document.getElementById('tpl-icons').content.querySelector(`[data-icon="${name}"] svg`).cloneNode(true);

/* =========================================================================
   i18n
   ========================================================================= */
function translateDom() {
  for (const el of $$('[data-i18n]')) {
    const value = t(el.dataset.i18n);
    if (el.textContent !== value) el.textContent = value;
  }
  for (const el of $$('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      el.setAttribute(attr, t(key));
    }
  }
  for (const el of $$('[data-prices]')) {
    el.textContent = el.dataset.prices.split('|').map(Number).map(fmt).join(el.dataset.sep || '');
  }
  for (const el of $$('[data-wa]')) el.href = waLink(el.dataset.wa);
  for (const btn of $$('[data-add]')) btn.setAttribute('aria-label', `${t('menu.add')}: ${t(`item.${btn.dataset.add}.name`)}`);
  const langInput = $('[data-lang-input]');
  if (langInput) langInput.value = lang;
}

function applyMeta() {
  const meta = AL.meta[lang];
  const canonical = $('link[rel="canonical"]');
  const origin = canonical ? new URL(canonical.href).origin : location.origin;
  const url = origin + meta.path;
  root.lang = lang;
  root.dataset.lang = lang;
  document.title = t('meta.title');
  const set = (sel, attr, value) => $(sel)?.setAttribute(attr, value);
  set('meta[name="description"]', 'content', t('meta.description'));
  set('meta[property="og:title"]', 'content', t('meta.title'));
  set('meta[property="og:description"]', 'content', t('meta.description'));
  set('meta[property="og:url"]', 'content', url);
  set('meta[property="og:locale"]', 'content', meta.ogLocale);
  set('meta[property="og:image:alt"]', 'content', t('meta.ogAlt'));
  set('meta[name="twitter:title"]', 'content', t('meta.title'));
  set('meta[name="twitter:description"]', 'content', t('meta.description'));
  canonical?.setAttribute('href', url);
}

function syncLangControls() {
  for (const a of $$('[data-lang-option]')) {
    if (a.dataset.langOption === lang) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  }
  const label = $('[data-lang-label]');
  if (label) label.textContent = AL.meta[lang].label;
}

async function setLanguage(next, { push = true } = {}) {
  if (!AL.dict[next] || next === lang) return;
  const animate = !reduceMotion.matches;
  if (animate) {
    root.classList.add('lang-switching');
    await wait(180);
  }
  lang = next;
  try {
    applyMeta();
    translateDom();
    syncLangControls();
    renderCart();
    updateOpenStatus();
    retranslateErrors();
    if (push) history.pushState({ lang }, '', AL.meta[lang].path + location.hash);
    store.set('al-lang', lang);
  } finally {
    requestAnimationFrame(() => root.classList.remove('lang-switching'));
  }
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-lang-option]');
  if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  e.preventDefault();
  closeLangMenu({ restoreFocus: false });
  if (menuOpen) setMenu(false);
  dismissHint();
  setLanguage(link.dataset.langOption);
});

window.addEventListener('popstate', () => setLanguage(langFromPath(location.pathname), { push: false }));

/* ---------- Language dropdown ---------- */
const langToggle = $('[data-lang-toggle]');
const langMenu = $('[data-lang-menu]');
let langOpen = false;

function openLangMenu() {
  langOpen = true;
  langMenu.dataset.open = 'true';
  langToggle.setAttribute('aria-expanded', 'true');
  setNavHidden(false);
}
function closeLangMenu({ restoreFocus = true } = {}) {
  if (!langOpen) return;
  langOpen = false;
  langMenu.dataset.open = 'false';
  langToggle.setAttribute('aria-expanded', 'false');
  if (restoreFocus && langMenu.contains(document.activeElement)) langToggle.focus();
}

langToggle?.addEventListener('click', () => (langOpen ? closeLangMenu() : openLangMenu()));
langToggle?.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    openLangMenu();
    ($('[aria-current="true"]', langMenu) || $('a', langMenu)).focus();
  }
});
langMenu?.addEventListener('keydown', (e) => {
  const items = $$('a', langMenu);
  const i = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const next = (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next].focus();
  } else if (e.key === 'Escape') {
    closeLangMenu();
  }
});
document.addEventListener('click', (e) => {
  if (langOpen && !e.target.closest('[data-lang-switcher]')) closeLangMenu({ restoreFocus: false });
});
document.addEventListener('focusin', (e) => {
  if (langOpen && !e.target.closest('[data-lang-switcher]')) closeLangMenu({ restoreFocus: false });
});

/* ---------- "Also available in …" suggestion for tourists ---------- */
let hintEl = null;
function maybeSuggestLanguage() {
  if (store.get('al-lang') || store.get('al-hint')) return;
  const prefs = (navigator.languages?.length ? navigator.languages : [navigator.language || 'en']).map((l) =>
    l.slice(0, 2).toLowerCase(),
  );
  const suggested = prefs.find((l) => AL.dict[l]) || 'en';
  if (suggested === lang) return;
  const strings = AL.dict[suggested];
  hintEl = document.createElement('div');
  hintEl.className = 'lang-hint';
  hintEl.lang = suggested;
  hintEl.setAttribute('role', 'region');
  hintEl.setAttribute('aria-label', strings['nav.language']);
  const globe = iconTpl('globe');
  globe.classList.add('shrink-0', 'text-oak-700');
  const text = document.createElement('p');
  text.className = 'flex-1 text-sm font-medium leading-snug';
  text.textContent = strings['hint.offer'];
  const go = document.createElement('a');
  go.href = AL.meta[suggested].path;
  go.dataset.langOption = suggested;
  go.className = 'btn btn-dark btn-sm';
  go.textContent = strings['hint.switch'];
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'toast-close';
  close.setAttribute('aria-label', strings['a11y.close']);
  close.append(iconTpl('close'));
  close.addEventListener('click', () => {
    store.set('al-hint', '1');
    dismissHint();
  });
  hintEl.append(globe, text, go, close);
  setTimeout(() => hintEl && document.body.append(hintEl), 1400);
}
function dismissHint() {
  if (!hintEl) return;
  const el = hintEl;
  hintEl = null;
  if (!el.isConnected) return;
  el.dataset.leaving = '';
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

/* =========================================================================
   Header: theme over hero, hide on scroll down, active section
   ========================================================================= */
const header = $('#site-header');
const hero = $('#top');
const bottomBar = $('[data-bottom-bar]');
let lastY = window.scrollY;
let ticking = false;
let navHidden = false;

function setNavHidden(hidden) {
  if (hidden === navHidden) return;
  navHidden = hidden;
  header.dataset.hidden = String(hidden);
  root.dataset.navHidden = String(hidden);
}

function updateHeaderTheme() {
  const overHero = hero.getBoundingClientRect().bottom > 76;
  header.dataset.theme = menuOpen || overHero ? 'hero' : 'light';
}

const parallaxEls = reduceMotion.matches ? [] : $$('[data-parallax]');
function updateParallax() {
  const vh = window.innerHeight;
  for (const el of parallaxEls) {
    const rect = el.getBoundingClientRect();
    if (rect.bottom < -100 || rect.top > vh + 100) continue;
    const offset = (rect.top + rect.height / 2 - vh / 2) * Number(el.dataset.parallax);
    const img = $('img', el);
    if (img) img.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.1)`;
  }
}

function onScroll() {
  ticking = false;
  const y = window.scrollY;
  updateHeaderTheme();
  if (!menuOpen && !langOpen) {
    if (y > lastY + 6 && y > window.innerHeight * 0.7) setNavHidden(true);
    else if (y < lastY - 6 || y < 120) setNavHidden(false);
  }
  lastY = y;
  updateParallax();
}
window.addEventListener(
  'scroll',
  () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  },
  { passive: true },
);
window.addEventListener('resize', () => requestAnimationFrame(onScroll), { passive: true });

// Highlight the nav link of the section in view.
const spyLinks = $$('[data-spy-link]');
const sectionSpy = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const a of spyLinks) {
        if (a.dataset.spyLink === entry.target.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      }
    }
  },
  { rootMargin: '-45% 0px -50% 0px' },
);
for (const id of ['about', 'menu', 'order', 'visit']) {
  const el = document.getElementById(id);
  if (el) sectionSpy.observe(el);
}
new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) spyLinks.forEach((a) => a.removeAttribute('aria-current'));
}, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);

/* =========================================================================
   Mobile menu
   ========================================================================= */
const burger = $('[data-menu-toggle]');
const mobileMenu = $('#mobile-menu');
let menuOpen = false;

function setMenu(open) {
  menuOpen = open;
  mobileMenu.dataset.open = String(open);
  mobileMenu.inert = !open;
  burger.setAttribute('aria-expanded', String(open));
  const labelKey = open ? 'nav.closeMenu' : 'nav.openMenu';
  burger.dataset.i18nAttr = `aria-label:${labelKey}`;
  burger.setAttribute('aria-label', t(labelKey));
  root.classList.toggle('menu-open', open);
  bottomBar.dataset.hidden = String(open);
  setNavHidden(false);
  updateHeaderTheme();
  if (open) setTimeout(() => $('.mm-link', mobileMenu)?.focus({ preventScroll: true }), 350);
}

burger?.addEventListener('click', () => setMenu(!menuOpen));
mobileMenu?.addEventListener('click', (e) => {
  if (e.target.closest('[data-mm-link]')) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menuOpen) {
    setMenu(false);
    burger.focus();
  }
  // Keep keyboard focus inside the open menu (burger + menu items).
  if (e.key === 'Tab' && menuOpen) {
    const focusables = [burger, ...$$('a, button', mobileMenu)];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => e.matches && menuOpen && setMenu(false));

/* =========================================================================
   Scroll reveal (staggered per batch) & hero intro clean-up
   ========================================================================= */
function initReveal() {
  const els = $$('.reveal');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.remove('reveal'));
    return;
  }
  const done = (el) => (e) => {
    if (e.target !== el || e.propertyName !== 'transform') return;
    el.classList.remove('reveal', 'is-visible');
    el.style.removeProperty('--reveal-delay');
  };
  const io = new IntersectionObserver(
    (entries) => {
      const batch = entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target)
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      batch.forEach((el, i) => {
        io.unobserve(el);
        el.style.setProperty('--reveal-delay', `${Math.min(i, 6) * 80}ms`);
        el.addEventListener('transitionend', done(el));
        el.classList.add('is-visible');
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  els.forEach((el) => io.observe(el));
}

for (const el of $$('.hero-in')) {
  el.addEventListener('animationend', (e) => e.target === el && el.classList.remove('hero-in'));
}

/* =========================================================================
   Menu category tabs (scroll-spy)
   ========================================================================= */
const tabBar = $('[data-menu-tabs]');
const tabs = $$('[data-tab]');
function setActiveTab(id) {
  let active;
  for (const tab of tabs) {
    if (tab.dataset.tab === id) {
      tab.setAttribute('aria-current', 'true');
      active = tab;
    } else tab.removeAttribute('aria-current');
  }
  if (active && tabBar.scrollWidth > tabBar.clientWidth) {
    const left = active.offsetLeft - (tabBar.clientWidth - active.offsetWidth) / 2;
    tabBar.scrollTo({ left, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  }
}
const catSpy = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) if (entry.isIntersecting) setActiveTab(entry.target.dataset.cat);
  },
  { rootMargin: '-30% 0px -65% 0px' },
);
$$('[data-cat]').forEach((el) => catSpy.observe(el));
// Above the first category (menu intro in view) → first tab is active again.
const firstCat = $('[data-cat]');
if (firstCat) {
  new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting || entry.boundingClientRect.top > 0) {
        if (firstCat.getBoundingClientRect().top > window.innerHeight * 0.3) setActiveTab(firstCat.dataset.cat);
      }
    },
    { rootMargin: '0px 0px -60% 0px' },
  ).observe($('#menu-title'));
}

/* =========================================================================
   Cart
   ========================================================================= */
const MAX_QTY = 20;
const cart = new Map();
try {
  for (const [id, qty] of JSON.parse(store.get('al-cart') || '[]')) {
    if (AL.menu[id] && Number.isInteger(qty) && qty > 0) cart.set(id, Math.min(qty, MAX_QTY));
  }
} catch {
  /* ignore corrupt storage */
}

const cartCount = () => [...cart.values()].reduce((a, b) => a + b, 0);
const cartSum = () => [...cart].reduce((sum, [id, qty]) => sum + AL.menu[id] * qty, 0);
const srLive = $('[data-sr-live]');

function setQty(id, qty, { announce = false } = {}) {
  if (!AL.menu[id]) return;
  const before = cart.get(id) || 0;
  qty = Math.max(0, Math.min(MAX_QTY, qty));
  if (qty === before) return;
  if (qty) cart.set(id, qty);
  else cart.delete(id);
  store.set('al-cart', JSON.stringify([...cart]));
  requestId = null;
  syncCart({ bump: qty > before });
  if (announce && srLive) srLive.textContent = `${t(`item.${id}.name`)} — ${t('order.added')}`;
}

function syncCart({ bump = false } = {}) {
  for (const card of $$('[data-item]')) {
    const qty = cart.get(card.dataset.item) || 0;
    card.classList.toggle('in-cart', qty > 0);
    const out = $('[data-count-for]', card);
    if (out) out.textContent = qty;
  }
  const count = cartCount();
  for (const badge of $$('[data-cart-count]')) {
    badge.textContent = count;
    badge.hidden = count === 0;
    if (bump && count) {
      badge.classList.remove('bump');
      void badge.offsetWidth;
      badge.classList.add('bump');
    }
  }
  renderCart();
}

function renderCart() {
  const list = $('[data-cart-list]');
  if (!list) return;
  const entries = [...cart];
  const has = entries.length > 0;
  $('[data-cart]').classList.toggle('has-items', has);
  $('[data-cart-empty]').hidden = has;
  $('[data-cart-total]').hidden = !has;
  $('[data-cart-clear]').hidden = !has;
  const label = $('[data-cart-label]');
  const count = cartCount();
  label.hidden = !has;
  label.textContent = count === 1 ? t('order.item1') : t('order.itemN', { n: count });
  $('[data-cart-sum]').textContent = fmt(cartSum());

  const tpl = $('#tpl-cart-row');
  list.replaceChildren(
    ...entries.map(([id, qty]) => {
      const row = tpl.content.firstElementChild.cloneNode(true);
      $('.cart-name', row).textContent = t(`item.${id}.name`);
      $('.cart-unit', row).textContent = `${fmt(AL.menu[id])} ${t('menu.currency')}`;
      $('.step-count', row).textContent = qty;
      $('.cart-line', row).textContent = fmt(AL.menu[id] * qty);
      const dec = $('[data-dec]', row);
      const inc = $('[data-inc]', row);
      dec.dataset.dec = id;
      inc.dataset.inc = id;
      dec.setAttribute('aria-label', `${t('a11y.decrease')}: ${t(`item.${id}.name`)}`);
      inc.setAttribute('aria-label', `${t('a11y.increase')}: ${t(`item.${id}.name`)}`);
      dec.append(iconTpl('minus'));
      inc.append(iconTpl('plus'));
      return row;
    }),
  );
}

document.addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  if (add) return setQty(add.dataset.add, (cart.get(add.dataset.add) || 0) + 1, { announce: true });
  const inc = e.target.closest('[data-inc]');
  if (inc) return setQty(inc.dataset.inc, (cart.get(inc.dataset.inc) || 0) + 1);
  const dec = e.target.closest('[data-dec]');
  if (dec) return setQty(dec.dataset.dec, (cart.get(dec.dataset.dec) || 0) - 1);
  if (e.target.closest('[data-cart-clear]')) {
    cart.clear();
    store.set('al-cart', '[]');
    requestId = null;
    syncCart();
  }
});

/* =========================================================================
   Order form
   ========================================================================= */
const form = $('[data-order-form]');
const submitBtn = $('[data-submit]');
const addressWrap = $('[data-address-wrap]');
const apiBase = ($('meta[name="al:api"]')?.content || '').replace(/\/$/, '');
let submitting = false;
let requestId = null; // idempotency key: stays the same while the order is unchanged

const digits = (s) => s.replace(/\D/g, '');

function orderType() {
  return form.elements.type.value === 'delivery' ? 'delivery' : 'pickup';
}

function syncAddress() {
  const open = orderType() === 'delivery';
  addressWrap.dataset.open = String(open);
  addressWrap.inert = !open;
  if (!open) setFieldError('address', null);
}
form?.addEventListener('change', (e) => {
  if (e.target.name === 'type') syncAddress();
});
form?.addEventListener('input', (e) => {
  requestId = null;
  if (e.target.name) setFieldError(e.target.name, null);
});

function collect() {
  const f = form.elements;
  return {
    name: f.name.value.trim(),
    phone: f.phone.value.trim(),
    type: orderType(),
    address: f.address.value.trim(),
    details: f.details.value.trim(),
    items: [...cart].map(([id, qty]) => ({ id, qty })),
    lang,
    company: f.company.value,
  };
}

function validate(data) {
  const errors = {};
  if (data.name.length < 2) errors.name = 'err.name';
  const n = digits(data.phone).length;
  if (n < 7 || n > 15 || !/^[+\d\s().\-/]+$/.test(data.phone)) errors.phone = 'err.phone';
  if (data.type === 'delivery' && data.address.length < 5) errors.address = 'err.address';
  if (!data.items.length && data.details.length < 3) errors.details = 'err.details';
  return errors;
}

function setFieldError(field, key) {
  const input = form?.elements[field];
  const out = $(`[data-error-for="${field}"]`);
  if (!input || !out) return;
  if (key) {
    input.setAttribute('aria-invalid', 'true');
    out.dataset.key = key;
    out.textContent = t(key);
    out.hidden = false;
  } else {
    input.removeAttribute('aria-invalid');
    out.hidden = true;
    out.textContent = '';
    delete out.dataset.key;
  }
}
function retranslateErrors() {
  // Re-translate visible errors instead of dropping them on language change.
  for (const out of $$('[data-error-for]')) if (out.dataset.key) out.textContent = t(out.dataset.key);
}
function showErrors(errors) {
  for (const field of ['name', 'phone', 'address', 'details']) setFieldError(field, errors[field] || null);
  const first = ['name', 'phone', 'address', 'details'].find((f) => errors[f]);
  if (first) form.elements[first].focus({ preventScroll: false });
}

function setLoading(on) {
  submitting = on;
  submitBtn.dataset.loading = String(on);
  submitBtn.setAttribute('aria-busy', String(on));
  const label = $('[data-submit-label]', submitBtn);
  label.dataset.i18n = on ? 'order.sending' : 'order.submit';
  label.textContent = t(label.dataset.i18n);
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (submitting) return;
  const data = collect();
  const errors = validate(data);
  showErrors(errors);
  if (Object.keys(errors).length) {
    toast('error', t('toast.invalid'));
    return;
  }
  requestId ||= crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  setLoading(true);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(`${apiBase}/api/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...data, requestId }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.ok) {
      toast('success', t('toast.success'), 8000);
      form.reset();
      syncAddress();
      cart.clear();
      store.set('al-cart', '[]');
      requestId = null;
      syncCart();
    } else if (res.status === 429) {
      toast('error', t('toast.rate'));
    } else if (res.status === 400 && body.errors) {
      const mapped = Object.fromEntries(Object.entries(body.errors).map(([f]) => [f, `err.${f === 'items' ? 'details' : f}`]));
      showErrors(mapped);
      toast('error', t('toast.invalid'));
    } else {
      toast('error', t('toast.error'));
    }
  } catch {
    toast('error', t('toast.error'));
  } finally {
    setLoading(false);
  }
});

/* =========================================================================
   Toasts
   ========================================================================= */
const toastRoot = $('[data-toasts]');
function toast(type, message, duration = 5500) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.dataset.type = type;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  const ic = document.createElement('span');
  ic.className = 'toast-icon';
  ic.append(iconTpl(type === 'error' ? 'error' : 'success'));
  const msg = document.createElement('p');
  msg.className = 'toast-msg';
  msg.textContent = message;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'toast-close';
  close.setAttribute('aria-label', t('a11y.close'));
  close.append(iconTpl('close'));
  const remove = () => {
    if (el.dataset.leaving !== undefined) return;
    el.dataset.leaving = '';
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 600);
  };
  close.addEventListener('click', remove);
  el.append(ic, msg, close);
  toastRoot.append(el);
  setTimeout(remove, duration);
}

/* =========================================================================
   Opening status (Europe/Tirane), map facade, misc
   ========================================================================= */
function updateOpenStatus() {
  const { opens, closes } = AL.site.hours;
  const toMin = (s) => {
    const [h, m] = s.split(':').map(Number);
    return h * 60 + m;
  };
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: AL.site.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const now = Number(parts.find((p) => p.type === 'hour').value) * 60 + Number(parts.find((p) => p.type === 'minute').value);
  const o = toMin(opens);
  const c = toMin(closes);
  const open = o < c ? now >= o && now < c : now >= o || now < c;
  const text = open
    ? `${t('status.open')} · ${t('status.closesAt', { time: closes })}`
    : `${t('status.closed')} · ${t('status.opensAt', { time: opens })}`;
  $$('[data-open-status]').forEach((el) => (el.textContent = text));
  $$('[data-status-dot]').forEach((el) => (el.dataset.open = String(open)));
}

$('[data-map-load]')?.addEventListener('click', () => {
  const frame = $('[data-map]');
  if (frame.dataset.loaded) return;
  const iframe = document.createElement('iframe');
  iframe.src = AL.site.mapsEmbed;
  iframe.title = t('visit.mapTitle');
  iframe.dataset.i18nAttr = 'title:visit.mapTitle';
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allowFullscreen = true;
  iframe.className = 'map-iframe';
  frame.append(iframe);
  frame.dataset.loaded = 'true';
});

// Hide the bottom bar while typing (mobile keyboards push fixed elements around).
document.addEventListener('focusin', (e) => {
  if (e.target.matches('input, textarea, select')) bottomBar.dataset.hidden = 'true';
});
document.addEventListener('focusout', () => {
  setTimeout(() => {
    if (!document.activeElement?.matches('input, textarea, select')) bottomBar.dataset.hidden = String(menuOpen);
  }, 60);
});

// Result of the no-JavaScript form fallback (?order=ok|error).
const params = new URLSearchParams(location.search);
if (params.has('order')) {
  toast(params.get('order') === 'ok' ? 'success' : 'error', t(params.get('order') === 'ok' ? 'toast.success' : 'toast.error'), 8000);
  params.delete('order');
  const qs = params.toString();
  history.replaceState(history.state, '', location.pathname + (qs ? `?${qs}` : '') + location.hash);
}

$$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

/* ---------- boot ---------- */
history.replaceState({ lang }, '');
syncAddress();
syncCart();
updateOpenStatus();
setInterval(updateOpenStatus, 60_000);
initReveal();
onScroll();
maybeSuggestLanguage();
