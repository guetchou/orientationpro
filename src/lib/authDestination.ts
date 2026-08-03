export type AuthSpace = {
  role: string;
  label: string;
  destination: string;
};

const ROLE_SPACES: Record<string, Omit<AuthSpace, 'role'>> = {
  super_admin: { label: 'Superadministration', destination: '/superadmin/dashboard' },
  admin: { label: 'Administration', destination: '/admin/dashboard' },
  conseiller: { label: 'Espace conseiller', destination: '/conseiller/dashboard' },
  recruteur: { label: 'Espace recruteur', destination: '/recruteur/dashboard' },
  recruiter: { label: 'Espace recruteur', destination: '/recruteur/dashboard' },
  recruitment_manager: { label: 'Espace recruteur', destination: '/recruteur/dashboard' },
  coach: { label: 'Espace coach', destination: '/coach/dashboard' },
  rh: { label: 'Espace RH', destination: '/rh/dashboard' },
  user: { label: 'Espace jeune', destination: '/dashboard' },
};

const ROLE_PRIORITY = [
  'super_admin',
  'admin',
  'conseiller',
  'recruteur',
  'recruitment_manager',
  'recruiter',
  'coach',
  'rh',
  'user',
];

export const normalizeAuthRoles = (roles?: string | string[] | null): string[] => {
  const normalized = (Array.isArray(roles) ? roles : [roles])
    .filter((role): role is string => typeof role === 'string' && role.trim().length > 0)
    .map((role) => role.trim().toLowerCase())
    .filter((role) => Boolean(ROLE_SPACES[role]));

  return [...new Set(normalized)];
};

export const spacesForRoles = (roles?: string | string[] | null): AuthSpace[] => {
  const normalized = normalizeAuthRoles(roles);
  return ROLE_PRIORITY
    .filter((role) => normalized.includes(role))
    .map((role) => ({ role, ...ROLE_SPACES[role] }));
};

export const hasMultipleAuthSpaces = (roles?: string | string[] | null): boolean => (
  new Set(spacesForRoles(roles).map((space) => space.destination)).size > 1
);

export const destinationForRoles = (roles?: string | string[] | null): string => {
  const selected = spacesForRoles(roles)[0];
  return selected?.destination || '/dashboard';
};
