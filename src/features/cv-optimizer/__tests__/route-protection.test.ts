import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Verifie que les routes CV sensibles sont protegees par UserRoute, de maniere
// coherente avec /cv-history. C'est une garantie structurelle : le parcours
// public ne doit jamais etre accessible sans session.
const routerSource = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'router', 'AppRouter.tsx'),
  'utf8',
);

const isProtected = (route: string) => {
  const re = new RegExp(
    `path="${route.replace(/\//g, '\\/')}"[^\\n]*element=\\{<UserRoute>`,
  );
  return re.test(routerSource);
};

describe('protection des routes CV', () => {
  it('/cv-optimizer est protege par UserRoute', () => {
    expect(isProtected('/cv-optimizer')).toBe(true);
  });

  it('/cv-history est protege par UserRoute', () => {
    expect(isProtected('/cv-history')).toBe(true);
  });

  it('/cv-optimizer ne charge plus le composant admin CVUploadZone', () => {
    const pageSource = fs.readFileSync(
      path.join(__dirname, '..', '..', '..', 'pages', 'CVOptimizer.tsx'),
      'utf8',
    );
    expect(pageSource).not.toMatch(/CVUploadZone/);
    expect(pageSource).toMatch(/cv-optimizer/);
  });
});
