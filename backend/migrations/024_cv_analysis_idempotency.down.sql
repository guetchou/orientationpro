ALTER TABLE cv_analyses
  DROP INDEX uq_cv_analyses_account_idempotency,
  DROP COLUMN request_fingerprint,
  DROP COLUMN idempotency_key;
