'use strict';

const PDFDocument = require('pdfkit');

const REPORT_VERSION = 'makoki-cv-report-v1';
const MAX_REPORT_BYTES = 4 * 1024 * 1024;

const MAX_LIST_ITEMS = 30;
const MAX_TEXT_LENGTH = 600;

const COLORS = {
  primary: '#009640',
  dark: '#202124',
  muted: '#5f6368',
  light: '#eef7f1',
  border: '#d7ded9',
  white: '#ffffff',
};

const SECTION_LABELS = {
  contact: 'Coordonnées',
  summary: 'Profil professionnel',
  experience: 'Expérience professionnelle',
  education: 'Formation',
  skills: 'Compétences',
  languages: 'Langues',
};

const SCORE_DEFINITIONS = {
  generalReadiness: { label: 'Préparation générale', maximum: 100 },
  structure: { label: 'Structure', maximum: 30 },
  contentClarity: { label: 'Clarté du contenu', maximum: 25 },
  impact: { label: 'Impact', maximum: 25 },
  technicalUsability: { label: 'Utilisabilité technique', maximum: 20 },
  targetRelevance: { label: 'Pertinence pour le poste ciblé', maximum: 100 },
};

const cleanText = (
  value,
  maximumLength = MAX_TEXT_LENGTH,
) => {
  if (
    value === undefined
    || value === null
  ) {
    return '';
  }

  return String(value)
    .normalize('NFKC')
    .replace(
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/gu,
      ' ',
    )
    .replace(/\s+/gu, ' ')
    .trim()
    .slice(0, maximumLength);
};

const boundedScore = (value) => {
  const numeric = Number(value);

  if (
    !Number.isFinite(numeric)
    || numeric < 0
    || numeric > 100
  ) {
    return null;
  }

  return Math.round(numeric);
};

const boundedArray = (
  value,
  mapper,
  maximumItems = MAX_LIST_ITEMS,
) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(0, maximumItems)
    .map(mapper)
    .filter(Boolean);
};

const assertNoRawContent = (
  value,
  currentPath = [],
) => {
  if (
    value === null
    || value === undefined
    || typeof value !== 'object'
  ) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      assertNoRawContent(
        item,
        [
          ...currentPath,
          String(index),
        ],
      );
    });

    return;
  }

  const forbidden = new Set([
    'text',
    'rawText',
    'raw_text',
    'cvText',
    'cv_text',
    'jobDescription',
    'job_description',
    'fileBuffer',
    'fileContent',
    'file_content',
  ]);

  for (
    const [key, nested]
    of Object.entries(value)
  ) {
    if (forbidden.has(key)) {
      throw new Error(
        'CV report snapshot contains forbidden raw content.',
      );
    }

    assertNoRawContent(
      nested,
      [
        ...currentPath,
        key,
      ],
    );
  }
};

const parseIsoTimestamp = (value) => {
  const normalized = cleanText(
    value,
    40,
  );

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/u,
  );

  if (!match) {
    return null;
  }

  const [
    ,
    yearText,
    monthText,
    dayText,
    hourText,
    minuteText,
    secondText,
    millisecondText = '000',
  ] = match;

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);

  const leapYear =
    year % 400 === 0
    || (
      year % 4 === 0
      && year % 100 !== 0
    );

  const daysPerMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  if (
    month < 1
    || month > 12
    || day < 1
    || day > daysPerMonth[month - 1]
    || hour < 0
    || hour > 23
    || minute < 0
    || minute > 59
    || second < 0
    || second > 59
  ) {
    return null;
  }

  return {
    display:
      `${dayText}/${monthText}/${yearText} `
      + `${hourText}:${minuteText} UTC`,

    iso:
      `${yearText}-${monthText}-${dayText}`
      + `T${hourText}:${minuteText}:${secondText}`
      + `.${millisecondText.padEnd(3, '0')}Z`,
  };
};

const formatUtcDate = (value) =>
  parseIsoTimestamp(value)?.display
  || 'Date non disponible';

