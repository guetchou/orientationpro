'use strict';

const fs = require('node:fs');

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const advisoryDetails = (via = []) => via
  .filter((item) => item && typeof item === 'object')
  .map((item) => ({
    id: item.source ? `npm:${item.source}` : 'npm:unknown',
    title: item.title || 'Advisory sans titre',
    url: item.url || null,
    affectedRange: item.range || null,
  }));

const resolveAdvisories = (audit, name, visited = new Set()) => {
  if (visited.has(name)) return [];
  visited.add(name);
  const vulnerability = audit.vulnerabilities?.[name];
  if (!vulnerability) return [];
  const direct = advisoryDetails(vulnerability.via);
  const inherited = (vulnerability.via || [])
    .filter((item) => typeof item === 'string')
    .flatMap((dependency) => resolveAdvisories(audit, dependency, visited));
  return [...new Map([...direct, ...inherited].map((item) => [item.id, item])).values()];
};

const classify = (name, isProduction) => {
  if (name === 'react-router' || name === 'react-router-dom') {
    return {
      reachability: 'reachable-client-navigation',
      exposure: 'authenticated and public client-side routing; no React Router SSR',
      decision: 'compensate',
      control: 'closed cohort, bounded routes, CSP and monitoring; major migration required',
      owner: 'frontend-maintainer',
      dueDate: '2026-08-05',
    };
  }
  if (name === 'sequelize' || name === 'uuid') {
    return {
      reachability: 'reachable-only-through-disabled-legacy-controllers',
      exposure: 'server runtime dependency; legacy APIs remain disabled by default',
      decision: 'compensate',
      control: 'keep legacy gate off; dedicated ORM migration and regression suite',
      owner: 'backend-maintainer',
      dueDate: '2026-08-05',
    };
  }
  return {
    reachability: isProduction ? 'build-path-not-runtime-http-path' : 'development-or-ci-only',
    exposure: isProduction
      ? 'installed in production dependency graph but invoked during build/test'
      : 'not installed by npm ci --omit=dev',
    decision: 'compensate',
    control: 'no public development server; trusted repository inputs; migrate the owning toolchain',
    owner: name.includes('pwa') || ['ejs', 'jake', 'filelist', 'workbox-build'].includes(name)
      ? 'pwa-maintainer'
      : 'build-and-ci-maintainer',
    dueDate: '2026-08-05',
  };
};

const fix = (value, name) => {
  if (value === true) return { available: true, target: name, version: null, breaking: false };
  if (!value || typeof value !== 'object') return { available: false, target: null, version: null, breaking: false };
  return {
    available: true,
    target: value.name || name,
    version: value.version || null,
    breaking: Boolean(value.isSemVerMajor),
  };
};

const rowsFor = (all, production, manifest) => Object.entries(all.vulnerabilities || {})
  .map(([name, vulnerability]) => {
    const isProduction = Boolean(production.vulnerabilities?.[name]);
    return {
      advisory: resolveAdvisories(all, name),
      dependency: name,
      dependencyPath: vulnerability.nodes || [],
      manifest,
      scope: isProduction ? 'production-graph' : 'development-graph',
      severity: vulnerability.severity || 'unknown',
      direct: Boolean(vulnerability.isDirect),
      affectedRange: vulnerability.range || null,
      fix: fix(vulnerability.fixAvailable, name),
      ...classify(name, isProduction),
    };
  });

const build = ({ rootAll, rootProduction, backendAll, backendProduction, gitSha }) => {
  const findings = [
    ...rowsFor(rootAll, rootProduction, 'package-lock.json'),
    ...rowsFor(backendAll, backendProduction, 'backend/package-lock.json'),
  ];
  return {
    schemaVersion: 'makoki.v5g-dependency-matrix.v1',
    gitSha,
    generatedAt: new Date().toISOString(),
    interpretation: 'technical disposition only; risk acceptance requires named business decision-maker',
    npmTotals: {
      root: rootAll.metadata?.vulnerabilities || {},
      rootProduction: rootProduction.metadata?.vulnerabilities || {},
      backend: backendAll.metadata?.vulnerabilities || {},
      backendProduction: backendProduction.metadata?.vulnerabilities || {},
    },
    findings,
  };
};

if (require.main === module) {
  try {
    const args = Object.fromEntries(process.argv.slice(2).map((item) => {
      const index = item.indexOf('=');
      if (index < 1) throw new Error(`Expected key=path, received ${item}`);
      return [item.slice(0, index), item.slice(index + 1)];
    }));
    for (const key of ['rootAll', 'rootProduction', 'backendAll', 'backendProduction', 'gitSha']) {
      if (!args[key]) throw new Error(`${key} is required`);
    }
    process.stdout.write(`${JSON.stringify(build({
      rootAll: read(args.rootAll),
      rootProduction: read(args.rootProduction),
      backendAll: read(args.backendAll),
      backendProduction: read(args.backendProduction),
      gitSha: args.gitSha,
    }), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`V5-G dependency matrix failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = { advisoryDetails, build, classify, resolveAdvisories };
