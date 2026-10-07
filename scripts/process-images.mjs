// Builds responsive AVIF / WebP / JPEG variants from /photos-original into /public/images,
// plus the social share image and app icons. Run whenever photos change: npm run images
//
// Credits: hero photo by Emily Powers on Unsplash — https://unsplash.com/photos/9xWl_zhIcS4
import sharp from 'sharp';
import { mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { emblemSvg } from '../src/icons.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'photos-original');
const OUT = path.join(root, 'public', 'images');

// Crops are fractions of the (flipped) source so they survive re-exports at other sizes.
const jobs = [
  {
    // Mirrored so the pizza sits right of the headline.
    name: 'hero',
    src: 'hero-oven-unsplash.jpg',
    flop: true,
    crop: { left: 0, top: 0.2, width: 0.85, height: 0.8 },
    widths: [960, 1440, 1920, 2560],
  },
  {
    name: 'hero-mobile',
    src: 'hero-oven-unsplash.jpg',
    flop: true,
    // Tight portrait crop with the pizza in the upper-middle of the phone screen.
    crop: { left: 0.4387, top: 0.38, width: 0.2326, height: 0.62 },
    widths: [640, 930],
  },
  { name: 'about', src: 'about-terrace.jpg', widths: [800, 1200, 1600, 2000] },
  { name: 'exterior', src: 'exterior-hd.jpg', widths: [960, 1440, 1920] },
];

async function master(job) {
  let img = sharp(path.join(SRC, job.src)).rotate();
  if (job.flop) img = img.flop();
  const buf = await img.toBuffer();
  if (!job.crop) return buf;
  const { width, height } = await sharp(buf).metadata();
  const c = job.crop;
  return sharp(buf)
    .extract({
      left: Math.round(c.left * width),
      top: Math.round(c.top * height),
      width: Math.round(c.width * width),
      height: Math.round(c.height * height),
    })
    .toBuffer();
}

async function run() {
  await mkdir(OUT, { recursive: true });
  const keep = new Set(['og-image.jpg']);

  for (const job of jobs) {
    const buf = await master(job);
    const meta = await sharp(buf).metadata();
    for (const w of job.widths) {
      const base = sharp(buf).resize({ width: w, kernel: 'lanczos3', withoutEnlargement: true }).sharpen({ sigma: 0.6, m1: 0.4, m2: 1.4 });
      const stem = `${job.name}-${w}`;
      await Promise.all([
        base.clone().avif({ quality: 55, effort: 6 }).toFile(path.join(OUT, `${stem}.avif`)),
        base.clone().webp({ quality: 80, effort: 6 }).toFile(path.join(OUT, `${stem}.webp`)),
        base.clone().jpeg({ quality: 82, mozjpeg: true, progressive: true }).toFile(path.join(OUT, `${stem}.jpg`)),
      ]);
      ['avif', 'webp', 'jpg'].forEach((ext) => keep.add(`${stem}.${ext}`));
    }
    const ratio = meta.height / meta.width;
    console.log(`✓ ${job.name} (${meta.width}×${meta.height}) → ${job.widths.map((w) => `${w}×${Math.round(w * ratio)}`).join(', ')}`);
  }

  // Social share image: the real terrace, with a soft bottom gradient.
  await sharp(path.join(SRC, 'exterior-hd.jpg'))
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .composite([
      {
        input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
          <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.45" stop-color="#111413" stop-opacity="0"/>
            <stop offset="1" stop-color="#111413" stop-opacity="0.7"/>
          </linearGradient></defs>
          <rect width="1200" height="630" fill="url(#g)"/>
        </svg>`),
      },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(OUT, 'og-image.jpg'));
  console.log('✓ og-image (1200×630)');

  // Remove variants left over from earlier exports.
  for (const file of await readdir(OUT)) {
    if (!keep.has(file)) await rm(path.join(OUT, file));
  }
}

// App icons rendered from the brand emblem.
async function icons() {
  const dir = path.join(root, 'public', 'icons');
  await mkdir(dir, { recursive: true });
  const svg = Buffer.from(emblemSvg({ standalone: true }));
  const render = (size) => sharp(svg, { density: Math.ceil((72 * size) / 120) }).resize(size, size);
  await render(180).flatten({ background: '#111413' }).png().toFile(path.join(dir, 'apple-touch-icon.png'));
  await render(192).png().toFile(path.join(dir, 'icon-192.png'));
  await render(512).png().toFile(path.join(dir, 'icon-512.png'));
  // Maskable: emblem inside the safe zone on a solid background.
  const inner = await render(400).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: '#111413' } })
    .composite([{ input: inner, left: 56, top: 56 }])
    .png()
    .toFile(path.join(dir, 'icon-maskable-512.png'));
  console.log('✓ app icons');
}

run()
  .then(icons)
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