const mimeTypeLabel = (mimeType) => {
  if (mimeType === 'application/pdf') {
    return 'PDF';
  }

  if (
    mimeType
    === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'DOCX';
  }

  return 'Document';
};

const normalizeCvReportData = (analysis) => {
  if (
    !analysis
    || typeof analysis !== 'object'
    || !analysis.snapshot
    || typeof analysis.snapshot !== 'object'
  ) {
    throw new Error(
      'CV report analysis snapshot is invalid.',
    );
  }

  assertNoRawContent(analysis.snapshot);

  const snapshot = analysis.snapshot;
  const document =
    snapshot.document
    || analysis.document
    || {};

  const scores = snapshot.scores || {};
  const targetMatch =
    snapshot.targetMatch
    && typeof snapshot.targetMatch === 'object'
      ? snapshot.targetMatch
      : null;

  const skills = boundedArray(
    snapshot.skills,
    (skill) => {
      if (
        !skill
        || typeof skill !== 'object'
      ) {
        return null;
      }

      const canonical = cleanText(
        skill.canonical,
        120,
      );

      if (!canonical) return null;

      return {
        canonical,
        domain: cleanText(
          skill.domain,
          120,
        ),
      };
    },
  );

  const strengths = boundedArray(
    snapshot.strengths,
    (strength) => {
      if (
        typeof strength === 'string'
      ) {
        return cleanText(strength);
      }

      if (
        !strength
        || typeof strength !== 'object'
      ) {
        return null;
      }

      return cleanText(
        strength.title
        || strength.code,
      );
    },
  );

  const issues = boundedArray(
    snapshot.issues,
    (issue) => {
      if (
        !issue
        || typeof issue !== 'object'
      ) {
        return null;
      }

      const title = cleanText(
        issue.title
        || issue.code,
      );

      if (!title) return null;

      return {
        title,
        severity: cleanText(
          issue.severity,
          40,
        ),
        observation: cleanText(
          issue.observation,
        ),
        recommendation: cleanText(
          issue.recommendation,
        ),
      };
    },
  );

  const limitations = boundedArray(
    snapshot.methodology?.limitations,
    (limitation) =>
      cleanText(limitation),
    10,
  );

  const sections = boundedArray(
    snapshot.sections,
    (section) => {
      if (
        !section
        || typeof section !== 'object'
        || section.present !== true
      ) {
        return null;
      }

      const key = cleanText(
        section.key,
        60,
      );

      return SECTION_LABELS[key] || key;
    },
    12,
  );

  return {
    reportVersion: REPORT_VERSION,
    analysisId: cleanText(
      analysis.id,
      64,
    ),
    algorithmVersion: cleanText(
      analysis.algorithmVersion
      || snapshot.methodology?.version,
      80,
    ),
    createdAt: formatUtcDate(
      analysis.createdAt,
    ),

    document: {
      fileName: cleanText(
        document.fileName
        || analysis.document?.fileName
        || 'CV',
        180,
      ),
      type: mimeTypeLabel(
        document.mimeType
        || analysis.document?.mimeType,
      ),
      fileSize:
        Number.isFinite(
          Number(document.fileSize),
        )
          ? Number(document.fileSize)
          : null,
      pageCount:
        Number.isSafeInteger(
          Number(document.pageCount),
        )
        && Number(document.pageCount) > 0
          ? Number(document.pageCount)
          : null,
      detectedLanguage: cleanText(
        document.detectedLanguage
        || analysis.document?.detectedLanguage
        || 'und',
        8,
      ),
    },

    scores: Object.fromEntries(
      Object.keys(SCORE_DEFINITIONS)
        .map((key) => [
          key,
          boundedScore(scores[key]),
        ]),
    ),

    contactPresence: {
      hasEmail:
        snapshot.contactPresence?.hasEmail
        === true,
      hasPhone:
        snapshot.contactPresence?.hasPhone
        === true,
    },

    sections,
    skills,
    strengths,
    issues,

    target: targetMatch
      ? {
          title: cleanText(
            analysis.targetTitle
            || targetMatch.jobTitle,
            255,
          ),
          presentSkills: boundedArray(
            targetMatch.presentSkills,
            (item) =>
              cleanText(item, 120),
          ),
          missingSkills: boundedArray(
            targetMatch.missingSkills,
            (item) =>
              cleanText(item, 120),
          ),
          requiredSkills: boundedArray(
            targetMatch.requiredSkills,
            (item) =>
              cleanText(item, 120),
          ),
          keywordOverlapPercent:
            boundedScore(
              targetMatch
                .keywordOverlapPercent,
            ),
        }
      : (
          analysis.targetTitle
            ? {
                title: cleanText(
                  analysis.targetTitle,
                  255,
                ),
                presentSkills: [],
                missingSkills: [],
                requiredSkills: [],
                keywordOverlapPercent:
                  null,
              }
            : null
        ),

    limitations,
  };
};

