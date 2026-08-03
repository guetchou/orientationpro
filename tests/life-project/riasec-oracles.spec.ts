import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';
import { E2E_BACKEND_PORT, expect, test } from './fixtures';

// Rejoue en navigateur réel un sous-ensemble représentatif de la banque
// d'oracles RIASEC (tests/life-project/oracles/riasec-profiles.v1.json,
// générée par backend/scripts/generate-riasec-oracles.js à partir du VRAI
// moteur de score) et compare le résultat stocké côté API aux valeurs
// exactes attendues — preuve que navigateur + API + DB reproduisent
// fidèlement le moteur canonique, pas seulement que le moteur seul est juste
// (déjà couvert par backend/test/riasec-oracle-bank.test.js).
//
// L'ordre des items est mélangé par tentative (voir critical-path.spec.ts) :
// chaque question est donc identifiée par son texte affiché, jamais par sa
// position, via la table id -> prompt de riasec-items.v1.json.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bank = JSON.parse(readFileSync(path.join(__dirname, 'oracles', 'riasec-profiles.v1.json'), 'utf8'));
const itemsTable = JSON.parse(readFileSync(path.join(__dirname, 'oracles', 'riasec-items.v1.json'), 'utf8'));

const promptToItemId = new Map<string, string>(
  Object.entries(itemsTable.items as Record<string, { prompt: string }>).map(([id, item]) => [item.prompt, id]),
);

type RiasecDimension = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

const profileById = (id: string) => {
  const profile = bank.profiles.find((entry: { id: string }) => entry.id === id);
  if (!profile) throw new Error(`Unknown oracle profile: ${id}`);
  return profile as {
    id: string;
    responses: Array<{ itemId: string; value: number }>;
    expected: {
      scores: Record<RiasecDimension, { normalized: number }>;
      ranking: { primaryCode: string | null; displayCode: string };
    };
  };
};

const responseByItemId = (profile: ReturnType<typeof profileById>) => new Map(
  profile.responses.map((response) => [response.itemId, response.value]),
);

// Répond au questionnaire en cours en suivant EXACTEMENT le profil d'oracle
// fourni, quel que soit l'ordre (mélangé) dans lequel les affirmations sont
// présentées : chaque question est reconnue par son texte, pas sa position.
const answerRiasecSurveyAsProfile = async (page: Page, profile: ReturnType<typeof profileById>) => {
  await expect(page.getByTestId('unified-riasec-intro')).toBeVisible();
  await page.getByRole('button', { name: 'Commencer le questionnaire' }).click();
  await expect(page.getByTestId('unified-riasec-questions')).toBeVisible();

  const values = responseByItemId(profile);
  const knownPrompts = [...promptToItemId.keys()];
  for (let guard = 0; guard < 100; guard += 1) {
    const questions = page.getByTestId('unified-riasec-questions');
    if (!(await questions.isVisible().catch(() => false))) break;

    await expect(questions.getByRole('heading', { name: /^Affirmation \d+ sur \d+$/ })).toBeVisible();
    // Le texte de la question est le seul contenu de ce bloc qui corresponde
    // à une affirmation connue : pas besoin de dépendre d'un sélecteur CSS
    // fragile pour l'isoler.
    const blockText = (await questions.textContent()) ?? '';
    const prompt = knownPrompts.find((candidate) => blockText.includes(candidate));
    const itemId = prompt ? promptToItemId.get(prompt) : undefined;
    if (!itemId) {
      throw new Error(`Could not match displayed RIASEC question to a known item prompt in: "${blockText}"`);
    }
    const value = values.get(itemId);
    if (value === undefined) {
      throw new Error(`Oracle profile "${profile.id}" has no response for item "${itemId}"`);
    }

    await questions.getByRole('radio').nth(value - 1).click();
    const nextButton = questions.getByRole('button', { name: /^(Suivant|Voir mon résultat)$/ });
    await nextButton.click();
  }
};

