import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, Printer, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createAdvisorProject,
  generateAdvisorRecommendations,
  getAdvisorCapabilityRegistry,
  getAdvisorProject,
  listAdvisorProjects,
  saveAdvisorDiagnostic,
  selectAdvisorScenario,
} from './advisor-api';
import type {
  AdvisorDiagnosticInput,
  AdvisorEnvelope,
  AdvisorObjective,
  AdvisorProjectSummary,
  AdvisorRecommendationScenario,
  AdvisorRiasecProfile,
} from './advisor-types';

const DRAFT_KEY = 'makoki.life-project.simple-diagnostic.v1';
const fieldClass = 'mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

type SimpleForm = {
  title: string;
  objective: AdvisorObjective;
  zone: string;
  situation: string;
  educationLevel: string;
  diploma: string;
  mobility: AdvisorDiagnosticInput['constraints']['mobility'];
  budget: string;
  maxDurationMonths: string;
  needIncomeWithinMonths: string;
  interests: string;
  skills: string;
  experiences: string;
  constraints: string;
  priorities: string[];
};

const emptyForm: SimpleForm = {
  title: 'Mon projet d’avenir',
  objective: 'uncertain',
  zone: '',
  situation: '',
  educationLevel: '',
  diploma: '',
  mobility: 'unknown',
  budget: '',
  maxDurationMonths: '',
  needIncomeWithinMonths: '',
  interests: '',
  skills: '',
  experiences: '',
  constraints: '',
  priorities: ['interest', 'cost', 'duration', 'employability'],
};

const objectiveLabels: Record<AdvisorObjective, string> = {
  studies: 'Poursuivre des études',
  training: 'Trouver une formation',
  insertion: 'Entrer rapidement en emploi',
  reentry: 'Reprendre après une interruption',
  reconversion: 'Changer de voie',
  entrepreneurship: 'Entreprendre',
  work_and_training: 'Combiner emploi et formation',
  uncertain: 'Clarifier mon projet',
};

const priorityLabels: Record<string, string> = {
  interest: 'Ce qui m’intéresse',
  cost: 'Le coût',
  duration: 'La durée',
  proximity: 'La proximité',
  employability: 'Les possibilités d’emploi',
  future_income: 'Les revenus possibles',
  stability: 'La stabilité',
  family_compatibility: 'La compatibilité avec ma vie familiale',
};

const splitList = (value: string) => [...new Set(value
  .split(/[;,\n]/u)
  .map((entry) => entry.trim())
  .filter(Boolean))];

const optionalNumber = (value: string) => {
  const parsed = Number(value);
  return value.trim() && Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const readDraft = (): SimpleForm => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? { ...emptyForm, ...JSON.parse(raw) as Partial<SimpleForm> } : { ...emptyForm };
  } catch {
    return { ...emptyForm };
  }
};

const buildDiagnostic = (form: SimpleForm, profile: AdvisorRiasecProfile): AdvisorDiagnosticInput => {
  const experiences = splitList(form.experiences);
  const constraints = splitList(form.constraints);
  const budget = optionalNumber(form.budget);
  const maxDurationMonths = optionalNumber(form.maxDurationMonths);
  const needIncomeWithinMonths = optionalNumber(form.needIncomeWithinMonths);

  return {
    objective: form.objective,
    riasecProfile: profile,
    identity: {
      country: { value: 'Congo', verification: 'declared' },
      zone: { value: form.zone.trim(), verification: 'declared' },
      situation: { value: form.situation.trim(), verification: 'declared' },
      educationLevel: { value: form.educationLevel.trim(), verification: 'declared' },
      diploma: { value: form.diploma.trim(), verification: 'declared' },
      subjects: [],
      significantResults: [],
      interruptions: [],
    },
    constraints: {
      mobility: form.mobility,
      budget: {
        ...(budget === undefined ? {} : { amount: budget }),
        currency: 'XAF',
        verification: budget === undefined ? 'unknown' : 'declared',
      },
      ...(maxDurationMonths === undefined ? {} : { maxDurationMonths }),
      ...(needIncomeWithinMonths === undefined ? {} : { needIncomeWithinMonths }),
      internetAccess: 'unknown',
      equipment: [],
      familyResponsibilities: constraints,
      availability: [],
      healthOrDisability: [],
      documents: [],
      availableModes: [],
    },
    preferences: {
      interests: splitList(form.interests),
      activities: [],
      favouriteSubjects: [],
      workEnvironments: [],
      workStyles: [],
      values: [],
    },
    capabilities: {
      skills: splitList(form.skills),
      internships: experiences,
      volunteering: [],
      jobs: [],
      personalProjects: [],
      responsibilities: [],
      languages: ['français'],
      digitalSkills: [],
      evidence: [],
      regulatoryQualifications: [],
    },
    priorities: form.priorities.map((id, index) => ({ id, importance: Math.max(0.55, 1 - index * 0.1) })),
    notes: constraints.join('; ') || undefined,
  };
};