const ensureSpace = (
  document,
  minimumHeight = 80,
) => {
  const bottomLimit =
    document.page.height
    - document.page.margins.bottom
    - 28;

  if (
    document.y + minimumHeight
    > bottomLimit
  ) {
    document.addPage();
  }
};

const addSectionTitle = (
  document,
  title,
) => {
  ensureSpace(document, 70);

  document
    .moveDown(0.7)
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor(COLORS.primary)
    .text(title);

  document
    .moveDown(0.25)
    .strokeColor(COLORS.border)
    .lineWidth(1)
    .moveTo(
      document.page.margins.left,
      document.y,
    )
    .lineTo(
      document.page.width
      - document.page.margins.right,
      document.y,
    )
    .stroke()
    .moveDown(0.5);
};

const addKeyValue = (
  document,
  label,
  value,
) => {
  const safeValue =
    cleanText(value)
    || 'Non disponible';

  document
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(COLORS.dark)
    .text(
      `${label} : `,
      {
        continued: true,
      },
    )
    .font('Helvetica')
    .fillColor(COLORS.muted)
    .text(safeValue);
};

const addBulletList = (
  document,
  items,
  emptyMessage,
) => {
  if (!items.length) {
    document
      .font('Helvetica')
      .fontSize(10)
      .fillColor(COLORS.muted)
      .text(emptyMessage);

    return;
  }

  for (const item of items) {
    ensureSpace(document, 44);

    document
      .font('Helvetica')
      .fontSize(10)
      .fillColor(COLORS.dark)
      .text(
        `- ${cleanText(item)}`,
        {
          indent: 8,
          paragraphGap: 4,
        },
      );
  }
};

const addScore = (
  document,
  label,
  value,
  maximum,
) => {
  if (value === null) return;

  ensureSpace(document, 34);

  const left =
    document.page.margins.left;

  const width =
    document.page.width
    - document.page.margins.left
    - document.page.margins.right;

  const barWidth = width - 165;
  const y = document.y;

  document
    .font('Helvetica')
    .fontSize(10)
    .fillColor(COLORS.dark)
    .text(
      label,
      left,
      y,
      {
        width: 145,
      },
    );

  document
    .roundedRect(
      left + 150,
      y + 2,
      barWidth,
      10,
      4,
    )
    .fill(COLORS.light);

  document
    .roundedRect(
      left + 150,
      y + 2,
      Math.max(
        0,
        Math.min(
          barWidth,
          barWidth * value / maximum,
        ),
      ),
      10,
      4,
    )
    .fill(COLORS.primary);

  document
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(COLORS.dark)
    .text(
      `${value} / ${maximum}`,
      left + 150,
      y - 1,
      {
        width: barWidth,
        align: 'right',
      },
    );

  document.y = y + 22;
};

