from pathlib import Path


def replace(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text().replace('\r\n', '\n')
    if old not in text:
        raise SystemExit(f"Expected snippet not found in {path}: {old[:160]!r}")
    file.write_text(text.replace(old, new, 1))


replace(
    'backend/src/life-project/recommendation-contracts.js',
    """    missingInformation: stringArray(
      value.missingInformation,
      'scenario.missingInformation',
    ),
    localOpportunities: objectArray(
""",
    """    missingInformation: stringArray(
      value.missingInformation,
      'scenario.missingInformation',
    ),
    durationMonths: boundedNumber(value.durationMonths, 'scenario.durationMonths', 0, 240, null),
    cost: cost(value.cost, 'scenario.cost'),
    calendar: calendar(value.calendar, 'scenario.calendar'),
    modes: stringArray(value.modes, 'scenario.modes'),
    geographies: stringArray(value.geographies, 'scenario.geographies'),
    entryLevel: entryLevel(value.entryLevel, 'scenario.entryLevel'),
    localOpportunities: objectArray(
""",
)

replace(
    'backend/src/life-project/recommendation-engine.js',
    """    strengths: entry.strengths,
    conditions: entry.option.conditions,
""",
    """    strengths: entry.strengths,
    durationMonths: entry.option.durationMonths,
    cost: entry.option.cost,
    calendar: entry.option.calendar,
    modes: entry.option.modes,
    geographies: entry.option.geographies,
    entryLevel: entry.option.entryLevel,
    conditions: entry.option.conditions,
""",
)

replace(
    'backend/test/life-project-recommendation-engine.test.js',
    """    assert.ok(scenario.sourceReferences.length > 0);
    assert.equal(scenario.engineVersion, RECOMMENDATION_ENGINE_VERSION);
""",
    """    assert.ok(scenario.sourceReferences.length > 0);
    const option = createLocalOption(TEST_OPTIONS.find((candidate) => candidate.id === scenario.optionId));
    assert.equal(scenario.durationMonths, option.durationMonths);
    assert.deepEqual(scenario.cost, option.cost);
    assert.deepEqual(scenario.calendar, option.calendar);
    assert.deepEqual(scenario.modes, option.modes);
    assert.deepEqual(scenario.geographies, option.geographies);
    assert.deepEqual(scenario.entryLevel, option.entryLevel);
    assert.equal(scenario.engineVersion, RECOMMENDATION_ENGINE_VERSION);
""",
)

replace(
    'src/features/life-project/advisor-types.ts',
    """  blockingFactors: string[];
  missingInformation: string[];
  localOpportunities: AdvisorLocalOpportunity[];
""",
    """  blockingFactors: string[];
  missingInformation: string[];
  durationMonths: number | null;
  cost: {
    amount: number | null;
    currency: string | null;
    fundingAvailable: boolean;
    status: 'known' | 'range' | 'unknown';
  };
  calendar: {
    status: 'open' | 'closed' | 'unknown';
    nextStartAt: string | null;
    applicationDeadlineAt: string | null;
  };
  modes: string[];
  geographies: string[];
  entryLevel: {
    minimumRank: number | null;
    label: string | null;
    status: 'verified' | 'to_confirm';
  };
  localOpportunities: AdvisorLocalOpportunity[];
""",
)

replace(
    'src/features/life-project/AdvisorLifeProjectPage.tsx',
    """const positioningLabels = {
  priority: 'Prioritaire',
  adjacent: 'Proche',
  alternative: 'Alternative',
  fallback: 'Repli',
  exploratory: 'Exploratoire',
};

const csv = (value: string) => [...new Set(value
""",
    """const positioningLabels = {
  priority: 'Prioritaire',
  adjacent: 'Proche',
  alternative: 'Alternative',
  fallback: 'Repli',
  exploratory: 'Exploratoire',
};

const formatDuration = (scenario: AdvisorRecommendationScenario) => (
  scenario.durationMonths === null ? 'À confirmer' : `${scenario.durationMonths} mois`
);

const formatCost = (scenario: AdvisorRecommendationScenario) => {
  if (scenario.cost.status === 'unknown' || scenario.cost.amount === null) return 'À confirmer';
  const amount = new Intl.NumberFormat('fr-FR').format(scenario.cost.amount);
  const currency = scenario.cost.currency ? ` ${scenario.cost.currency}` : '';
  return scenario.cost.status === 'range'
    ? `À partir de ${amount}${currency}`
    : `${amount}${currency}`;
};

const formatCalendar = (scenario: AdvisorRecommendationScenario) => {
  if (scenario.calendar.status === 'closed') return 'Fermé pour la période connue';
  if (scenario.calendar.status === 'unknown') return 'À confirmer';
  const details = ['Ouvert'];
  if (scenario.calendar.applicationDeadlineAt) {
    details.push(`candidature avant le ${new Date(scenario.calendar.applicationDeadlineAt).toLocaleDateString('fr-FR')}`);
  }
  if (scenario.calendar.nextStartAt) {
    details.push(`démarrage le ${new Date(scenario.calendar.nextStartAt).toLocaleDateString('fr-FR')}`);
  }
  return details.join(' · ');
};

const formatAccess = (scenario: AdvisorRecommendationScenario) => {
  const values = [...new Set([
    ...scenario.geographies,
    ...scenario.modes,
    ...scenario.localOpportunities.map((entry) => entry.zone).filter((value): value is string => Boolean(value)),
  ])];
  return values.join(', ') || 'À confirmer';
};

const csv = (value: string) => [...new Set(value
""",
)

replace(
    'src/features/life-project/AdvisorLifeProjectPage.tsx',
    """                    <th className=\"p-3\">Durée</th>
                    <th className=\"p-3\">Coût</th>
                    <th className=\"p-3\">Accès / mobilité</th>
""",
    """                    <th className=\"p-3\">Durée</th>
                    <th className=\"p-3\">Coût</th>
                    <th className=\"p-3\">Calendrier</th>
                    <th className=\"p-3\">Accès / mobilité</th>
""",
)

replace(
    'src/features/life-project/AdvisorLifeProjectPage.tsx',
    """                      <td className=\"p-3\">À confirmer dans la source locale</td>
                      <td className=\"p-3\">À confirmer dans la source locale</td>
                      <td className=\"p-3\">{scenario.localOpportunities.map((entry) => entry.zone).filter(Boolean).join(', ') || 'À confirmer'}</td>
""",
    """                      <td className=\"p-3\">{formatDuration(scenario)}</td>
                      <td className=\"p-3\">{formatCost(scenario)}</td>
                      <td className=\"p-3\">{formatCalendar(scenario)}</td>
                      <td className=\"p-3\">{formatAccess(scenario)}</td>
""",
)

replace(
    'src/features/life-project/AdvisorLifeProjectPage.tsx',
    """              La durée et le coût restent « à confirmer » tant que le moteur ne transmet pas de valeur locale vérifiée. Ils ne sont jamais déduits silencieusement.
""",
    """              La durée, le coût, le calendrier et les modalités proviennent du référentiel local. Une donnée absente reste « à confirmer » et n’est jamais déduite silencieusement.
""",
)

replace(
    'src/features/life-project/AdvisorLifeProjectPage.test.tsx',
    """  blockingFactors: [],
  missingInformation: ['Coût ou fourchette de coût'],
  localOpportunities: [{
""",
    """  blockingFactors: [],
  missingInformation: [],
  durationMonths: 24,
  cost: { amount: 250000, currency: 'XAF', fundingAvailable: false, status: 'known' as const },
  calendar: {
    status: 'open' as const,
    nextStartAt: '2026-10-01T00:00:00.000Z',
    applicationDeadlineAt: '2026-09-01T00:00:00.000Z',
  },
  modes: ['presentiel'],
  geographies: ['Brazzaville'],
  entryLevel: { minimumRank: 4, label: 'Baccalauréat', status: 'to_confirm' as const },
  localOpportunities: [{
""",
)

replace(
    'src/features/life-project/AdvisorLifeProjectPage.test.tsx',
    """    expect(screen.getByRole('heading', { name: '3. Comparaison' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '4. Synthèse remise au jeune' })).toBeInTheDocument();
""",
    """    expect(screen.getByRole('heading', { name: '3. Comparaison' })).toBeInTheDocument();
    expect(screen.getByText('24 mois')).toBeInTheDocument();
    expect(screen.getByText(/250.*000 XAF/u)).toBeInTheDocument();
    expect(screen.getByText(/Ouvert.*01\\/09\\/2026/u)).toBeInTheDocument();
    expect(screen.getByText(/Brazzaville, presentiel/u)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '4. Synthèse remise au jeune' })).toBeInTheDocument();
""",
)

Path('.github/workflows/agent-life-comparison-facts-v2.yml').unlink(missing_ok=True)
Path('.agent-life-comparison-trigger').unlink(missing_ok=True)
Path('scripts/agent-apply-life-comparison-facts.py').unlink(missing_ok=True)
