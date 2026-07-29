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
  status: 'planned' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  dueAt: string | null;
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

export interface TriageDraft {
  situation: string;
  need: string;
  mobility: string;
  urgency: string;
  detail: string;
}
