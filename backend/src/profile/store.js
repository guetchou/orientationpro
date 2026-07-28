'use strict';

const parseJson = (value) => typeof value === 'string' ? JSON.parse(value) : value;

const calculateCompletion = (profile) => {
  const fields = ['first_name','last_name','city','current_situation','primary_goal','mobility_scope'];
  const completed = fields.filter((field) => Boolean(profile?.[field])).length;
  return Math.round((completed / fields.length) * 100);
};

const createProfileStore = (pool) => {
  if (!pool || typeof pool.execute !== 'function') throw new Error('A MySQL pool is required.');

  return {
    async getProfile(accountId) {
      const [[profile]] = await pool.execute('SELECT * FROM account_profiles WHERE account_id = ? LIMIT 1', [accountId]);
      const [education] = await pool.execute('SELECT * FROM account_education_history WHERE account_id = ? ORDER BY start_year DESC, created_at DESC', [accountId]);
      const [skills] = await pool.execute('SELECT * FROM account_profile_skills WHERE account_id = ? ORDER BY confirmation_status, label', [accountId]);
      const [hypotheses] = await pool.execute('SELECT * FROM account_profile_hypotheses WHERE account_id = ? ORDER BY created_at DESC', [accountId]);
      return {
        profile: profile || null,
        education,
        skills,
        hypotheses: hypotheses.map((item) => ({ ...item, value_json: parseJson(item.value_json), confidence: item.confidence === null ? null : Number(item.confidence) })),
      };
    },

    async upsertProfile(accountId, input) {
      const allowed = ['first_name','last_name','phone','city','country_code','current_situation','primary_goal','mobility_scope','profile_summary'];
      const profile = Object.fromEntries(allowed.map((key) => [key, input[key] ?? null]));
      const completion = calculateCompletion(profile);
      await pool.execute(
        `INSERT INTO account_profiles (account_id, first_name, last_name, phone, city, country_code, current_situation, primary_goal, mobility_scope, profile_summary, completion_percent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE first_name=VALUES(first_name), last_name=VALUES(last_name), phone=VALUES(phone), city=VALUES(city), country_code=VALUES(country_code), current_situation=VALUES(current_situation), primary_goal=VALUES(primary_goal), mobility_scope=VALUES(mobility_scope), profile_summary=VALUES(profile_summary), completion_percent=VALUES(completion_percent)`,
        [accountId, ...allowed.map((key) => profile[key]), completion],
      );
      return this.getProfile(accountId);
    },
  };
};

module.exports = { calculateCompletion, createProfileStore };