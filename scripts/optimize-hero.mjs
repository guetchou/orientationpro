import sharp from 'sharp';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const DIR = 'public/images/hero';

// Chaque image source PNG (~2 Mo, 1672x941) est déclinée en WebP à deux
// largeurs : une pour le desktop, une plus légère pour le mobile (réseau
// congolais souvent lent/coûteux). Qualité 72 = bon compromis netteté/poids.
const VARIANTS = [
  { suffix: '', width: 1600, quality: 72 },
  { suffix: '-sm', width: 768, quality: 68 },
];

const files = (await readdir(DIR)).filter((f) => f.endsWith('.png'));

for (const file of files) {
  const base = path.basename(file, '.png');
  for (const v of VARIANTS) {
    const out = path.join(DIR, `${base}${v.suffix}.webp`);
    const info = await sharp(path.join(DIR, file))
      .resize({ width: v.width, withoutEnlargement: true })
      .webp({ quality: v.quality })
      .toFile(out);
    console.log(`${out}  ${v.width}w  ${(info.size / 1024).toFixed(0)} KB`);
  }
}
console.log('done');
