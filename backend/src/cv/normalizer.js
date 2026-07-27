'use strict';

// Normalisation déterministe du texte brut extrait. Le texte est une donnée
// NON FIABLE ; on ne fait que le structurer, jamais l'exécuter ni le rendre.
const stripDiacritics = (value) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '');

const normalizeText = (raw) => {
  const text = String(raw == null ? '' : raw).replace(/\r\n?/g, '\n');
  const lines = text.split('\n').map((line) => line.replace(/\s+$/g, '')).filter((line, index, all) => {
    // conserve une ligne vide unique entre blocs, supprime les répétitions
    if (line.trim() !== '') return true;
    return index > 0 && all[index - 1].trim() !== '';
  });
  const nonEmpty = lines.filter((line) => line.trim() !== '');
  const joined = nonEmpty.join('\n');
  const lowered = stripDiacritics(joined.toLowerCase());
  const words = lowered.match(/[a-z0-9][a-z0-9'-]*/g) || [];
  const printableRatio = joined.length === 0
    ? 0
    : (joined.match(/[\p{L}\p{N}\s.,;:()/@+%-]/gu) || []).length / joined.length;
  return {
    text: joined,
    lowered,
    lines: nonEmpty,
    words,
    wordCount: words.length,
    charCount: joined.length,
    printableRatio: Number(printableRatio.toFixed(4)),
  };
};

module.exports = { normalizeText, stripDiacritics };
