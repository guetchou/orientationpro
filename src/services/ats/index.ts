/**
 * Export centralisé des services ATS avancés
 */

// Services de base
export { PredictiveScoringService, predictiveScoringService } from './PredictiveScoringService';
export type { CandidateProfile, JobRequirements, PredictiveScore } from './PredictiveScoringService';

export { IntelligentMatchingService, intelligentMatchingService } from './IntelligentMatchingService';
export type { MatchResult, MatchingConfig } from './IntelligentMatchingService';

export { AutomatedPipelineService, automatedPipelineService } from './AutomatedPipelineService';
export type {
  PipelineStage,
  CandidateInPipeline,
  AutomationRule,
  PipelineStats,
} from './AutomatedPipelineService';

export { BenchmarkingService, benchmarkingService } from './BenchmarkingService';
export type {
  BenchmarkData,
  BenchmarkStats,
  ComparisonResult,
} from './BenchmarkingService';

// Services avancés (IA et Workflows)
export { AIChatAdvisor, aiChatAdvisor } from './AIChatAdvisor';
export type {
  ChatMessage,
  AdviceCategory,
} from './AIChatAdvisor';

export { IntelligentWorkflowEngine, intelligentWorkflowEngine } from './IntelligentWorkflowEngine';
export type {
  WorkflowTrigger,
  WorkflowAction,
  WorkflowRule,
  WorkflowCondition,
  WorkflowContext,
  WorkflowExecution,
} from './IntelligentWorkflowEngine';

export { RecommendationEngine, recommendationEngine } from './RecommendationEngine';
export type {
  Recommendation,
  RecommendationContext,
} from './RecommendationEngine';

