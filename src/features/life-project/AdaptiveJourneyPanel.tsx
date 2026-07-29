import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, PauseCircle, Route, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createLifeProjectActionPlan,
  getLifeProjectOrchestration,
  getLifeProjectProgress,
  moveLifeProjectToClarification,
  updateLifeProjectAction,
} from './api';
import type {
  LifeProjectActionStatus,
  LifeProjectEnvelope,
  LifeProjectOrchestration,
  LifeProjectProgress,
} from './types';

const moduleStateKey = (projectId: string) => `makoki.life-project.modules.${projectId}.v1`;

interface ModuleState {
  completed: string[];
  skipped: string[];
}

const readModuleState = (projectId: string): ModuleState => {
  try {
    const parsed = JSON.parse(localStorage.getItem(moduleStateKey(projectId)) || '{}') as Partial<ModuleState>;
    return {
      completed: Array.isArray(parsed.completed) ? parsed.completed : [],
      skipped: Array.isArray(parsed.skipped) ? parsed.skipped : [],
    };
  } catch {
    return { completed: [], skipped: [] };
  }
};

const moduleRoutes: Record<string, string> = {
  'profile.review': '/profile',
  'profile.skills-review': '/profile',
  'orientation.interests': '/tests/riasec',
  'career.exploration': '/careers',
};

const knownModuleLabels: Record<string, string> = {
  'life-project.clarification': 'Clarifier la situation',
  'profile.review': 'Relire le profil',
  'profile.skills-review': 'Vérifier les compétences',
  'orientation.interests': 'Explorer les intérêts',
  'career.exploration': 'Explorer des possibilités',
};

const statusLabels: Record<LifeProjectActionStatus, string> = {
  planned: 'Planifiée',
  in_progress: 'En cours',
  completed: 'Terminée',
  blocked: 'Bloquée',
  cancelled: 'Annulée',
};