const renderCvReport = (
  document,
  data,
) => {
  const contentWidth =
    document.page.width
    - document.page.margins.left
    - document.page.margins.right;

  document
    .roundedRect(
      document.page.margins.left,
      document.page.margins.top,
      contentWidth,
      82,
      8,
    )
    .fill(COLORS.primary);

  document
    .font('Helvetica-Bold')
    .fontSize(25)
    .fillColor(COLORS.white)
    .text(
      'MAKOKI',
      document.page.margins.left + 18,
      document.page.margins.top + 16,
      {
        width: contentWidth - 36,
      },
    );

  document
    .font('Helvetica')
    .fontSize(14)
    .fillColor(COLORS.white)
    .text(
      "Rapport d'analyse de CV",
      document.page.margins.left + 18,
      document.page.margins.top + 48,
      {
        width: contentWidth - 36,
      },
    );

  document.y =
    document.page.margins.top + 102;

  addSectionTitle(
    document,
    'Informations du document',
  );

  addKeyValue(
    document,
    'Fichier',
    data.document.fileName,
  );

  addKeyValue(
    document,
    'Format',
    data.document.type,
  );

  addKeyValue(
    document,
    'Langue détectée',
    data.document.detectedLanguage,
  );

  if (data.document.pageCount !== null) {
    addKeyValue(
      document,
      'Nombre de pages',
      data.document.pageCount,
    );
  }

  addKeyValue(
    document,
    "Date de l'analyse",
    data.createdAt,
  );

  addKeyValue(
    document,
    'Version du moteur',
    data.algorithmVersion,
  );

  addSectionTitle(
    document,
    'Synthèse des scores',
  );

  for (
    const [key, definition]
    of Object.entries(SCORE_DEFINITIONS)
  ) {
    addScore(
      document,
      definition.label,
      data.scores[key],
      definition.maximum,
    );
  }

  addSectionTitle(
    document,
    'Éléments détectés',
  );

  addKeyValue(
    document,
    'Adresse e-mail détectée',
    data.contactPresence.hasEmail
      ? 'Oui'
      : 'Non',
  );

  addKeyValue(
    document,
    'Téléphone détecté',
    data.contactPresence.hasPhone
      ? 'Oui'
      : 'Non',
  );

  document
    .moveDown(0.4)
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(COLORS.dark)
    .text('Sections présentes');

  addBulletList(
    document,
    data.sections,
    'Aucune section reconnue.',
  );

  addSectionTitle(
    document,
    'Compétences détectées',
  );

  addBulletList(
    document,
    data.skills.map((skill) =>
      skill.domain
        ? `${skill.canonical} - ${skill.domain}`
        : skill.canonical
    ),
    'Aucune compétence canonique détectée.',
  );

  addSectionTitle(
    document,
    'Points forts',
  );

  addBulletList(
    document,
    data.strengths,
    'Aucun point fort spécifique identifié.',
  );

  addSectionTitle(
    document,
    "Axes d'amélioration",
  );

  if (!data.issues.length) {
    document
      .font('Helvetica')
      .fontSize(10)
      .fillColor(COLORS.muted)
      .text(
        "Aucun axe d'amélioration prioritaire identifié.",
      );
  }

  for (const issue of data.issues) {
    ensureSpace(document, 90);

    document
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(COLORS.dark)
      .text(
        issue.severity
          ? `${issue.title} (${issue.severity})`
          : issue.title,
      );

    if (issue.observation) {
      document
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor(COLORS.muted)
        .text(
          `Observation : ${issue.observation}`,
          {
            indent: 8,
          },
        );
    }

    if (issue.recommendation) {
      document
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor(COLORS.dark)
        .text(
          `Recommandation : ${issue.recommendation}`,
          {
            indent: 8,
            paragraphGap: 7,
          },
        );
    }
  }

  if (data.target) {
    addSectionTitle(
      document,
      'Analyse par rapport au poste ciblé',
    );

    addKeyValue(
      document,
      'Poste ciblé',
      data.target.title,
    );

    if (
      data.target.keywordOverlapPercent
      !== null
    ) {
      addKeyValue(
        document,
        'Recouvrement des mots-clés',
        `${data.target.keywordOverlapPercent} / 100`,
      );
    }

    document
      .moveDown(0.4)
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(COLORS.dark)
      .text(
        'Compétences du poste détectées dans le CV',
      );

    addBulletList(
      document,
      data.target.presentSkills,
      'Aucune compétence correspondante détectée.',
    );

    document
      .moveDown(0.4)
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(COLORS.dark)
      .text(
        'Compétences non détectées dans le CV',
      );

    addBulletList(
      document,
      data.target.missingSkills,
      'Aucune compétence manquante identifiée.',
    );
  }

  addSectionTitle(
    document,
    'Méthodologie et limites',
  );

  document
    .font('Helvetica')
    .fontSize(9.5)
    .fillColor(COLORS.dark)
    .text(
      "Cette analyse repose sur des règles déterministes et explicables. Elle constitue une aide à l'amélioration du CV et non une décision de recrutement.",
      {
        paragraphGap: 6,
      },
    );

  addBulletList(
    document,
    data.limitations,
    'Aucune limitation supplémentaire documentée.',
  );

  document
    .moveDown(0.8)
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(COLORS.muted)
    .text(
      `Référence de l'analyse : ${data.analysisId}`,
    );

  document.text(
    `Version du rapport : ${data.reportVersion}`,
  );
};

