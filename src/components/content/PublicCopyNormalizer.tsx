import { useEffect } from 'react';

const exactReplacements: Record<string, string> = {
  'Les formations ou les écoles à choisir.': 'Les formations et les écoles à explorer et comparer.',
  'Découvre les métiers qui te correspondent,': 'Commence à construire un projet qui te ressemble,',
  'en 15 minutes.': 'étape par étape.',
  'Pas du tout d’accord': 'Pas du tout',
  'Plutôt pas d’accord': 'Un peu',
  'Ni d’accord ni pas d’accord': 'Moyennement',
  'Plutôt d’accord': 'Beaucoup',
  'Tout à fait d’accord': 'Tout à fait',
  'Réaliste': 'Pratique et technique',
  'Investigateur': 'Analyse et recherche',
  'Artistique': 'Création et expression',
  'Social': 'Aide et transmission',
  'Entreprenant': 'Initiative et leadership',
  'Conventionnel': 'Organisation et précision',
  'Ton résultat complet est prêt': 'Ton premier résultat est prêt',
  'Enregistre ton résultat et découvre la suite': 'Enregistre ce premier résultat et construis la suite',
  'Commencer le test': 'Commencer le questionnaire',
  'Tes réponses restent disponibles sur cet appareil pendant le test.': 'Tes réponses restent disponibles sur cet appareil pendant le questionnaire.',
  'Tes réponses sont conservées sur cet appareil pendant le test afin que tu puisses reprendre en cas d’interruption.': 'Tes réponses sont conservées sur cet appareil pendant le questionnaire afin que tu puisses reprendre en cas d’interruption.',
};

const sentenceReplacements: Array<[string, string]> = [
  [
    'C’est un premier indice, pas une conclusion. Ton résultat complet tient compte de plusieurs tendances et de ta situation personnelle.',
    'C’est un premier indice, pas une conclusion. La suite tiendra compte de plusieurs tendances, de tes compétences et de ta situation personnelle.',
  ],
];

const normalizeTextNode = (node: Text) => {
  const original = node.nodeValue || '';
  const trimmed = original.trim();
  if (!trimmed) return;

  const next = exactReplacements[trimmed];
  if (next) {
    node.nodeValue = original.replace(trimmed, next);
    return;
  }

  let updated = original;
  for (const [before, after] of sentenceReplacements) {
    if (updated.includes(before)) updated = updated.replace(before, after);
  }
  if (updated !== original) node.nodeValue = updated;
};

const normalizeRoot = (root: ParentNode) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    normalizeTextNode(current as Text);
    current = walker.nextNode();
  }
};

export function PublicCopyNormalizer() {
  useEffect(() => {
    normalizeRoot(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) normalizeTextNode(node as Text);
          else if (node.nodeType === Node.ELEMENT_NODE) normalizeRoot(node as Element);
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}

export default PublicCopyNormalizer;
