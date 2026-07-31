export interface Capability {
  id: string;
  status: 'active' | 'experimental' | 'disabled' | 'legacy';
  configured: boolean;
  publicLimitations: string[];
}

export interface CapabilityRegistry {
  schemaVersion: string;
  capabilities: Capability[];
}

export type AtsJobStatus = 'draft' | 'published' | 'closed';

export interface AtsJob {
  id: string;
  ownerAccountId: string;
  title: string;
  description: string;
  status: AtsJobStatus;
  version: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Fermé volontairement : aucun état "score"/"probabilité" n'existe côté serveur,
// donc aucun ne peut apparaître ici.
export type AtsApplicationState =
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'interview_planned'
  | 'interview_completed'
  | 'offer_proposed'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export interface AtsApplication {
  id: string;
  jobId: string;
  candidateAccountId: string;
  cvAnalysisId: string | null;
  state: AtsApplicationState;
  version: number;
  submittedAt: string;
  updatedAt: string;
}

export interface AtsApplicationEvent {
  id: number;
  applicationId: string;
  eventType: string;
  from: AtsApplicationState;
  to: AtsApplicationState;
  actorAccountId: string;
  actorRole: string;
  reason: string | null;
  metadata: Record<string, unknown>;
  occurredAt: string;
}

export const ATS_APPLICATION_TERMINAL_STATES: readonly AtsApplicationState[] = Object.freeze([
  'hired',
  'rejected',
  'withdrawn',
]);
