import { ApiError } from '@/lib/apiClient';
import type { LifeProjectEnvelope } from './types';

export const SYNC_QUEUE_VERSION = 'makoki-life-project-sync-queue-v1';
export const SYNC_QUEUE_KEY = 'makoki.life-project.sync-queue.v1';

export type LifeProjectSyncCommandKind =
  | 'select_scenario'
  | 'transition'
  | 'update_action';

export interface LifeProjectSyncCommand {
  schemaVersion: typeof SYNC_QUEUE_VERSION;
  commandId: string;
  projectId: string;
  baseVersion: number;
  kind: LifeProjectSyncCommandKind;
  payload: Record<string, unknown>;
  createdAt: string;
  confirmedAt: string;
}

export interface SyncConflict {
  code: 'REMOTE_VERSION_CHANGED' | 'COMMAND_REJECTED';
  commandId: string;
  projectId: string;
  localBaseVersion: number;
  remoteVersion: number;
  message: string;
}

export interface SyncQueueState {
  schemaVersion: typeof SYNC_QUEUE_VERSION;
  commands: LifeProjectSyncCommand[];
  conflict: SyncConflict | null;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const emptyQueue = (): SyncQueueState => ({
  schemaVersion: SYNC_QUEUE_VERSION,
  commands: [],
  conflict: null,
});

const validDate = (value: unknown): value is string => (
  typeof value === 'string' && !Number.isNaN(Date.parse(value))
);

const isCommand = (value: unknown): value is LifeProjectSyncCommand => {
  if (!value || typeof value !== 'object') return false;
  const command = value as Partial<LifeProjectSyncCommand>;
  return command.schemaVersion === SYNC_QUEUE_VERSION
    && typeof command.commandId === 'string'
    && command.commandId.length > 0
    && typeof command.projectId === 'string'
    && command.projectId.length > 0
    && Number.isInteger(command.baseVersion)
    && Number(command.baseVersion) > 0
    && ['select_scenario', 'transition', 'update_action'].includes(String(command.kind))
    && Boolean(command.payload && typeof command.payload === 'object')
    && validDate(command.createdAt)
    && validDate(command.confirmedAt);
};

export const readSyncQueue = (
  storage: StorageLike = localStorage,
): SyncQueueState => {
  try {
    const raw = storage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return emptyQueue();
    const parsed = JSON.parse(raw) as Partial<SyncQueueState>;
    if (parsed.schemaVersion !== SYNC_QUEUE_VERSION || !Array.isArray(parsed.commands)) {
      return emptyQueue();
    }
    return {
      schemaVersion: SYNC_QUEUE_VERSION,
      commands: parsed.commands.filter(isCommand),
      conflict: parsed.conflict || null,
    };
  } catch {
    return emptyQueue();
  }
};

export const writeSyncQueue = (
  state: SyncQueueState,
  storage: StorageLike = localStorage,
) => {
  if (state.commands.length === 0 && !state.conflict) {
    storage.removeItem(SYNC_QUEUE_KEY);
    return;
  }
  storage.setItem(SYNC_QUEUE_KEY, JSON.stringify(state));
};

export const createSyncCommand = ({
  commandId = crypto.randomUUID(),
  projectId,
  baseVersion,
  kind,
  payload,
  createdAt = new Date().toISOString(),
  confirmedAt,
}: Omit<LifeProjectSyncCommand, 'schemaVersion' | 'commandId' | 'createdAt'> & {
  commandId?: string;
  createdAt?: string;
}): LifeProjectSyncCommand => {
  if (!confirmedAt || !validDate(confirmedAt)) {
    throw new Error('Une confirmation explicite est requise avant la mise en file locale.');
  }
  if (!projectId || !Number.isInteger(baseVersion) || baseVersion < 1) {
    throw new Error('Le projet et sa version canonique sont requis.');
  }
  return Object.freeze({
    schemaVersion: SYNC_QUEUE_VERSION,
    commandId,
    projectId,
    baseVersion,
    kind,
    payload: Object.freeze({ ...payload }),
    createdAt: new Date(createdAt).toISOString(),
    confirmedAt: new Date(confirmedAt).toISOString(),
  });
};

export const enqueueSyncCommand = (
  command: LifeProjectSyncCommand,
  storage: StorageLike = localStorage,
): SyncQueueState => {
  const current = readSyncQueue(storage);
  const existing = current.commands.find((entry) => entry.commandId === command.commandId);
  if (existing) {
    if (JSON.stringify(existing) !== JSON.stringify(command)) {
      throw new Error('Cet identifiant de commande est déjà utilisé différemment.');
    }
    return current;
  }
  const state = {
    schemaVersion: SYNC_QUEUE_VERSION,
    commands: [...current.commands, command],
    conflict: null,
  } as SyncQueueState;
  writeSyncQueue(state, storage);
  return state;
};

export const queuedCommandsForProject = (
  projectId: string,
  storage: StorageLike = localStorage,
) => readSyncQueue(storage).commands.filter((command) => command.projectId === projectId);

export const reconcileReadableEnvelope = ({
  remote,
  local,
  queue,
}: {
  remote: LifeProjectEnvelope;
  local: LifeProjectEnvelope | null;
  queue: SyncQueueState;
}) => {
  if (!local || local.project.id !== remote.project.id) {
    return { envelope: remote, source: 'remote' as const, conflict: null };
  }
  const pending = queue.commands.filter((command) => command.projectId === remote.project.id);
  const incompatible = pending.find((command) => command.baseVersion !== remote.persistenceVersion);
  if (incompatible) {
    return {
      envelope: remote,
      source: 'remote' as const,
      conflict: {
        code: 'REMOTE_VERSION_CHANGED' as const,
        commandId: incompatible.commandId,
        projectId: remote.project.id,
        localBaseVersion: incompatible.baseVersion,
        remoteVersion: remote.persistenceVersion,
        message: 'Le projet a changé ailleurs. Les modifications locales ne seront pas appliquées sans révision.',
      },
    };
  }
  return {
    envelope: remote.persistenceVersion >= local.persistenceVersion ? remote : local,
    source: remote.persistenceVersion >= local.persistenceVersion ? 'remote' as const : 'local' as const,
    conflict: null,
  };
};

export type SyncExecutor = (
  command: LifeProjectSyncCommand,
  currentVersion: number,
) => Promise<LifeProjectEnvelope>;

export const flushSyncQueue = async ({
  remote,
  confirmed,
  executor,
  storage = localStorage,
}: {
  remote: LifeProjectEnvelope;
  confirmed: boolean;
  executor: SyncExecutor;
  storage?: StorageLike;
}) => {
  const state = readSyncQueue(storage);
  const commands = state.commands.filter((command) => command.projectId === remote.project.id);
  if (commands.length === 0) return { envelope: remote, applied: 0, conflict: null };
  if (!confirmed) throw new Error('La reprise des écritures exige une confirmation explicite.');

  const firstConflict = commands.find((command) => command.baseVersion !== remote.persistenceVersion);
  if (firstConflict) {
    const conflict: SyncConflict = {
      code: 'REMOTE_VERSION_CHANGED',
      commandId: firstConflict.commandId,
      projectId: remote.project.id,
      localBaseVersion: firstConflict.baseVersion,
      remoteVersion: remote.persistenceVersion,
      message: 'La version distante a changé. Vérifiez les modifications avant de poursuivre.',
    };
    writeSyncQueue({ ...state, conflict }, storage);
    return { envelope: remote, applied: 0, conflict };
  }

  let envelope = remote;
  let applied = 0;
  for (const command of commands) {
    try {
      envelope = await executor(command, envelope.persistenceVersion);
      applied += 1;
    } catch (error) {
      const conflict: SyncConflict = {
        code: 'COMMAND_REJECTED',
        commandId: command.commandId,
        projectId: command.projectId,
        localBaseVersion: command.baseVersion,
        remoteVersion: envelope.persistenceVersion,
        message: error instanceof ApiError && error.status === 409
          ? 'La commande entre en conflit avec une modification plus récente.'
          : 'La reprise a été interrompue. Les commandes restantes sont conservées.',
      };
      const remaining = state.commands.filter((entry) => (
        entry.projectId !== remote.project.id
        || commands.slice(applied).some((candidate) => candidate.commandId === entry.commandId)
      )).map((entry) => (
        entry.projectId === remote.project.id
          ? { ...entry, baseVersion: envelope.persistenceVersion }
          : entry
      ));
      writeSyncQueue({ schemaVersion: SYNC_QUEUE_VERSION, commands: remaining, conflict }, storage);
      return { envelope, applied, conflict };
    }
  }

  const appliedIds = new Set(commands.map((command) => command.commandId));
  writeSyncQueue({
    schemaVersion: SYNC_QUEUE_VERSION,
    commands: state.commands.filter((command) => !appliedIds.has(command.commandId)),
    conflict: null,
  }, storage);
  return { envelope, applied, conflict: null };
};
