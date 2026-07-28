'use strict';

const crypto = require('node:crypto');

const parseJson = (value) => typeof value === 'string' ? JSON.parse(value) : value;

const PROFILE_FIELDS = [
  'first_name',
  'last_name',
  'phone',
  'city',
  'country_code',
  'current_situation',
  'primary_goal',
  'mobility_scope',
  'profile_summary',
];

const COMPLETION_FIELDS = [
  'first_name',
  'last_name',
  'city',
  'current_situation',
  'primary_goal',
  'mobility_scope',
];

const EDUCATION_LEVELS = new Set([
  'primary',
  'middle_school',
  'high_school',
  'baccalaureate',
  'vocational',
  'bac_plus_1',
  'bac_plus_2',
  'licence',
  'master',
  'doctorate',
  'other',
]);
const EDUCATION_STATUSES = new Set(['in_progress', 'completed', 'interrupted']);
const PROFICIENCY_LEVELS = new Set(['beginner', 'intermediate', 'advanced', 'expert', 'unknown']);
const HYPOTHESIS_STATUSES = new Set(['confirmed', 'rejected']);

const calculateCompletion = (profile) => {
  const completed = COMPLETION_FIELDS.filter((field) => Boolean(profile?.[field])).length;
  return Math.round((completed / COMPLETION_FIELDS.length) * 100);
};

const cleanText = (value, field, maximumLength) => {
  if (value === undefined || value === null || value === '') return null;
  const text = String(value).trim();
  if (!text) return null;
  if (text.length > maximumLength) throw new TypeError(`${field} is too long.`);
  return text;
};

const requiredChoice = (value, field, choices) => {
  const normalized = cleanText(value, field, 64);
  if (!normalized || !choices.has(normalized)) throw new TypeError(`${field} is invalid.`);
  return normalized;
};

const optionalYear = (value, field) => {
  if (value === undefined || value === null || value === '') return null;
  const year = Number(value);
  const maximum = new Date().getUTCFullYear() + 10;
  if (!Number.isInteger(year) || year < 1900 || year > maximum) {
    throw new TypeError(`${field} is invalid.`);
  }
  return year;
};

const normalizeEducationEntry = (entry = {}) => {
  const normalized = {
    id: crypto.randomUUID(),
    education_level: requiredChoice(entry.education_level, 'education_level', EDUCATION_LEVELS),
    status: requiredChoice(entry.status, 'status', EDUCATION_STATUSES),
    diploma_name: cleanText(entry.diploma_name, 'diploma_name', 255),
    field_of_study: cleanText(entry.field_of_study, 'field_of_study', 255),
    institution: cleanText(entry.institution, 'institution', 255),
    country_code: cleanText(entry.country_code, 'country_code', 2)?.toUpperCase() || null,
    start_year: optionalYear(entry.start_year, 'start_year'),
    end_year: optionalYear(entry.end_year, 'end_year'),
  };
  if (normalized.start_year && normalized.end_year && normalized.end_year < normalized.start_year) {
    throw new TypeError('end_year cannot be before start_year.');
  }
  return normalized;
};

const normalizeDeclaredSkill = (entry = {}) => ({
  id: crypto.randomUUID(),
  label: cleanText(entry.label, 'label', 255),
  esco_uri: cleanText(entry.esco_uri, 'esco_uri', 512),
  proficiency: requiredChoice(entry.proficiency || 'unknown', 'proficiency', PROFICIENCY_LEVELS),
  evidence: cleanText(entry.evidence, 'evidence', 2000),
});

const boundedLimit = (value, fallback = 10, maximum = 20) => {
  const number = Number(value ?? fallback);
  if (!Number.isInteger(number) || number < 1) return fallback;
  return Math.min(number, maximum);
};

