import { describe, expect, it } from 'vitest';

const expectedSha = '244f2204189f5ed4e46289956ab773009658e430';
const origin = 'https://makoki.org';

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const waitForExpectedProduction = async () => {
  let last: unknown = null;
  for (let attempt = 1; attempt <= 72; attempt += 1) {
    try {
      const response = await fetch(`${origin}/api/test/health`, { headers: { accept: 'application/json' } });
      const body = await response.json();
      last = { status: response.status, body };
      if (response.status === 200 && body?.status === 'OK' && body?.gitSha === expectedSha) return body;
    } catch (error) {
      last = error;
    }
    await sleep(5000);
  }
  throw new Error(`Production did not serve ${expectedSha}: ${JSON.stringify(last)}`);
};

const expectHttp200 = async (path: string) => {
  const response = await fetch(`${origin}${path}`);
  expect(response.status, path).toBe(200);
  return response;
};

describe('production launch readiness', () => {
  it('serves the deployed SHA, public pages, capabilities and MAKOKI PWA identity', async () => {
    const health = await waitForExpectedProduction();
    expect(health.gitSha).toBe(expectedSha);

    for (const path of [
      '/',
      '/parcours',
      '/careers',
      '/jobs',
      '/cv-optimizer',
      '/recruitment',
      '/conseiller',
      '/legal',
      '/cookies',
      '/sitemap.xml',
    ]) {
      await expectHttp200(path);
    }

    const capabilitiesResponse = await expectHttp200('/api/v1/capabilities');
    const capabilities = await capabilitiesResponse.json();
    const byId = (id: string) => capabilities.capabilities.find((entry: { id: string }) => entry.id === id);
    expect(byId('identity.auth-v1')).toMatchObject({ status: 'active', configured: true });
    expect(byId('life-project.core-v1')).toMatchObject({ status: 'experimental', configured: true });
    expect(byId('orientation.riasec')).toMatchObject({ status: 'experimental', configured: true });
    expect(byId('career.catalog-public-v1')).toMatchObject({ status: 'experimental', configured: true });
    expect(byId('cv.analysis-v1')).toMatchObject({ status: 'disabled', configured: false });
    expect(byId('ats.workflow-v1')).toMatchObject({ status: 'disabled', configured: false });

    const manifestResponse = await expectHttp200('/manifest.webmanifest');
    const manifestText = await manifestResponse.text();
    expect(manifestText).toContain('MAKOKI');
    expect(manifestText).not.toContain('Orientation Pro Congo');
    expect(manifestText.toLowerCase()).not.toContain('plateforme leader');
  }, 420_000);
});
