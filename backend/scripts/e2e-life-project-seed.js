'use strict';

// Seed/nettoyage pour le harnais Playwright du parcours invité → compte →
// rapport (tests/life-project/), issue #216. Les sessions invité elles-mêmes
// ne sont jamais pré-semées ici : elles sont entièrement dynamiques
// (cookie posé par le serveur au premier appel), donc chaque test en crée une
// réelle en visitant /parcours. Ce script ne fournit que les comptes fixes
// nécessaires aux scénarios de connexion/inscription/collision d'email, plus
// l'instrument RIASEC (réutilise scripts/seed-riasec.js, jamais dupliqué).
// Usage : node e2e-life-project-seed.js up|down
const path = require('node:path');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const { migrateUp } = require('../src/db/migrate');
const { seedRiasecInstrument } = require('./seed-riasec');

const FIXTURES = {
  // Compte déjà enregistré : sert à la fois au test "email déjà utilisé"
  // (inscription refusée) et au test de connexion (chemin "J'ai déjà un compte").
  existingAccount: { id: '99999999-9999-4999-8999-999999999901', email: 'e2e-life-project-existing@example.test' },
  password: 'E2eStrongPassw0rd!2026',
};

const createPool = () => mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'orientationpro_life_project_e2e',
  waitForConnections: true,
  connectionLimit: 4,
});

const up = async (pool) => {
  await migrateUp(pool, path.join(__dirname, '..', 'migrations'));
  await seedRiasecInstrument(pool);

  const passwordHash = await bcrypt.hash(FIXTURES.password, 10);
  await pool.query(
    `INSERT INTO auth_accounts (id, email, password_hash, status) VALUES (?, ?, ?, 'active')
     ON DUPLICATE KEY UPDATE email = VALUES(email)`,
    [FIXTURES.existingAccount.id, FIXTURES.existingAccount.email, passwordHash],
  );
  await pool.query(
    `INSERT IGNORE INTO auth_account_roles (account_id, role_id) VALUES (?, 'user')`,
    [FIXTURES.existingAccount.id],
  );

  process.stdout.write(`${JSON.stringify(FIXTURES)}\n`);
};

const down = async (pool) => {
  // Les sessions invité / tentatives / résultats / projets créés pendant les
  // tests le sont dans une base MySQL jetable dédiée à ce harnais (détruite
  // avec le conteneur) : seuls les comptes fixes créés par ce script sont
  // nettoyés explicitement ici.
  await pool.query('DELETE FROM auth_account_roles WHERE account_id = ?', [FIXTURES.existingAccount.id]);
  await pool.query('DELETE FROM auth_accounts WHERE id = ?', [FIXTURES.existingAccount.id]);
};

const main = async () => {
  const mode = process.argv[2];
  if (mode !== 'up' && mode !== 'down') {
    throw new Error('Usage: node e2e-life-project-seed.js up|down');
  }
  const pool = createPool();
  try {
    await (mode === 'up' ? up(pool) : down(pool));
  } finally {
    await pool.end();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