const createProfileStore = (pool) => {
  if (!pool || typeof pool.execute !== 'function') {
    throw new Error('A MySQL pool is required for the profile store.');
  }

  const getProfile = async (accountId) => {
    const [[profile]] = await pool.execute(
      'SELECT * FROM account_profiles WHERE account_id = ? LIMIT 1',
      [accountId],
    );
    const [education] = await pool.execute(
      'SELECT * FROM account_education_history WHERE account_id = ? ORDER BY start_year DESC, created_at DESC',
      [accountId],
    );
    const [skills] = await pool.execute(
      'SELECT * FROM account_profile_skills WHERE account_id = ? ORDER BY confirmation_status, label',
      [accountId],
    );
    const [hypotheses] = await pool.execute(
      'SELECT * FROM account_profile_hypotheses WHERE account_id = ? ORDER BY created_at DESC',
      [accountId],
    );

    return {
      profile: profile || null,
      education,
      skills,
      hypotheses: hypotheses.map((item) => ({
        ...item,
        value_json: parseJson(item.value_json),
        confidence: item.confidence === null ? null : Number(item.confidence),
      })),
    };
  };

  return {
    getProfile,

    async upsertProfile(accountId, input = {}) {
      const profile = Object.fromEntries(
        PROFILE_FIELDS.map((key) => [key, input[key] ?? null]),
      );
      const completion = calculateCompletion(profile);

      await pool.execute(
        `INSERT INTO account_profiles (
           account_id, first_name, last_name, phone, city, country_code,
           current_situation, primary_goal, mobility_scope, profile_summary,
           completion_percent
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           first_name = VALUES(first_name),
           last_name = VALUES(last_name),
           phone = VALUES(phone),
           city = VALUES(city),
           country_code = VALUES(country_code),
           current_situation = VALUES(current_situation),
           primary_goal = VALUES(primary_goal),
           mobility_scope = VALUES(mobility_scope),
           profile_summary = VALUES(profile_summary),
           completion_percent = VALUES(completion_percent)`,
        [accountId, ...PROFILE_FIELDS.map((key) => profile[key]), completion],
      );

      return getProfile(accountId);
    },

    async replaceEducation(accountId, input = []) {
      if (!Array.isArray(input) || input.length > 20) {
        throw new TypeError('education must contain at most 20 entries.');
      }
      const education = input.map(normalizeEducationEntry);
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.execute('DELETE FROM account_education_history WHERE account_id = ?', [accountId]);
        for (const entry of education) {
          await connection.execute(
            `INSERT INTO account_education_history (
               id, account_id, education_level, status, diploma_name, field_of_study,
               institution, country_code, start_year, end_year
             ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              entry.id,
              accountId,
              entry.education_level,
              entry.status,
              entry.diploma_name,
              entry.field_of_study,
              entry.institution,
              entry.country_code,
              entry.start_year,
              entry.end_year,
            ],
          );
        }
        await connection.commit();
      } catch (error) {
        await connection.rollback().catch(() => undefined);
        throw error;
      } finally {
        connection.release();
      }
      return getProfile(accountId);
    },

    async replaceDeclaredSkills(accountId, input = []) {
      if (!Array.isArray(input) || input.length > 50) {
        throw new TypeError('skills must contain at most 50 entries.');
      }
      const skills = input.map(normalizeDeclaredSkill);
      if (skills.some((skill) => !skill.label)) throw new TypeError('Every skill requires a label.');
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.execute(
          "DELETE FROM account_profile_skills WHERE account_id = ? AND source = 'declared'",
          [accountId],
        );
        for (const skill of skills) {
          await connection.execute(
            `INSERT INTO account_profile_skills (
               id, account_id, label, esco_uri, proficiency, source,
               confirmation_status, evidence
             ) VALUES (?, ?, ?, ?, ?, 'declared', 'confirmed', ?)`,
            [skill.id, accountId, skill.label, skill.esco_uri, skill.proficiency, skill.evidence],
          );
        }
        await connection.commit();
      } catch (error) {
        await connection.rollback().catch(() => undefined);
        throw error;
      } finally {
        connection.release();
      }
      return getProfile(accountId);
    },

    async updateHypothesisStatus(accountId, hypothesisId, status) {
      const normalizedStatus = requiredChoice(status, 'status', HYPOTHESIS_STATUSES);
      const [result] = await pool.execute(
        `UPDATE account_profile_hypotheses
         SET status = ?
         WHERE id = ? AND account_id = ? AND status = 'proposed'`,
        [normalizedStatus, hypothesisId, accountId],
      );
      if (!result.affectedRows) return null;
      return getProfile(accountId);
    },

    async searchSkills({ query, locale = 'fr', limit } = {}) {
      const normalizedQuery = cleanText(query, 'query', 100);
      if (!normalizedQuery || normalizedQuery.length < 2) return [];
      const normalizedLocale = cleanText(locale, 'locale', 16) || 'fr';
      const resultLimit = boundedLimit(limit);
      const contains = `%${normalizedQuery}%`;
      const startsWith = `${normalizedQuery}%`;
      const [rows] = await pool.execute(
        `SELECT
           skill.id,
           skill.source_code AS esco_uri,
           skill.preferred_label AS label,
           skill.description,
           skill.skill_kind,
           source.source_version AS esco_version,
           skill.locale
         FROM career_skills skill
         JOIN career_catalog_sources source ON source.id = skill.catalog_source_id
         WHERE source.source_kind = 'esco'
           AND skill.locale = ?
           AND (skill.preferred_label LIKE ? OR skill.description LIKE ?)
         ORDER BY
           CASE WHEN skill.preferred_label LIKE ? THEN 0 ELSE 1 END,
           CHAR_LENGTH(skill.preferred_label),
           skill.preferred_label
         LIMIT ${resultLimit}`,
        [normalizedLocale, contains, contains, startsWith],
      );
      return rows;
    },
  };
};

module.exports = {
  calculateCompletion,
  createProfileStore,
};
