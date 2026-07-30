import type {
  LifeProject,
  LifeProjectActionPlan,
  LifeProjectEnvelope,
  LifeProjectScenario,
  LifeProjectState,
  LifeProjectSummary,
} from './types';

export type AdvisorObjective =
  | 'studies'
  | 'training'
  | 'insertion'
  | 'reentry'
  | 'reconversion'
  | 'entrepreneurship'
  | 'work_and_training'
  | 'uncertain';

export type AdvisorMobility =
  | 'none'
  | 'local'
  | 'national'
  | 'international'
  | 'flexible'
  | 'unknown';

export interface EvidenceField<T = string> {
  value: T | null;
  verification: 'declared' | 'verified' | 'unknown';
  source: string | null;
  verifiedAt: string | null;
}

export interface AdvisorPriority {
  id: string;
  importance: number;
}

export interface LifeProjectDiagnostic {
  schemaVersion: 'makoki-life-diagnostic-v1';
  id: string;
  objective: AdvisorObjective;
  identity: {
    ageRange: string | null;
    country: EvidenceField;
    zone: EvidenceField;
    situation: EvidenceField;
    educationLevel: EvidenceField;
    diploma: EvidenceField;
    subjects: string[];
    significantResults: string[];
    interruptions: string[];
  };
  constraints: {
    mobility: AdvisorMobility;
    budget: {
      amount: number | null;
      currency: string | null;
      verification: 'declared' | 'verified' | 'unknown';
    };
    needIncomeWithinMonths: number | null;
    maxDurationMonths: number | null;
    internetAccess: 'none' | 'limited' | 'regular' | 'unknown';
    equipment: string[];
    familyResponsibilities: string[];
    availability: string[];
    healthOrDisability: string[];
    documents: string[];
    availableModes: string[];
  };
  preferences: {
    interests: string[];
    activities: string[];
    favouriteSubjects: string[];
    workEnvironments: string[];
    workStyles: string[];
    values: string[];
  };
  capabilities: {
    skills: string[];
    internships: string[];
    volunteering: string[];
    jobs: string[];
    personalProjects: string[];
    responsibilities: string[];
    languages: string[];
    digitalSkills: string[];
    evidence: string[];
    regulatoryQualifications: string[];
  };
  priorities: AdvisorPriority[];
  notes: string | null;
  recordedAt: string;
  updatedAt: string;
}

export interface AdvisorReason {
  signal: string;
  explanation: string;
  score: number | null;
}

export interface AdvisorSourceReference {
  id: string;
  title: string;
  kind: string;
  url: string | null;
  version: string | null;
  verifiedAt: string | null;
  verificationStatus: 'verified' | 'to_confirm' | 'obsolete';
  scope: string | null;
}

export interface AdvisorLocalOpportunity {
  id: string;
  title: string;
  organization: string | null;
  zone: string | null;
  sourceReferenceId: string;
  status: 'verified' | 'to_confirm' | 'obsolete';
}

export interface AdvisorFirstAction {
  title: string;
  deadlineDays: number;
  expectedEvidence: string;
}

export interface AdvisorRecommendationScenario {
  id: string;
  optionId: string;
  title: string;
  category: string;
  positioning: 'priority' | 'adjacent' | 'alternative' | 'fallback' | 'exploratory';
  rank: number;
  fitScore: number;
  confidence: 'high' | 'medium' | 'low';
  reasons: AdvisorReason[];
  strengths: string[];
  conditions: string[];
  risks: string[];
  blockingFactors: string[];
  missingInformation: string[];
  localOpportunities: AdvisorLocalOpportunity[];
  sourceReferences: AdvisorSourceReference[];
  firstActions: AdvisorFirstAction[];
  alternatives: string[];
  scoreBreakdown: Record<string, unknown>;
  penalties: Record<string, number>;
  generatedAt: string;
  engineVersion: string;
}

export interface AdvisorRecommendation {
  schemaVersion: 'makoki-life-recommendation-output-v1';
  engineVersion: string;
  status: 'complete' | 'insufficient_options';
  generatedAt: string;
  diagnosticSummary: Record<string, unknown>;
  scenarios: AdvisorRecommendationScenario[];
  nonPrioritized: Array<{ optionId: string; title: string; reasons: string[] }>;
  missingInformation: string[];
}

export interface AdvisorLifeProject extends Omit<LifeProject, 'scenarios' | 'actionPlans'> {
  state: LifeProjectState;
  scenarios: LifeProjectScenario[];
  actionPlans: LifeProjectActionPlan[];
  diagnostic: LifeProjectDiagnostic | null;
  recommendation: AdvisorRecommendation | null;
}

export interface AdvisorEnvelope extends Omit<LifeProjectEnvelope, 'project'> {
  project: AdvisorLifeProject;
}

export type AdvisorProjectSummary = LifeProjectSummary;

export interface AdvisorDiagnosticInput {
  objective: AdvisorObjective;
  identity: {
    ageRange?: string;
    country: { value: string; verification: 'declared' | 'verified' };
    zone: { value: string; verification: 'declared' | 'verified' };
    situation: { value: string; verification: 'declared' | 'verified' };
    educationLevel: { value: string; verification: 'declared' | 'verified' };
    diploma: { value: string; verification: 'declared' | 'verified' };
    subjects: string[];
    significantResults: string[];
    interruptions: string[];
  };
  constraints: {
    mobility: AdvisorMobility;
    budget: { amount?: number; currency?: string; verification: 'declared' | 'verified' | 'unknown' };
    needIncomeWithinMonths?: number;
    maxDurationMonths?: number;
    internetAccess: 'none' | 'limited' | 'regular' | 'unknown';
    equipment: string[];
    familyResponsibilities: string[];
    availability: string[];
    healthOrDisability: string[];
    documents: string[];
    availableModes: string[];
  };
  preferences: {
    interests: string[];
    activities: string[];
    favouriteSubjects: string[];
    workEnvironments: string[];
    workStyles: string[];
    values: string[];
  };
  capabilities: {
    skills: string[];
    internships: string[];
    volunteering: string[];
    jobs: string[];
    personalProjects: string[];
    responsibilities: string[];
    languages: string[];
    digitalSkills: string[];
    evidence: string[];
    regulatoryQualifications: string[];
  };
  priorities: AdvisorPriority[];
  notes?: string;
}