const scenarioSummary = (scenario: AdvisorRecommendationScenario) => {
  const parts: string[] = [];
  if (scenario.durationMonths !== null) parts.push(`${scenario.durationMonths} mois environ`);
  if (scenario.cost.amount !== null) {
    parts.push(`${new Intl.NumberFormat('fr-FR').format(scenario.cost.amount)} ${scenario.cost.currency || 'FCFA'}`);
  }
  return parts.join(' · ') || 'Durée et coût à confirmer';
};

const scenarioCalendar = (scenario: AdvisorRecommendationScenario) => {
  if (scenario.calendar.status === 'closed') return 'Inscriptions fermées pour la période connue';
  if (scenario.calendar.status === 'unknown') return 'Dates à confirmer auprès de l’organisme';
  const details = ['Inscriptions ouvertes'];
  if (scenario.calendar.applicationDeadlineAt) {
    details.push(`candidature avant le ${new Date(scenario.calendar.applicationDeadlineAt).toLocaleDateString('fr-FR')}`);
  }
  if (scenario.calendar.nextStartAt) {
    details.push(`prochain démarrage le ${new Date(scenario.calendar.nextStartAt).toLocaleDateString('fr-FR')}`);
  }
  return details.join(' · ');
};

const scenarioModes = (scenario: AdvisorRecommendationScenario) => (
  scenario.modes.length > 0 ? scenario.modes.join(', ') : 'Modalités à confirmer'
);

