import { describe, expect, it, vi } from 'vitest';
import type { LifeProjectEnvelope } from './types';
import {
  createSyncCommand,
  enqueueSyncCommand,
  flushSyncQueue,
  readSyncQueue,
  reconcileReadableEnvelope,
  type StorageLike,
} from './sync';

const createStorage = (): StorageLike => {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
};

const envelope = (
  version: number,
  projectId = 'project-1',
  accountId = 'account-1',
): LifeProjectEnvelope => ({
  schemaVersion: 'makoki-life-project-api-v1',
  persistenceVersion: version,
  project: {
    id: projectId,
    ownerAccountId: accountId,
    title: 'Projet',
    purpose: null,
    state: 'exploration',
    activeScenarioId: null,
    scenarios: [],
    actionPlans: [],
    missingInformation: [],
    uncertainty: { level: 'low', reasons: [] },
    updatedAt: `2026-07-29T09:0${version}:00.000Z`,
  },
});

const command = (overrides = {}) => createSyncCommand({
  commandId: 'command-1',
  projectId: 'project-1',
  baseVersion: 2,
  kind: 'transition',
  payload: { to: 'clarification' },
  createdAt: '2026-07-29T09:00:00.000Z',
  confirmedAt: '2026-07-29T09:00:01.000Z',
  ...overrides,
});

describe('file locale de reprise LifeProject', () => {
  it('refuse une écriture locale sans confirmation explicite', () => {
    expect(() => createSyncCommand({
      projectId: 'project-1',
      baseVersion: 2,
      kind: 'transition',
      payload: {},
      confirmedAt: '',
    })).toThrow(/confirmation explicite/i);
  });

  it('conserve une commande confirmée et rejoue un doublon identique sans duplication', () => {
    const storage = createStorage();
    enqueueSyncCommand(command(), storage);
    enqueueSyncCommand(command(), storage);
    expect(readSyncQueue(storage).commands).toHaveLength(1);
  });

  it('détecte une version distante différente sans écraser la commande locale', () => {
    const storage = createStorage();
    enqueueSyncCommand(command(), storage);
    const result = reconcileReadableEnvelope({
      remote: envelope(3),
      local: envelope(2),
      queue: readSyncQueue(storage),
    });
    expect(result.envelope.persistenceVersion).toBe(3);
    expect(result.conflict?.code).toBe('REMOTE_VERSION_CHANGED');
    expect(readSyncQueue(storage).commands).toHaveLength(1);
  });

  it('exige une confirmation avant de vider la file', async () => {
    const storage = createStorage();
    enqueueSyncCommand(command(), storage);
    await expect(flushSyncQueue({
      remote: envelope(2),
      confirmed: false,
      executor: vi.fn(),
      storage,
    })).rejects.toThrow(/confirmation explicite/i);
  });

  it('applique les commandes dans l’ordre avec la version courante puis vide la file', async () => {
    const storage = createStorage();
    enqueueSyncCommand(command(), storage);
    enqueueSyncCommand(command({
      commandId: 'command-2',
      kind: 'select_scenario',
      payload: { scenarioId: 'scenario-1' },
    }), storage);
    const executor = vi.fn()
      .mockResolvedValueOnce(envelope(3))
      .mockResolvedValueOnce(envelope(4));

    const result = await flushSyncQueue({
      remote: envelope(2),
      confirmed: true,
      executor,
      storage,
    });

    expect(result.applied).toBe(2);
    expect(result.envelope.persistenceVersion).toBe(4);
    expect(executor.mock.calls[0][1]).toBe(2);
    expect(executor.mock.calls[1][1]).toBe(3);
    expect(readSyncQueue(storage).commands).toHaveLength(0);
  });

  it('conserve les commandes restantes lorsqu’un conflit survient en cours de reprise', async () => {
    const storage = createStorage();
    enqueueSyncCommand(command(), storage);
    enqueueSyncCommand(command({ commandId: 'command-2' }), storage);
    const executor = vi.fn()
      .mockResolvedValueOnce(envelope(3))
      .mockRejectedValueOnce(new Error('conflit'));

    const result = await flushSyncQueue({
      remote: envelope(2),
      confirmed: true,
      executor,
      storage,
    });

    expect(result.applied).toBe(1);
    expect(result.conflict?.code).toBe('COMMAND_REJECTED');
    expect(readSyncQueue(storage).commands.map((entry) => entry.commandId)).toEqual(['command-2']);
  });

  it('isole la reprise lors d’un changement de projet', async () => {
    const storage = createStorage();
    enqueueSyncCommand(command(), storage);
    enqueueSyncCommand(command({ commandId: 'command-2', projectId: 'project-2' }), storage);
    const executor = vi.fn().mockResolvedValue(envelope(3, 'project-2'));
    const result = await flushSyncQueue({
      remote: envelope(2, 'project-2'), confirmed: true, executor, storage,
    });
    expect(result.applied).toBe(1);
    expect(executor.mock.calls[0][0].projectId).toBe('project-2');
    expect(readSyncQueue(storage).commands.map((entry) => entry.projectId)).toEqual(['project-1']);
  });

  it('reprend sans perte après une interruption sur une liaison lente', async () => {
    const storage = createStorage();
    enqueueSyncCommand(command(), storage);
    enqueueSyncCommand(command({ commandId: 'command-2' }), storage);
    const interrupted = vi.fn()
      .mockResolvedValueOnce(envelope(3))
      .mockRejectedValueOnce(new Error('network interrupted'));
    const firstAttempt = await flushSyncQueue({
      remote: envelope(2), confirmed: true, executor: interrupted, storage,
    });
    expect(firstAttempt.applied).toBe(1);
    expect(readSyncQueue(storage).commands.map((entry) => entry.commandId)).toEqual(['command-2']);

    const resumed = await flushSyncQueue({
      remote: envelope(3),
      confirmed: true,
      executor: async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return envelope(4);
      },
      storage,
    });
    expect(resumed.applied).toBe(1);
    expect(resumed.envelope.persistenceVersion).toBe(4);
    expect(readSyncQueue(storage).commands).toHaveLength(0);
  });
});
