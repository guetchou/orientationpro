import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CareerCatalog from './CareerCatalog';
import CareerMatches from './CareerMatches';
import OccupationDetail from './OccupationDetail';
import { CareerRecommendations } from '@/components/career/CareerRecommendations';
import type { CareerOccupation, CareerProfileRecommendationResponse } from '@/types/career';
import * as careerApi from '@/services/careerApi';

vi.mock('@/services/careerApi', async () => {
  const actual = await vi.importActual<typeof import('@/services/careerApi')>('@/services/careerApi');
  return {
    ...actual,
    getCareerCatalogSummary: vi.fn(),
    searchCareerOccupations: vi.fn(),
    getCareerOccupation: vi.fn(),
    getCareerMatches: vi.fn(),
    getProfileCareerRecommendations: vi.fn(),
    createCareerRecommendationSnapshot: vi.fn(),
  };
});

const onet = { id: 'onet:30.3:en', kind: 'onet', version: '30.3', locale: 'en', title: 'O*NET 30.3 Database', licenseName: 'CC BY 4.0', licenseUrl: 'https://example.test', attribution: 'O*NET', contentSha256: 'a'.repeat(64), declaredRecordCount: 1016, occupationCount: 1016, matchableCount: 923, locallyReviewedRelevantCount: 0, importedAt: '2026-07-28' };
const esco = { ...onet, id: 'esco:1.2.1:fr', kind: 'esco', version: '1.2.1', locale: 'fr', title: 'ESCO 1.2.1 — fr', attribution: 'ESCO', contentSha256: 'b'.repeat(64), occupationCount: 1, matchableCount: 0 };
const occupation: CareerOccupation = {
  id: 'onet:job', sourceCode: '29-1141.00', requestedLocale: 'fr', locale: 'fr', fallbackLocale: null, translationStatus: 'available', preferredLabel: 'infirmier/infirmière', description: 'Dispense des soins infirmiers.', status: 'active', iscoCode: '2221', jobZone: 4,
  riasec: { R: 20, I: 70, A: 30, S: 90, E: 35, C: 45 }, riasecDisplayCode: 'SIC', riasecProfileStatus: 'direct', riasecProvenance: {}, localRelevanceStatus: 'unreviewed', localRelevanceNotes: null, metadata: {}, presentationOccupationId: 'esco:job', escoOccupationId: 'esco:job',
  source: onet, riasecSource: onet, presentationSource: esco, crosswalk: { mappingKind: 'close', confidenceScore: null, confidenceLevel: 'medium', reviewStatus: 'official', sourceReference: 'official.csv', sourceVersion: '2023-08', mappedAt: '2026-07-28', provenance: {} },
  aliases: [{ locale: 'fr', label: 'infirmier', kind: 'alternate' }], skills: [{ id: 'skill:care', locale: 'fr', preferredLabel: 'prodiguer des soins', description: 'Fournir des soins.', kind: 'skill', relationKind: 'essential', importanceScore: null, provenance: {} }],
};
const catalogSources = [
  { id: onet.id, kind: onet.kind, version: onet.version, locale: onet.locale, contentSha256: onet.contentSha256, importedAt: onet.importedAt },
  { id: esco.id, kind: esco.kind, version: esco.version, locale: esco.locale, contentSha256: esco.contentSha256, importedAt: esco.importedAt },
];
const matching: CareerProfileRecommendationResponse = {
  result: { id: 'result-1', displayCode: 'SIC', algorithmVersion: 'riasec-v1', createdAt: '2026-07-28', normalizedScores: { R: 20, I: 70, A: 30, S: 90, E: 35, C: 45 } },
  versioning: {
    recommendationAlgorithmVersion: 'career-profile-context-v2',
    riasecAlgorithmVersion: 'riasec-v1',
    preparationAdapterVersion: 'onet-job-zone-adapter-v1',
    inputFingerprint: 'c'.repeat(64),
    profileFingerprint: 'd'.repeat(64),
    catalogSources,
    calculatedAt: '2026-07-29T00:00:00.000Z',
  },
  recommendationContext: {
    algorithmVersion: 'career-profile-context-v2',
    preparationAdapterVersion: 'onet-job-zone-adapter-v1',
    profileFingerprint: 'd'.repeat(64),
    inputFingerprint: 'c'.repeat(64),
    catalogSources,
    profileCompletionPercent: 100,
    currentSituation: 'job_seeker',
    primaryGoal: 'find_job',
    mobilityScope: 'international',
    highestEducationLevel: 'licence',
    highestEducationStatus: 'completed',
    confirmedEscoSkillCount: 1,
    configuredWeights: { riasec: 0.6, skills: 0.3, education: 0.1 },
    usedSignals: ['riasec', 'confirmed_esco_skills', 'education', 'primary_goal'],
    missingSignals: [],
    limitations: ['Aucun catalogue national n’entre dans le score.'],
  },
  matching: {
    requestedLocale: 'fr', locale: 'fr', eligibleOccupationCount: 1, translatedOccupationCount: 1, fallbackOccupationCount: 0,
    matches: [{
      occupationId: occupation.id, sourceCode: occupation.sourceCode, preferredLabel: occupation.preferredLabel, locale: 'fr', requestedLocale: 'fr', fallbackLocale: null, translationStatus: 'available', presentationSource: esco, riasecSource: onet, crosswalk: occupation.crosswalk,
      fitScore: 95, algorithmVersion: 'career-riasec-cosine-rank-v1', userCode: 'SIC', occupationCode: 'SIC', components: { cosineSimilarity: 0.95, rankAgreement: 1, cosineWeight: 0.8, rankWeight: 0.2 }, differentiation: { user: 70, occupation: 70 }, provenance: {},
      recommendationScore: 91, recommendationAlgorithmVersion: 'career-profile-context-v2',
      profileComponents: {
        riasec: { available: true, score: 95 },
        skills: { available: true, score: 33.33, confirmedSkillCount: 1, matchedSkillCount: 1, matchedSkills: [{ escoUri: 'http://data.europa.eu/esco/skill/care', label: 'prodiguer des soins', proficiency: 'advanced', relationKind: 'essential', contribution: 0.85 }] },
        education: { available: true, score: 100, status: 'meets_reference', highestEducationLevel: 'licence', highestEducationStatus: 'completed', jobZone: 4, requiredRank: 6, gap: 0, adapterVersion: 'onet-job-zone-adapter-v1', sourceVersion: '30.3', frameworkId: 'onet-job-zone-four-level-from-30.2', frameworkKind: 'four_level', zoneLabel: 'Job Zone Four' },
        configuredWeights: { riasec: 0.6, skills: 0.3, education: 0.1 },
        appliedWeights: { riasec: 0.6, skills: 0.3, education: 0.1 },
      },
      explanations: [{ code: 'RIASEC_ALIGNMENT', signal: 'riasec', score: 95, message: 'La proximité RIASEC est élevée.' }, { code: 'ESCO_SKILL_EVIDENCE', signal: 'skills', score: 33.33, message: '1 compétence ESCO confirmée est reliée à ce métier.' }],
      cautions: ['Ce classement aide à explorer des pistes. Il ne garantit ni emploi, ni salaire, ni réussite, ni aptitude réglementaire.'],
    }],
  },
};