export default function AdaptiveJourneyPanel({
  envelope,
  online,
  cached,
  onEnvelope,
  onMessage,
}: {
  envelope: LifeProjectEnvelope;
  online: boolean;
  cached: boolean;
  onEnvelope: (envelope: LifeProjectEnvelope) => void;
  onMessage: (message: string | null) => void;
}) {
  const navigate = useNavigate();
  const initialModuleState = useMemo(
    () => readModuleState(envelope.project.id),
    [envelope.project.id],
  );
  const [moduleStates, setModuleStates] = useState<Record<string, ModuleState>>({});
  const moduleState = moduleStates[envelope.project.id] || initialModuleState;
  const [orchestration, setOrchestration] = useState<LifeProjectOrchestration | null>(null);
  const [progress, setProgress] = useState<LifeProjectProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planTitle, setPlanTitle] = useState('Mon premier plan d’action');
  const [actionTitle, setActionTitle] = useState('');
  const [blockingReasons, setBlockingReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    setOrchestration(null);
    setProgress(null);
    setLoading(true);
    setBlockingReasons({});
  }, [envelope.project.id]);

  const load = useCallback(async () => {
    if (!online || cached) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [orchestrationResponse, progressResponse] = await Promise.all([
        getLifeProjectOrchestration(
          envelope.project.id,
          moduleState.completed,
          moduleState.skipped,
        ),
        getLifeProjectProgress(envelope.project.id),
      ]);
      setOrchestration(orchestrationResponse.orchestration);
      setProgress(progressResponse.progress);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Le parcours adaptatif ne peut pas être chargé.');
    } finally {
      setLoading(false);
    }
  }, [cached, envelope.project.id, moduleState.completed, moduleState.skipped, online, onMessage]);

  useEffect(() => {
    void load();
  }, [load, envelope.persistenceVersion]);

  const persistModuleState = (next: ModuleState) => {
    setModuleStates((current) => ({
      ...current,
      [envelope.project.id]: next,
    }));
    localStorage.setItem(moduleStateKey(envelope.project.id), JSON.stringify(next));
  };

  const skipModule = (moduleId: string) => {
    persistModuleState({
      completed: moduleState.completed.filter((id) => id !== moduleId),
      skipped: [...new Set([...moduleState.skipped, moduleId])],
    });
  };

  const resumeModule = (moduleId: string) => {
    persistModuleState({
      completed: moduleState.completed.filter((id) => id !== moduleId),
      skipped: moduleState.skipped.filter((id) => id !== moduleId),
    });
  };

  const completeModule = (moduleId: string) => {
    persistModuleState({
      completed: [...new Set([...moduleState.completed, moduleId])],
      skipped: moduleState.skipped.filter((id) => id !== moduleId),
    });
  };

  const openModule = async (moduleId: string) => {
    if (moduleId === 'life-project.clarification') {
      if (!online || cached) {
        onMessage('La clarification nécessite une connexion. Utilisez le bouton de clarification du projet pour enregistrer une reprise hors ligne.');
        return;
      }
      setSaving(true);
      onMessage(null);
      try {
        const updated = await moveLifeProjectToClarification(
          envelope.project.id,
          envelope.persistenceVersion,
        );
        onEnvelope(updated);
        onMessage('Le projet est passé en clarification. Vous pouvez maintenant préciser les informations manquantes.');
      } catch (error) {
        onMessage(error instanceof Error ? error.message : 'La clarification n’a pas pu être enregistrée.');
      } finally {
        setSaving(false);
      }
      return;
    }

    const route = moduleRoutes[moduleId];
    if (route) navigate(route);
  };

  const createPlan = async (event: FormEvent) => {
    event.preventDefault();
    if (!envelope.project.activeScenarioId || !actionTitle.trim() || !online || cached) return;
    setSaving(true);
    onMessage(null);
    try {
      const updated = await createLifeProjectActionPlan(
        envelope.project.id,
        envelope.project.activeScenarioId,
        envelope.persistenceVersion,
        planTitle.trim(),
        actionTitle.trim(),
      );
      onEnvelope(updated);
      setActionTitle('');
      onMessage('La première action a été ajoutée. Elle reste révisable.');
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'Le plan d’action n’a pas pu être enregistré.');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (
    planId: string,
    actionId: string,
    status: LifeProjectActionStatus,
  ) => {
    if (!online || cached) {
      onMessage('Cette modification d’action nécessite une connexion. Les transitions de projet et choix de scénario peuvent être mis en file hors ligne.');
      return;
    }
    const blockingReason = blockingReasons[actionId]?.trim();
    if (status === 'blocked' && !blockingReason) {
      onMessage('Indiquez la raison du blocage avant de marquer cette action comme bloquée.');
      return;
    }
    setSaving(true);
    onMessage(null);
    try {
      const updated = await updateLifeProjectAction(
        envelope.project.id,
        planId,
        actionId,
        envelope.persistenceVersion,
        {
          status,
          blockingReasons: status === 'blocked' ? [blockingReason] : [],
          reason: `Statut modifié en ${status} depuis le Parcours MAKOKI.`,
        },
      );
      onEnvelope(updated);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'L’action n’a pas pu être mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  const next = orchestration?.recommendations.find((entry) => entry.moduleId === orchestration.nextModuleId) || null;
  const nextActionAvailable = Boolean(next && (
    next.moduleId === 'life-project.clarification'
    || moduleRoutes[next.moduleId]
  ));
  const moduleLabel = (moduleId: string) => orchestration?.recommendations
    .find((entry) => entry.moduleId === moduleId)?.label
    || knownModuleLabels[moduleId]
    || moduleId;
  const activeScenario = envelope.project.scenarios.find((scenario) => scenario.id === envelope.project.activeScenarioId);
  const hasActions = envelope.project.actionPlans.some((plan) => plan.items.length > 0);
  const hypotheses = useMemo(() => envelope.project.scenarios.flatMap((scenario) => [
    ...(scenario.assumptions || []),
    ...(scenario.uncertainty.reasons || []),
  ]), [envelope.project.scenarios]);

  return (
    <div className="space-y-6" id="life-project-workspace">
      <Card data-testid="adaptive-next-module">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Route className="h-5 w-5" />Prochaine étape proposée</CardTitle>
          <CardDescription>La proposition dépend de l’état du projet, des inconnues, des scénarios, des actions et des capacités réellement disponibles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <p className="flex items-center text-sm"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Calcul explicable de la prochaine étape…</p>}
          {!loading && !online && <p className="text-sm text-muted-foreground">L’orchestration distante sera recalculée après reconnexion. La dernière version du projet reste lisible.</p>}
          {!loading && online && !next && <p className="text-sm text-muted-foreground">Aucune étape supplémentaire disponible pour le moment. Vous pouvez relire ou réorienter votre projet.</p>}
          {next && (
            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold">{next.label}</h3>
                <Badge variant={next.capabilityStatus === 'experimental' ? 'secondary' : 'default'}>{next.capabilityStatus}</Badge>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {next.reasons.map((reason) => <li key={reason.code}>• {reason.message}</li>)}
              </ul>
              {next.publicLimitations.length > 0 && <p className="mt-3 text-xs text-muted-foreground">Limite : {next.publicLimitations[0]}</p>}
              {!nextActionAvailable && (
                <p className="mt-3 text-sm text-amber-800" role="status">
                  Cette étape n’est pas encore raccordée à une action ou une page. Elle reste visible, mais ne peut pas être commencée depuis cet écran.
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" disabled={saving || !nextActionAvailable} onClick={() => void openModule(next.moduleId)}><ArrowRight className="mr-2 h-4 w-4" />Commencer cette étape</Button>
                <Button type="button" variant="outline" onClick={() => skipModule(next.moduleId)}><PauseCircle className="mr-2 h-4 w-4" />Passer explicitement</Button>
                <Button type="button" variant="ghost" onClick={() => completeModule(next.moduleId)}><CheckCircle2 className="mr-2 h-4 w-4" />Déjà réalisé</Button>
              </div>
            </div>
          )}
          {moduleState.skipped.length > 0 && (
            <div className="rounded-lg border border-dashed p-4 text-sm" data-testid="skipped-modules">
              <p className="font-medium">Étapes passées</p>
              <p className="mt-1 text-muted-foreground">Vous pouvez reprendre une étape passée. Ce choix reste propre à ce projet.</p>
              <ul className="mt-3 space-y-2">
                {moduleState.skipped.map((moduleId) => (
                  <li key={moduleId} className="flex flex-wrap items-center justify-between gap-2">
                    <span>{moduleLabel(moduleId)}</span>
                    <Button type="button" size="sm" variant="outline" onClick={() => resumeModule(moduleId)}>
                      Reprendre {moduleLabel(moduleId)}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {orchestration?.recommendations.some((entry) => entry.availability !== 'available') && (
            <div className="rounded-lg border border-dashed p-4 text-sm" data-testid="unavailable-modules">
              <p className="font-medium">Modules non disponibles</p>
              <ul className="mt-2 space-y-2 text-muted-foreground">
                {orchestration.recommendations
                  .filter((entry) => entry.availability !== 'available')
                  .map((entry) => (
                    <li key={entry.moduleId}>
                      {entry.label} — {entry.blockers.join(' · ') || 'indisponible dans cet environnement'}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ce que Makoki sait — et ne sait pas</CardTitle>
          <CardDescription>Aucune déclaration ou hypothèse n’est transformée automatiquement en fait vérifié.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4"><h3 className="font-medium">Déclarations de départ</h3><p className="mt-2 text-sm text-muted-foreground">{envelope.project.purpose || 'Aucune déclaration résumée.'}</p></div>
          <div className="rounded-lg border p-4"><h3 className="font-medium">Hypothèses à vérifier</h3><p className="mt-2 text-sm text-muted-foreground">{hypotheses[0] || 'Les scénarios restent des possibilités, pas des verdicts.'}</p></div>
          <div className="rounded-lg border p-4" data-testid="verified-information-unavailable"><h3 className="font-medium">Informations vérifiées — capacité non raccordée</h3><p className="mt-2 text-sm text-muted-foreground">Aucune source, autorité, date de vérification, fraîcheur ou périmètre géographique n’est disponible dans ce parcours. Aucune donnée n’est donc présentée comme vérifiée.</p></div>
          <div className="rounded-lg border p-4"><h3 className="font-medium">Inconnues actuelles</h3><p className="mt-2 text-sm text-muted-foreground">{envelope.project.missingInformation[0] || 'Aucune inconnue explicitement enregistrée.'}</p></div>
        </CardContent>
      </Card>

      <Card data-testid="life-project-actions">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Actions et suivi</CardTitle>
          <CardDescription>La progression décrit les actions enregistrées. Elle ne mesure ni votre valeur, ni vos capacités psychologiques.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {progress && (
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline">Planifiées : {progress.counts.planned}</Badge>
              <Badge variant="outline">En cours : {progress.counts.in_progress}</Badge>
              <Badge variant="outline">Terminées : {progress.counts.completed}</Badge>
              <Badge variant="outline">Bloquées : {progress.counts.blocked}</Badge>
            </div>
          )}

          {!hasActions && activeScenario && (
            <form className="space-y-3 rounded-lg border p-4" onSubmit={(event) => void createPlan(event)}>
              <h3 className="font-medium">Créer une première action pour « {activeScenario.title} »</h3>
              <label className="block text-sm">Nom du plan<input className="mt-1 w-full rounded-md border px-3 py-2" value={planTitle} onChange={(event) => setPlanTitle(event.target.value)} maxLength={200} required /></label>
              <label className="block text-sm">Première action observable<input className="mt-1 w-full rounded-md border px-3 py-2" value={actionTitle} onChange={(event) => setActionTitle(event.target.value)} maxLength={200} required placeholder="Ex. contacter une formation et noter les conditions d’accès" /></label>
              <Button type="submit" disabled={saving || !online || cached}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Ajouter cette action</Button>
            </form>
          )}

          {!activeScenario && !hasActions && <p className="text-sm text-muted-foreground">Choisissez d’abord un scénario provisoire avant de construire un plan d’action.</p>}

          {envelope.project.actionPlans.flatMap((plan) => plan.items.map((action) => (
            <div key={action.id} className="rounded-lg border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div><h3 className="font-medium">{action.title}</h3><p className="mt-1 text-sm text-muted-foreground">{action.description || 'Action révisable et observable.'}</p></div>
                <Badge>{statusLabels[action.status]}</Badge>
              </div>
              {action.status === 'blocked' && action.blockingReasons.length > 0 && <p className="mt-3 flex gap-2 text-sm text-amber-800"><AlertTriangle className="h-4 w-4 shrink-0" />{action.blockingReasons.join(' · ')}</p>}
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="text-sm">Raison du blocage, si nécessaire<input className="mt-1 w-full rounded-md border px-3 py-2" value={blockingReasons[action.id] || ''} onChange={(event) => setBlockingReasons((current) => ({ ...current, [action.id]: event.target.value }))} maxLength={500} /></label>
                <label className="text-sm">Changer le statut<select className="mt-1 w-full rounded-md border px-3 py-2" value={action.status} disabled={saving} onChange={(event) => void updateStatus(plan.id, action.id, event.target.value as LifeProjectActionStatus)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              </div>
            </div>
          )))}
        </CardContent>
      </Card>
    </div>
  );
}
