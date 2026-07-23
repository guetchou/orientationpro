export type RiasecDimensionCode = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface RiasecResponseOption {
  value: number;
  label: string;
}

export interface RiasecInstrumentItem {
  id: string;
  position: number;
  prompt: string;
}

export interface RiasecInstrument {
  id: string;
  slug: string;
  version: number;
  locale: string;
  status: 'draft' | 'pilot' | 'active';
  title: string;
  disclaimer: string;
  responseScale: RiasecResponseOption[];
  itemCount: number;
  items: RiasecInstrumentItem[];
}

export interface RiasecAttempt {
  id: string;
  accountId: string;
  instrumentId: string;
  status: 'in_progress' | 'completed' | string;
  itemOrder: string[];
  startedAt?: string;
  completedAt?: string | null;
  responses?: Array<{
    itemId: string;
    value: number;
    answeredAt?: string;
  }>;
}

export interface RiasecDimensionDescription {
  code: RiasecDimensionCode;
  name: string;
  summary: string;
}

export interface RiasecScore {
  raw: number;
  minimum: number;
  maximum: number;
  itemCount: number;
  normalized: number;
}

export interface RiasecRankingEntry {
  dimension: RiasecDimensionCode;
  score: number;
}

export interface RiasecResult {
  id: string;
  attemptId: string;
  accountId: string;
  instrumentId: string;
  resultType: 'riasec';
  algorithmVersion: string;
  primaryCode: string | null;
  displayCode: string;
  scores: Record<RiasecDimensionCode, RiasecScore>;
  ranking: {
    ordered: RiasecRankingEntry[];
    tieGroups: Array<{ score: number; dimensions: RiasecDimensionCode[] }>;
    primaryCode: string | null;
    displayCode: string;
    hasLeadingTie: boolean;
  };
  differentiation: {
    range: number;
    standardDeviation: number;
  };
  responsePattern: {
    completionRate: number;
    sameAnswerRatio: number;
    responseStandardDeviation: number;
  };
  snapshot: {
    resultType: 'riasec';
    instrument: {
      id: string;
      slug: string;
      version: number;
      locale: string;
      title: string;
      responseScale: RiasecResponseOption[];
      methodology: string;
      disclaimer: string;
      contentHash: string;
      source?: {
        kind: string;
        reference: string;
        license: string;
      };
    };
    dimensions: Record<RiasecDimensionCode, RiasecDimensionDescription>;
    generatedAt: string;
  };
  createdAt: string;
}
