import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
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
const DRAFT_STEP_KEY = 'makoki.life-project.simple-diagnostic.step.v1';
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
  priorities: [],
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

const situationOptions = [
  'Lycéen',
  'Étudiant',
  'En formation professionnelle',
  'En emploi',
  'En recherche d’emploi',
  'Entrepreneur',
  'En interruption d’études ou d’activité',
  'Autre situation',
];

const educationOptions = [
  'Primaire',
  'Collège',
  'Lycée',
  'Terminale',
  'Baccalauréat obtenu',
  'Formation professionnelle',
  'Bac +1',
  'Bac +2',
  'Licence / Bac +3',
  'Master / Bac +5',
  'Doctorat',
  'Autre niveau',
];

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

const formSteps = [
  { title: 'Ta situation', description: 'Où tu en es aujourd’hui et ce que tu veux faire.' },
  { title: 'Tes possibilités', description: 'Mobilité, budget et temps disponible.' },
  { title: 'Ce que tu apportes', description: 'Tes intérêts, compétences et expériences.' },
  { title: 'Tes priorités', description: 'Classe ce qui compte le plus pour comparer les pistes.' },
];

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

const readDraftStep = () => {
  const value = Number(localStorage.getItem(DRAFT_STEP_KEY));
  return Number.isInteger(value) ? Math.max(0, Math.min(formSteps.length - 1, value)) : 0;
};

const buildDiagnostic = (form: SimpleForm, profile: AdvisorRiasecProfile): AdvisorDiagnosticInput => {
  const experiences = splitList(form.experiences);
  const constraints = splitList(form.constraints);
  const budget = optionalNumber(form.budget);
  const maxDurationMonths = optionalNumber(form.maxDurationMonths);
  const needIncomeWithinMonths = optionalNumber(form.needIncomeWithinMonths);
  const orderedPriorities = form.priorities.filter(Boolean).slice(0, 3);
  const importanceByPosition = [1, 0.85, 0.7];

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
    priorities: orderedPriorities.map((id, index) => ({
      id,
      importance: importanceByPosition[index] ?? 0.7,
    })),
    notes: constraints.join('; ') || undefined,
  };
};

const scenarioSummary = (scenario: AdvisorRecommendationScenario) => {
  const parts: string[] = [];
  if (scenario.durationMonths !== null) parts.push(`${scenario.durationMonths} mois environ`);
  if (scenario.cost.amount !== null) {
    parts.push(`${new Intl.NumberFormat('fr-FR').format(scenario.cost.amount)} ${scenario.cost.currency || 'FCFA'}`);
  }
  return parts.join(' · ') || 'Durée et coût encore inconnus';
};

