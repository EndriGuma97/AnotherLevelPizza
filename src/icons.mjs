// Inline SVG icon set (24×24, stroke-based) so icons inherit colour and need no extra requests.
const paths = {
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  phone:
    '<path d="M5 4h3.2l1.6 4.2-2.1 1.3a11 11 0 0 0 6.8 6.8l1.3-2.1 4.2 1.6V19a1.8 1.8 0 0 1-1.9 1.8A16 16 0 0 1 3.2 5.9 1.8 1.8 0 0 1 5 4z"/>',
  whatsapp:
    '<path d="M3.6 20.4l1.3-4.3A8.6 8.6 0 1 1 8 19.2z"/><path d="M9 8.6c.2-.5.6-.6.9-.6h.5l1 2.3-.7.9a5.3 5.3 0 0 0 2.4 2.4l.9-.7 2.3 1v.5c0 .3-.1.7-.6.9-.6.3-1.6.4-3-.3a8 8 0 0 1-3.3-3.3C8.6 10.2 8.7 9.2 9 8.6z"/>',
  bag: '<path d="M5 8h14l-1.2 11.1a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowUpRight: '<path d="M7 17 17 7M8 7h9v9"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  mapPin: '<path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6" fill="currentColor"/>',
  facebook: '<path d="M14.5 8.5H17V5h-2.5A3.5 3.5 0 0 0 11 8.5V11H8.5v3.5H11V21h3.5v-6.5H17l.5-3.5h-3V9a.5.5 0 0 1 .5-.5z"/>',
  leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19c3-4 6-6.5 9.5-8"/>',
  flame: '<path d="M12 3c.5 3 4.5 5 4.5 10a4.5 4.5 0 0 1-9 0c0-2 .8-3.3 2-4.5.2 1.6 1 2.5 2 2.5 0-3-1-5.5.5-8z"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  sandwich:
    '<path d="M4 10.5a8 8 0 0 1 16 0z"/><path d="M3 14h18"/><path d="M4.5 17.5h15a.5.5 0 0 1 .5.5 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 .5.5 0 0 1 .5-.5z"/>',
  bowl: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8.5 7.5c0-1.4.9-1.6.9-3M12.5 7.5c0-1.4.9-1.6.9-3"/>',
  glass: '<path d="M6 3h12l-1.6 16.2a2 2 0 0 1-2 1.8H9.6a2 2 0 0 1-2-1.8z"/><path d="M6.6 9h10.8"/>',
  pizza: '<path d="M12 21 3.5 6.5a15 15 0 0 1 17 0z"/><path d="M5.3 9.6a12 12 0 0 1 13.4 0"/><circle cx="10" cy="12" r="1"/><circle cx="13.5" cy="15" r="1"/>',
  send: '<path d="M4 12 20 4l-5 16-3.5-6.5z"/><path d="m11.5 13.5 4-4"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16h.01"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.7L16 9.8"/>',
  navigation: '<path d="M3 11 21 3l-8 18-2-8z"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  map: '<path d="M9 4 3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
};

export function icon(name, cls = 'size-5') {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}

/* ---------- Brand ----------
   Illustrated pizza slice (crust, melted cheese, pepperoni, basil, olives),
   centred on (0,0) and ~66 units tall. Fixed brand colours so the same SVG
   works inline, as favicon and when rendered to PNG. */
const BRAND = { ink: '#111413', ink2: '#1b1f1e', oak: '#ddbd92', crust: '#bb8650', crustHi: '#ecd2a8', cheese: '#ecc477', cheeseHi: '#f6dca0', pep: '#9a4a2e', pepRim: '#7a3722', basil: '#90a274', olive: '#111413' };

