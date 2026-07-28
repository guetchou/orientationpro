import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import PostBac from '../../../pages/PostBac';
import { PostBacLanding } from '../PostBacLanding';
import { AdvisorCta } from '../AdvisorCta';
import { AutomaticOrientationSummary } from '../AutomaticOrientationSummary';
import { buildCareerReason } from '../reasons';
import { isPostBacEnabled } from '../config';
import type { RiasecResult } from '@/types/riasec';
import type { CareerMatch } from '@/types/career';

vi.mock('@/services/careerApi', () => ({
  getCareerMatches: vi.fn(),
}));
import { getCareerMatches } from '@/services/careerApi';

const FEATURE_DIR = path.join(__dirname, '..');
const featureFiles = fs
  .readdirSync(FEATURE_DIR)
  .filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'));

const readAll = () =>
  featureFiles.map((f) => fs.readFileSync(path.join(FEATURE_DIR, f), 'utf8')).join('\n');

const makeMatch = (id: string, code: string, fit: number): CareerMatch => ({
  occupationId: id,
  sourceCode: id,
  preferredLabel: `Métier ${id}`,
  fitScore: fit,
  algorithmVersion: 'career-v1',
  userCode: 'IRE',
  occupationCode: code,
  components: { cosineSimilarity: 0.8, rankAgreement: 0.7, cosineWeight: 0.6, rankWeight: 0.4 },
  differentiation: { user: 20, occupation: 18 },
  provenance: null,
});

const result: RiasecResult = {
  id: 'res-1',
  attemptId: 'att-1',
  accountId: 'acc-1',
  instrumentId: 'inst-1',
  resultType: 'riasec',
  algorithmVersion: 'riasec-v1',
  primaryCode: 'IRE',
  displayCode: 'IRE',
  scores: {} as RiasecResult['scores'],
  ranking: {
    ordered: [
      { dimension: 'I', score: 80 },
      { dimension: 'R', score: 70 },
      { dimension: 'E', score: 60 },
      { dimension: 'A', score: 40 },
      { dimension: 'S', score: 30 },
      { dimension: 'C', score: 20 },
    ],
    tieGroups: [],
    primaryCode: 'IRE',
    displayCode: 'IRE',
    hasLeadingTie: false,
  },
  differentiation: { range: 60, standardDeviation: 22 },
  responsePattern: { completionRate: 100, sameAnswerRatio: 20, responseStandardDeviation: 1 },
  snapshot: {
    resultType: 'riasec',
    instrument: {
      id: 'inst-1', slug: 's', version: 1, locale: 'fr', title: 't',
      responseScale: [], methodology: 'm', disclaimer: 'd', contentHash: 'h',
    },
    dimensions: {
      R: { code: 'R', name: 'Réaliste', summary: '' },
      I: { code: 'I', name: 'Investigateur', summary: '' },
      A: { code: 'A', name: 'Artistique', summary: '' },
      S: { code: 'S', name: 'Social', summary: '' },
      E: { code: 'E', name: 'Entreprenant', summary: '' },
      C: { code: 'C', name: 'Conventionnel', summary: '' },
    },
    generatedAt: '2026-07-28T00:00:00.000Z',
  },
  createdAt: '2026-07-28T00:00:00.000Z',
};

const FORBIDDEN = [
  /vous réussirez/i,
  /fait pour vous/i,
  /aptitudes? nécessaires/i,
  /\d+\s*%\s*de chances/i,
  /métier idéal/i,
  /avenir garanti/i,
  /orientation certaine(?! )/i, // "pas une orientation certaine" est autorisé (nié)
  /garantie d’(emploi|admission)/i,
  /probabilité de réussite/i,
];

beforeEach(() => {
  (getCareerMatches as unknown as ReturnType<typeof vi.fn>).mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('feature flag post-bac', () => {
  it('1. flag désactivé : /post-bac redirige (page masquée)', () => {
    vi.stubEnv('VITE_POSTBAC_AUTO_V1_ENABLED', 'false');
    expect(isPostBacEnabled()).toBe(false);
    const { container } = render(
      <MemoryRouter initialEntries={['/post-bac']}>
        <PostBac />
      </MemoryRouter>,
    );
    expect(container.textContent).not.toMatch(/Le bac est obtenu/);
  });

  it('2. flag actif : la page est rendue', () => {
    vi.stubEnv('VITE_POSTBAC_AUTO_V1_ENABLED', 'true');
    expect(isPostBacEnabled()).toBe(true);
    render(
      <MemoryRouter>
        <PostBac />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/Le bac est obtenu/);
  });
});

describe('landing', () => {
  it('3. le CTA principal conduit au parcours existant (/tests)', () => {
    render(<MemoryRouter><PostBacLanding /></MemoryRouter>);
    const ctas = screen.getAllByRole('link', { name: /Découvrir mon profil/i });
    expect(ctas.length).toBeGreaterThan(0);
    ctas.forEach((cta) => expect(cta.getAttribute('href')).toBe('/tests'));
  });

  it('8. RIASEC n’est pas le titre principal', () => {
    render(<MemoryRouter><PostBacLanding /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1 }).textContent).not.toMatch(/riasec/i);
  });
});

