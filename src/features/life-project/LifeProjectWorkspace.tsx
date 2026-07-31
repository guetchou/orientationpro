import { useCallback, useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileText,
  Loader2,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
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
import { riasecDimensionLabels, topRiasecDimensions } from './riasec-profile';

const DRAFT_KEY = 'makoki.life-project.autonomous-diagnostic.v1';
const fieldClass = 'mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

interface LifeProjectForm {
  title: string;
  ageRange: string;
  country: string;
  zone: string;
  situation: string;
  educationLevel: string;
  diploma: string;
  objective: AdvisorObjective;
  mobility: AdvisorDiagnosticInput['constraints']['mobility'];
  budget: string;
  maxDurationMonths: string;
  needIncomeWithinMonths: string;
  internetAccess: AdvisorDiagnosticInput['constraints']['internetAccess'];
  availableModes: string;
  subjects: string;
  results: string;
  interruptions: string;
  interestsComplement: string;
  activities: string;
  workEnvironments: string;
  workStyles: string;
  values: string;
  skills: string;
  digitalSkills: string;
  personalProjects: string;
  internships: string;
  volunteering: string;
  jobs: string;
  responsibilities: string;
  languages: string;
  evidence: string;
  regulatoryQualifications: string;
  equipment: string;
  documents: string;
  familyResponsibilities: string;
  healthOrDisability: string;
  availability: string;
  notes: string;
  priorityIds: string[];
}

const emptyForm: LifeProjectForm = {
  title: 'Mon Projet de vie',
  ageRange: '',
  country: 'Congo',
  zone: '',
  situation: '',
  educationLevel: '',
  diploma: '',
  objective: 'uncertain',
  mobility: 'unknown',
  budget: '',
  maxDurationMonths: '',
  needIncomeWithinMonths: '',
  internetAccess: 'unknown',
  availableModes: 'presentiel',
  subjects: '',
  results: '',
  interruptions: '',
  interestsComplement: '',
  activities: '',
  workEnvironments: '',
  workStyles: '',
  values: '',
  skills: '',
  digitalSkills: '',
  personalProjects: '',
  internships: '',
  volunteering: '',
  jobs: '',
  responsibilities: '',
  languages: 'français',
  evidence: '',
  regulatoryQualifications: '',
  equipment: '',
  documents: '',
  familyResponsibilities: '',
  healthOrDisability: '',
  availability: '',
  notes: '',
  priorityIds: ['interest', 'proximity', 'duration', 'cost', 'employability'],
};

const objectiveLabels: Record<AdvisorObjective, string> = {
  studies: 'Poursuivre des études',
  training: 'Trouver une formation',
  insertion: 'Entrer rapidement en emploi',
  reentry: 'Reprendre après une interruption',
  reconversion: 'Se réorienter',
  entrepreneurship: 'Entreprendre',
  work_and_training: 'Combiner emploi et formation',
  uncertain: 'Clarifier une situation encore indécise',
};

const priorityLabels: Record<string, string> = {
  interest: 'Intérêt personnel',
  duration: 'Durée',
  cost: 'Coût',
  proximity: 'Proximité',
  employability: 'Employabilité',
  alternance: 'Alternance',
  future_income: 'Revenus futurs',
  stability: 'Stabilité',
  evolution: 'Évolution',
  family_compatibility: 'Compatibilité familiale',
};

const confidenceLabels = {
  high: 'Élevée',
  medium: 'Moyenne',
  low: 'Faible',
};

const positioningLabels = {
  priority: 'Prioritaire',
  adjacent: 'Proche',
  alternative: 'Alternative',
  fallback: 'Repli',
  exploratory: 'Exploratoire',
};

const csv = (value: string) => [...new Set(value
  .split(/[;,\n]/u)
  .map((entry) => entry.trim())
  .filter(Boolean))];

const join = (value?: string[]) => (value || []).join(', ');

const optionalNumber = (value: string) => {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
};

const readDraft = (): LifeProjectForm => {
  try {
    const stored = localStorage.getItem(DRAFT_KEY);
    return stored
      ? { ...emptyForm, ...JSON.parse(stored) as Partial<LifeProjectForm> }
      : { ...emptyForm };
  } catch {
    return { ...emptyForm };
  }
};

const formFromEnvelope = (envelope: AdvisorEnvelope): LifeProjectForm => {
  const diagnostic = envelope.project.diagnostic;
  if (!diagnostic) return { ...readDraft(), title: envelope.project.title };
  return {
    title: envelope.project.title,
    ageRange: diagnostic.identity.ageRange || '',
    country: String(diagnostic.identity.country.value || ''),
    zone: String(diagnostic.identity.zone.value || ''),
    situation: String(diagnostic.identity.situation.value || ''),
    educationLevel: String(diagnostic.identity.educationLevel.value || ''),
    diploma: String(diagnostic.identity.diploma.value || ''),
    objective: diagnostic.objective,
    mobility: diagnostic.constraints.mobility,
    budget: diagnostic.constraints.budget.amount === null ? '' : String(diagnostic.constraints.budget.amount),
    maxDurationMonths: diagnostic.constraints.maxDurationMonths === null ? '' : String(diagnostic.constraints.maxDurationMonths),
    needIncomeWithinMonths: diagnostic.constraints.needIncomeWithinMonths === null ? '' : String(diagnostic.constraints.needIncomeWithinMonths),
    internetAccess: diagnostic.constraints.internetAccess,
    availableModes: join(diagnostic.constraints.availableModes),
    subjects: join(diagnostic.identity.subjects),
    results: join(diagnostic.identity.significantResults),
    interruptions: join(diagnostic.identity.interruptions),
    interestsComplement: join(diagnostic.preferences.interests),
    activities: join(diagnostic.preferences.activities),
    workEnvironments: join(diagnostic.preferences.workEnvironments),
    workStyles: join(diagnostic.preferences.workStyles),
    values: join(diagnostic.preferences.values),
    skills: join(diagnostic.capabilities.skills),
    digitalSkills: join(diagnostic.capabilities.digitalSkills),
    personalProjects: join(diagnostic.capabilities.personalProjects),
    internships: join(diagnostic.capabilities.internships),
    volunteering: join(diagnostic.capabilities.volunteering),
    jobs: join(diagnostic.capabilities.jobs),
    responsibilities: join(diagnostic.capabilities.responsibilities),
    languages: join(diagnostic.capabilities.languages),
    evidence: join(diagnostic.capabilities.evidence),
    regulatoryQualifications: join(diagnostic.capabilities.regulatoryQualifications),
    equipment: join(diagnostic.constraints.equipment),
    documents: join(diagnostic.constraints.documents),
    familyResponsibilities: join(diagnostic.constraints.familyResponsibilities),
    healthOrDisability: join(diagnostic.constraints.healthOrDisability),
    availability: join(diagnostic.constraints.availability),
    notes: diagnostic.notes || '',
    priorityIds: diagnostic.priorities.map((entry) => entry.id),
  };
};

const buildDiagnostic = (form: LifeProjectForm): AdvisorDiagnosticInput => {
  const budget = optionalNumber(form.budget);
  const maxDurationMonths = optionalNumber(form.maxDurationMonths);
  const needIncomeWithinMonths = optionalNumber(form.needIncomeWithinMonths);
  return {
    objective: form.objective,
    identity: {
      ageRange: form.ageRange || undefined,
      country: { value: form.country.trim(), verification: 'declared' },
      zone: { value: form.zone.trim(), verification: 'declared' },
      situation: { value: form.situation.trim(), verification: 'declared' },
      educationLevel: { value: form.educationLevel, verification: 'declared' },
      diploma: { value: form.diploma.trim(), verification: 'declared' },
      subjects: csv(form.subjects),
      significantResults: csv(form.results),
      interruptions: csv(form.interruptions),
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
      internetAccess: form.internetAccess,
      equipment: csv(form.equipment),
      familyResponsibilities: csv(form.familyResponsibilities),
      availability: csv(form.availability),
      healthOrDisability: csv(form.healthOrDisability),
      documents: csv(form.documents),
      availableModes: csv(form.availableModes),
    },
    preferences: {
      interests: csv(form.interestsComplement),
      activities: csv(form.activities),
      favouriteSubjects: csv(form.subjects),
      workEnvironments: csv(form.workEnvironments),
      workStyles: csv(form.workStyles),
      values: csv(form.values),
    },
    capabilities: {
      skills: csv(form.skills),
      internships: csv(form.internships),
      volunteering: csv(form.volunteering),
      jobs: csv(form.jobs),
      personalProjects: csv(form.personalProjects),
      responsibilities: csv(form.responsibilities),
      languages: csv(form.languages),
      digitalSkills: csv(form.digitalSkills),
      evidence: csv(form.evidence),
      regulatoryQualifications: csv(form.regulatoryQualifications),
    },
    priorities: form.priorityIds.map((id, index) => ({
      id,
      importance: Math.max(0.5, 1 - index * 0.08),
    })),
    notes: form.notes || undefined,
  };
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  inputMode?: 'text' | 'numeric';
}

const TextField = ({ label, value, onChange, required = false, placeholder, inputMode = 'text' }: FieldProps) => (
  <label className="text-sm font-medium">
    {label}
    <input
      required={required}
      inputMode={inputMode}
      className={fieldClass}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  </label>
);

const TextAreaField = ({ label, value, onChange, required = false, placeholder }: FieldProps) => (
  <label className="text-sm font-medium">
    {label}
    <textarea
      required={required}
      className={`${fieldClass} min-h-20`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  </label>
);

const ListBlock = ({ title, values, className = '' }: { title: string; values: string[]; className?: string }) => {
  if (values.length === 0) return null;
  return (
    <div className={className}>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
        {values.map((value) => <li key={value}>• {value}</li>)}
      </ul>
    </div>
  );
};

const StatusMessage = ({ kind, children }: { kind: 'error' | 'success' | 'warning'; children: ReactNode }) => {
  const classes = {
    error: 'border-red-200 bg-red-50 text-red-900',
    success: 'border-green-200 bg-green-50 text-green-950',
    warning: 'border-amber-300 bg-amber-50 text-amber-950',
  };
  const Icon = kind === 'success' ? CheckCircle2 : AlertTriangle;
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`rounded-md border p-4 text-sm ${classes[kind]}`}>
      <Icon className="mr-2 inline h-4 w-4" />{children}
    </div>
  );
};

