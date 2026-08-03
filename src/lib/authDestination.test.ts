import { describe, expect, it } from 'vitest';
import {
  destinationForRoles,
  hasMultipleAuthSpaces,
  spacesForRoles,
} from './authDestination';

describe('auth destinations', () => {
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

  it('keeps a deterministic fallback while exposing every distinct assigned space', () => {
    expect(destinationForRoles(['user', 'recruteur', 'admin'])).toBe('/admin/dashboard');
    expect(spacesForRoles(['user', 'recruteur', 'admin']).map((space) => space.destination)).toEqual([
      '/admin/dashboard',
      '/recruteur/dashboard',
      '/dashboard',
    ]);
    expect(hasMultipleAuthSpaces(['user', 'recruteur', 'admin'])).toBe(true);
  });

  it('does not show a selector for role aliases leading to the same space', () => {
    expect(hasMultipleAuthSpaces(['recruteur', 'recruiter', 'recruitment_manager'])).toBe(false);
  });

  it('falls back to the young user dashboard for missing or unknown roles', () => {
    expect(destinationForRoles(undefined)).toBe('/dashboard');
    expect(destinationForRoles(['unknown'])).toBe('/dashboard');
    expect(hasMultipleAuthSpaces(['user'])).toBe(false);
  });
});
