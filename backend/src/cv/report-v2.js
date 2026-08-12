'use strict';

const PDFDocument = require('pdfkit');

const REPORT_VERSION = 'makoki-cv-report-v2';
const MAX_REPORT_BYTES = 4 * 1024 * 1024;
const MAX_LIST_ITEMS = 30;
const MAX_TEXT_LENGTH = 600;
const PAGE_MARGIN = 34;

const COLORS = {
  primary: '#007A4D',
  primaryDark: '#005D3B',
  primarySoft: '#EAF7F0',
  text: '#16211D',
  muted: '#62706A',
  border: '#DDE6E1',
  panel: '#F7FAF8',
  white: '#FFFFFF',
  danger: '#C83A3A',
  dangerSoft: '#FFF2F2',
  warning: '#C66A08',
  warningSoft: '#FFF7E8',
  info: '#2D64B3',
  infoSoft: '#EEF5FF',
  track: '#E9EEEB',
};

const SECTION_LABELS = {
  contact: 'Coordonnées',
  summary: 'Profil professionnel',
  experience: 'Expérience professionnelle',
  education: 'Formation',
  skills: 'Compétences',
  languages: 'Langues',
};

const DOMAIN_LABELS = {
  'commerce-vente': 'Commerce & vente',
  administration: 'Administration',
  entrepreneuriat: 'Entrepreneuriat',
  'telecom-informatique': 'Télécoms & informatique',
  'banque-assurance': 'Banque & assurance',
  'communication-relation-client': 'Communication & relation client',
  'comptabilite-finance': 'Comptabilité & finance',
  'droit-rh': 'Droit & ressources humaines',
  education: 'Éducation',
  'hotellerie-restauration': 'Hôtellerie & restauration',
  'logistique-transport': 'Logistique & transport',
};

const SCORE_DEFINITIONS = {
  structure: { label: 'Structure', maximum: 30 },
  contentClarity: { label: 'Clarté du contenu', maximum: 25 },
  impact: { label: 'Impact', maximum: 25 },
  technicalUsability: { label: 'Utilisabilité technique', maximum: 20 },
  targetRelevance: { label: 'Pertinence pour le poste ciblé', maximum: 100 },
};

const cleanText = (value, maximumLength = MAX_TEXT_LENGTH) => {
  if (value === undefined || value === null) return '';
  return String(value)
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .slice(0, maximumLength);
};

const boundedScore = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) return null;
  return Math.round(numeric);
};

const boundedArray = (value, mapper, maximumItems = MAX_LIST_ITEMS) => {
  if (!Array.isArray(value)) return [];
  return value.slice(0, maximumItems).map(mapper).filter(Boolean);
};

const assertNoRawContent = (value) => {
  if (value === null || value === undefined || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item) => assertNoRawContent(item));
    return;
  }

  const forbidden = new Set([
    'text', 'rawText', 'raw_text', 'cvText', 'cv_text',
    'jobDescription', 'job_description', 'fileBuffer',
    'fileContent', 'file_content',
  ]);

  for (const [key, nested] of Object.entries(value)) {
    if (forbidden.has(key)) {
      throw new Error('CV report snapshot contains forbidden raw content.');
    }
    assertNoRawContent(nested);
  }
};

const parseIsoTimestamp = (value) => {
  const normalized = cleanText(value, 40);
  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/u,
  );
  if (!match) return null;

  const [
    , yearText, monthText, dayText, hourText, minuteText, secondText,
    millisecondText = '000',
  ] = match;

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const leapYear = year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);
  const daysPerMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (
    month < 1 || month > 12 || day < 1 || day > daysPerMonth[month - 1]
    || hour < 0 || hour > 23 || minute < 0 || minute > 59
    || second < 0 || second > 59
  ) return null;

  return {
    display: `${dayText}/${monthText}/${yearText} ${hourText}:${minuteText} UTC`,
    iso: `${yearText}-${monthText}-${dayText}T${hourText}:${minuteText}:${secondText}.${millisecondText.padEnd(3, '0')}Z`,
  };
};

const formatUtcDate = (value) => parseIsoTimestamp(value)?.display || 'Date non disponible';

const mimeTypeLabel = (mimeType) => {
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'DOCX';
  return 'Document';
};

const prettyDomain = (value) => {
  const raw = cleanText(value, 120);
  if (!raw) return 'Autres';
  const key = raw.toLowerCase();
  if (DOMAIN_LABELS[key]) return DOMAIN_LABELS[key];
  return raw
    .replace(/[-_]+/gu, ' ')
    .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
};

