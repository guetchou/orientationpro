/**
 * Moteur de workflows intelligents pour automatisation avancée
 * Crée des workflows personnalisés basés sur les patterns de succès
 */

import { CandidateProfile, JobRequirements } from './PredictiveScoringService';
import { MatchResult } from './IntelligentMatchingService';

export type WorkflowTrigger =
  | 'candidate_uploaded'
  | 'score_calculated'
  | 'match_found'
  | 'time_elapsed'
  | 'manual_trigger'
  | 'condition_met';

export type WorkflowAction =
  | 'send_email'
  | 'send_sms'
  | 'update_status'
  | 'assign_recruiter'
  | 'schedule_interview'
  | 'reject_candidate'
  | 'advance_to_stage'
  | 'create_task'
  | 'send_notification'
  | 'generate_report';

export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  enabled: boolean;
  priority: number;
  metadata?: Record<string, any>;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
}

export interface WorkflowContext {
  candidate?: CandidateProfile;
  job?: JobRequirements;
  match?: MatchResult;
  cvScore?: number;
  stage?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface WorkflowExecution {
  id: string;
  ruleId: string;
  triggeredAt: Date;
  context: WorkflowContext;
  actionsExecuted: WorkflowAction[];
  status: 'success' | 'failed' | 'partial';
  error?: string;
}

export class IntelligentWorkflowEngine {
  private workflows: WorkflowRule[] = [];
  private executions: WorkflowExecution[] = [];

  constructor() {
    this.initializeDefaultWorkflows();
  }

  /**
   * Initialise les workflows par défaut
   */
  private initializeDefaultWorkflows(): void {
    // Workflow 1: Auto-avance pour scores élevés
    this.addWorkflow({
      id: 'auto_advance_high_score',
      name: 'Auto-avance pour scores élevés',
      description: 'Avance automatiquement les candidats avec score ≥ 85',
      trigger: 'score_calculated',
      conditions: [
        { field: 'cvScore', operator: 'greater_than', value: 85 },
      ],
      actions: ['advance_to_stage', 'send_notification', 'assign_recruiter'],
      enabled: true,
      priority: 1,
    });

    // Workflow 2: Alert pour candidats stagnants
    this.addWorkflow({
      id: 'alert_stagnant_candidates',
      name: 'Alert pour candidats stagnants',
      description: 'Génère une alerte pour candidats en attente > 7 jours',
      trigger: 'time_elapsed',
      conditions: [
        { field: 'daysInStage', operator: 'greater_than', value: 7 },
        { field: 'stage', operator: 'not_in', value: ['hired', 'rejected'] },
      ],
      actions: ['send_notification', 'create_task'],
      enabled: true,
      priority: 2,
    });

    // Workflow 3: Auto-rejet pour scores faibles
    this.addWorkflow({
      id: 'auto_reject_low_score',
      name: 'Auto-rejet pour scores faibles',
      description: 'Rejette automatiquement les candidats avec score < 50',
      trigger: 'score_calculated',
      conditions: [
        { field: 'cvScore', operator: 'less_than', value: 50 },
      ],
      actions: ['update_status', 'send_email', 'reject_candidate'],
      enabled: true,
      priority: 1,
    });

    // Workflow 4: Fast-track pour strong_recommend
    this.addWorkflow({
      id: 'fast_track_strong_recommend',
      name: 'Fast-track pour recommandation forte',
      description: 'Fast-track les candidats avec recommendation "strong_recommend"',
      trigger: 'match_found',
      conditions: [
        { field: 'recommendation', operator: 'equals', value: 'strong_recommend' },
      ],
      actions: ['advance_to_stage', 'schedule_interview', 'send_notification'],
      enabled: true,
      priority: 1,
    });

    // Workflow 5: Assign recruteur spécialisé
    this.addWorkflow({
      id: 'assign_specialized_recruiter',
      name: 'Assign recruteur spécialisé',
      description: 'Assigne un recruteur technique pour candidats tech',
      trigger: 'candidate_uploaded',
      conditions: [
        { field: 'technicalSkills.length', operator: 'greater_than', value: 5 },
      ],
      actions: ['assign_recruiter'],
      enabled: true,
      priority: 2,
    });
  }