const snapshot = {
  id: 'snapshot-1', immutable: true as const, orientationResultId: 'result-1', recommendationAlgorithmVersion: 'career-profile-context-v2', riasecAlgorithmVersion: 'riasec-v1', preparationAdapterVersion: 'onet-job-zone-adapter-v1', requestedLocale: 'fr', includeLocallyExcluded: false, limit: 50, inputFingerprint: 'c'.repeat(64), profileFingerprint: 'd'.repeat(64), onetSources: [catalogSources[0]], escoSources: [catalogSources[1]], createdAt: '2026-07-29T00:00:00.000Z',
};

describe('French career experience', () => {
  beforeEach(() => {
    vi.mocked(careerApi.getCareerCatalogSummary).mockResolvedValue([onet, esco]);
    vi.mocked(careerApi.searchCareerOccupations).mockResolvedValue([occupation]);
    vi.mocked(careerApi.getCareerOccupation).mockResolvedValue(occupation);
    vi.mocked(careerApi.getProfileCareerRecommendations).mockResolvedValue(matching);
    vi.mocked(careerApi.createCareerRecommendationSnapshot).mockResolvedValue({ created: true, snapshot, recommendation: matching });
  });

  it('renders French catalogue and French search examples without horizontal overflow classes', async () => {
    const { container } = render(<MemoryRouter><CareerCatalog /></MemoryRouter>);
    expect(await screen.findByText('infirmier/infirmière')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/infirmier, comptable, ingénieur/u)).toBeInTheDocument();
    expect(container.querySelector('main')?.className).toContain('overflow-x-hidden');
    await waitFor(() => expect(careerApi.searchCareerOccupations).toHaveBeenCalledWith(expect.objectContaining({ locale: 'fr' })));
  });

  it('renders profile-aware French recommendations, versions and immutable snapshot action', async () => {
    const view = render(<MemoryRouter initialEntries={['/results/result-1']}><CareerRecommendations resultId="result-1" /></MemoryRouter>);
    expect(await screen.findByText('infirmier/infirmière')).toBeInTheDocument();
    expect(screen.getByText(/Signaux utilisés/u)).toBeInTheDocument();
    expect(screen.getByText('prodiguer des soins')).toBeInTheDocument();
    view.unmount();
    render(<MemoryRouter initialEntries={['/results/result-1/careers']}><Routes><Route path="/results/:resultId/careers" element={<CareerMatches />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('Classement expliqué des métiers')).toBeInTheDocument();
    expect(screen.getByText('O*NET 30.3')).toBeInTheDocument();
    expect(screen.getByText('ESCO 1.2.1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Figer ce classement' }));
    expect(await screen.findByText(/Instantané snapshot-1/u)).toBeInTheDocument();
    expect(careerApi.createCareerRecommendationSnapshot).toHaveBeenCalledWith('result-1', { locale: 'fr', limit: 50 });
  });

  it('renders a public French career detail without exposing technical source labels', async () => {
    const view = render(<MemoryRouter initialEntries={['/careers/onet%3Ajob']}><Routes><Route path="/careers/:occupationId" element={<OccupationDetail />} /></Routes></MemoryRouter>);

    expect(await screen.findByRole('heading', { level: 1, name: 'infirmier/infirmière' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ce que ce métier mobilise souvent' })).toBeInTheDocument();
    expect(screen.getByText('prodiguer des soins')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voir si ce métier me correspond' })).toHaveAttribute('href', '/parcours');

    const publicCopy = view.container.textContent || '';
    expect(publicCopy).not.toContain('O*NET');
    expect(publicCopy).not.toContain('ESCO');
    expect(publicCopy).not.toContain('RIASEC');
    expect(publicCopy).not.toContain('Job Zone');
  });
});
