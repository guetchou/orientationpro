import { describe, expect, it } from 'vitest';
import { destinationForRoles } from './authDestination';

describe('destinationForRoles', () => {
  it.each([
    ['super_admin', '/superadmin/dashboard'],
    ['admin', '/admin/dashboard'],
    ['conseiller', '/conseiller/dashboard'],
    ['recruteur', '/recruteur/dashboard'],
    ['recruiter', '/recruteur/dashboard'],
    ['recruitment_manager', '/recruteur/dashboard'],
    ['coach', '/coach/dashboard'],
    ['rh', '/rh/dashboard'],
    ['user', '/dashboard'],
  ])('routes %s to %s', (role, destination) => {
    expect(destinationForRoles(role)).toBe(destination);
  });

  it('uses the most privileged recognized role when several roles are returned', () => {
    expect(destinationForRoles(['user', 'recruteur', 'admin'])).toBe('/admin/dashboard');
  });

  it('falls back to the user dashboard for missing or unknown roles', () => {
    expect(destinationForRoles(undefined)).toBe('/dashboard');
    expect(destinationForRoles(['unknown'])).toBe('/dashboard');
  });
});
