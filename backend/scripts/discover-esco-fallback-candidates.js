'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createDatabasePool } = require('../src/db/pool');

const REGISTRY_PATH = path.resolve(__dirname, '../data/esco/onet-esco-reviewed-overrides.json');

// Search vocabulary is intentionally separate from mapping decisions. These terms only
// retrieve candidates from the installed French ESCO catalogue; they never create a crosswalk.
const SEARCH_QUERIES = {
  '11-9131.00': ['responsable service postal', 'directeur bureau poste', 'services postaux'],
  '11-9199.11': ['réhabilitation friche industrielle', 'gestion site contaminé', 'réaménagement terrain'],
  '13-1022.00': ['acheteur commerce gros détail', 'acheteur approvisionnement', 'acheteur marchandises'],
  '13-1074.00': ['entrepreneur main œuvre agricole', 'responsable travailleurs agricoles', 'prestataire agricole'],
  '17-1022.01': ['géomètre géodésie', 'géodésien', 'arpenteur géomètre'],
  '23-1022.00': ['médiateur conciliateur arbitrage', 'médiateur conflits', 'conciliateur'],
  '25-9021.00': ['formateur agriculture gestion familiale', 'conseiller agricole formateur', 'éducateur agriculture'],
  '29-2099.08': ['médiateur patient', 'représentant patients', 'défenseur droits patients'],
  '31-9099.02': ['technicien endoscopie', 'assistant endoscopie', 'technicien médical endoscopie'],
  '33-9099.02': ['prévention pertes commerce', 'sécurité magasin', 'agent prévention vols'],
  '35-9011.00': ['commis salle restauration', 'employé cafétéria', 'aide barman'],
  '39-1022.00': ['superviseur services personnels', 'responsable services à la personne', 'chef équipe services personnels'],
  '47-2082.00': ['poseur bandes joints plâtre', 'jointeur plaques plâtre', 'finisseur cloisons sèches'],
  '49-2097.00': ['installateur réparateur audiovisuel', 'technicien équipement audiovisuel', 'maintenance audiovisuelle'],
  '49-9098.00': ['aide maintenance réparation', 'assistant installateur maintenance', 'manœuvre maintenance'],
  '51-4192.00': ['traceur métal plastique', 'ouvrier traçage métal', 'préparateur fabrication métallique'],
  '51-8099.01': ['technicien production biocarburants', 'opérateur biocarburants', 'technicien bioénergie'],
  '53-6041.00': ['technicien circulation routière', 'technicien trafic routier', 'technicien transport circulation'],
  '53-7011.00': ['opérateur convoyeur', 'conducteur convoyeur', 'opérateur bande transporteuse'],
};

const normalizeScore = (value) => Math.round(Number(value || 0) * 1000) / 1000;

const discoverCandidates = async (pool) => {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  const [[escoSource]] = await pool.query(
    `SELECT id, source_version, content_sha256
     FROM career_catalog_sources
     WHERE source_kind = 'esco' AND locale = 'fr'
     ORDER BY imported_at DESC LIMIT 1`,
  );
  if (!escoSource) throw new Error('No French ESCO source is installed.');

  const pendingEntries = registry.entries.filter((entry) => entry.status === 'pending');
  const reports = [];

  for (const entry of pendingEntries) {
    const queries = SEARCH_QUERIES[entry.onetCode] || [];
    if (!queries.length) {
      reports.push({ ...entry, queries: [], candidates: [], reason: 'no-search-vocabulary' });
      continue;
    }

    const byId = new Map();
    for (const query of queries) {
      const [rows] = await pool.query(
        `SELECT occupation.id,
                occupation.source_code AS escoUri,
                occupation.preferred_label AS label,
                occupation.description,
                occupation.isco_code AS iscoCode,
                MATCH(occupation.preferred_label, occupation.description)
                  AGAINST (? IN NATURAL LANGUAGE MODE) AS textScore
         FROM career_occupations occupation
         WHERE occupation.catalog_source_id = ?
           AND occupation.locale = 'fr'
           AND occupation.status = 'active'
           AND MATCH(occupation.preferred_label, occupation.description)
             AGAINST (? IN NATURAL LANGUAGE MODE)
         ORDER BY textScore DESC, occupation.preferred_label ASC
         LIMIT 8`,
        [query, escoSource.id, query],
      );

      for (const row of rows) {
        const current = byId.get(row.id);
        const score = normalizeScore(row.textScore);
        if (!current || score > current.score) {
          byId.set(row.id, {
            escoUri: row.escoUri,
            label: row.label,
            iscoCode: row.iscoCode || null,
            score,
            matchedQuery: query,
            description: row.description,
          });
        }
      }
    }

    reports.push({
      onetCode: entry.onetCode,
      title: entry.title,
      status: entry.status,
      queries,
      candidates: [...byId.values()]
        .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, 'fr'))
        .slice(0, 10),
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    source: {
      id: escoSource.id,
      version: escoSource.source_version,
      contentSha256: escoSource.content_sha256,
    },
    pendingCount: pendingEntries.length,
    reports,
    interpretation: {
      candidatesAreSearchResultsOnly: true,
      noCrosswalkIsCreated: true,
      noRegistryStatusIsChanged: true,
      humanReviewStillRequired: true,
    },
  };
};

const main = async () => {
  const pool = createDatabasePool(process.env);
  try {
    const report = await discoverCandidates(pool);
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await pool.end();
  }
};

if (require.main === module) {
  main().catch((error) => {
    process.stderr.write(`ESCO candidate discovery failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = { discoverCandidates, SEARCH_QUERIES };