describe('résumé automatique', () => {
  it('5. affiche au maximum six métiers', async () => {
    (getCareerMatches as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      result: { id: 'res-1', displayCode: 'IRE', algorithmVersion: 'v', createdAt: '', normalizedScores: {} },
      matching: {
        locale: 'en',
        eligibleOccupationCount: 8,
        matches: Array.from({ length: 8 }, (_, i) => makeMatch(`occ-${i}`, 'IRE', 90 - i)),
      },
    });
    render(<MemoryRouter><AutomaticOrientationSummary result={result} /></MemoryRouter>);
    await waitFor(() => {
      expect(screen.getAllByRole('link', { name: /Voir la fiche métier/i }).length).toBe(6);
    });
    // une seule requête API (pas d'appels superflus)
    expect(getCareerMatches).toHaveBeenCalledTimes(1);
    expect(getCareerMatches).toHaveBeenCalledWith('res-1', { locale: 'en', limit: 6 });
  });

  it('7. aucune promesse interdite dans le rendu', async () => {
    (getCareerMatches as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      result: { id: 'res-1', displayCode: 'IRE', algorithmVersion: 'v', createdAt: '', normalizedScores: {} },
      matching: { locale: 'en', eligibleOccupationCount: 2, matches: [makeMatch('a', 'IRE', 88), makeMatch('b', 'SAC', 70)] },
    });
    const { container } = render(<MemoryRouter><AutomaticOrientationSummary result={result} /></MemoryRouter>);
    await waitFor(() => expect(screen.getAllByRole('link', { name: /Voir la fiche métier/i }).length).toBe(2));
    const text = container.textContent || '';
    FORBIDDEN.forEach((re) => expect(text).not.toMatch(re));
  });
});

describe('raisons de recommandation', () => {
  it('6. les raisons utilisent les dimensions dominantes existantes', () => {
    const reason = buildCareerReason(makeMatch('a', 'IRE', 85), ['I', 'R', 'E']);
    expect(reason.sharedDimensions).toEqual(['I', 'R', 'E']);
    expect(reason.text).toMatch(/analyse et de résolution de problèmes/);
    expect(reason.text).toMatch(/vos intérêts dominants/);
    // aucune promesse de réussite
    FORBIDDEN.forEach((re) => expect(reason.text).not.toMatch(re));
  });
});

describe('conseiller facultatif', () => {
  it('9. sans canal configuré : état honnête « en préparation »', () => {
    vi.stubEnv('VITE_MAKOKI_ADVISOR_WHATSAPP', '');
    vi.stubEnv('VITE_MAKOKI_ADVISOR_FORM_URL', '');
    render(<MemoryRouter><AdvisorCta /></MemoryRouter>);
    expect(screen.getByText(/Accompagnement en préparation/i)).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('9b. WhatsApp configuré : lien wa.me', () => {
    vi.stubEnv('VITE_MAKOKI_ADVISOR_WHATSAPP', '242055344253');
    render(<MemoryRouter><AdvisorCta /></MemoryRouter>);
    const link = screen.getByRole('link', { name: /conseiller/i });
    expect(link.getAttribute('href')).toContain('wa.me/242055344253');
  });
});

describe('garanties structurelles (source)', () => {
  it('4. les nouveaux composants ne calculent aucun score (pas de Math.*)', () => {
    for (const f of featureFiles) {
      const code = fs.readFileSync(path.join(FEATURE_DIR, f), 'utf8')
        .split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');
      expect(code, `${f} ne doit pas contenir Math.`).not.toMatch(/Math\./);
    }
  });

  it('10. pas de classe manifestement responsable d’un débordement mobile', () => {
    const all = readAll();
    expect(all).not.toMatch(/w-screen/);
    expect(all).not.toMatch(/overflow-x-scroll/);
    expect(all).not.toMatch(/min-w-\[\d{4,}px\]/);
  });
});