const severityMeta = (severity) => {
  const value = cleanText(severity, 40).toLowerCase();
  if (['critical', 'high', 'important', 'haute', 'élevée', 'elevee'].includes(value)) {
    return { label: 'Priorité haute', color: COLORS.danger, soft: COLORS.dangerSoft };
  }
  if (['medium', 'warning', 'moyenne'].includes(value)) {
    return { label: 'Priorité moyenne', color: COLORS.warning, soft: COLORS.warningSoft };
  }
  return { label: 'À améliorer', color: COLORS.info, soft: COLORS.infoSoft };
};

const normalizeCvReportData = (analysis, context = {}) => {
  if (!analysis || typeof analysis !== 'object' || !analysis.snapshot || typeof analysis.snapshot !== 'object') {
    throw new Error('CV report analysis snapshot is invalid.');
  }

  assertNoRawContent(analysis.snapshot);
  const snapshot = analysis.snapshot;
  const sourceDocument = snapshot.document || analysis.document || {};
  const scores = snapshot.scores || {};
  const targetMatch = snapshot.targetMatch && typeof snapshot.targetMatch === 'object'
    ? snapshot.targetMatch
    : null;

  const skills = boundedArray(snapshot.skills, (skill) => {
    if (!skill || typeof skill !== 'object') return null;
    const canonical = cleanText(skill.canonical, 120);
    if (!canonical) return null;
    return { canonical, domain: prettyDomain(skill.domain) };
  });

  const strengths = boundedArray(snapshot.strengths, (strength) => {
    if (typeof strength === 'string') return cleanText(strength);
    if (!strength || typeof strength !== 'object') return null;
    return cleanText(strength.title || strength.code);
  });

  const issues = boundedArray(snapshot.issues, (issue) => {
    if (!issue || typeof issue !== 'object') return null;
    const title = cleanText(issue.title || issue.code);
    if (!title) return null;
    return {
      title,
      severity: cleanText(issue.severity, 40),
      observation: cleanText(issue.observation),
      recommendation: cleanText(issue.recommendation),
    };
  }, 12);

  const limitations = boundedArray(snapshot.methodology?.limitations, (item) => cleanText(item), 8);

  const sections = boundedArray(snapshot.sections, (section) => {
    if (!section || typeof section !== 'object' || section.present !== true) return null;
    const key = cleanText(section.key, 60);
    return SECTION_LABELS[key] || prettyDomain(key);
  }, 12);

  const target = targetMatch
    ? {
        title: cleanText(analysis.targetTitle || targetMatch.jobTitle, 255),
        presentSkills: boundedArray(targetMatch.presentSkills, (item) => cleanText(item, 120)),
        missingSkills: boundedArray(targetMatch.missingSkills, (item) => cleanText(item, 120)),
        requiredSkills: boundedArray(targetMatch.requiredSkills, (item) => cleanText(item, 120)),
        keywordOverlapPercent: boundedScore(targetMatch.keywordOverlapPercent),
      }
    : analysis.targetTitle
      ? {
          title: cleanText(analysis.targetTitle, 255),
          presentSkills: [],
          missingSkills: [],
          requiredSkills: [],
          keywordOverlapPercent: null,
        }
      : null;

  return {
    reportVersion: REPORT_VERSION,
    analysisId: cleanText(analysis.id, 64),
    algorithmVersion: cleanText(analysis.algorithmVersion || snapshot.methodology?.version, 80),
    createdAt: formatUtcDate(analysis.createdAt),
    document: {
      fileName: cleanText(sourceDocument.fileName || analysis.document?.fileName || 'CV', 180),
      type: mimeTypeLabel(sourceDocument.mimeType || analysis.document?.mimeType),
      fileSize: Number.isFinite(Number(sourceDocument.fileSize)) ? Number(sourceDocument.fileSize) : null,
      pageCount: Number.isSafeInteger(Number(sourceDocument.pageCount)) && Number(sourceDocument.pageCount) > 0
        ? Number(sourceDocument.pageCount)
        : null,
      detectedLanguage: cleanText(sourceDocument.detectedLanguage || analysis.document?.detectedLanguage || 'und', 8),
    },
    scores: {
      generalReadiness: boundedScore(scores.generalReadiness),
      structure: boundedScore(scores.structure),
      contentClarity: boundedScore(scores.contentClarity),
      impact: boundedScore(scores.impact),
      technicalUsability: boundedScore(scores.technicalUsability),
      targetRelevance: target ? boundedScore(scores.targetRelevance) : null,
    },
    contactPresence: {
      hasEmail: snapshot.contactPresence?.hasEmail === true,
      hasPhone: snapshot.contactPresence?.hasPhone === true,
    },
    sections,
    skills,
    strengths,
    issues,
    target,
    limitations,
    beneficiary: context.beneficiary
      ? {
          firstName: cleanText(context.beneficiary.firstName, 100),
          lastName: cleanText(context.beneficiary.lastName, 100),
          currentSituation: cleanText(context.beneficiary.currentSituation, 64),
          primaryGoal: cleanText(context.beneficiary.primaryGoal, 64),
        }
      : null,
  };
};

