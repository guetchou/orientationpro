import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CareerMatchCard } from './CareerMatchCard';
import type { CareerMatch, CareerSource } from '@/types/career';

const source = (kind: string, version: string): CareerSource => ({
  id: `${kind}:${version}`,
  kind,
  version,
  title: `${kind} ${version}`,
  licenseName: 'CC BY 4.0',
  licenseUrl: 'https://example.test',
  attribution: kind,
});

const match = (translationStatus: CareerMatch['translationStatus']): CareerMatch => ({
  occupationId: 'onet:30.3:en:29-1141.00',
  sourceCode: '29-1141.00',
  preferredLabel: translationStatus === 'available' ? 'infirmier/infirmière' : 'Registered Nurses',
  locale: translationStatus === 'available' ? 'fr' : 'en',
  requestedLocale: 'fr',
  fallbackLocale: translationStatus === 'available' ? null : 'en',
  translationStatus,
  presentationSource: translationStatus === 'available' ? source('esco', '1.2.1') : source('onet', '30.3'),
  riasecSource: source('onet', '30.3'),
  crosswalk: null,
  fitScore: 88,
  algorithmVersion: 'career-riasec-cosine-rank-v1',
  userCode: 'SIC',
  occupationCode: 'SIC',
  components: { cosineSimilarity: 0.9, rankAgreement: 0.8, cosineWeight: 0.8, rankWeight: 0.2 },
  differentiation: { user: 60, occupation: 55 },
  provenance: {},
});

describe('CareerMatchCard', () => {
  it('shows French ESCO content while distinguishing O*NET RIASEC', () => {
    render(<MemoryRouter><CareerMatchCard match={match('available')} /></MemoryRouter>);
    expect(screen.getByText('infirmier/infirmière')).toBeInTheDocument();
    expect(screen.getByText(/Libellé · ESCO 1.2.1/u)).toBeInTheDocument();
    expect(screen.getByText(/RIASEC · O\*NET 30.3/u)).toBeInTheDocument();
  });

  it('signals English fallback instead of presenting it as French', () => {
    const { container } = render(<MemoryRouter><CareerMatchCard match={match('unavailable')} /></MemoryRouter>);
    expect(screen.getByText('Anglais par défaut')).toBeInTheDocument();
    expect(container.firstElementChild?.className).toContain('min-w-0');
    expect(container.firstElementChild?.className).toContain('overflow-hidden');
  });
});
