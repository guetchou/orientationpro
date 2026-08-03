import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const workspace = read('src/features/life-project/LifeProjectWorkspace.tsx');
const questionnaire = read('src/features/life-project/EmbeddedRiasecStep.tsx');
const page = read('src/features/life-project/UnifiedLifeProjectPage.tsx');
const completion = read('src/features/life-project/LifeProjectCompletionPanel.tsx');

describe('formulaire public du parcours', () => {
  it('annonce clairement les 60 affirmations et évite la double invitation à commencer', () => {
    expect(page).toContain('Commence par 60 affirmations');
    expect(page).not.toContain('Réponds à quelques questions');
    expect(page).not.toContain('Commence ton parcours');
    expect(questionnaire).toContain('Commencer le questionnaire');
    expect(questionnaire).not.toContain('Commencer le test');
  });

  it('utilise une échelle de réponse naturelle et un vocabulaire de questionnaire', () => {
    expect(questionnaire).toContain('À quel point cette affirmation te ressemble-t-elle ?');
    expect(questionnaire).not.toContain('pendant le test');
  });

  it('découpe la situation en quatre étapes courtes avec des choix normalisés', () => {
    expect(workspace).toContain("{ title: 'Ta situation'");
    expect(workspace).toContain("{ title: 'Tes possibilités'");
    expect(workspace).toContain("{ title: 'Ce que tu apportes'");
    expect(workspace).toContain("{ title: 'Tes priorités'");
    expect(workspace).toContain('<select className={fieldClass} required value={form.situation}');
    expect(workspace).toContain('<select className={fieldClass} required value={form.educationLevel}');
    expect(workspace).not.toContain("priorities: ['interest', 'cost', 'duration', 'employability']");
  });

  it('rend le classement des priorités explicite et cohérent avec leur poids', () => {
    expect(workspace).toContain('Priorité {index + 1}');
    expect(workspace).toContain('La première comptera davantage que la deuxième');
    expect(workspace).toContain('importanceByPosition');
    expect(workspace).not.toContain('type="checkbox"');
  });

  it('retire les formulations administratives du rapport utilisateur', () => {
    const combined = `${workspace}\n${completion}`;
    for (const forbidden of [
      'faisabilité de tes choix',
      'Choix provisoire',
      'Piste choisie provisoirement',
      'Preuve attendue',
      'Accès / zone',
      'donnée non vérifiée',
    ]) {
      expect(combined).not.toContain(forbidden);
    }
    expect(completion).toContain('Piste retenue pour la suite');
    expect(completion).toContain('Résultat attendu');
  });
});