  /**
   * Ajoute un nouveau workflow
   */
  addWorkflow(workflow: WorkflowRule): void {
    this.workflows.push(workflow);
    // Trier par priorité
    this.workflows.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Déclenche un workflow basé sur un événement
   */
  async triggerWorkflow(
    trigger: WorkflowTrigger,
    context: WorkflowContext
  ): Promise<WorkflowExecution[]> {
    const executions: WorkflowExecution[] = [];

    // Trouver les workflows correspondants
    const matchingWorkflows = this.workflows.filter(
      workflow => workflow.enabled && workflow.trigger === trigger
    );

    for (const workflow of matchingWorkflows) {
      // Vérifier les conditions
      if (this.evaluateConditions(workflow.conditions, context)) {
        // Exécuter le workflow
        const execution = await this.executeWorkflow(workflow, context);
        executions.push(execution);
      }
    }

    return executions;
  }

  /**
   * Évalue les conditions d'un workflow
   */
  private evaluateConditions(
    conditions: WorkflowCondition[],
    context: WorkflowContext
  ): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(condition.field, context);

      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(fieldValue);
        case 'not_in':
          return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
        default:
          return false;
      }
    });
  }

  /**
   * Obtient la valeur d'un champ dans le contexte
   */
  private getFieldValue(field: string, context: WorkflowContext): any {
    const parts = field.split('.');
    let value: any = context;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Exécute un workflow
   */
  private async executeWorkflow(
    workflow: WorkflowRule,
    context: WorkflowContext
  ): Promise<WorkflowExecution> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const executedActions: WorkflowAction[] = [];
    let status: 'success' | 'failed' | 'partial' = 'success';
    let error: string | undefined;

    try {
      for (const action of workflow.actions) {
        try {
          await this.executeAction(action, context);
          executedActions.push(action);
        } catch (actionError: any) {
          status = 'partial';
          error = error ? `${error}; ${actionError.message}` : actionError.message;
          console.error(`Error executing action ${action}:`, actionError);
        }
      }
    } catch (workflowError: any) {
      status = 'failed';
      error = workflowError.message;
    }

    const execution: WorkflowExecution = {
      id: executionId,
      ruleId: workflow.id,
      triggeredAt: new Date(),
      context,
      actionsExecuted: executedActions,
      status,
      error,
    };

    this.executions.push(execution);
    return execution;
  }

  /**
   * Exécute une action spécifique
   */
  private async executeAction(
    action: WorkflowAction,
    context: WorkflowContext
  ): Promise<void> {
    // Simulation d'exécution d'actions (à remplacer par des implémentations réelles)
    switch (action) {
      case 'send_email':
        await this.sendEmail(context);
        break;
      case 'send_sms':
        await this.sendSMS(context);
        break;
      case 'update_status':
        await this.updateStatus(context);
        break;
      case 'assign_recruiter':
        await this.assignRecruiter(context);
        break;
      case 'schedule_interview':
        await this.scheduleInterview(context);
        break;
      case 'reject_candidate':
        await this.rejectCandidate(context);
        break;
      case 'advance_to_stage':
        await this.advanceToStage(context);
        break;
      case 'create_task':
        await this.createTask(context);
        break;
      case 'send_notification':
        await this.sendNotification(context);
        break;
      case 'generate_report':
        await this.generateReport(context);
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  }

  // Implémentations des actions (simplifiées pour l'exemple)
  private async sendEmail(context: WorkflowContext): Promise<void> {
    console.log('📧 Sending email to candidate:', context.candidate?.id);
    // TODO: Implémenter l'envoi d'email
  }

  private async sendSMS(context: WorkflowContext): Promise<void> {
    console.log('📱 Sending SMS to candidate:', context.candidate?.id);
    // TODO: Implémenter l'envoi SMS
  }

  private async updateStatus(context: WorkflowContext): Promise<void> {
    console.log('📝 Updating status for candidate:', context.candidate?.id);
    // TODO: Implémenter la mise à jour de statut
  }

  private async assignRecruiter(context: WorkflowContext): Promise<void> {
    console.log('👤 Assigning recruiter for candidate:', context.candidate?.id);
    // TODO: Implémenter l'assignation de recruteur
  }

  private async scheduleInterview(context: WorkflowContext): Promise<void> {
    console.log('📅 Scheduling interview for candidate:', context.candidate?.id);
    // TODO: Implémenter la planification d'entretien
  }

  private async rejectCandidate(context: WorkflowContext): Promise<void> {
    console.log('❌ Rejecting candidate:', context.candidate?.id);
    // TODO: Implémenter le rejet de candidat
  }

  private async advanceToStage(context: WorkflowContext): Promise<void> {
    console.log('➡️ Advancing candidate to next stage:', context.candidate?.id);
    // TODO: Implémenter l'avancement de stage
  }

  private async createTask(context: WorkflowContext): Promise<void> {
    console.log('✅ Creating task for candidate:', context.candidate?.id);
    // TODO: Implémenter la création de tâche
  }

  private async sendNotification(context: WorkflowContext): Promise<void> {
    console.log('🔔 Sending notification for candidate:', context.candidate?.id);
    // TODO: Implémenter l'envoi de notification
  }

  private async generateReport(context: WorkflowContext): Promise<void> {
    console.log('📊 Generating report for candidate:', context.candidate?.id);
    // TODO: Implémenter la génération de rapport
  }

  /**
   * Récupère les workflows disponibles
   */
  getWorkflows(): WorkflowRule[] {
    return this.workflows.filter(w => w.enabled);
  }

  /**
   * Récupère l'historique d'exécutions
   */
  getExecutions(): WorkflowExecution[] {
    return this.executions;
  }

  /**
   * Active/désactive un workflow
   */
  toggleWorkflow(workflowId: string, enabled: boolean): void {
    const workflow = this.workflows.find(w => w.id === workflowId);
    if (workflow) {
      workflow.enabled = enabled;
    }
  }
}

// Export instance singleton
export const intelligentWorkflowEngine = new IntelligentWorkflowEngine();

