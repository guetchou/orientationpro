import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(process.cwd(), 'src/features/life-project/LifeProjectWorkspace.tsx'),
  'utf8',
);

describe('synthèse du projet de vie', () => {
  it('affiche le calendrier et les modalités pour chaque piste', () => {
    expect(source).toContain('const scenarioCalendar');
    expect(source).toContain("scenario.calendar.status === 'unknown'");
    expect(source).toContain('Dates à confirmer auprès de l’organisme');
    expect(source).toContain('const scenarioModes');
    expect(source).toContain('Modalités à confirmer');
    expect(source).toMatch(/<h3 className="font-semibold">Calendrier<\/h3>[\s\S]*scenarioCalendar\(scenario\)/u);
    expect(source).toMatch(/<h3 className="font-semibold">Modalités<\/h3>[\s\S]*scenarioModes\(scenario\)/u);
  });

  it('produit une synthèse imprimable du choix provisoire', () => {
    expect(source).toContain('id="life-project-summary"');
    expect(source).toContain('Ta synthèse de projet');
    expect(source).toContain('Piste retenue');
    expect(source).toContain('Première action');
    expect(source).toContain('window.print()');
    expect(source).toContain('Imprimer ma synthèse');
  });

  it('maintient les limites et vérifications avant engagement', () => {
    expect(source).toContain('Choix provisoire');
    expect(source).toContain('Elle ne remplace ni les conditions officielles ni une décision accompagnée.');
    expect(source).toContain('Vérifie les admissions, les coûts, les dates, les modalités et les débouchés');
  });
});