const formatDuration = (scenario: AdvisorRecommendationScenario) => (
  scenario.durationMonths === null ? 'À confirmer' : `${scenario.durationMonths} mois`
);

const formatCost = (scenario: AdvisorRecommendationScenario) => {
  if (scenario.cost.status === 'unknown' || scenario.cost.amount === null) return 'À confirmer';
  const amount = new Intl.NumberFormat('fr-FR').format(scenario.cost.amount);
  return `${amount}${scenario.cost.currency ? ` ${scenario.cost.currency}` : ''}`;
};

const ScenarioCard = ({
  scenario,
  selected,
  saving,
  onSelect,
}: {
  scenario: AdvisorRecommendationScenario;
  selected: boolean;
  saving: boolean;
  onSelect: () => void;
}) => (
  <Card className={selected ? 'border-primary shadow-md' : ''} data-testid={`life-project-option-${scenario.rank}`}>
    <CardHeader>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge>{positioningLabels[scenario.positioning]}</Badge>
            <Badge variant="outline">Confiance {confidenceLabels[scenario.confidence]}</Badge>
          </div>
          <CardTitle className="mt-3 text-xl">{scenario.rank}. {scenario.title}</CardTitle>
        </div>
        <div className="rounded-full border bg-muted px-4 py-2 text-lg font-bold" aria-label={`Adéquation ${scenario.fitScore} sur 100`}>
          {Math.round(scenario.fitScore)}/100
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold">Pourquoi cette option apparaît</h4>
        <ul className="mt-2 space-y-2 text-sm">
          {scenario.reasons.map((reason) => (
            <li key={reason.signal} className="rounded-md bg-muted/50 p-2">{reason.explanation}</li>
          ))}
        </ul>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border p-3 text-sm">
          <p><strong>Durée :</strong> {formatDuration(scenario)}</p>
          <p className="mt-1"><strong>Coût :</strong> {formatCost(scenario)}</p>
          <p className="mt-1"><strong>Modalités :</strong> {scenario.modes.join(', ') || 'À confirmer'}</p>
          <p className="mt-1"><strong>Accès :</strong> {scenario.geographies.join(', ') || 'À confirmer'}</p>
        </div>
        <ListBlock title="Conditions à vérifier" values={scenario.conditions} />
        <ListBlock title="Risques et limites" values={scenario.risks} className="rounded-md border border-amber-200 bg-amber-50 p-3" />
        <ListBlock title="Informations manquantes" values={scenario.missingInformation} />
      </div>
      <div className="rounded-md border border-green-200 bg-green-50 p-3">
        <h4 className="text-sm font-semibold text-green-950">Première action</h4>
        {scenario.firstActions.map((action) => (
          <div key={action.title} className="mt-2 text-sm text-green-950">
            <p className="font-medium">{action.title} — sous {action.deadlineDays} jour(s)</p>
            <p>Preuve attendue : {action.expectedEvidence}</p>
          </div>
        ))}
      </div>
      <Button type="button" variant={selected ? 'secondary' : 'default'} disabled={saving || selected} onClick={onSelect}>
        {selected ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Target className="mr-2 h-4 w-4" />}
        {selected ? 'Choix provisoire enregistré' : 'Retenir provisoirement cette option'}
      </Button>
    </CardContent>
  </Card>
);