const SLICE = `
  <path d="M-29-18Q0-39 29-18L26-11Q0-30-26-11Z" fill="${BRAND.crust}"/>
  <path d="M-23.5-20.5Q0-34 23.5-20.5" fill="none" stroke="${BRAND.crustHi}" stroke-width="1.4" stroke-linecap="round" opacity=".75"/>
  <path d="M-26-11Q0-30 26-11L2.6 31Q0 35.5-2.6 31Z" fill="${BRAND.cheese}"/>
  <path d="M-18.6 3.2q-2 7.6 1.2 8.6q2.8.6 2.3-6.2Z" fill="${BRAND.cheese}"/>
  <path d="M13.6 10.6q2.1 6.6-.8 7.6q-2.6.5-2-5.6Z" fill="${BRAND.cheese}"/>
  <path d="M-20-9.5Q0-24 20-9.5" fill="none" stroke="${BRAND.cheeseHi}" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>
  <circle cx="-9.5" cy="-10" r="5.4" fill="${BRAND.pep}" stroke="${BRAND.pepRim}" stroke-width=".9"/>
  <circle cx="9.5" cy="-7.5" r="4.8" fill="${BRAND.pep}" stroke="${BRAND.pepRim}" stroke-width=".9"/>
  <circle cx="-.5" cy="8.5" r="4.4" fill="${BRAND.pep}" stroke="${BRAND.pepRim}" stroke-width=".9"/>
  <circle cx=".2" cy="22" r="2.6" fill="${BRAND.pep}" stroke="${BRAND.pepRim}" stroke-width=".7"/>
  <circle cx="-11" cy="-11.2" r="1" fill="#c7745a"/><circle cx="8.3" cy="-8.8" r=".9" fill="#c7745a"/><circle cx="-1.6" cy="7.4" r=".9" fill="#c7745a"/>
  <ellipse cx="8.6" cy="3.2" rx="3.4" ry="1.6" transform="rotate(-32 8.6 3.2)" fill="${BRAND.basil}"/>
  <ellipse cx="-11.4" cy="2.4" rx="3.2" ry="1.5" transform="rotate(28 -11.4 2.4)" fill="${BRAND.basil}"/>
  <ellipse cx="1.5" cy="-17.5" rx="2.8" ry="1.3" transform="rotate(-8 1.5 -17.5)" fill="${BRAND.basil}"/>
  <circle cx="16.5" cy="-4" r="1.7" fill="none" stroke="${BRAND.olive}" stroke-width="1.5"/>
  <circle cx="-15.5" cy="-3.2" r="1.6" fill="none" stroke="${BRAND.olive}" stroke-width="1.5"/>
  <circle cx="-5" cy="16" r="1.4" fill="none" stroke="${BRAND.olive}" stroke-width="1.4"/>`;

// Compact emblem (favicon, app icons): slice inside a double oak ring.
export function emblemSvg({ cls = '', standalone = false } = {}) {
  const attrs = standalone
    ? 'xmlns="http://www.w3.org/2000/svg" width="120" height="120"'
    : `class="${cls}" aria-hidden="true" focusable="false"`;
  return `<svg ${attrs} viewBox="0 0 120 120"><circle cx="60" cy="60" r="59" fill="${BRAND.ink}"/><circle cx="60" cy="60" r="54.5" fill="none" stroke="${BRAND.oak}" stroke-width="3"/><circle cx="60" cy="60" r="48" fill="none" stroke="${BRAND.oak}" stroke-opacity=".5" stroke-width="1.6" stroke-dasharray=".1 4.7" stroke-linecap="round"/><g transform="translate(60 62.5) scale(1.07)">${SLICE}</g></svg>`;
}

// Full seal (footer, hero, 404): name set on a circular path around the slice.
export function sealSvg({ cls = '', id = 'seal', spin = false } = {}) {
  const text = 'ANOTHER LEVEL ✦ PIZZERIA &amp; FAST FOOD ✦ SARANDË ✦ ';
  return `<svg class="${cls}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
    <defs><path id="${id}-ring" d="M15 60a45 45 0 1 1 90 0a45 45 0 1 1-90 0"/></defs>
    <circle cx="60" cy="60" r="59.5" fill="${BRAND.ink}"/>
    <circle cx="60" cy="60" r="56.5" fill="none" stroke="${BRAND.oak}" stroke-width="1.6"/>
    <g class="${spin ? 'seal-spin' : ''}">
      <text font-family="Bricolage Grotesque Variable, Inter Variable, Arial, sans-serif" font-size="8.4" font-weight="800" fill="${BRAND.oak}"><textPath href="#${id}-ring" textLength="281" lengthAdjust="spacing">${text}</textPath></text>
    </g>
    <circle cx="60" cy="60" r="35" fill="${BRAND.ink2}" stroke="${BRAND.oak}" stroke-opacity=".55" stroke-width="1.2"/>
    <circle cx="60" cy="60" r="31" fill="none" stroke="${BRAND.oak}" stroke-opacity=".35" stroke-width="1" stroke-dasharray=".1 3.6" stroke-linecap="round"/>
    <g transform="translate(60 61.5) scale(.66)">${SLICE}</g>
  </svg>`;
}
