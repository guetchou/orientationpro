// Maximums reels de chaque composante (identiques au moteur et au rapport PDF).
// Le score general est la somme des quatre composantes ; les composantes ne
// sont jamais converties en pourcentage.
export const SCORE_DEFINITIONS = {
  generalReadiness: { label: 'Préparation générale', maximum: 100 },
  structure: { label: 'Structure', maximum: 30 },
  contentClarity: { label: 'Clarté du contenu', maximum: 25 },
  impact: { label: 'Impact', maximum: 25 },
  technicalUsability: { label: 'Utilisabilité technique', maximum: 20 },
  targetRelevance: { label: 'Pertinence pour le poste ciblé', maximum: 100 },
} as const;

export type ScoreKey = keyof typeof SCORE_DEFINITIONS;

// Limites d'upload cote client (le serveur reste l'autorite finale).
export const CV_MAX_FILE_SIZE = 5 * 1024 * 1024;
export const CV_ACCEPTED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const CV_ACCEPTED_EXTENSIONS = ['.pdf', '.docx'];
