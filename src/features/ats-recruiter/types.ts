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
  organizationId: string;
  title: string;
  description: string;
  status: AtsJobStatus;
  version: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export const ATS_APPLICATION_TERMINAL_STATES: readonly AtsApplicationState[] = Object.freeze([
  'hired',
  'rejected',
  'withdrawn',
]);

export interface AtsApplication {
  id: string;
  jobId: string;
  organizationId: string;
  candidateAccountId: string;
  cvAnalysisId: string | null;
  state: AtsApplicationState;
  version: number;
  submittedAt: string;
  updatedAt: string;
}

// Vue recruteur : détail complet, jamais expurgé (la redaction ne s'applique
// qu'à la vue candidat, côté serveur).
export interface AtsApplicationEvent {
  id: number;
  applicationId: string;
  eventType: string;
  from: AtsApplicationState;
  to: AtsApplicationState;
  actorAccountId: string;
  actorRole: string;
  reason: string | null;
  reasonCode: string | null;
  metadata: Record<string, unknown>;
  occurredAt: string;
}

export interface AtsJobEvent {
  id: number;
  jobId: string;
  eventType: string;
  actorAccountId: string;
  actorRole: string;
  metadata: Record<string, unknown>;
  occurredAt: string;
}

export interface AtsRecruiterAssignment {
  jobId: string;
  recruiterAccountId: string;
  assignedByAccountId: string;
  assignedAt: string;
}

// Fermé volontairement : aucun score/pourcentage n'existe côté serveur, même
// dans les évaluations structurées — seule une recommandation qualitative.
export type AtsEvaluationRecommendation = 'advance' | 'hold' | 'reject';

export const ATS_EVALUATION_RECOMMENDATIONS: readonly AtsEvaluationRecommendation[] = Object.freeze([
  'advance',
  'hold',
  'reject',
]);

export interface AtsEvaluation {
  id: number;
  applicationId: string;
  organizationId: string;
  evaluatorAccountId: string;
  evaluatorRole: string;
  applicationStateAtEvaluation: AtsApplicationState;
  rating: number | null;
  recommendation: AtsEvaluationRecommendation;
  note: string | null;
  occurredAt: string;
}

export type AtsRejectionReasonCode =
  | 'not_qualified'
  | 'position_filled'
  | 'duplicate_application'
  | 'failed_assessment'
  | 'salary_expectation_mismatch'
  | 'candidate_unresponsive'
  | 'role_cancelled'
  | 'other';

export const ATS_REJECTION_REASON_CODES: readonly AtsRejectionReasonCode[] = Object.freeze([
  'not_qualified',
  'position_filled',
  'duplicate_application',
  'failed_assessment',
  'salary_expectation_mismatch',
  'candidate_unresponsive',
  'role_cancelled',
  'other',
]);
