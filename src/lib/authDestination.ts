const ROLE_DESTINATIONS: Record<string, string> = {
  super_admin: '/superadmin/dashboard',
  admin: '/admin/dashboard',
  conseiller: '/conseiller/dashboard',
  recruteur: '/recruteur/dashboard',
  recruiter: '/recruteur/dashboard',
  recruitment_manager: '/recruteur/dashboard',
  coach: '/coach/dashboard',
  rh: '/rh/dashboard',
  user: '/dashboard',
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

export const destinationForRoles = (roles?: string | string[] | null): string => {
  const normalized = (Array.isArray(roles) ? roles : [roles])
    .filter((role): role is string => typeof role === 'string' && role.length > 0)
    .map((role) => role.trim().toLowerCase());

  const selected = ROLE_PRIORITY.find((role) => normalized.includes(role));
  return selected ? ROLE_DESTINATIONS[selected] : '/dashboard';
};
