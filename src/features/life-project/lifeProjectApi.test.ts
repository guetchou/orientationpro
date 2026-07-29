import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addInitialScenario,
  createLifeProject,
  getLifeProjectCapability,
  listLifeProjects,
} from './lifeProjectApi';
import type { LoadedLifeProject, TriageInput } from './types';

const response = (payload: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => JSON.stringify(payload),
});

const input: TriageInput = {
  situation: 'Je cherche un emploi',
  need: 'Construire une piste professionnelle',
  title: 'Construire une piste professionnelle',
};

describe('lifeProjectApi', () => {
  beforeEach(() => {
    localStorage.setItem('userToken', 'jwt-life-project');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('lit le registre public avant de charger les projets authentifiés', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock
      .mockResolvedValueOnce(response({
        capabilities: [{ id: 'life-project.core-v1', configured: true, status: 'experimental' }],
      }))
      .mockResolvedValueOnce(response({ projects: [] }));

    expect((await getLifeProjectCapability())?.configured).toBe(true);
    await listLifeProjects();

    expect(new Headers(fetchMock.mock.calls[0][1].headers).get('Authorization')).toBeNull();
    expect(new Headers(fetchMock.mock.calls[1][1].headers).get('Authorization')).toBe('Bearer jwt-life-project');
  });

  it('crée le projet avec des déclarations explicitement signalées', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(response({ project: { id: 'project-1' }, persistenceVersion: 1 }, 201));

    await createLifeProject(input);

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init.body));
    expect(init.method).toBe('POST');
    expect(body.provenanceNotes).toContain('Situation déclarée');
    expect(body.uncertainty.level).toBe('high');
  });

  it('envoie la version de persistance pour ajouter le scénario initial', async () => {
    const loaded = {
      project: { id: 'project/1' },
      persistenceVersion: 7,
    } as LoadedLifeProject;
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue(response(loaded, 201));

    await addInitialScenario(loaded, input);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/project%2F1/scenarios');
    expect(new Headers(init.headers).get('If-Match')).toBe('"7"');
  });
});