export default function LifeProjectWorkspace({ riasecProfile }: { riasecProfile: AdvisorRiasecProfile }) {
  const [form, setForm] = useState<SimpleForm>(() => readDraft());
  const [projects, setProjects] = useState<AdvisorProjectSummary[]>([]);
  const [current, setCurrent] = useState<AdvisorEnvelope | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const registry = await getAdvisorCapabilityRegistry();
      const available = registry.capabilities.some((entry) => entry.id === 'life-project.core-v1' && entry.configured);
      if (!available) {
        setError('Cette partie du parcours est momentanément indisponible. Ton résultat reste enregistré et tu peux continuer à explorer les métiers.');
        return;
      }
      const response = await listAdvisorProjects();
      setProjects(response.projects);
      if (response.projects[0]) setCurrent(await getAdvisorProject(response.projects[0].id));
    } catch {
      setError('Cette partie du parcours n’a pas pu être chargée. Réessaie dans quelques instants.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); }, [form]);

  const recommendations = current?.project.recommendation?.scenarios || [];
  const selectedId = current?.project.activeScenarioId || null;
  const selectedScenario = useMemo(
    () => recommendations.find((scenario) => scenario.id === selectedId) || null,
    [recommendations, selectedId],
  );

  const saveAndGenerate = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.zone.trim() || !form.situation.trim() || !form.educationLevel.trim()) {
      setError('Indique ta ville ou zone, ta situation actuelle et ton niveau d’études.');
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      let envelope = current;
      if (!envelope) {
        envelope = await createAdvisorProject(
          form.title.trim() || 'Mon projet d’avenir',
          'Construire un projet adapté à ma situation, mes compétences et mes contraintes.',
        );
      }
      const diagnosed = await saveAdvisorDiagnostic(
        envelope.project.id,
        envelope.persistenceVersion,
        buildDiagnostic(form, riasecProfile),
      );
      const recommended = await generateAdvisorRecommendations(diagnosed.project.id, diagnosed.persistenceVersion);
      setCurrent(recommended);
      setProjects((existing) => [{
        id: recommended.project.id,
        title: recommended.project.title,
        state: recommended.project.state,
        persistenceVersion: recommended.persistenceVersion,
      }, ...existing.filter((item) => item.id !== recommended.project.id)]);
      localStorage.removeItem(DRAFT_KEY);
      setNotice('Tes pistes ont été préparées. Compare-les, puis choisis celle que tu veux approfondir en premier.');
    } catch {
      setError('Tes informations n’ont pas pu être enregistrées. Vérifie ta connexion puis réessaie.');
    } finally {
      setSaving(false);
    }
  };

  const chooseScenario = async (scenarioId: string) => {
    if (!current) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await selectAdvisorScenario(current, scenarioId);
      setCurrent(updated);
      setNotice('Cette piste est maintenant ton choix provisoire. Vérifie les conditions locales avant de prendre une décision définitive.');
    } catch {
      setError('Cette piste n’a pas pu être enregistrée. Réessaie dans quelques instants.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card><CardContent className="flex min-h-40 items-center justify-center p-8" role="status">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />Préparation de la suite de ton parcours…
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <AlertTriangle className="mr-2 inline h-4 w-4" />{error}
        </div>
      )}
      {notice && (
        <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          <CheckCircle2 className="mr-2 inline h-4 w-4" />{notice}
        </div>
      )}

      <form onSubmit={(event) => void saveAndGenerate(event)} className="space-y-6">
        <Card>
          <CardHeader>
            <Badge className="w-fit">Ta situation</Badge>
            <CardTitle>Donne les informations utiles pour affiner ton projet</CardTitle>
            <CardDescription>
              Tes réponses précédentes sont déjà prises en compte. Ajoute maintenant ce qui peut changer la faisabilité de tes choix.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-medium">Nom de ton projet
              <input className={fieldClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </label>
            <label className="text-sm font-medium">Ce que tu veux faire maintenant
              <select className={fieldClass} value={form.objective} onChange={(event) => setForm({ ...form, objective: event.target.value as AdvisorObjective })}>
                {Object.entries(objectiveLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Ville ou zone
              <input className={fieldClass} required value={form.zone} onChange={(event) => setForm({ ...form, zone: event.target.value })} placeholder="Brazzaville, Pointe-Noire…" />
            </label>
            <label className="text-sm font-medium">Situation actuelle
              <input className={fieldClass} required value={form.situation} onChange={(event) => setForm({ ...form, situation: event.target.value })} placeholder="Lycéen, étudiant, en emploi, en recherche…" />
            </label>
            <label className="text-sm font-medium">Niveau d’études
              <input className={fieldClass} required value={form.educationLevel} onChange={(event) => setForm({ ...form, educationLevel: event.target.value })} />
            </label>
            <label className="text-sm font-medium">Diplôme principal
              <input className={fieldClass} value={form.diploma} onChange={(event) => setForm({ ...form, diploma: event.target.value })} />
            </label>
            <label className="text-sm font-medium">Mobilité possible
              <select className={fieldClass} value={form.mobility} onChange={(event) => setForm({ ...form, mobility: event.target.value as SimpleForm['mobility'] })}>
                <option value="unknown">Je ne sais pas encore</option>
                <option value="none">Je souhaite rester dans ma zone</option>
                <option value="local">Je peux me déplacer à proximité</option>
                <option value="national">Je peux me déplacer au Congo</option>
                <option value="international">J’envisage l’étranger</option>
                <option value="flexible">Je suis flexible</option>
              </select>
            </label>
            <label className="text-sm font-medium">Budget maximum en FCFA
              <input inputMode="numeric" className={fieldClass} value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} />
            </label>
            <label className="text-sm font-medium">Durée maximale envisagée en mois
              <input inputMode="numeric" className={fieldClass} value={form.maxDurationMonths} onChange={(event) => setForm({ ...form, maxDurationMonths: event.target.value })} />
            </label>
            <label className="text-sm font-medium">Dans combien de mois as-tu besoin d’un revenu ?
              <input inputMode="numeric" className={fieldClass} value={form.needIncomeWithinMonths} onChange={(event) => setForm({ ...form, needIncomeWithinMonths: event.target.value })} />
            </label>
            <label className="text-sm font-medium md:col-span-2">Autres centres d’intérêt
              <textarea className={`${fieldClass} min-h-20`} value={form.interests} onChange={(event) => setForm({ ...form, interests: event.target.value })} placeholder="Sépare les éléments par des virgules" />
            </label>
            <label className="text-sm font-medium md:col-span-2">Compétences que tu maîtrises déjà
              <textarea className={`${fieldClass} min-h-20`} value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} />
            </label>
            <label className="text-sm font-medium md:col-span-2">Expériences utiles
              <textarea className={`${fieldClass} min-h-20`} value={form.experiences} onChange={(event) => setForm({ ...form, experiences: event.target.value })} placeholder="Stage, emploi, bénévolat, projet personnel…" />
            </label>
            <label className="text-sm font-medium md:col-span-2">Contraintes importantes
              <textarea className={`${fieldClass} min-h-20`} value={form.constraints} onChange={(event) => setForm({ ...form, constraints: event.target.value })} placeholder="Disponibilité, responsabilités familiales, transport…" />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ce qui compte le plus pour toi</CardTitle>
            <CardDescription>Sélectionne les éléments qui doivent guider la comparaison.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {Object.entries(priorityLabels).map(([id, label]) => (
              <label key={id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.priorities.includes(id)}
                  onChange={(event) => setForm({
                    ...form,
                    priorities: event.target.checked
                      ? [...new Set([...form.priorities, id])]
                      : form.priorities.filter((entry) => entry !== id),
                  })}
                />
                {label}
              </label>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
            Préparer mes pistes
          </Button>
          <Button type="button" variant="outline" onClick={() => void load()} disabled={saving}>
            <RefreshCw className="mr-2 h-4 w-4" />Actualiser
          </Button>
        </div>
      </form>

      {recommendations.length > 0 && (
        <section className="space-y-4" aria-labelledby="life-project-options-title">
          <div>
            <h2 id="life-project-options-title" className="text-2xl font-bold">Tes pistes à comparer</h2>
            <p className="mt-2 text-muted-foreground">Ces pistes servent à avancer. Vérifie toujours les admissions, coûts, dates et débouchés auprès des organismes concernés.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {recommendations.map((scenario) => {
              const selected = scenario.id === selectedId;
              return (
                <Card key={scenario.id} className={selected ? 'border-emerald-500 shadow-md' : ''}>
                  <CardHeader>
                    {selected && <Badge className="w-fit">Piste choisie provisoirement</Badge>}
                    <CardTitle>{scenario.title}</CardTitle>
                    <CardDescription>{scenarioSummary(scenario)}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 border-b pb-4 text-sm sm:grid-cols-2">
                    <div className="rounded-lg bg-muted/40 p-3">
                      <h3 className="font-semibold">Calendrier</h3>
                      <p className="mt-1 text-muted-foreground">{scenarioCalendar(scenario)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3">
                      <h3 className="font-semibold">Modalités</h3>
                      <p className="mt-1 text-muted-foreground">{scenarioModes(scenario)}</p>
                    </div>
                  </CardContent>
                  <CardContent className="space-y-4">
                    {scenario.reasons.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold">Pourquoi cette piste peut te convenir</h3>
                        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                          {scenario.reasons.slice(0, 3).map((reason) => <li key={reason.signal}>• {reason.explanation}</li>)}
                        </ul>
                      </div>
                    )}
                    {scenario.conditions.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold">Points à vérifier</h3>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {scenario.conditions.slice(0, 4).map((condition) => <li key={condition}>• {condition}</li>)}
                        </ul>
                      </div>
                    )}
                    {scenario.firstActions.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold">Premières actions possibles</h3>
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {scenario.firstActions.slice(0, 3).map((action) => <li key={action.title}>• {action.title}</li>)}
                        </ul>
                      </div>
                    )}
                    <Button type="button" variant={selected ? 'outline' : 'default'} disabled={saving || selected} onClick={() => void chooseScenario(scenario.id)}>
                      {selected ? 'Piste enregistrée' : 'Approfondir cette piste'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {selectedScenario && (
        <section id="life-project-summary" aria-labelledby="life-project-summary-title" className="space-y-4">
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader>
              <Badge className="w-fit">Choix provisoire</Badge>
              <CardTitle id="life-project-summary-title">Ta synthèse de projet</CardTitle>
              <CardDescription>
                Cette synthèse t’aide à préparer la prochaine vérification. Elle ne remplace ni les conditions officielles ni une décision accompagnée.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <h3 className="font-semibold">Piste retenue</h3>
                <p className="mt-1 text-lg font-medium">{selectedScenario.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{scenarioSummary(selectedScenario)}</p>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-lg border bg-background p-3">
                  <h3 className="font-semibold">Calendrier</h3>
                  <p className="mt-1 text-muted-foreground">{scenarioCalendar(selectedScenario)}</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <h3 className="font-semibold">Modalités</h3>
                  <p className="mt-1 text-muted-foreground">{scenarioModes(selectedScenario)}</p>
                </div>
              </div>
              {selectedScenario.firstActions[0] && (
                <div>
                  <h3 className="font-semibold">Première action</h3>
                  <p className="mt-1">{selectedScenario.firstActions[0].title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    À réaliser sous {selectedScenario.firstActions[0].deadlineDays} jour(s). Preuve attendue : {selectedScenario.firstActions[0].expectedEvidence}
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Vérifie les admissions, les coûts, les dates, les modalités et les débouchés auprès des organismes concernés avant tout engagement.
              </p>
              <Button type="button" variant="outline" className="print:hidden" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />Imprimer ma synthèse
              </Button>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50/50 print:hidden">
            <CardHeader>
              <CardTitle>Ta prochaine étape</CardTitle>
              <CardDescription>
                Vérifie les conditions réelles de « {selectedScenario.title} », puis réalise la première action proposée cette semaine.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      )}

      {projects.length > 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Mes autres projets</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {projects.filter((project) => project.id !== current?.project.id).map((project) => (
              <Button key={project.id} type="button" variant="outline" onClick={() => void getAdvisorProject(project.id).then(setCurrent)}>
                {project.title}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
