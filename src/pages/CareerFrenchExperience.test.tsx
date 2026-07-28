import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CareerCatalog from './CareerCatalog';
import CareerMatches from './CareerMatches';
import OccupationDetail from './OccupationDetail';
import { CareerRecommendations } from '@/components/career/CareerRecommendations';
import type { CareerMatchResponse, CareerOccupation } from '@/types/career';
import * as careerApi from '@/services/careerApi';

vi.mock('@/services/careerApi', async () => {
  const actual = await vi.importActual<typeof import('@/services/careerApi')>('@/services/careerApi');
  return { ...actual, getCareerCatalogSummary: vi.fn(), searchCareerOccupations: vi.fn(), getCareerOccupation: vi.fn(), getCareerMatches: vi.fn() };
});

const onet = { id: 'onet:30.3:en', kind: 'onet', version: '30.3', locale: 'en', title: 'O*NET 30.3 Database', licenseName: 'CC BY 4.0', licenseUrl: 'https://example.test', attribution: 'O*NET', contentSha256: 'a'.repeat(64), declaredRecordCount: 1016, occupationCount: 1016, matchableCount: 923, locallyReviewedRelevantCount: 0, importedAt: '2026-07-28' };
const esco = { ...onet, id: 'esco:1.2.1:fr', kind: 'esco', version: '1.2.1', locale: 'fr', title: 'ESCO 1.2.1 — fr', attribution: 'ESCO', occupationCount: 1, matchableCount: 0 };
const occupation: CareerOccupation = {
  id: 'onet:job', sourceCode: '29-1141.00', requestedLocale: 'fr', locale: 'fr', fallbackLocale: null, translationStatus: 'available', preferredLabel: 'infirmier/infirmière', description: 'Dispense des soins infirmiers.', status: 'active', iscoCode: '2221', jobZone: 4,
  riasec: { R: 20, I: 70, A: 30, S: 90, E: 35, C: 45 }, riasecDisplayCode: 'SIC', riasecProfileStatus: 'direct', riasecProvenance: {}, localRelevanceStatus: 'unreviewed', localRelevanceNotes: null, metadata: {}, presentationOccupationId: 'esco:job', escoOccupationId: 'esco:job',
  source: onet, riasecSource: onet, presentationSource: esco, crosswalk: { mappingKind: 'close', confidenceScore: null, confidenceLevel: 'medium', reviewStatus: 'official', sourceReference: 'official.csv', sourceVersion: '2023-08', mappedAt: '2026-07-28', provenance: {} },
  aliases: [{ locale: 'fr', label: 'infirmier', kind: 'alternate' }], skills: [{ id: 'skill:care', locale: 'fr', preferredLabel: 'prodiguer des soins', description: 'Fournir des soins.', kind: 'skill', relationKind: 'essential', importanceScore: null, provenance: {} }],
};
const matching: CareerMatchResponse = {
  result: { id: 'result-1', displayCode: 'SIC', algorithmVersion: 'riasec-v1', createdAt: '2026-07-28', normalizedScores: { R: 20, I: 70, A: 30, S: 90, E: 35, C: 45 } },
  matching: { requestedLocale: 'fr', locale: 'fr', eligibleOccupationCount: 1, translatedOccupationCount: 1, fallbackOccupationCount: 0, matches: [{ occupationId: occupation.id, sourceCode: occupation.sourceCode, preferredLabel: occupation.preferredLabel, locale: 'fr', requestedLocale: 'fr', fallbackLocale: null, translationStatus: 'available', presentationSource: esco, riasecSource: onet, crosswalk: occupation.crosswalk, fitScore: 95, algorithmVersion: 'career-riasec-cosine-rank-v1', userCode: 'SIC', occupationCode: 'SIC', components: { cosineSimilarity: 0.95, rankAgreement: 1, cosineWeight: 0.8, rankWeight: 0.2 }, differentiation: { user: 70, occupation: 70 }, provenance: {} }] },
};

describe('French career experience', () => {
  beforeEach(() => {
    vi.mocked(careerApi.getCareerCatalogSummary).mockResolvedValue([onet, esco]);
    vi.mocked(careerApi.searchCareerOccupations).mockResolvedValue([occupation]);
    vi.mocked(careerApi.getCareerOccupation).mockResolvedValue(occupation);
    vi.mocked(careerApi.getCareerMatches).mockResolvedValue(matching);
  });

  it('renders French catalogue and French search examples without horizontal overflow classes', async () => {
    const { container } = render(<MemoryRouter><CareerCatalog /></MemoryRouter>);
    expect(await screen.findByText('infirmier/infirmière')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/infirmier, comptable, ingénieur/u)).toBeInTheDocument();
    expect(container.querySelector('main')?.className).toContain('overflow-x-hidden');
    await waitFor(() => expect(careerApi.searchCareerOccupations).toHaveBeenCalledWith(expect.objectContaining({ locale: 'fr' })));
  });

  it('renders French recommendations and ranking', async () => {
    const view = render(<MemoryRouter initialEntries={['/results/result-1']}><CareerRecommendations resultId="result-1" /></MemoryRouter>);
    expect(await screen.findByText('infirmier/infirmière')).toBeInTheDocument();
    view.unmount();
    render(<MemoryRouter initialEntries={['/results/result-1/careers']}><Routes><Route path="/results/:resultId/careers" element={<CareerMatches />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('Classement des métiers')).toBeInTheDocument();
    expect(screen.getByText('infirmier/infirmière')).toBeInTheDocument();
  });

  it('renders French detail, skills and separate O*NET/ESCO sources without React errors', async () => {
    render(<MemoryRouter initialEntries={['/careers/onet%3Ajob']}><Routes><Route path="/careers/:occupationId" element={<OccupationDetail />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('infirmier/infirmière')).toBeInTheDocument();
    expect(screen.getByText('prodiguer des soins')).toBeInTheDocument();
    expect(screen.getByText(/Description : ESCO 1.2.1/u)).toBeInTheDocument();
    expect(screen.getByText(/RIASEC : O\*NET 30.3/u)).toBeInTheDocument();
  });
});
