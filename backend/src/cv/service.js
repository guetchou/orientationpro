'use strict';

const { createHash, randomUUID } = require('node:crypto');

const { ALGORITHM_VERSION, analyzeCv } = require('./analyzer');
const { CvInputError } = require('./errors');
const { extractCvFile } = require('./extractor');
const { buildCvReportFileName, generateCvReportPdf } = require('./report');

const MAX_JOB_TITLE_LENGTH = 255;
const MAX_JOB_DESCRIPTION_LENGTH = 20000;
const MAX_REQUIRED_SKILLS = 100;
const MAX_REQUIRED_SKILL_LENGTH = 120;
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9._:-]{16,128}$/;
const FINGERPRINT_PATTERN = /^[a-f0-9]{64}$/;

const normalizeOptionalText = (value, field, maximumLength) => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw new CvInputError('CV_TARGET_INVALID', { field });
  const normalized = value.normalize('NFKC').trim();
  if (normalized.length > maximumLength) {
    throw new CvInputError('CV_TARGET_INVALID', { field, maximumLength });
  }
  return normalized || null;
};

const parseRequiredSkills = (value) => {
  if (value === undefined || value === null || value === '') return [];
  let items = value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try { items = JSON.parse(trimmed); } catch {
        throw new CvInputError('CV_TARGET_INVALID', { field: 'requiredSkills' });
      }
    } else {
      items = trimmed.split(/[\n,;]+/u);
    }
  }
  if (!Array.isArray(items)) throw new CvInputError('CV_TARGET_INVALID', { field: 'requiredSkills' });
  if (items.length > MAX_REQUIRED_SKILLS) {
    throw new CvInputError('CV_TARGET_INVALID', { field: 'requiredSkills', maximumItems: MAX_REQUIRED_SKILLS });
  }
  const unique = [];
  const seen = new Set();
  for (const item of items) {
    if (typeof item !== 'string') throw new CvInputError('CV_TARGET_INVALID', { field: 'requiredSkills' });
    const normalized = item.normalize('NFKC').trim();
    if (!normalized) continue;
    if (normalized.length > MAX_REQUIRED_SKILL_LENGTH) {
      throw new CvInputError('CV_TARGET_INVALID', { field: 'requiredSkills', maximumItemLength: MAX_REQUIRED_SKILL_LENGTH });
    }
    const key = normalized.toLocaleLowerCase('fr');
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(normalized);
    }
  }
  return unique;
};

const normalizeTargetInput = (body = {}) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new CvInputError('CV_TARGET_INVALID');
  }
  return {
    jobTitle: normalizeOptionalText(body.jobTitle, 'jobTitle', MAX_JOB_TITLE_LENGTH),
    jobDescription: normalizeOptionalText(body.jobDescription, 'jobDescription', MAX_JOB_DESCRIPTION_LENGTH),
    requiredSkills: parseRequiredSkills(body.requiredSkills),
  };
};

const normalizeIdempotency = ({ idempotencyKey, requestFingerprint } = {}) => {
  const key = typeof idempotencyKey === 'string' ? idempotencyKey.trim() : '';
  const fingerprint = typeof requestFingerprint === 'string' ? requestFingerprint.trim().toLowerCase() : '';
  if (!key && !fingerprint) return { idempotencyKey: null, requestFingerprint: null };
  if (!IDEMPOTENCY_KEY_PATTERN.test(key) || !FINGERPRINT_PATTERN.test(fingerprint)) {
    throw new CvInputError('CV_IDEMPOTENCY_INVALID');
  }
  return { idempotencyKey: key, requestFingerprint: fingerprint };
};

const buildServerFingerprint = ({ sourceSha256, target }) => createHash('sha256')
  .update(JSON.stringify({
    sourceSha256,
    target: {
      jobTitle: target.jobTitle,
      jobDescription: target.jobDescription,
      requiredSkills: target.requiredSkills,
    },
    algorithmVersion: ALGORITHM_VERSION,
  }))
  .digest('hex');

const assertSnapshotContainsNoRawContent = (value, path = []) => {
  if (value === null || value === undefined || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSnapshotContainsNoRawContent(item, [...path, String(index)]));
    return;
  }
  const forbiddenKeys = new Set([
    'text', 'rawText', 'raw_text', 'cvText', 'cv_text', 'jobDescription', 'job_description', 'fileBuffer', 'fileContent',
  ]);
  for (const [key, nested] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) {
      throw new Error(`CV snapshot contains forbidden raw field: ${[...path, key].join('.')}`);
    }
    assertSnapshotContainsNoRawContent(nested, [...path, key]);
  }
};