const addPageFooters = (
  document,
) => {
  const range =
    document.bufferedPageRange();

  for (
    let index = range.start;
    index < range.start + range.count;
    index += 1
  ) {
    document.switchToPage(index);

    const pageNumber =
      index - range.start + 1;

    document
      .font('Helvetica')
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text(
        `MAKOKI - Rapport d'analyse de CV - Page ${pageNumber}/${range.count}`,
        document.page.margins.left,
        document.page.height - 30,
        {
          width:
            document.page.width
            - document.page.margins.left
            - document.page.margins.right,
          align: 'center',
          lineBreak: false,
        },
      );
  }
};

const generateCvReportPdf = async (
  analysis,
) => {
  const data =
    normalizeCvReportData(analysis);

  return new Promise(
    (resolve, reject) => {
      const chunks = [];
      let totalBytes = 0;
      let settled = false;

      const document = new PDFDocument({
        size: 'A4',
        margins: {
          top: 46,
          right: 46,
          bottom: 52,
          left: 46,
        },
        bufferPages: true,
        compress: true,
        info: {
          Title:
            "MAKOKI - Rapport d'analyse de CV",
          Author: 'MAKOKI',
          Subject:
            'Analyse déterministe de CV',
          Keywords:
            'MAKOKI, CV, orientation, emploi',
        },
      });

      const fail = (error) => {
        if (settled) return;
        settled = true;
        reject(error);
      };

      document.on(
        'data',
        (chunk) => {
          totalBytes += chunk.length;

          if (
            totalBytes
            > MAX_REPORT_BYTES
          ) {
            fail(
              new Error(
                'Generated CV report exceeds the maximum size.',
              ),
            );

            return;
          }

          chunks.push(chunk);
        },
      );

      document.on(
        'error',
        fail,
      );

      document.on(
        'end',
        () => {
          if (settled) return;

          settled = true;

          resolve(
            Buffer.concat(
              chunks,
              totalBytes,
            ),
          );
        },
      );

      try {
        renderCvReport(
          document,
          data,
        );

        addPageFooters(document);
        document.end();
      } catch (error) {
        fail(error);
      }
    },
  );
};

const buildCvReportFileName = (
  analysisId,
) => {
  const safeId = cleanText(
    analysisId,
    64,
  )
    .replace(
      /[^a-zA-Z0-9_-]/gu,
      '',
    )
    .slice(0, 64);

  return safeId
    ? `rapport-cv-makoki-${safeId}.pdf`
    : 'rapport-cv-makoki.pdf';
};

module.exports = {
  MAX_REPORT_BYTES,
  REPORT_VERSION,
  assertNoRawContent,
  buildCvReportFileName,
  cleanText,
  generateCvReportPdf,
  normalizeCvReportData,
};
