INSERT INTO auth_permissions (id, description) VALUES
  ('career.catalog.read', 'Consulter le référentiel versionné des métiers'),
  ('career.match.read_own', 'Calculer et consulter les correspondances métiers de ses propres Résultats d’orientation');

INSERT INTO auth_role_permissions (role_id, permission_id) VALUES
  ('user', 'career.catalog.read'),
  ('user', 'career.match.read_own'),
  ('conseiller', 'career.catalog.read'),
  ('conseiller', 'career.match.read_own'),
  ('coach', 'career.catalog.read'),
  ('coach', 'career.match.read_own'),
  ('recruteur', 'career.catalog.read'),
  ('recruteur', 'career.match.read_own'),
  ('rh', 'career.catalog.read'),
  ('rh', 'career.match.read_own'),
  ('admin', 'career.catalog.read'),
  ('admin', 'career.match.read_own'),
  ('super_admin', 'career.catalog.read'),
  ('super_admin', 'career.match.read_own');
