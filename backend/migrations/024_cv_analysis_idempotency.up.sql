ALTER TABLE cv_analyses
  ADD COLUMN idempotency_key VARCHAR(128) NULL AFTER account_id,
  ADD COLUMN request_fingerprint CHAR(64) NULL AFTER idempotency_key,
  ADD UNIQUE KEY uq_cv_analyses_account_idempotency (account_id, idempotency_key);
