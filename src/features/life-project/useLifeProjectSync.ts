import { useCallback, useEffect, useState } from 'react';
import {
  executeLifeProjectSyncCommand,
  getLifeProject,
} from './api';
import {
  createSyncCommand,
  enqueueSyncCommand,
  flushSyncQueue,
  queuedCommandsForProject,
  readSyncQueue,
  reconcileReadableEnvelope,
  type LifeProjectSyncCommandKind,
  type SyncConflict,
} from './sync';
import type { LifeProjectEnvelope } from './types';

export const useLifeProjectSync = ({
  current,
  online,
  onEnvelope,
  onMessage,
}: {
  current: LifeProjectEnvelope | null;
  online: boolean;
  onEnvelope: (envelope: LifeProjectEnvelope) => void;
  onMessage: (message: string | null) => void;
}) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [conflict, setConflict] = useState<SyncConflict | null>(null);
  const [syncing, setSyncing] = useState(false);

  const refreshCount = useCallback(() => {
    setPendingCount(current ? queuedCommandsForProject(current.project.id).length : 0);
    setConflict(readSyncQueue().conflict);
  }, [current]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  useEffect(() => {
    if (online && pendingCount > 0) {
      onMessage('Des modifications confirmées sont enregistrées sur cet appareil. Vérifiez-les avant de reprendre la synchronisation.');
    }
  }, [online, onMessage, pendingCount]);

  const queue = useCallback((
    kind: LifeProjectSyncCommandKind,
    payload: Record<string, unknown>,
    description: string,
  ) => {
    if (!current) return false;
    const confirmed = window.confirm(
      `${description}\n\nCette modification sera conservée sur cet appareil et ne sera envoyée qu’après une nouvelle confirmation lorsque la connexion sera disponible.`,
    );
    if (!confirmed) return false;
    const now = new Date().toISOString();
    enqueueSyncCommand(createSyncCommand({
      projectId: current.project.id,
      baseVersion: current.persistenceVersion,
      kind,
      payload,
      confirmedAt: now,
      createdAt: now,
    }));
    refreshCount();
    onMessage('Modification enregistrée localement. Elle n’est pas encore appliquée au projet canonique.');
    return true;
  }, [current, onMessage, refreshCount]);

  const queueScenarioSelection = useCallback((scenarioId: string) => queue(
    'select_scenario',
    { scenarioId },
    'Enregistrer ce choix provisoire pour la reprise ?',
  ), [queue]);

  const queueTransition = useCallback((to: string, reason: string) => queue(
    'transition',
    { to, reason },
    'Enregistrer cette évolution du projet pour la reprise ?',
  ), [queue]);

  const resume = useCallback(async () => {
    if (!current || !online || pendingCount === 0) return;
    const confirmed = window.confirm(
      `Reprendre ${pendingCount} modification(s) enregistrée(s) sur cet appareil ? Le projet distant sera relu avant toute écriture.`,
    );
    if (!confirmed) return;
    setSyncing(true);
    onMessage(null);
    try {
      const remote = await getLifeProject(current.project.id);
      const reconciliation = reconcileReadableEnvelope({
        remote,
        local: current,
        queue: readSyncQueue(),
      });
      if (reconciliation.conflict) {
        setConflict(reconciliation.conflict);
        onEnvelope(reconciliation.envelope);
        onMessage(reconciliation.conflict.message);
        return;
      }
      const result = await flushSyncQueue({
        remote,
        confirmed: true,
        executor: executeLifeProjectSyncCommand,
      });
      onEnvelope(result.envelope);
      setConflict(result.conflict);
      refreshCount();
      onMessage(result.conflict
        ? result.conflict.message
        : `${result.applied} modification(s) reprise(s) avec succès.`);
    } catch (error) {
      onMessage(error instanceof Error ? error.message : 'La reprise a été interrompue. Les modifications locales sont conservées.');
    } finally {
      setSyncing(false);
    }
  }, [current, online, onEnvelope, onMessage, pendingCount, refreshCount]);

  return {
    conflict,
    pendingCount,
    queueScenarioSelection,
    queueTransition,
    refreshCount,
    resume,
    syncing,
  };
};
