-- Lie une transaction OAuth a un compte pour le flux de LIAISON de compte.
-- account_id NULL = flux de connexion classique ; renseigne = flux de liaison
-- (l'identite sociale sera rattachee a ce compte deja authentifie).
ALTER TABLE auth_oauth_transactions
  ADD COLUMN account_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL AFTER provider;
