import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  fileURLToPath(new URL('./UnifiedLifeProjectPage.tsx', import.meta.url)),
  'utf8',
);

const componentSource = (name: string, nextName: string) => {
  const start = source.indexOf(`const ${name}`);
  const end = source.indexOf(`const ${nextName}`, start + 1);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end);
};

describe('verrou de résultat invité', () => {
  it('ne montre qu’une tendance principale sans compte', () => {
    const guestPreview = componentSource('GuestPreview', 'FullCareerValue');

    expect(guestPreview).toContain('topRiasecDimensions(profile)[0]');
    expect(guestPreview).toContain('Une première tendance se dégage');
    expect(guestPreview).toContain('Ton résultat complet tient compte de plusieurs tendances');
    expect(guestPreview).not.toContain('guestCareerFamilies');
    expect(guestPreview).not.toContain('/careers');
    expect(guestPreview).not.toContain('examples.join');
  });

  it('réserve les familles de métiers détaillées à la branche authentifiée', () => {
    expect(source).toMatch(/user \? \([\s\S]*<RiasecProfileSummary profile=\{riasecProfile\} \/>[\s\S]*<FullCareerValue profile=\{riasecProfile\} \/>/u);
    expect(source).toMatch(/\) : \([\s\S]*<GuestPreview profile=\{riasecProfile\} \/>[\s\S]*data-testid="guest-registration-gate"/u);
  });

  it('propose l’inscription ou la connexion sans échappatoire vers le catalogue', () => {
    const unauthenticatedStart = source.indexOf('<GuestPreview profile={riasecProfile} />');
    const unauthenticatedEnd = source.indexOf('</>', unauthenticatedStart);
    const unauthenticated = source.slice(unauthenticatedStart, unauthenticatedEnd);

    expect(unauthenticated).toContain('to="/register"');
    expect(unauthenticated).toContain('to="/login"');
    expect(unauthenticated).not.toContain('to="/careers"');
  });
});
