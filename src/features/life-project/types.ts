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
  status: 'active' | 'experimental' | 'legacy' | 'disabled';
  configured: boolean;
  publicLimitations: string[];
}

export interface LifeProjectSummary {
  id: string;
  title: string;
  purpose: string | null;
  state: LifeProjectState;
  activeScenarioId: string | null;
  scenarioCount: number;
  actionPlanCount: number;
  persistenceVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface Uncertainty {
  level: 'unknown' | 'low' | 'medium' | 'high';
  reasons: string[];
}

export interface LifeProjectScenario {
  id: string;
  title: string;
  description: string | null;
  horizon: string | null;
  status: 'exploring' | 'candidate' | 'active' | 'paused' | 'discarded';
  optionType: string;
  assumptions: string[];
  barriers: string[];
  supports: string[];
  missingInformation: string[];
  uncertainty: Uncertainty;
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
  uncertainty: Uncertainty;
  createdAt: string;
  updatedAt: string;
}

export interface LoadedLifeProject {
  schemaVersion: 'makoki-life-project-api-v1';
  project: LifeProject;
  persistenceVersion: number;
}

export interface TriageInput {
  situation: string;
  need: string;
  title: string;
}
