'use strict';

const MESSAGES = {
  CV_INPUT_REQUIRED: "Une entree d'analyse est requise.",
  CV_TEXT_INVALID_TYPE: 'Le champ texte doit etre une chaine de caracteres.',
  CV_TEXT_EMPTY: 'Le texte fourni est vide.',
  CV_TEXT_TOO_SHORT: 'Le texte est trop court pour etre analyse.',
  CV_TEXT_TOO_LARGE: 'Le texte depasse la taille maximale autorisee.',
  CV_TEXT_UNREADABLE: "Le texte n'est pas suffisamment lisible pour etre analyse.",

  CV_FILE_REQUIRED: 'Un fichier CV est requis.',
  CV_FILE_TOO_LARGE: 'Le fichier depasse la taille maximale autorisee.',
  CV_FILE_TYPE_UNSUPPORTED: 'Seuls les fichiers PDF et DOCX sont acceptes.',
  CV_FILE_SIGNATURE_INVALID: 'La signature du fichier est invalide.',
  CV_FILE_CORRUPTED: 'Le fichier est corrompu ou ne peut pas etre lu.',
  CV_PDF_SCANNED: 'Ce PDF semble etre scanne et ne contient pas de texte exploitable.',
  CV_TEXT_EXTRACTION_FAILED: "Le texte du document n'a pas pu etre extrait.",
  CV_UPLOAD_INVALID: 'Le televersement du fichier CV est invalide.',
  CV_TARGET_INVALID: 'Les parametres de ciblage de l analyse CV sont invalides.',
};

class CvInputError extends Error {
  constructor(code, detail) {
    super(MESSAGES[code] || code);
    this.name = 'CvInputError';
    this.code = code;

    if (detail && typeof detail === 'object') {
      this.detail = detail;
    }
  }
}

module.exports = { CvInputError, MESSAGES };