export default function LifeProjectWorkspace({ riasecProfile }: { riasecProfile: AdvisorRiasecProfile }) {
  const [form, setForm] = useState<SimpleForm>(() => readDraft());
  const [activeStep, setActiveStep] = useState(() => readDraftStep());
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
  useEffect(() => { localStorage.setItem(DRAFT_STEP_KEY, String(activeStep)); }, [activeStep]);

  const recommendations = current?.project.recommendation?.scenarios || [];
  const selectedId = current?.project.activeScenarioId || null;
  const selectedScenario = useMemo(
    () => recommendations.find((scenario) => scenario.id === selectedId) || null,
    [recommendations, selectedId],
  );

  const validateCurrentStep = () => {
    if (activeStep === 0) {
      if (!form.zone.trim() || !form.situation.trim() || !form.educationLevel.trim()) {
        setError('Indique ta ville ou zone, ta situation actuelle et ton niveau d’études.');
        return false;
      }
    }
    if (activeStep === 3 && form.priorities.filter(Boolean).length === 0) {
      setError('Choisis au moins une priorité pour comparer les pistes.');
      return false;
    }
    setError(null);
    return true;
  };

  const goNext = () => {
    if (!validateCurrentStep()) return;
    setActiveStep((step) => Math.min(formSteps.length - 1, step + 1));
  };

  const setPriority = (index: number, value: string) => {
    const next = [...form.priorities];
    while (next.length < 3) next.push('');
    if (value) {
      for (let position = 0; position < next.length; position += 1) {
        if (position !== index && next[position] === value) next[position] = '';
      }
    }
    next[index] = value;
    setForm({ ...form, priorities: next });
  };

  const saveAndGenerate = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateCurrentStep()) return;
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
      localStorage.removeItem(DRAFT_STEP_KEY);
      setNotice('Tes pistes sont prêtes. Compare-les, puis choisis celle que tu veux vérifier en premier.');
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
      setNotice('Cette piste est enregistrée pour la suite. Tu peux encore la changer après avoir vérifié les informations réelles.');
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
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge className="w-fit">Étape {activeStep + 1} sur {formSteps.length}</Badge>
                <CardTitle className="mt-3">{formSteps[activeStep].title}</CardTitle>
                <CardDescription className="mt-2">{formSteps[activeStep].description}</CardDescription>
              </div>
              <span className="text-sm text-muted-foreground">Ta saisie est conservée sur cet appareil.</span>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-4" aria-label="Étapes du formulaire">
              {formSteps.map((step, index) => (
                <div key={step.title} className={`rounded-md border px-3 py-2 text-sm ${index === activeStep ? 'border-primary bg-primary/5 font-semibold' : index < activeStep ? 'border-emerald-200 bg-emerald-50' : 'bg-muted/20 text-muted-foreground'}`}>
                  {index + 1}. {step.title}
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {activeStep === 0 && (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm font-medium">Ce que tu veux faire maintenant
                  <select className={fieldClass} value={form.objective} onChange={(event) => setForm({ ...form, objective: event.target.value as AdvisorObjective })}>
                    {Object.entries(objectiveLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium">Ville ou zone
                  <input className={fieldClass} required value={form.zone} onChange={(event) => setForm({ ...form, zone: event.target.value })} placeholder="Brazzaville, Pointe-Noire…" />
                </label>
                <label className="text-sm font-medium">Situation actuelle
                  <select className={fieldClass} required value={form.situation} onChange={(event) => setForm({ ...form, situation: event.target.value })}>
                    <option value="">Choisis ta situation</option>
                    {situationOptions.map((label) => <option key={label} value={label}>{label}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium">Niveau d’études
                  <select className={fieldClass} required value={form.educationLevel} onChange={(event) => setForm({ ...form, educationLevel: event.target.value })}>
                    <option value="">Choisis ton niveau</option>
                    {educationOptions.map((label) => <option key={label} value={label}>{label}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium md:col-span-2">Diplôme principal <span className="font-normal text-muted-foreground">(facultatif)</span>
                  <input className={fieldClass} value={form.diploma} onChange={(event) => setForm({ ...form, diploma: event.target.value })} placeholder="Ex. Baccalauréat, BTS, Licence…" />
                </label>
              </div>
            )}

            {activeStep === 1 && (
              <div className="grid gap-5 md:grid-cols-2">
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
                <label className="text-sm font-medium">Budget maximum en FCFA <span className="font-normal text-muted-foreground">(facultatif)</span>
                  <input inputMode="numeric" className={fieldClass} value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value.replace(/\D/gu, '') })} placeholder="Ex. 350000" />
                </label>
                <label className="text-sm font-medium">Durée maximale envisagée en mois <span className="font-normal text-muted-foreground">(facultatif)</span>
                  <input inputMode="numeric" className={fieldClass} value={form.maxDurationMonths} onChange={(event) => setForm({ ...form, maxDurationMonths: event.target.value.replace(/\D/gu, '') })} placeholder="Ex. 36" />
                </label>
                <label className="text-sm font-medium">Dans combien de mois as-tu besoin d’un revenu ? <span className="font-normal text-muted-foreground">(facultatif)</span>
                  <input inputMode="numeric" className={fieldClass} value={form.needIncomeWithinMonths} onChange={(event) => setForm({ ...form, needIncomeWithinMonths: event.target.value.replace(/\D/gu, '') })} placeholder="Ex. 6" />
                </label>
              </div>
            )}

            {activeStep === 2 && (
              <div className="grid gap-5">
                <label className="text-sm font-medium">Autres centres d’intérêt <span className="font-normal text-muted-foreground">(facultatif)</span>
                  <textarea className={`${fieldClass} min-h-20`} value={form.interests} onChange={(event) => setForm({ ...form, interests: event.target.value })} placeholder="Ex. numérique, santé, commerce, création…" />
                </label>
                <label className="text-sm font-medium">Compétences que tu maîtrises déjà <span className="font-normal text-muted-foreground">(facultatif)</span>
                  <textarea className={`${fieldClass} min-h-20`} value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} placeholder="Ex. communiquer, organiser, utiliser un tableur…" />
                </label>
                <label className="text-sm font-medium">Expériences utiles <span className="font-normal text-muted-foreground">(facultatif)</span>
                  <textarea className={`${fieldClass} min-h-20`} value={form.experiences} onChange={(event) => setForm({ ...form, experiences: event.target.value })} placeholder="Stage, emploi, bénévolat, projet scolaire ou personnel…" />
                </label>
                <label className="text-sm font-medium">Contraintes importantes <span className="font-normal text-muted-foreground">(facultatif)</span>
                  <textarea className={`${fieldClass} min-h-20`} value={form.constraints} onChange={(event) => setForm({ ...form, constraints: event.target.value })} placeholder="Transport, horaires, responsabilités familiales, équipement…" />
                </label>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-5">
                <p className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
                  Choisis jusqu’à trois priorités. La première comptera davantage que la deuxième, puis la troisième.
                </p>
                {[0, 1, 2].map((index) => (
                  <label key={index} className="block text-sm font-medium">
                    Priorité {index + 1}{index === 0 ? ' — la plus importante' : ''}
                    <select className={fieldClass} value={form.priorities[index] || ''} onChange={(event) => setPriority(index, event.target.value)}>
                      <option value="">{index === 0 ? 'Choisis au moins une priorité' : 'Aucune priorité supplémentaire'}</option>
                      {Object.entries(priorityLabels).map(([id, label]) => (
                        <option key={id} value={id} disabled={form.priorities.some((entry, position) => position !== index && entry === id)}>{label}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-between gap-3 border-t pt-5">
              <Button type="button" variant="outline" disabled={activeStep === 0 || saving} onClick={() => {
                setError(null);
                setActiveStep((step) => Math.max(0, step - 1));
              }}>
                <ArrowLeft className="mr-2 h-4 w-4" />Précédent
              </Button>
              {activeStep < formSteps.length - 1 ? (
                <Button type="button" onClick={goNext} disabled={saving}>
                  Continuer <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" size="lg" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  Préparer mes pistes
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      {recommendations.length > 0 && (
        <section className="space-y-4" aria-labelledby="life-project-options-title">
          <div>
            <h2 id="life-project-options-title" className="text-2xl font-bold">Tes pistes à comparer</h2>
            <p className="mt-2 text-muted-foreground">Ces pistes servent à avancer. Vérifie toujours les admissions, coûts, dates et possibilités réelles auprès des organismes concernés.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {recommendations.map((scenario) => {
              const selected = scenario.id === selectedId;
              return (
                <Card key={scenario.id} className={selected ? 'border-emerald-500 shadow-md' : ''}>
                  <CardHeader>
                    {selected && <Badge className="w-fit">Piste retenue pour la suite</Badge>}
                    <CardTitle>{scenario.title}</CardTitle>
                    <CardDescription>{scenarioSummary(scenario)}</CardDescription>
                  </CardHeader>
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
                        <h3 className="text-sm font-semibold">Informations à vérifier</h3>
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
                      {selected ? 'Piste retenue' : 'Choisir cette piste pour la suite'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {selectedScenario && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader>
            <CardTitle>Ta prochaine étape</CardTitle>
            <CardDescription>
              Vérifie les informations réelles de « {selectedScenario.title} », puis réalise une première action concrète cette semaine.
            </CardDescription>
          </CardHeader>
        </Card>
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
