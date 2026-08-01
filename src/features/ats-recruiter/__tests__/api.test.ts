import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  assignRecruiter,
  closeJob,
  createEvaluation,
  createJob,
  getApplication,
  getApplicationHistory,
  getJob,
  listApplicationsForJob,
  listEvaluations,
  listJobEvents,
  listJobRecruiters,
  listJobs,
  publishJob,
  removeRecruiter,
  transitionApplication,
} from '../api';

describe('ats-recruiter api', () => {
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

  it('listJobs déballe .jobs sans filtrage client (le serveur borne déjà par rôle/organisation)', async () => {
    mockResponse({ schemaVersion: 'x', jobs: [{ id: 'j1', status: 'draft' }, { id: 'j2', status: 'published' }] });
    const jobs = await listJobs();
    expect(jobs.map((j) => j.id)).toEqual(['j1', 'j2']);
  });

  it('getJob appelle GET /v1/ats/jobs/:id et déballe .job', async () => {
    const fetchMock = mockResponse({ schemaVersion: 'x', job: { id: 'j1' } });
    await getJob('j1');
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/v1/ats/jobs/j1');
  });

  it('createJob envoie title et description', async () => {
    const fetchMock = mockResponse({ schemaVersion: 'x', job: { id: 'j1' } }, 201);
    await createJob('Développeur', 'Description');
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/v1/ats/jobs');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ title: 'Développeur', description: 'Description' });
  });

  it('publishJob envoie expectedVersion', async () => {
    const fetchMock = mockResponse({ schemaVersion: 'x', job: { id: 'j1', status: 'published' } });
    await publishJob('j1', 1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/v1/ats/jobs/j1/publish');
    expect(JSON.parse(init.body as string)).toEqual({ expectedVersion: 1 });
  });

  it('closeJob envoie expectedVersion', async () => {
    const fetchMock = mockResponse({ schemaVersion: 'x', job: { id: 'j1', status: 'closed' } });
    await closeJob('j1', 2);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/v1/ats/jobs/j1/close');
    expect(JSON.parse(init.body as string)).toEqual({ expectedVersion: 2 });
  });

  it('listApplicationsForJob sans filtre ne pose pas de query string', async () => {
    const fetchMock = mockResponse({ schemaVersion: 'x', applications: [] });
    await listApplicationsForJob('j1');
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/v1/ats/jobs/j1/applications');
    expect(String(url)).not.toContain('?');
  });

  it('listApplicationsForJob avec filtres construit la query string', async () => {
    const fetchMock = mockResponse({ schemaVersion: 'x', applications: [] });
    await listApplicationsForJob('j1', { state: 'under_review', candidateEmail: 'a@example.test' });
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('state=under_review');
    expect(String(url)).toContain('candidateEmail=a%40example.test');
  });

  it('listJobEvents déballe .events', async () => {
    mockResponse({ schemaVersion: 'x', events: [{ id: 1, eventType: 'job.created' }] });
    const events = await listJobEvents('j1');
    expect(events).toEqual([{ id: 1, eventType: 'job.created' }]);
  });

  it('listJobRecruiters déballe .recruiters', async () => {
    mockResponse({ schemaVersion: 'x', recruiters: [{ recruiterAccountId: 'r1' }] });
    const recruiters = await listJobRecruiters('j1');
    expect(recruiters).toEqual([{ recruiterAccountId: 'r1' }]);
  });

  it('assignRecruiter envoie recruiterAccountId en POST', async () => {
    const fetchMock = mockResponse({ schemaVersion: 'x', assigned: true }, 201);
    await assignRecruiter('j1', 'r1');
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/v1/ats/jobs/j1/recruiters');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ recruiterAccountId: 'r1' });
  });

  it('removeRecruiter appelle DELETE sur /recruiters/:accountId', async () => {
    const fetchMock = mockResponse({ schemaVersion: 'x', removed: true });
    await removeRecruiter('j1', 'r1');
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/v1/ats/jobs/j1/recruiters/r1');
    expect(init.method).toBe('DELETE');
  });

  it('getApplication déballe .application', async () => {
    mockResponse({ schemaVersion: 'x', application: { id: 'a1' } });
    const application = await getApplication('a1');
    expect(application).toEqual({ id: 'a1' });
  });

  it('getApplicationHistory déballe .events (vue complète, non expurgée)', async () => {
    mockResponse({ schemaVersion: 'x', events: [{ id: 1, actorAccountId: 'r1', reason: 'x' }] });
    const events = await getApplicationHistory('a1');
    expect(events[0].actorAccountId).toBe('r1');
  });

  it('transitionApplication envoie to, expectedVersion, reason et reasonCode', async () => {
    const fetchMock = mockResponse({ application: {}, event: {} });
    await transitionApplication('a1', {
      to: 'rejected',
      expectedVersion: 2,
      reason: 'Profil non retenu.',
      reasonCode: 'not_qualified',
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/v1/ats/applications/a1/transitions');
    expect(JSON.parse(init.body as string)).toEqual({
      to: 'rejected',
      expectedVersion: 2,
      reason: 'Profil non retenu.',
      reasonCode: 'not_qualified',
    });
  });

  it('listEvaluations déballe .evaluations', async () => {
    mockResponse({ schemaVersion: 'x', evaluations: [{ id: 1, recommendation: 'advance' }] });
    const evaluations = await listEvaluations('a1');
    expect(evaluations).toEqual([{ id: 1, recommendation: 'advance' }]);
  });

  it('createEvaluation envoie recommendation, rating et note', async () => {
    const fetchMock = mockResponse({ schemaVersion: 'x', evaluation: { id: 1 } }, 201);
    await createEvaluation('a1', { recommendation: 'advance', rating: 4, note: 'Bon entretien.' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/v1/ats/applications/a1/evaluations');
    expect(JSON.parse(init.body as string)).toEqual({
      recommendation: 'advance',
      rating: 4,
      note: 'Bon entretien.',
    });
  });
});