export default function LifeProjectWorkspace({ riasecProfile }: { riasecProfile: AdvisorRiasecProfile }) {
  const [capability, setCapability] = useState<'loading' | 'enabled' | 'disabled' | 'error'>('loading');
  const [projects, setProjects] = useState<AdvisorProjectSummary[]>([]);
  const [current, setCurrent] = useState<AdvisorEnvelope | null>(null);
  const [form, setForm] = useState<LifeProjectForm>(() => readDraft());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadProject = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const envelope = await getAdvisorProject(projectId);
      setCurrent(envelope);
      setForm(formFromEnvelope(envelope));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Ton dossier ne peut pas être chargé.');
    } finally {
      setLoading(false);
    }
  }, []);

  const initialise = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const registry = await getAdvisorCapabilityRegistry();
      const entry = registry.capabilities.find((item) => item.id === 'life-project.core-v1');
      if (!entry || !entry.configured || !['active', 'experimental'].includes(entry.status)) {
        setCapability('disabled');
        setLoading(false);
        return;
      }
      setCapability('enabled');
      const response = await listAdvisorProjects();
      setProjects(response.projects);
      if (response.projects[0]) await loadProject(response.projects[0].id);
      else setLoading(false);
    } catch (loadError) {
      setCapability('error');
      setError(loadError instanceof Error ? loadError.message : 'Ton Projet de vie est indisponible.');
      setLoading(false);
    }
  }, [loadProject]);

  useEffect(() => {
    void initialise();
  }, [initialise]);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      // La reprise locale est facultative ; les dossiers enregistrés restent côté serveur.
    }
  }, [form]);

  const update = <K extends keyof LifeProjectForm>(field: K, value: LifeProjectForm[K]) => {
    setForm((existing) => ({ ...existing, [field]: value }));
  };

  const togglePriority = (id: string) => {
    update('priorityIds', form.priorityIds.includes(id)
      ? form.priorityIds.filter((entry) => entry !== id)
      : [...form.priorityIds, id]);
  };

  const persistAndGenerate = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      let envelope = current;
      if (!envelope) {
        envelope = await createAdvisorProject(
          form.title.trim() || 'Mon Projet de vie',
          'Croiser mon profil RIASEC, ma situation, mes compétences et mes contraintes pour construire des options vérifiables.',
        );
      }
      const diagnosed = await saveAdvisorDiagnostic(
        envelope.project.id,
        envelope.persistenceVersion,
        buildDiagnostic(form),
      );
      const recommended = await generateAdvisorRecommendations(
        diagnosed.project.id,
        diagnosed.persistenceVersion,
      );
      setCurrent(recommended);
      setForm(formFromEnvelope(recommended));
      localStorage.removeItem(DRAFT_KEY);
      const response = await listAdvisorProjects();
      setProjects(response.projects);
      setNotice(recommended.project.recommendation?.status === 'complete'
        ? 'Tes options sont calculées. Compare-les, retiens une piste provisoire puis imprime ton rapport unique.'
        : 'Le référentiel ou les informations disponibles ne permettent pas encore trois options valides. Les inconnues sont affichées au lieu d’être inventées.');
      requestAnimationFrame(() => document.getElementById('life-project-options')?.scrollIntoView({ behavior: 'smooth' }));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Ton diagnostic ou tes options n’ont pas pu être enregistrés.');
    } finally {
      setSaving(false);
    }
  };

  const selectScenario = async (scenarioId: string) => {
    if (!current) return;
    setSaving(true);
    setError(null);
    try {
      const selected = await selectAdvisorScenario(current, scenarioId);
      setCurrent(selected);
      setNotice('Ton choix est enregistré comme provisoire, pas comme une décision définitive.');
    } catch (selectError) {
      setError(selectError instanceof Error ? selectError.message : 'Ton choix provisoire n’a pas pu être enregistré.');
    } finally {
      setSaving(false);
    }
  };

  const recommendation = current?.project.recommendation;
  const selectedScenario = recommendation?.scenarios.find(
    (scenario) => scenario.id === current?.project.activeScenarioId,
  ) || null;
  const actionScenario = selectedScenario || recommendation?.scenarios[0] || null;
  const diagnostic = current?.project.diagnostic;
  const summaryMissing = recommendation?.missingInformation || current?.project.missingInformation || [];
  const leadingRiasec = topRiasecDimensions(diagnostic?.riasecProfile || riasecProfile);

  if (capability === 'loading' || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center" role="status">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />Chargement de ton dossier…
      </div>
    );
  }

  if (capability === 'disabled') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projet de vie indisponible</CardTitle>
          <CardDescription>La capacité serveur n’est pas activée dans cet environnement.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (capability === 'error') {
    return <StatusMessage kind="error">{error || 'Ton Projet de vie est indisponible.'}</StatusMessage>;
  }

  return (
    <div className="space-y-8">
      {error && <StatusMessage kind="error">{error}</StatusMessage>}
      {notice && <StatusMessage kind="success">{notice}</StatusMessage>}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem] print:block">
        <form className="space-y-6 print:hidden" onSubmit={(event) => void persistAndGenerate(event)} aria-busy={saving}>
          <Card data-testid="autonomous-life-project-diagnostic">
            <CardHeader>
              <Badge className="w-fit">Étape 2 sur 5</Badge>
              <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" />Complète ta situation</CardTitle>
              <CardDescription>
                Ton RIASEC est déjà pris en compte. Ajoute maintenant les faits qui rendent les recommandations réalistes : niveau, compétences, contraintes, budget et priorités.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-7">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="Titre du dossier" value={form.title} onChange={(value) => update('title', value)} />
                <TextField label="Tranche d’âge" value={form.ageRange} onChange={(value) => update('ageRange', value)} placeholder="16-20" />
                <TextField label="Pays" required value={form.country} onChange={(value) => update('country', value)} />
                <TextField label="Ville ou zone" required value={form.zone} onChange={(value) => update('zone', value)} placeholder="Brazzaville" />
                <TextField label="Situation actuelle" required value={form.situation} onChange={(value) => update('situation', value)} placeholder="Terminale, étudiant, sans emploi…" />
                <label className="text-sm font-medium">
                  Dernier niveau atteint
                  <select required className={fieldClass} value={form.educationLevel} onChange={(event) => update('educationLevel', event.target.value)}>
                    <option value="">Choisir</option>
                    <option value="middle_school">Collège</option>
                    <option value="high_school">Lycée sans baccalauréat</option>
                    <option value="baccalaureate">Baccalauréat obtenu ou préparé</option>
                    <option value="vocational">Diplôme professionnel</option>
                    <option value="bac_plus_2">Bac+2</option>
                    <option value="licence">Licence</option>
                    <option value="master">Master</option>
                  </select>
                </label>
                <TextField label="Diplôme obtenu ou préparé" value={form.diploma} onChange={(value) => update('diploma', value)} />
                <label className="text-sm font-medium">
                  Objectif immédiat
                  <select className={fieldClass} value={form.objective} onChange={(event) => update('objective', event.target.value as AdvisorObjective)}>
                    {Object.entries(objectiveLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
              </div>

              <div>
                <h3 className="font-semibold">Contraintes réelles</h3>
                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  <label className="text-sm font-medium">
                    Mobilité
                    <select className={fieldClass} value={form.mobility} onChange={(event) => update('mobility', event.target.value as LifeProjectForm['mobility'])}>
                      <option value="unknown">À clarifier</option>
                      <option value="none">Aucune</option>
                      <option value="local">Locale</option>
                      <option value="national">Nationale</option>
                      <option value="international">Internationale</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </label>
                  <TextField label="Budget maximal (XAF)" inputMode="numeric" value={form.budget} onChange={(value) => update('budget', value)} placeholder="Inconnu si vide" />
                  <TextField label="Durée maximale (mois)" inputMode="numeric" value={form.maxDurationMonths} onChange={(value) => update('maxDurationMonths', value)} placeholder="Inconnue si vide" />
                  <TextField label="Revenu nécessaire sous (mois)" inputMode="numeric" value={form.needIncomeWithinMonths} onChange={(value) => update('needIncomeWithinMonths', value)} />
                  <label className="text-sm font-medium">
                    Accès Internet
                    <select className={fieldClass} value={form.internetAccess} onChange={(event) => update('internetAccess', event.target.value as LifeProjectForm['internetAccess'])}>
                      <option value="unknown">À clarifier</option>
                      <option value="none">Aucun</option>
                      <option value="limited">Limité</option>
                      <option value="regular">Régulier</option>
                    </select>
                  </label>
                  <TextField label="Modalités acceptables" value={form.availableModes} onChange={(value) => update('availableModes', value)} placeholder="Présentiel, distance, alternance" />
                  <TextField label="Disponibilité" value={form.availability} onChange={(value) => update('availability', value)} placeholder="Temps plein, soir, week-end" />
                  <TextField label="Équipement" value={form.equipment} onChange={(value) => update('equipment', value)} placeholder="Smartphone, ordinateur…" />
                  <TextField label="Documents disponibles" value={form.documents} onChange={(value) => update('documents', value)} placeholder="Baccalauréat, pièce d’identité, CV…" />
                  <TextField label="Responsabilités familiales" value={form.familyResponsibilities} onChange={(value) => update('familyResponsibilities', value)} />
                  <TextField label="Santé ou handicap volontairement déclaré" value={form.healthOrDisability} onChange={(value) => update('healthOrDisability', value)} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <TextAreaField label="Matières suivies ou préférées" value={form.subjects} onChange={(value) => update('subjects', value)} placeholder="Séparer par des virgules" />
                <TextAreaField label="Résultats significatifs" value={form.results} onChange={(value) => update('results', value)} />
                <TextAreaField label="Précisions d’intérêts (facultatif)" value={form.interestsComplement} onChange={(value) => update('interestsComplement', value)} placeholder="Le RIASEC fournit déjà le socle ; ajoute seulement ce qu’il ne couvre pas." />
                <TextAreaField label="Activités appréciées" value={form.activities} onChange={(value) => update('activities', value)} />
                <TextAreaField label="Compétences déclarées" required value={form.skills} onChange={(value) => update('skills', value)} placeholder="Logique, communication, organisation…" />
                <TextAreaField label="Compétences numériques" value={form.digitalSkills} onChange={(value) => update('digitalSkills', value)} />
                <TextAreaField label="Projets personnels" value={form.personalProjects} onChange={(value) => update('personalProjects', value)} />
                <TextAreaField label="Preuves disponibles" value={form.evidence} onChange={(value) => update('evidence', value)} placeholder="Attestation, portfolio, lien, réalisation…" />
                <TextAreaField label="Stages" value={form.internships} onChange={(value) => update('internships', value)} />
                <TextAreaField label="Emplois" value={form.jobs} onChange={(value) => update('jobs', value)} />
                <TextAreaField label="Bénévolat" value={form.volunteering} onChange={(value) => update('volunteering', value)} />
                <TextAreaField label="Responsabilités exercées" value={form.responsibilities} onChange={(value) => update('responsibilities', value)} />
                <TextAreaField label="Environnements de travail préférés" value={form.workEnvironments} onChange={(value) => update('workEnvironments', value)} placeholder="Bureau, atelier, terrain, public…" />
                <TextAreaField label="Styles de travail" value={form.workStyles} onChange={(value) => update('workStyles', value)} placeholder="Autonomie, équipe, stabilité, variété…" />
                <TextAreaField label="Valeurs" value={form.values} onChange={(value) => update('values', value)} placeholder="Utilité, revenu, évolution, sécurité…" />
                <TextAreaField label="Langues" value={form.languages} onChange={(value) => update('languages', value)} />
                <TextAreaField label="Qualifications réglementaires" value={form.regulatoryQualifications} onChange={(value) => update('regulatoryQualifications', value)} />
                <TextAreaField label="Interruptions éventuelles" value={form.interruptions} onChange={(value) => update('interruptions', value)} />
                <TextAreaField label="Notes personnelles" value={form.notes} onChange={(value) => update('notes', value)} />
              </div>

              <fieldset>
                <legend className="font-semibold">Classe tes critères de décision</legend>
                <p className="mt-1 text-sm text-muted-foreground">L’ordre de sélection détermine leur importance relative.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(priorityLabels).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => togglePriority(id)}
                      className={`rounded-full border px-3 py-2 text-sm ${form.priorityIds.includes(id) ? 'border-primary bg-primary text-primary-foreground' : 'bg-background'}`}
                    >
                      {form.priorityIds.includes(id) ? `${form.priorityIds.indexOf(id) + 1}. ` : ''}{label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={saving}>
                  <Search className="mr-2 h-4 w-4" />{saving ? 'Calcul en cours…' : 'Enregistrer et générer mes options'}
                </Button>
                <Button type="button" variant="outline" disabled={saving} onClick={() => void initialise()}>
                  <RefreshCw className="mr-2 h-4 w-4" />Actualiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <aside className="space-y-4 print:hidden">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mes dossiers</CardTitle>
              <CardDescription>Reprends un dossier existant ou démarre une nouvelle exploration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setCurrent(null);
                  setForm({ ...emptyForm });
                  setNotice('Nouveau dossier prêt à être renseigné.');
                }}
              >
                Nouveau dossier
              </Button>
              {projects.map((project) => (
                <button
                  type="button"
                  key={project.id}
                  onClick={() => void loadProject(project.id)}
                  className={`w-full rounded-md border p-3 text-left text-sm ${current?.project.id === project.id ? 'border-primary bg-primary/5' : ''}`}
                >
                  <span className="block font-medium">{project.title}</span>
                  <span className="text-muted-foreground">{project.state} · {project.scenarioCount || 0} option(s)</span>
                </button>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" />Comprendre les scores</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              L’adéquation mesure la correspondance avec tes informations. La confiance mesure leur qualité. Un score élevé avec des données locales non confirmées reste une hypothèse à vérifier.
            </CardContent>
          </Card>
        </aside>
      </div>

      {recommendation && (
        <section id="life-project-options" className="space-y-6" aria-labelledby="options-title">
          <div>
            <Badge>Étape 3 sur 5</Badge>
            <h2 id="options-title" className="mt-2 text-2xl font-bold">Tes options recommandées</h2>
            <p className="text-muted-foreground">
              {recommendation.status === 'complete'
                ? `${recommendation.scenarios.length} option(s) calculée(s) à partir de ton RIASEC, de ta situation et de tes contraintes.`
                : 'Le moteur n’a pas assez d’éléments vérifiables pour produire trois options crédibles.'}
            </p>
          </div>
          {recommendation.scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              selected={current?.project.activeScenarioId === scenario.id}
              saving={saving}
              onSelect={() => void selectScenario(scenario.id)}
            />
          ))}
        </section>
      )}

      {recommendation && (
        <section id="life-project-summary" className="space-y-5 rounded-lg border bg-background p-6 print:border-0 print:p-0" aria-labelledby="summary-title">
          <div className="flex flex-wrap items-center justify-between gap-3 print:block">
            <div>
              <Badge className="print:hidden">Étape 5 sur 5</Badge>
              <h2 id="summary-title" className="mt-2 text-2xl font-bold">Mon rapport Projet de vie</h2>
              <p className="text-sm text-muted-foreground">Généré le {new Date(recommendation.generatedAt).toLocaleString('fr-FR')} · moteur {recommendation.engineVersion}</p>
            </div>
            <Button type="button" variant="outline" className="print:hidden" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" />Imprimer ou enregistrer en PDF
            </Button>
          </div>

          <Card className="border-primary/20 print:break-inside-avoid">
            <CardHeader>
              <CardTitle className="text-lg">Mon profil RIASEC — {diagnostic?.riasecProfile?.displayCode || riasecProfile.displayCode}</CardTitle>
              <CardDescription>Les dimensions dominantes ont été intégrées au calcul des options ci-dessous.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {leadingRiasec.map((entry) => (
                <div key={entry.dimension} className="rounded-md border p-3">
                  <p className="font-semibold">{riasecDimensionLabels[entry.dimension]} ({entry.dimension})</p>
                  <p className="text-sm text-muted-foreground">{Math.round(entry.score)}/100</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">Ma situation</h3>
              <p className="mt-2 text-sm">
                {String(diagnostic?.identity.situation.value || 'Situation à préciser')} · niveau {String(diagnostic?.identity.educationLevel.value || 'à préciser')} · {String(diagnostic?.identity.zone.value || 'zone à préciser')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Objectif : {diagnostic ? objectiveLabels[diagnostic.objective] : 'à clarifier'}.</p>
            </div>
            <div>
              <h3 className="font-semibold">Mon choix provisoire</h3>
              <p className="mt-2 text-sm font-medium">{selectedScenario?.title || 'Aucun choix provisoire'}</p>
              <p className="text-sm text-muted-foreground">Ce choix n’est pas une admission, un recrutement ou un financement garanti.</p>
            </div>
            <ListBlock
              title="Mes options"
              values={recommendation.scenarios.map((scenario) => `${scenario.rank}. ${scenario.title} — ${Math.round(scenario.fitScore)}/100, confiance ${confidenceLabels[scenario.confidence].toLowerCase()}`)}
            />
            <ListBlock title="Points restant à vérifier" values={summaryMissing} />
            <div>
              <h3 className="font-semibold">Ma première action</h3>
              <p className="mt-2 text-sm">{actionScenario?.firstActions[0]?.title || 'Définir une première action concrète.'}</p>
              <p className="text-sm text-muted-foreground">Preuve attendue : {actionScenario?.firstActions[0]?.expectedEvidence || 'Une preuve observable à définir.'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Ma prochaine décision</h3>
              <p className="mt-2 text-sm">Vérifier les conditions locales, réaliser la première action, puis confirmer ou modifier le choix avant toute inscription ou dépense.</p>
            </div>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
            <FileText className="mr-2 inline h-4 w-4" />Ce rapport aide à décider. Il ne remplace ni les conditions officielles d’admission, ni une validation financière, ni un accompagnement professionnel lorsque la situation le nécessite.
          </div>
        </section>
      )}
    </div>
  );
}
