'use strict';

// Erreurs d'entree a codes STABLES. Le message ne contient jamais de contenu
// de CV ni de donnee personnelle : uniquement le code et un libelle generique.
const MESSAGES = {
  CV_INPUT_REQUIRED: "Une entree d'analyse est requise.",
  CV_TEXT_INVALID_TYPE: 'Le champ texte doit etre une chaine de caracteres.',
  CV_TEXT_EMPTY: 'Le texte fourni est vide.',
  CV_TEXT_TOO_SHORT: 'Le texte est trop court pour etre analyse.',
  CV_TEXT_TOO_LARGE: 'Le texte depasse la taille maximale autorisee.',
  CV_TEXT_UNREADABLE: "Le texte n'est pas suffisamment lisible pour etre analyse.",
};

class CvInputError extends Error {
  constructor(code, detail) {
    super(MESSAGES[code] || code);
    this.name = 'CvInputError';
    this.code = code;
    // detail = metadonnee non sensible facultative, jamais du contenu de CV.
    if (detail && typeof detail === 'object') this.detail = detail;
  }
}

module.exports = { CvInputError, MESSAGES };
