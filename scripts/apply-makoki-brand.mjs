#!/usr/bin/env node

import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT_FILES = [
  'index.html',
  'vite.config.ts',
  'backend/src/auth-v1/smtp-email.js',
];

const ROOT_DIRS = ['public', 'src'];
const TEXT_EXTENSIONS = new Set([
  '.css', '.html', '.js', '.jsx', '.json', '.mjs', '.ts', '.tsx',
]);
const EXCLUDED_SUFFIXES = ['.backup', '.broken', '.bak'];

const literalReplacements = [
  ['Orientation Pro Congo', 'MAKOKI'],
  ['OrientationPro Congo', 'MAKOKI'],
  ['OrientationPro', 'MAKOKI'],
  ['Orientation Pro', 'MAKOKI'],
  ['Tests RIASEC scientifiquement validés', 'Test RIASEC structuré et transparent'],
  [
    'Les résultats sont toujours pertinents et fiables. C\'est un outil précieux pour notre profession.',
    'Les résultats servent de support structuré à nos échanges d\'orientation. C\'est un outil utile pour préparer l\'accompagnement.',
  ],
];

const collectFiles = async (entry) => {
  const info = await stat(entry);
  if (info.isFile()) return [entry];

  const files = [];
  for (const child of await readdir(entry, { withFileTypes: true })) {
    if (['node_modules', 'dist', 'coverage', '.git'].includes(child.name)) continue;
    const childPath = path.join(entry, child.name);
    if (child.isDirectory()) {
      files.push(...await collectFiles(childPath));
    } else if (child.isFile()) {
      files.push(childPath);
    }
  }
  return files;
};

const exists = async (entry) => {
  try {
    await stat(entry);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
};

const candidates = [];
for (const file of ROOT_FILES) {
  if (await exists(file)) candidates.push(file);
}
for (const directory of ROOT_DIRS) {
  if (await exists(directory)) candidates.push(...await collectFiles(directory));
}

const targetFiles = [...new Set(candidates)]
  .filter((file) => TEXT_EXTENSIONS.has(path.extname(file)))
  .filter((file) => !EXCLUDED_SUFFIXES.some((suffix) => file.endsWith(suffix)))
  .sort();

const changedFiles = [];
const unchangedFiles = [];
const replacementCounts = new Map();

for (const file of targetFiles) {
  const source = await readFile(file, 'utf8');
  let next = source;

  for (const [from, to] of literalReplacements) {
    const before = next;
    next = next.split(from).join(to);
    if (next !== before) {
      const count = before.split(from).length - 1;
      replacementCounts.set(from, (replacementCounts.get(from) || 0) + count);
    }
  }

  if (file === 'index.html') {
    next = next
      .replace('<html lang="en">', '<html lang="fr">')
      .replace(
        /<meta name="description" content="[^"]*"\s*\/?>/,
        '<meta name="description" content="MAKOKI accompagne l\'orientation, le développement des compétences et l\'accès à l\'emploi." />',
      )
      .replace(
        /<title>[^<]*<\/title>/,
        '<title>MAKOKI — Orientation, compétences et emploi</title>',
      );
  }

  if (file === 'src/components/layout/Header.tsx') {
    next = next
      .replace(
        '<span className="text-white font-bold text-lg lg:text-xl">O</span>',
        '<span className="text-white font-bold text-lg lg:text-xl">M</span>',
      )
      .replace(
        '<p className="text-xs text-gray-500 -mt-1">Congo</p>',
        '<p className="text-xs text-gray-500 -mt-1">Orientation & emploi</p>',
      );
  }

  if (file === 'src/components/layout/Footer.tsx') {
    next = next
      .replace(
        '<span className="text-white font-bold text-xl">OP</span>',
        '<span className="text-white font-bold text-xl">M</span>',
      )
      .replace(
        '<p className="text-blue-200 text-sm">Congo</p>',
        '<p className="text-blue-200 text-sm">Orientation • Compétences • Emploi</p>',
      );
  }

  if (file === 'src/components/layout/ISOCompliantFooter.tsx') {
    next = next.replace(
      '<p className="text-sm text-gray-400">Congo</p>',
      '<p className="text-sm text-gray-400">Orientation • Compétences • Emploi</p>',
    );
  }

  if (file === 'src/components/home/HeroSection.tsx') {
    next = next.replace(
      /<h1 className="text-8xl font-extrabold text-gray-900 leading-tight w-full">\s*<\/h1>/,
      '<h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-gray-900 leading-tight w-full">\n                MAKOKI\n              </h1>',
    );
  }

  if (next === source) {
    unchangedFiles.push(file);
    continue;
  }

  await writeFile(file, next, 'utf8');
  changedFiles.push(file);
}

console.log(JSON.stringify({
  brand: 'MAKOKI',
  changedFileCount: changedFiles.length,
  changedFiles,
  replacementCounts: Object.fromEntries(replacementCounts),
  unchangedFileCount: unchangedFiles.length,
}, null, 2));

console.log('\nContrôle recommandé :');
console.log("git grep -nE 'Orientation Pro Congo|OrientationPro Congo|OrientationPro|Orientation Pro' -- index.html public src backend/src/auth-v1/smtp-email.js vite.config.ts || true");
console.log('npm run check');
