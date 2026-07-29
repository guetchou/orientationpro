export type LifeProjectState =
  | 'exploration'
  | 'clarification'
  | 'comparison'
  | 'provisional_choice'
  | 'preparation'
  | 'experimentation'
  | 'action'
  | 'follow_up'
  | 'confirmation'
  | 'reorientation';

export type LifeProjectActionStatus =
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'blocked'
  | 'cancelled';

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

export interface LifeProjectScenario {
  id: string;
  title: string;
  description: string | null;
  status: 'exploring' | 'candidate' | 'active' | 'paused' | 'discarded';
  optionType: string;
  missingInformation: string[];
  uncertainty: { level: 'unknown' | 'low' | 'medium' | 'high'; reasons: string[] };
}

export interface LifeProjectActionItem {
  id: string;
  title: string;
  description: string | null;
  status: LifeProjectActionStatus;
  dueAt: string | null;
  completedAt?: string | null;
  evidenceIds: string[];
  blockingReasons: string[];
}

export interface LifeProjectActionPlan {
  id: string;
  scenarioId: string;
  title: string;
  status: 'draft' | 'active' | 'completed' | 'paused' | 'cancelled';
  items: LifeProjectActionItem[];
  missingInformation: string[];
}

export interface LifeProject {
  id: string;
  ownerAccountId: string;
  title: string;
  purpose: string | null;
  state: LifeProjectState;
  activeScenarioId: string | null;
  scenarios: LifeProjectScenario[];
  actionPlans: LifeProjectActionPlan[];
  missingInformation: string[];
  uncertainty: { level: 'unknown' | 'low' | 'medium' | 'high'; reasons: string[] };
  updatedAt: string;
}

export interface LifeProjectEnvelope {
  schemaVersion: string;
  project: LifeProject;
  persistenceVersion: number;
  replayed?: boolean;
}

export interface LifeProjectSummary {
  id: string;
  title: string;
  purpose?: string | null;
  state: LifeProjectState;
  activeScenarioId?: string | null;
  scenarioCount?: number;
  actionPlanCount?: number;
  persistenceVersion: number;
  updatedAt?: string;
}

export interface LifeProjectProgressAction {
  planId: string;
  actionId: string;
  title: string;
  status: LifeProjectActionStatus;
  dueAt: string | null;
  position: number;
  blockingReasons: string[];
  evidenceIds: string[];
}

export interface LifeProjectProgress {
  schemaVersion: string;
  projectId: string;
  state: 'not_started' | 'planned' | 'underway' | 'blocked' | 'completed';
  counts: Record<LifeProjectActionStatus, number>;
  nextActions: LifeProjectProgressAction[];
  completedActions: LifeProjectProgressAction[];
}

export interface LifeProjectProgressEnvelope {
  schemaVersion: string;
  persistenceVersion: number;
  progress: LifeProjectProgress;
}

export interface TriageDraft {
  situation: string;
  need: string;
  mobility: string;
  urgency: string;
  detail: string;
}
