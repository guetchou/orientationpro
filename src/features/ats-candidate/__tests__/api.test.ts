import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  depositApplication,
  getApplication,
  getApplicationHistory,
  getJob,
  listMyApplications,
  listPublishedJobs,
  withdrawApplication,
} from '../api';

describe('ats-candidate api', () => {
  beforeEach(() => {
    localStorage.setItem('userToken', 'jwt-test');
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  const mockResponse = (body: unknown, status = 200) => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(body),
    });
    return fetchMock;
  };

  it('listPublishedJobs ne garde que les offres publiées (défense en profondeur côté client)', async () => {
    mockResponse({
      schemaVersion: 'x',
      jobs: [
        { id: 'j1', status: 'published' },
        { id: 'j2', status: 'draft' },
        { id: 'j3', status: 'closed' },
      ],
    });
    const jobs = await listPublishedJobs();
    expect(jobs.map((j) => j.id)).toEqual(['j1']);
  });

  it('getJob appelle GET /v1/ats/jobs/:id et déballe .job', async () => {
    const fetchMock = mockResponse({ schemaVersion: 'x', job: { id: 'j1', title: 'Comptable' } });
    const job = await getJob('j1');
    expect(job.id).toBe('j1');
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/v1/ats/jobs/j1');
  });

  it('depositApplication omet cvAnalysisId du corps quand absent (jamais null)', async () => {
    const fetchMock = mockResponse({ application: { id: 'a1', state: 'submitted' }, event: {} }, 201);
    await depositApplication('j1');
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({});
  });

  it('depositApplication inclut cvAnalysisId quand fourni', async () => {
    const fetchMock = mockResponse({ application: {}, event: {} }, 201);
    await depositApplication('j1', 'cv-1');
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body as string)).toEqual({ cvAnalysisId: 'cv-1' });
  });

  it('listMyApplications déballe .applications', async () => {
    mockResponse({ schemaVersion: 'x', applications: [{ id: 'a1' }] });
    const applications = await listMyApplications();
    expect(applications).toEqual([{ id: 'a1' }]);
  });

  it('getApplication déballe .application', async () => {
    mockResponse({ schemaVersion: 'x', application: { id: 'a1' } });
    const application = await getApplication('a1');
    expect(application).toEqual({ id: 'a1' });
  });

  it('getApplicationHistory déballe .events', async () => {
    mockResponse({ schemaVersion: 'x', events: [{ id: 1, to: 'submitted' }] });
    const events = await getApplicationHistory('a1');
    expect(events).toEqual([{ id: 1, to: 'submitted' }]);
  });

  it('withdrawApplication envoie to=withdrawn et expectedVersion, jamais de reason', async () => {
    const fetchMock = mockResponse({ application: { state: 'withdrawn' }, event: {} });
    await withdrawApplication('a1', 3);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/v1/ats/applications/a1/transitions');
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({ to: 'withdrawn', expectedVersion: 3 });
    expect(body.reason).toBeUndefined();
  });
});
