'use strict';

// Le texte est une donnee NON FIABLE : on le structure sans jamais l'executer
// ni le rendre en HTML. Regex construites en ASCII pur (echappements \u via le
// constructeur RegExp) pour eviter tout caractere de controle litteral.
const DIACRITICS_RE = new RegExp('[\\u0300-\\u036f]', 'g');
const stripDiacritics = (value) => String(value).normalize('NFD').replace(DIACRITICS_RE, '');

// Supprime les caracteres de controle dangereux. On conserve la tabulation
// (u0009) et le saut de ligne (u000a) ; tout le reste de la zone C0 et u007f
// est remplace par une espace.
const CONTROL_RE = new RegExp('[\\u0000-\\u0008\\u000b\\u000c\\u000e-\\u001f\\u007f]', 'g');

const normalizeText = (raw) => {
  const source = typeof raw === 'string' ? raw : String(raw == null ? '' : raw);
  // 1) Unicode NFKC  2) fins de ligne normalisees  3) controle supprime
  const text = source.normalize('NFKC').replace(/\r\n?/g, '\n').replace(CONTROL_RE, ' ');

  const rawLines = text.split('\n').map((line) => line.replace(/[ \t]+$/g, ''));
  const nonEmpty = rawLines.filter((line) => line.trim() !== '');
  const joined = nonEmpty.join('\n');
  const lowered = stripDiacritics(joined.toLowerCase());
  const words = lowered.match(/[a-z0-9][a-z0-9'-]*/g) || [];
  const printableRatio = joined.length === 0
    ? 0
    : (joined.match(/[\p{L}\p{N}\s.,;:()/@+%'-]/gu) || []).length / joined.length;

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