const pageMetrics = (doc) => ({
  left: PAGE_MARGIN,
  right: doc.page.width - PAGE_MARGIN,
  width: doc.page.width - PAGE_MARGIN * 2,
});

const roundedPanel = (doc, x, y, width, height, options = {}) => {
  doc.save();
  if (options.fill) {
    doc.roundedRect(x, y, width, height, options.radius || 8)
      .fillColor(options.fill)
      .fill();
  }
  if (options.stroke !== false) {
    doc.roundedRect(x, y, width, height, options.radius || 8)
      .lineWidth(options.lineWidth || 1)
      .strokeColor(options.stroke || COLORS.border)
      .stroke();
  }
  doc.restore();
};

const drawText = (doc, value, x, y, options = {}) => {
  doc.font(options.bold ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(options.size || 9)
    .fillColor(options.color || COLORS.text)
    .text(cleanText(value, options.maxLength || 1200), x, y, {
      width: options.width,
      height: options.height ?? 34,
      ellipsis: options.ellipsis !== false,
      align: options.align,
      lineGap: options.lineGap ?? 1.5,
    });
};

const statusColor = (score, maximum) => {
  if (score === null) return COLORS.muted;
  const ratio = maximum ? score / maximum : 0;
  if (ratio >= 0.8) return COLORS.primary;
  if (ratio >= 0.6) return COLORS.warning;
  return COLORS.danger;
};

const statusLabel = (score, maximum) => {
  if (score === null) return 'Non évaluée';
  const ratio = maximum ? score / maximum : 0;
  if (ratio >= 0.8) return 'Excellent';
  if (ratio >= 0.6) return 'Solide';
  return 'À renforcer';
};

const drawHeader = (doc, title, page, total) => {
  const { left, right } = pageMetrics(doc);
  doc.circle(left + 11, 31, 11).fill(COLORS.primary);
  drawText(doc, 'M', left + 6.5, 24, { size: 9, bold: true, color: COLORS.white, width: 9, height: 12, align: 'center' });
  drawText(doc, 'MAKOKI', left + 30, 20, { size: 18, bold: true, color: COLORS.primaryDark, width: 120, height: 25 });
  drawText(doc, title, left + 175, 24, { size: 10, bold: true, width: 235, height: 18, align: 'center' });
  roundedPanel(doc, right - 66, 18, 66, 25, { fill: COLORS.panel, stroke: COLORS.border, radius: 6 });
  drawText(doc, `Page ${page} / ${total}`, right - 62, 26, { size: 7.5, color: COLORS.muted, width: 58, height: 12, align: 'center' });
};

const drawFooter = (doc, page, total) => {
  const { left, right } = pageMetrics(doc);
  const y = 804;
  doc.moveTo(left, y - 8).lineTo(right, y - 8).strokeColor(COLORS.border).lineWidth(0.8).stroke();
  drawText(doc, "MAKOKI - Rapport d'analyse de CV", left, y, { size: 6.8, color: COLORS.muted, width: 220, height: 10 });
  drawText(doc, `Page ${page} / ${total}`, right - 70, y, { size: 6.8, bold: true, width: 70, height: 10, align: 'right' });
};

const executiveSummary = (data) => {
  const score = data.scores.generalReadiness;
  if (score === null) return 'Ton CV a été analysé. Consulte les points forts et les priorités ci-dessous pour l’améliorer.';
  if (score >= 85) return 'Ton CV possède une base solide. Les prochaines améliorations doivent surtout renforcer la preuve de ton impact.';
  if (score >= 70) return 'Ton CV est bien structuré. Quelques améliorations ciblées peuvent renforcer sa lisibilité et son impact.';
  return 'Ton CV présente des bases utiles, mais plusieurs éléments prioritaires doivent être renforcés avant une candidature.';
};

const topIssue = (data) => data.issues[0] || {
  title: 'Aucune priorité critique détectée',
  severity: 'low',
  observation: '',
  recommendation: 'Conserve cette base et adapte ton CV à chaque poste visé.',
};

const drawScoreRing = (doc, x, y, value) => {
  doc.circle(x, y, 38).lineWidth(8).strokeColor('#BFE8CF').stroke();
  doc.circle(x, y, 38).lineWidth(8).strokeColor(COLORS.primary).stroke();
  drawText(doc, String(value ?? 0), x - 28, y - 17, { size: 27, bold: true, color: COLORS.white, width: 56, height: 32, align: 'center' });
  drawText(doc, '/100', x - 22, y + 17, { size: 8, bold: true, color: COLORS.white, width: 44, height: 12, align: 'center' });
};

const drawScoreCard = (doc, x, y, width, label, score, maximum) => {
  roundedPanel(doc, x, y, width, 78, { fill: COLORS.white, stroke: COLORS.border, radius: 8 });
  drawText(doc, label, x + 7, y + 8, { size: 7.2, bold: true, width: width - 14, height: 20, align: 'center' });
  if (score === null) {
    drawText(doc, 'Non évaluée', x + 7, y + 34, { size: 9.2, bold: true, color: COLORS.muted, width: width - 14, height: 14, align: 'center' });
    drawText(doc, 'Aucune offre fournie', x + 7, y + 53, { size: 6.2, color: COLORS.muted, width: width - 14, height: 11, align: 'center' });
    return;
  }
  const color = statusColor(score, maximum);
  drawText(doc, `${score} / ${maximum}`, x + 7, y + 31, { size: 13, bold: true, color, width: width - 14, height: 18, align: 'center' });
  doc.roundedRect(x + 12, y + 55, width - 24, 4, 2).fill(COLORS.track);
  doc.roundedRect(x + 12, y + 55, Math.max(2, (width - 24) * score / maximum), 4, 2).fill(color);
  drawText(doc, statusLabel(score, maximum), x + 7, y + 64, { size: 6.2, bold: true, color, width: width - 14, height: 10, align: 'center' });
};

const drawPageOne = (doc, data, total) => {
  drawHeader(doc, "Rapport d'analyse de CV", 1, total);
  const { left, width } = pageMetrics(doc);
  const heroY = 62;
  roundedPanel(doc, left, heroY, width, 170, { fill: COLORS.primaryDark, stroke: COLORS.primaryDark, radius: 10 });
  drawText(doc, 'Votre profil professionnel', left + 18, heroY + 18, { size: 16, bold: true, color: COLORS.white, width: 250, height: 23 });
  drawText(doc, 'Synthèse exécutive', left + 18, heroY + 41, { size: 8, color: '#DCEEE5', width: 160, height: 13 });
  drawScoreRing(doc, left + 78, heroY + 105, data.scores.generalReadiness);

  const beneficiaryName = [data.beneficiary?.firstName, data.beneficiary?.lastName].filter(Boolean).join(' ');
  if (beneficiaryName) {
    drawText(doc, beneficiaryName, left + 145, heroY + 65, { size: 8.5, bold: true, color: '#DCEEE5', width: width - 165, height: 14 });
  }
  drawText(doc, executiveSummary(data), left + 145, heroY + 86, {
    size: 11.2, bold: true, color: COLORS.white, width: width - 170, height: 62, lineGap: 4,
  });

  const issue = topIssue(data);
  const meta = severityMeta(issue.severity);
  drawText(doc, "Plan d'action prioritaire", left + 6, 248, { size: 11, bold: true, width: 210, height: 16 });
  roundedPanel(doc, left, 266, width, 68, { fill: meta.soft, stroke: '#E5D5D5', radius: 8 });
  doc.circle(left + 27, 300, 15).fill(meta.color);
  drawText(doc, '1', left + 21, 292, { size: 11, bold: true, color: COLORS.white, width: 12, height: 15, align: 'center' });
  drawText(doc, issue.title, left + 53, 278, { size: 10, bold: true, width: width - 165, height: 17 });
  drawText(doc, issue.recommendation || issue.observation || 'Améliore ce point en priorité.', left + 53, 297, { size: 7.4, width: width - 165, height: 28 });
  roundedPanel(doc, left + width - 83, 279, 68, 22, { fill: COLORS.white, stroke: meta.color, radius: 5 });
  drawText(doc, meta.label, left + width - 80, 286, { size: 6.2, bold: true, color: meta.color, width: 62, height: 10, align: 'center' });

  drawText(doc, 'Synthèse des scores', left + 6, 350, { size: 11, bold: true, width: 190, height: 16 });
  const gap = 7;
  const cardWidth = (width - gap * 4) / 5;
  let x = left;
  for (const [key, definition] of Object.entries(SCORE_DEFINITIONS)) {
    drawScoreCard(doc, x, 369, cardWidth, definition.label, data.scores[key], definition.maximum);
    x += cardWidth + gap;
  }

  roundedPanel(doc, left, 459, width, 70, { fill: COLORS.panel, stroke: COLORS.border, radius: 8 });
  drawText(doc, 'Lecture des indicateurs', left + 14, 470, { size: 9, bold: true, width: 180, height: 14 });
  drawText(doc, "La structure mesure l'organisation des rubriques. La clarté évalue la précision et la lisibilité du contenu. L'impact repère les résultats concrets. L'utilisabilité technique estime la lecture par les outils de tri. La pertinence compare le CV avec le poste ciblé.", left + 14, 488, {
    size: 7.1, color: COLORS.muted, width: width - 28, height: 34, lineGap: 2.2,
  });

  roundedPanel(doc, left, 543, width, 103, { fill: '#F3F7FB', stroke: '#DCE6EF', radius: 8 });
  drawText(doc, 'Informations du document', left + 14, 554, { size: 9, bold: true, width: 190, height: 14 });
  const cols = [
    ['Fichier', data.document.fileName],
    ['Format', data.document.type],
    ['Langue détectée', data.document.detectedLanguage],
    ["Date de l'analyse", data.createdAt],
  ];
  const colWidth = (width - 28) / cols.length;
  cols.forEach(([label, value], index) => {
    const cx = left + 14 + index * colWidth;
    drawText(doc, label, cx, 580, { size: 6.3, color: COLORS.muted, width: colWidth - 8, height: 10 });
    drawText(doc, value, cx, 594, { size: 7.2, bold: true, width: colWidth - 8, height: 22, maxLength: 90 });
  });
  drawText(doc, `Référence : ${data.analysisId || 'non disponible'}`, left + 14, 624, { size: 6.3, color: COLORS.muted, width: width - 28, height: 10 });
  drawFooter(doc, 1, total);
};

const countDomains = (skills) => {
  const counts = new Map();
  for (const skill of skills) counts.set(skill.domain || 'Autres', (counts.get(skill.domain || 'Autres') || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fr')).slice(0, 10);
};

const drawStatusTile = (doc, x, y, width, label, present, symbol) => {
  roundedPanel(doc, x, y, width, 72, { fill: COLORS.white, stroke: COLORS.border, radius: 8 });
  drawText(doc, symbol, x + 8, y + 12, { size: 16, bold: true, color: present ? COLORS.primary : COLORS.danger, width: width - 16, height: 20, align: 'center' });
  drawText(doc, label, x + 7, y + 38, { size: 6.6, color: COLORS.muted, width: width - 14, height: 10, align: 'center' });
  drawText(doc, present ? 'Détecté' : 'Non détecté', x + 7, y + 53, { size: 7.2, bold: true, color: present ? COLORS.primary : COLORS.danger, width: width - 14, height: 11, align: 'center' });
};

const drawPageTwo = (doc, data, total) => {
  drawHeader(doc, 'Diagnostic du document', 2, total);
  const { left, width } = pageMetrics(doc);
  drawText(doc, 'Éléments détectés', left, 67, { size: 11, bold: true, width: 190, height: 16 });

  const gap = 8;
  const tileWidth = (width - gap * 3) / 4;
  const sections = new Set(data.sections);
  drawStatusTile(doc, left, 88, tileWidth, 'Adresse e-mail', data.contactPresence.hasEmail, '@');
  drawStatusTile(doc, left + tileWidth + gap, 88, tileWidth, 'Téléphone', data.contactPresence.hasPhone, 'TEL');
  drawStatusTile(doc, left + (tileWidth + gap) * 2, 88, tileWidth, 'Expérience pro', sections.has('Expérience professionnelle'), 'EXP');
  drawStatusTile(doc, left + (tileWidth + gap) * 3, 88, tileWidth, "Niveau d'études", sections.has('Formation'), 'EDU');

  const leftCol = width * 0.48;
  const rightCol = width - leftCol - 12;
  roundedPanel(doc, left, 178, leftCol, 181, { fill: COLORS.white, stroke: COLORS.border, radius: 8 });
  drawText(doc, 'Sections présentes', left + 14, 190, { size: 10, bold: true, width: leftCol - 28, height: 15 });
  const sectionItems = data.sections.length ? data.sections : ['Aucune section reconnue'];
  sectionItems.slice(0, 7).forEach((item, index) => {
    const yy = 216 + index * 20;
    doc.circle(left + 19, yy + 5, 5).strokeColor(COLORS.primary).lineWidth(1.5).stroke();
    drawText(doc, 'v', left + 15.5, yy, { size: 7, bold: true, color: COLORS.primary, width: 8, height: 10, align: 'center' });
    drawText(doc, item, left + 32, yy, { size: 7.4, width: leftCol - 44, height: 12 });
  });

  roundedPanel(doc, left + leftCol + 12, 178, rightCol, 181, { fill: COLORS.white, stroke: COLORS.border, radius: 8 });
  drawText(doc, 'Points forts', left + leftCol + 26, 190, { size: 10, bold: true, color: COLORS.primaryDark, width: rightCol - 38, height: 15 });
  const strengths = data.strengths.length ? data.strengths : [
    'Structure du document exploitable',
    data.skills.length ? 'Compétences variées détectées' : 'Contenu analysable',
  ];
  strengths.slice(0, 6).forEach((item, index) => {
    drawText(doc, `• ${item}`, left + leftCol + 28, 219 + index * 22, { size: 7.3, width: rightCol - 42, height: 16 });
  });

  drawText(doc, 'Cartographie des compétences', left, 379, { size: 11, bold: true, width: 250, height: 16 });
  drawText(doc, 'Répartition par domaine. Une barre plus longue indique davantage de compétences repérées.', left, 397, { size: 6.7, color: COLORS.muted, width: 370, height: 12 });
  roundedPanel(doc, left, 418, width * 0.62, 246, { fill: COLORS.white, stroke: COLORS.border, radius: 8 });
  roundedPanel(doc, left + width * 0.62 + 12, 418, width * 0.38 - 12, 246, { fill: COLORS.panel, stroke: COLORS.border, radius: 8 });

  const domains = countDomains(data.skills);
  const maxCount = Math.max(1, ...domains.map((entry) => entry[1]));
  const barLeft = left + 142;
  const barWidth = width * 0.62 - 170;
  domains.forEach(([domain, count], index) => {
    const yy = 440 + index * 20;
    drawText(doc, domain, left + 12, yy, { size: 6.4, width: 125, height: 10 });
    doc.roundedRect(barLeft, yy + 2, barWidth, 7, 3).fill(COLORS.track);
    doc.roundedRect(barLeft, yy + 2, barWidth * count / maxCount, 7, 3).fill(index < 3 ? COLORS.primary : '#6E9F84');
    drawText(doc, String(count), barLeft + barWidth + 5, yy, { size: 6.2, bold: true, width: 18, height: 10 });
  });

  drawText(doc, 'Compétences clés détectées', left + width * 0.62 + 25, 433, { size: 8.3, bold: true, width: width * 0.38 - 40, height: 20 });
  data.skills.slice(0, 11).forEach((skill, index) => {
    const yy = 460 + index * 17;
    doc.circle(left + width * 0.62 + 27, yy + 3, 3).fill(COLORS.primary);
    drawText(doc, skill.canonical, left + width * 0.62 + 37, yy - 1, { size: 6.5, width: width * 0.38 - 54, height: 11 });
  });
  drawFooter(doc, 2, total);
};

const exampleForIssue = (issue) => {
  const title = issue.title.toLowerCase();
  if (title.includes('quantifi') || title.includes('résultat')) {
    return {
      before: 'Responsable des ventes.',
      after: "Responsable des ventes d'une équipe, avec progression mesurable du chiffre d'affaires sur la période.",
    };
  }
  if (title.includes('email') || title.includes('coordonnée')) {
    return {
      before: 'Coordonnées incomplètes.',
      after: 'Ajoute une adresse e-mail professionnelle active et vérifie le numéro de téléphone.',
    };
  }
  return {
    before: 'Formulation descriptive et générale.',
    after: 'Formulation précise avec action, contexte et résultat vérifiable.',
  };
};

const drawIssueCard = (doc, x, y, width, issue, index) => {
  const meta = severityMeta(issue.severity);
  roundedPanel(doc, x, y, width, 116, { fill: meta.soft, stroke: '#E6DFDD', radius: 8 });
  doc.circle(x + 18, y + 19, 10).fill(meta.color);
  drawText(doc, String(index + 1), x + 13, y + 12, { size: 8, bold: true, color: COLORS.white, width: 10, height: 10, align: 'center' });
  drawText(doc, issue.title, x + 35, y + 10, { size: 9.3, bold: true, color: meta.color, width: width - 145, height: 16 });
  roundedPanel(doc, x + width - 93, y + 9, 78, 19, { fill: COLORS.white, stroke: meta.color, radius: 5 });
  drawText(doc, meta.label, x + width - 90, y + 15, { size: 5.8, bold: true, color: meta.color, width: 72, height: 9, align: 'center' });
  drawText(doc, `Observation : ${issue.observation || 'Point détecté dans le document.'}`, x + 35, y + 35, { size: 6.6, width: width - 50, height: 16 });
  drawText(doc, `Recommandation : ${issue.recommendation || 'Améliore ce point avant l’envoi du CV.'}`, x + 35, y + 53, { size: 6.6, width: width - 50, height: 18 });
  const example = exampleForIssue(issue);
  drawText(doc, 'Exemple d’amélioration', x + 35, y + 78, { size: 6.4, bold: true, width: 120, height: 10 });
  drawText(doc, `Avant : ${example.before}`, x + 35, y + 92, { size: 6, color: COLORS.muted, width: (width - 60) / 2, height: 19 });
  drawText(doc, `Après : ${example.after}`, x + width / 2 + 5, y + 92, { size: 6, width: (width - 60) / 2 - 5, height: 19 });
};

const drawPageThree = (doc, data, total) => {
  drawHeader(doc, "Recommandations et plan d'action", 3, total);
  const { left, width } = pageMetrics(doc);
  drawText(doc, "Axes d'amélioration prioritaires", left, 68, { size: 11, bold: true, width: 260, height: 16 });
  const issues = data.issues.length ? data.issues.slice(0, 3) : [{
    title: 'Conserver une version ciblée',
    severity: 'medium',
    observation: 'Aucune faiblesse critique supplémentaire n’a été détectée.',
    recommendation: 'Adapte le titre, le résumé et les compétences au poste réellement visé.',
  }];
  let y = 91;
  issues.forEach((issue, index) => {
    drawIssueCard(doc, left, y, width, issue, index);
    y += 128;
  });

  roundedPanel(doc, left, 503, width, 127, { fill: COLORS.panel, stroke: COLORS.border, radius: 8 });
  drawText(doc, 'Bonnes pratiques rapides', left + 14, 516, { size: 9, bold: true, width: 190, height: 14 });
  const tips = [
    ['Utilise des verbes d’action', 'Piloter, mettre en place, optimiser, développer…'],
    ['Sois concis et précis', 'Phrases courtes, idées claires, informations utiles.'],
    ['Quantifie tes impacts', 'Chiffres, volumes, délais ou budgets uniquement s’ils sont réels.'],
    ['Adapte ton CV', 'Mets en avant les compétences utiles pour chaque offre.'],
  ];
  const tipWidth = (width - 42) / 4;
  tips.forEach(([title, detail], index) => {
    const x = left + 14 + index * (tipWidth + 5);
    drawText(doc, title, x, 542, { size: 6.6, bold: true, color: COLORS.primaryDark, width: tipWidth, height: 22 });
    drawText(doc, detail, x, 570, { size: 6.1, color: COLORS.muted, width: tipWidth, height: 38 });
  });
  drawFooter(doc, 3, total);
};

const drawTag = (doc, value, x, y, width, color) => {
  roundedPanel(doc, x, y, width, 19, { fill: COLORS.white, stroke: color, radius: 5 });
  drawText(doc, value, x + 5, y + 6, { size: 6, bold: true, color, width: width - 10, height: 8, align: 'center' });
};

const drawPageFour = (doc, data, total) => {
  drawHeader(doc, 'Adéquation au poste ciblé', 4, total);
  const { left, width } = pageMetrics(doc);

  if (!data.target) {
    roundedPanel(doc, left, 76, width, 170, { fill: COLORS.white, stroke: COLORS.primary, radius: 8 });
    drawText(doc, 'CIBLE', left + 35, 120, { size: 11, bold: true, color: COLORS.primary, width: 65, height: 18, align: 'center' });
    drawText(doc, 'Aucune offre de poste fournie', left + 120, 111, { size: 14, bold: true, color: COLORS.primaryDark, width: width - 160, height: 22 });
    drawText(doc, "Ajoute une description de poste pour obtenir une analyse détaillée de l'adéquation de ton CV avec les attentes du recruteur. Aucune note artificielle n'est affichée lorsque l'offre n'est pas fournie.", left + 120, 140, {
      size: 8, color: COLORS.muted, width: width - 160, height: 50, lineGap: 3,
    });
    roundedPanel(doc, left + 120, 194, 165, 28, { fill: COLORS.primary, stroke: COLORS.primary, radius: 6 });
    drawText(doc, 'Analyser avec une offre de poste', left + 127, 203, { size: 7, bold: true, color: COLORS.white, width: 151, height: 10, align: 'center' });
  } else {
    roundedPanel(doc, left, 76, width, 170, { fill: COLORS.white, stroke: COLORS.primary, radius: 8 });
    drawText(doc, data.target.title || 'Poste ciblé', left + 22, 95, { size: 14, bold: true, color: COLORS.primaryDark, width: width - 44, height: 22 });
    const relevance = data.scores.targetRelevance;
    drawText(doc, relevance === null ? 'Non évaluée' : `${relevance} / 100`, left + 22, 129, {
      size: 22, bold: true, color: relevance === null ? COLORS.muted : statusColor(relevance, 100), width: 165, height: 28,
    });
    drawText(doc, relevance === null ? "La description du poste n'a pas permis de calculer un score fiable." : statusLabel(relevance, 100), left + 22, 161, {
      size: 7.6, bold: true, color: relevance === null ? COLORS.muted : statusColor(relevance, 100), width: 180, height: 32,
    });
    drawText(doc, 'Compétences déjà présentes', left + 210, 112, { size: 8, bold: true, width: 150, height: 12 });
    data.target.presentSkills.slice(0, 4).forEach((item, index) => drawTag(doc, item, left + 210, 133 + index * 25, 140, COLORS.primary));
    drawText(doc, 'À renforcer', left + 370, 112, { size: 8, bold: true, width: 100, height: 12 });
    data.target.missingSkills.slice(0, 4).forEach((item, index) => drawTag(doc, item, left + 370, 133 + index * 25, 140, COLORS.warning));
  }

  roundedPanel(doc, left, 269, width, 214, { fill: COLORS.panel, stroke: COLORS.border, radius: 8 });
  drawText(doc, 'Méthodologie et limites', left + 16, 284, { size: 10, bold: true, width: 190, height: 15 });
  drawText(doc, "Cette analyse repose sur des règles déterministes et explicables. Elle constitue une aide à l'amélioration du CV et non une décision de recrutement.", left + 16, 307, { size: 7.3, color: COLORS.muted, width: width - 32, height: 38, lineGap: 2.3 });
  const methodology = [
    "Analyse heuristique et explicable de la structure, de la lisibilité et de l'adéquation d'un CV avec une offre.",
    "Les systèmes de recrutement diffèrent selon les employeurs ; le résultat sert à améliorer le CV, pas à garantir une sélection.",
    'Aucune reconnaissance OCR, aucune probabilité d’entretien, aucune décision de recrutement.',
    ...data.limitations,
  ].filter((item, index, array) => item && array.indexOf(item) === index).slice(0, 5);
  methodology.forEach((item, index) => {
    doc.circle(left + 21, 353 + index * 25, 3.5).fill(COLORS.primary);
    drawText(doc, item, left + 34, 346 + index * 25, { size: 6.6, width: width - 50, height: 20 });
  });

  roundedPanel(doc, left, 507, width, 87, { fill: COLORS.primaryDark, stroke: COLORS.primaryDark, radius: 8 });
  drawText(doc, 'CV+', left + 24, 527, { size: 20, bold: true, color: COLORS.white, width: 45, height: 25, align: 'center' });
  drawText(doc, 'Ton CV a un fort potentiel !', left + 88, 522, { size: 13, bold: true, color: COLORS.white, width: width - 115, height: 20 });
  drawText(doc, "En mettant davantage en avant des résultats concrets et en adaptant le contenu au poste visé, tu renforces nettement l'impact du document.", left + 88, 545, { size: 7.7, color: '#E1EFE8', width: width - 115, height: 35, lineGap: 2.2 });

  roundedPanel(doc, left, 607, width, 50, { fill: '#F3F7FB', stroke: '#DCE6EF', radius: 8 });
  drawText(doc, `Référence de l'analyse : ${data.analysisId || 'non disponible'}`, left + 14, 621, { size: 6.3, color: COLORS.muted, width: width / 2 - 20, height: 12 });
  drawText(doc, `Version du rapport : ${data.reportVersion}`, left + width / 2, 621, { size: 6.3, color: COLORS.muted, width: width / 2 - 14, height: 12 });
  drawFooter(doc, 4, total);
};

const generateCvReportPdf = async (analysis, context = {}) => {
  const data = normalizeCvReportData(analysis, context);
  const totalPages = 4;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      autoFirstPage: true,
      info: {
        Title: "MAKOKI - Rapport d'analyse de CV",
        Author: 'MAKOKI',
        Subject: 'Analyse de CV',
        Creator: REPORT_VERSION,
      },
    });

    const chunks = [];
    let settled = false;
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('error', (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
    doc.on('end', () => {
      if (settled) return;
      const buffer = Buffer.concat(chunks);
      if (buffer.length > MAX_REPORT_BYTES) {
        settled = true;
        reject(new Error('CV report PDF exceeds the maximum allowed size.'));
        return;
      }
      settled = true;
      resolve(buffer);
    });

    try {
      drawPageOne(doc, data, totalPages);
      doc.addPage({ size: 'A4', margin: 0 });
      drawPageTwo(doc, data, totalPages);
      doc.addPage({ size: 'A4', margin: 0 });
      drawPageThree(doc, data, totalPages);
      doc.addPage({ size: 'A4', margin: 0 });
      drawPageFour(doc, data, totalPages);
      doc.end();
    } catch (error) {
      if (!settled) {
        settled = true;
        reject(error);
      }
    }
  });
};

const buildCvReportFileName = (_analysisId) => 'mon-rapport-cv-makoki.pdf';

module.exports = {
  MAX_REPORT_BYTES,
  REPORT_VERSION,
  assertNoRawContent,
  buildCvReportFileName,
  cleanText,
  generateCvReportPdf,
  normalizeCvReportData,
};
