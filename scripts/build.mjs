// Production build: Tailwind CSS → dist/public/assets, static assets, and one
// fully pre-rendered HTML page per language (dist/pages/{sq,en,it}.html).
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { site } from '../src/content/site.mjs';
import { orderableItems } from '../src/content/menu.mjs';
import { LANGS, LANG_META, dictFor, ui } from '../src/content/i18n.mjs';
import { INLINE_BOOT, renderNotFound, renderPage } from '../src/page.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const pub = path.join(dist, 'public');
const assetsDir = path.join(pub, 'assets');
const require = createRequire(import.meta.url);

const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 10);
const t0 = Date.now();

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(assetsDir, 'fonts'), { recursive: true });
await mkdir(path.join(dist, 'pages'), { recursive: true });

// 1. Tailwind CSS
const cliPkg = require.resolve('@tailwindcss/cli/package.json');
const cli = path.join(path.dirname(cliPkg), JSON.parse(await readFile(cliPkg, 'utf8')).bin.tailwindcss);
const css = spawnSync(process.execPath, [cli, '-i', 'src/styles/main.css', '-o', path.join(assetsDir, 'styles.css'), '--minify'], {
  cwd: root,
  stdio: ['ignore', 'inherit', 'inherit'],
});
if (css.status !== 0) {
  console.error('Tailwind build failed');
  process.exit(1);
}

// 2. Static files + self-hosted fonts
await cp(path.join(root, 'public'), pub, { recursive: true });
const fonts = [
  ['@fontsource-variable/inter', 'inter-latin-wght-normal.woff2'],
  ['@fontsource-variable/bricolage-grotesque', 'bricolage-grotesque-latin-opsz-normal.woff2'],
];
for (const [pkg, file] of fonts) {
  const dir = path.dirname(require.resolve(`${pkg}/package.json`));
  await cp(path.join(dir, 'files', file), path.join(assetsDir, 'fonts', file));
}

// 3. Client JS + i18n bundle
await cp(path.join(root, 'src', 'js', 'app.js'), path.join(assetsDir, 'app.js'));
const clientData = {
  dict: Object.fromEntries(LANGS.map((l) => [l, dictFor(l)])),
  meta: Object.fromEntries(LANGS.map((l) => [l, { ...LANG_META[l] }])),
  menu: Object.fromEntries(Object.entries(orderableItems).map(([id, item]) => [id, item.price])),
  site: { whatsapp: site.whatsapp, hours: site.hours, timezone: site.timezone, mapsEmbed: site.mapsEmbed },
};
await writeFile(path.join(assetsDir, 'i18n.js'), `window.__AL__=${JSON.stringify(clientData)};\n`);

// Sanity check: every UI key must exist in every language.
for (const [key, values] of Object.entries(ui)) {
  for (const l of LANGS) if (typeof values[l] !== 'string') throw new Error(`Missing ${l} translation for "${key}"`);
}

// 4. Cache-busted asset URLs
const v = async (file) => `/assets/${file}?v=${hash(await readFile(path.join(assetsDir, file)))}`;
const assets = { css: await v('styles.css'), js: await v('app.js'), i18n: await v('i18n.js') };

// 5. Pages
const buildYear = new Date().getFullYear();
for (const lang of LANGS) {
  const html = renderPage({ lang, assets, buildYear }).replace(/^\s+/gm, '');
  await writeFile(path.join(dist, 'pages', `${lang}.html`), html);
}
await writeFile(path.join(dist, 'pages', '404.html'), renderNotFound({ assets }).replace(/^\s+/gm, ''));

// 6. Metadata the server needs (CSP hash for the inline boot script, sitemap date)
const inlineHash = `'sha256-${createHash('sha256').update(INLINE_BOOT).digest('base64')}'`;
await writeFile(
  path.join(dist, 'build.json'),
  JSON.stringify({ builtAt: new Date().toISOString(), scriptHashes: [inlineHash], assets }, null, 2),
);

console.log(`✓ Built ${LANGS.length} pages + assets in ${Date.now() - t0} ms → dist/`);