const fetchStoredResult = async (page: Page) => {
  const response = await page.request.get(`http://127.0.0.1:${E2E_BACKEND_PORT}/api/v1/orientation/results?limit=1`);
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  if (!payload.results?.[0]) throw new Error('No stored RIASEC result found for this guest session');
  return payload.results[0] as {
    primaryCode: string | null;
    displayCode: string;
    scores: Record<RiasecDimension, { normalized: number }>;
  };
};

const assertMatchesOracle = (stored: Awaited<ReturnType<typeof fetchStoredResult>>, expected: ReturnType<typeof profileById>['expected']) => {
  expect(stored.primaryCode).toBe(expected.ranking.primaryCode);
  expect(stored.displayCode).toBe(expected.ranking.displayCode);
  for (const dimension of ['R', 'I', 'A', 'S', 'E', 'C'] as RiasecDimension[]) {
    expect(stored.scores[dimension].normalized).toBe(expected.scores[dimension].normalized);
  }
};

test.describe('oracles RIASEC en navigateur réel — issue #216', () => {
  for (const profileId of ['dominant-i', 'all-identical-mid', 'all-minimum', 'all-maximum']) {
    test(`profil "${profileId}" : le score stocké correspond exactement à l'oracle`, async ({ page }) => {
      const profile = profileById(profileId);
      await page.goto('/parcours');
      await answerRiasecSurveyAsProfile(page, profile);
      await expect(page.getByTestId('guest-life-project-soft-gate')).toBeVisible();

      const stored = await fetchStoredResult(page);
      assertMatchesOracle(stored, profile.expected);
    });
  }

  test('profil "tie-top" : égalité en tête détectée, primaryCode absent, ordre canonique respecté', async ({ page }) => {
    const profile = profileById('tie-top');
    await page.goto('/parcours');
    await answerRiasecSurveyAsProfile(page, profile);
    await expect(page.getByTestId('guest-life-project-soft-gate')).toBeVisible();

    const stored = await fetchStoredResult(page);
    expect(profile.expected.ranking.primaryCode).toBeNull();
    assertMatchesOracle(stored, profile.expected);
    // Le trio de tête n'a pas de primaryCode, mais l'aperçu invité affiche
    // quand même une tendance (topRiasecDimensions[0]) sans planter.
    await expect(page.getByTestId('guest-registration-gate')).toBeVisible();
  });

  test('variation d\'une seule réponse : seule la dimension affectée change entre deux tentatives', async ({ browser }) => {
    const baseline = profileById('dominant-r');
    const varied = profileById('single-item-variation');

    const seedConsent = (targetPage: Page) => targetPage.addInitScript(() => {
      const now = new Date();
      const expires = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
      window.localStorage.setItem('makoki_consent_v1', JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false,
        support: false,
        updatedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
      }));
    });

    const baselineContext = await browser.newContext();
    const baselinePage = await baselineContext.newPage();
    await seedConsent(baselinePage);
    await baselinePage.goto('/parcours');
    await answerRiasecSurveyAsProfile(baselinePage, baseline);
    await expect(baselinePage.getByTestId('guest-life-project-soft-gate')).toBeVisible();
    const baselineStored = await fetchStoredResult(baselinePage);
    await baselineContext.close();

    const variedContext = await browser.newContext();
    const variedPage = await variedContext.newPage();
    await seedConsent(variedPage);
    await variedPage.goto('/parcours');
    await answerRiasecSurveyAsProfile(variedPage, varied);
    await expect(variedPage.getByTestId('guest-life-project-soft-gate')).toBeVisible();
    const variedStored = await fetchStoredResult(variedPage);
    await variedContext.close();

    assertMatchesOracle(baselineStored, baseline.expected);
    assertMatchesOracle(variedStored, varied.expected);

    for (const dimension of ['R', 'I', 'A', 'S', 'E', 'C'] as RiasecDimension[]) {
      const delta = variedStored.scores[dimension].normalized - baselineStored.scores[dimension].normalized;
      if (dimension === 'R') {
        expect(delta).not.toBe(0);
      } else {
        expect(delta).toBe(0);
      }
    }
  });
});
