#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const replacementsByFile = {
  'index.html': [
    ['<html lang="en">', '<html lang="fr">'],
    [
      '<meta name="description" content="Application d\'orientation professionnelle et académique" />',
      '<meta name="description" content="MAKOKI accompagne l\'orientation, le développement des compétences et l\'accès à l\'emploi." />',
    ],
    [
      '<title>Orientation professionnelle et académique</title>',
      '<title>MAKOKI — Orientation, compétences et emploi</title>',
    ],
  ],
  'src/components/layout/Header.tsx': [
    ['<span className="text-white font-bold text-lg lg:text-xl">O</span>', '<span className="text-white font-bold text-lg lg:text-xl">M</span>'],
    ['OrientationPro', 'MAKOKI'],
    ['<p className="text-xs text-gray-500 -mt-1">Congo</p>', '<p className="text-xs text-gray-500 -mt-1">Orientation & emploi</p>'],
  ],
  'src/components/layout/ProfessionalHeader.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
  ],
  'src/components/layout/Footer.tsx': [
    ['<span className="text-white font-bold text-xl">OP</span>', '<span className="text-white font-bold text-xl">M</span>'],
    ['<h3 className="text-2xl font-bold">OrientationPro</h3>', '<h3 className="text-2xl font-bold">MAKOKI</h3>'],
    ['<p className="text-blue-200 text-sm">Congo</p>', '<p className="text-blue-200 text-sm">Orientation • Compétences • Emploi</p>'],
    ['© {currentYear} OrientationPro Congo. Tous droits réservés.', '© {currentYear} MAKOKI. Tous droits réservés.'],
  ],
  'src/components/Footer.tsx': [
    ['Équipe Orientation Pro Congo', 'Équipe MAKOKI'],
    ['Orientation Pro Congo', 'MAKOKI'],
  ],
  'src/components/layout/ISOCompliantFooter.tsx': [
    ["Orientation Pro Congo - Retour à l'accueil", "MAKOKI - Retour à l'accueil"],
    ['Orientation Pro', 'MAKOKI'],
    ['<p className="text-sm text-gray-400">Congo</p>', '<p className="text-sm text-gray-400">Orientation • Compétences • Emploi</p>'],
    ['© {currentYear} MAKOKI Congo. Tous droits réservés.', '© {currentYear} MAKOKI. Tous droits réservés.'],
  ],
  'src/components/home/HeroSection.tsx': [
    ['{ icon: BookOpen, text: "Tests RIASEC scientifiquement validés" }', '{ icon: BookOpen, text: "Test RIASEC structuré et transparent" }'],
    [
      '<h1 className="text-8xl font-extrabold text-gray-900 leading-tight w-full">\n              </h1>',
      '<h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-gray-900 leading-tight w-full">\n                MAKOKI\n              </h1>',
    ],
    ['Orientation Pro Congo', 'MAKOKI'],
  ],
  'src/pages/Register.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
  ],
  'src/pages/Blog.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'src/pages/blog_slug.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'src/pages/ats.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'src/pages/Profile.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'src/pages/orientation-services.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'src/pages/Unauthorized.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'src/pages/cv-optimizer.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'src/pages/cv-history.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'src/pages/conseiller.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'src/pages/admin_dashboard.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'src/pages/admin_super-admin.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'src/pages/admin_ats.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'src/pages/admin_media.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'src/pages/conseiller_dashboard.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'src/components/home/TestimonialsSection.tsx': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'src/services/ai/IntelligentChatbot.ts': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'backend/src/auth-v1/smtp-email.js': [
    ['Vérifiez votre compte Orientation Pro Congo', 'Vérifiez votre compte MAKOKI'],
    ['Réinitialisez votre mot de passe Orientation Pro Congo', 'Réinitialisez votre mot de passe MAKOKI'],
  ],
  'vite.config.ts': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
  'public/manifest.json': [
    ['Orientation Pro Congo', 'MAKOKI'],
    ['Orientation Pro', 'MAKOKI'],
  ],
};

const changedFiles = [];
const missingFiles = [];
const unchangedFiles = [];

for (const [file, replacements] of Object.entries(replacementsByFile)) {
  let source;

  try {
    source = await readFile(file, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      missingFiles.push(file);
      continue;
    }
    throw error;
  }

  let next = source;

  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
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
  changedFiles,
  unchangedFiles,
  missingFiles,
}, null, 2));

if (missingFiles.length > 0) {
  console.error('\nCertains fichiers facultatifs sont absents. Vérifiez la liste ci-dessus.');
}

if (changedFiles.length === 0) {
  console.log('\nAucune modification : le rebranding semble déjà appliqué.');
} else {
  console.log(`\n${changedFiles.length} fichier(s) modifié(s).`);
  console.log('Étapes suivantes : npm run check, revue du diff, puis commit.');
}

process.exitCode = 0;