const createCvService = ({
  store,
  extractor = extractCvFile,
  analyzer = analyzeCv,
  createId = randomUUID,
  reportGenerator = generateCvReportPdf,
  profileReader = async () => ({ profile: null }),
} = {}) => {
  if (
    !store
    || typeof store.createAnalysis !== 'function'
    || typeof store.listAnalyses !== 'function'
    || typeof store.getAnalysis !== 'function'
    || typeof store.deleteAnalysis !== 'function'
  ) {
    throw new Error('A complete CV store is required.');
  }

  return {
    async createPreview({ file, body = {} }) {
      const target = normalizeTargetInput(body);
      const extracted = await extractor(file);
      const analyzed = analyzer({
        text: extracted.text,
        jobTitle: target.jobTitle,
        jobDescription: target.jobDescription,
        requiredSkills: target.requiredSkills,
        fileName: extracted.document.fileName,
        mimeType: extracted.document.mimeType,
        fileSize: extracted.document.fileSize,
      });
      const sections = Array.isArray(analyzed.sections) ? analyzed.sections : [];
      const strengths = Array.isArray(analyzed.strengths) ? analyzed.strengths : [];
      const issues = Array.isArray(analyzed.issues) ? analyzed.issues : [];
      const priorityIssue = issues.find((issue) => issue?.severity === 'critique' || issue?.severity === 'important');
      return {
        kind: 'cv-preview-v1',
        score: analyzed.scores?.generalReadiness ?? null,
        targetScore: analyzed.scores?.targetRelevance ?? null,
        sectionsPresent: sections.filter((section) => section?.present).length,
        sectionsTotal: sections.length,
        highlights: strengths.map((strength) => strength?.title).filter((title) => typeof title === 'string' && title.trim()).slice(0, 2),
        priorityAction: priorityIssue?.recommendation || 'Connecte-toi pour consulter les recommandations detaillees.',
        authenticationRequiredFor: ['full_report', 'export', 'save'],
      };
    },

    async createAnalysis({ accountId, file, body = {}, idempotencyKey, requestFingerprint }) {
      const target = normalizeTargetInput(body);
      const idempotency = normalizeIdempotency({ idempotencyKey, requestFingerprint });

      if (idempotency.idempotencyKey && typeof store.getAnalysisByIdempotencyKey === 'function') {
        const existing = await store.getAnalysisByIdempotencyKey({
          accountId,
          idempotencyKey: idempotency.idempotencyKey,
        });
        if (existing) {
          if (existing.requestFingerprint !== idempotency.requestFingerprint) {
            throw new CvInputError('CV_IDEMPOTENCY_CONFLICT');
          }
          return existing.analysis;
        }
      }

      const extracted = await extractor(file);
      const serverFingerprint = buildServerFingerprint({
        sourceSha256: extracted.document.sha256,
        target,
      });
      if (idempotency.requestFingerprint && serverFingerprint !== idempotency.requestFingerprint) {
        throw new CvInputError('CV_IDEMPOTENCY_INVALID');
      }

      const analyzed = analyzer({
        text: extracted.text,
        jobTitle: target.jobTitle,
        jobDescription: target.jobDescription,
        requiredSkills: target.requiredSkills,
        fileName: extracted.document.fileName,
        mimeType: extracted.document.mimeType,
        fileSize: extracted.document.fileSize,
      });

      const snapshot = JSON.parse(JSON.stringify({
        ...analyzed,
        document: { ...analyzed.document, pageCount: extracted.document.pageCount },
      }));
      assertSnapshotContainsNoRawContent(snapshot);

      return store.createAnalysis({
        id: createId(),
        accountId,
        idempotencyKey: idempotency.idempotencyKey,
        requestFingerprint: idempotency.requestFingerprint,
        algorithmVersion: snapshot.methodology?.version || ALGORITHM_VERSION,
        fileName: extracted.document.fileName,
        mimeType: extracted.document.mimeType,
        fileSize: extracted.document.fileSize,
        pageCount: extracted.document.pageCount,
        sourceSha256: extracted.document.sha256,
        detectedLanguage: snapshot.document.detectedLanguage,
        generalReadiness: snapshot.scores.generalReadiness,
        targetRelevance: snapshot.scores.targetRelevance,
        targetTitle: target.jobTitle || snapshot.targetMatch?.jobTitle || null,
        snapshot,
      });
    },

    listAnalyses({ accountId, limit, offset }) {
      return store.listAnalyses({ accountId, limit, offset });
    },

    getAnalysis({ accountId, analysisId }) {
      return store.getAnalysis({ accountId, analysisId });
    },

    async getReport({ accountId, analysisId }) {
      const analysis = await store.getAnalysis({ accountId, analysisId });
      if (!analysis) return null;
      const buffer = await reportGenerator(analysis, {
        beneficiary: await profileReader(accountId).then(({ profile } = {}) => profile ? ({
          firstName: profile.first_name,
          lastName: profile.last_name,
          currentSituation: profile.current_situation,
          primaryGoal: profile.primary_goal,
        }) : null),
      });
      return { buffer, fileName: buildCvReportFileName(analysis.id) };
    },

    deleteAnalysis({ accountId, analysisId }) {
      return store.deleteAnalysis({ accountId, analysisId });
    },
  };
};

module.exports = {
  MAX_JOB_DESCRIPTION_LENGTH,
  MAX_JOB_TITLE_LENGTH,
  MAX_REQUIRED_SKILLS,
  MAX_REQUIRED_SKILL_LENGTH,
  assertSnapshotContainsNoRawContent,
  buildServerFingerprint,
  createCvService,
  normalizeIdempotency,
  normalizeTargetInput,
  parseRequiredSkills,
};
