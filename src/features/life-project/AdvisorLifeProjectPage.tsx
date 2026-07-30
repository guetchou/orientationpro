import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Compass,
  FileText,
  Loader2,
  MapPin,
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
} from './advisor-types';

const DRAFT_KEY = 'makoki.life-project.advisor-diagnostic.v1';
const fieldClass = 'mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

interface AdvisorForm {
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
  subjects: string;
  results: string;
  interruptions: string;
  interests: string;
  activities: string;
  workEnvironments: string;
  workStyles: string;
  values: string;
  skills: string;
  digitalSkills: string;
  personalProjects: string;
  internships: string;
  jobs: string;
  languages: string;
  equipment: string;
  documents: string;
  familyResponsibilities: string;
  availability: string;
  notes: string;
  priorityIds: string[];
}

const emptyForm: AdvisorForm = {
  title: 'Projet de vie — séance conseiller',
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
  subjects: '',
  results: '',
  interruptions: '',
  interests: '',
  activities: '',
  workEnvironments: '',
  workStyles: '',
  values: '',
  skills: '',
  digitalSkills: '',
  personalProjects: '',
  internships: '',
  jobs: '',
  languages: 'français',
  equipment: '',
  documents: '',
  familyResponsibilities: '',
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

const readDraft = (): AdvisorForm => {
  try {
    const stored = localStorage.getItem(DRAFT_KEY);
    return stored ? { ...emptyForm, ...JSON.parse(stored) as Partial<AdvisorForm> } : emptyForm;
  } catch {
    return emptyForm;
  }
};

const formFromEnvelope = (envelope: AdvisorEnvelope): AdvisorForm => {
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
    subjects: join(diagnostic.identity.subjects),
    results: join(diagnostic.identity.significantResults),
    interruptions: join(diagnostic.identity.interruptions),
    interests: join(diagnostic.preferences.interests),
    activities: join(diagnostic.preferences.activities),
    workEnvironments: join(diagnostic.preferences.workEnvironments),
    workStyles: join(diagnostic.preferences.workStyles),
    values: join(diagnostic.preferences.values),
    skills: join(diagnostic.capabilities.skills),
    digitalSkills: join(diagnostic.capabilities.digitalSkills),
    personalProjects: join(diagnostic.capabilities.personalProjects),
    internships: join(diagnostic.capabilities.internships),
    jobs: join(diagnostic.capabilities.jobs),
    languages: join(diagnostic.capabilities.languages),
    equipment: join(diagnostic.constraints.equipment),
    documents: join(diagnostic.constraints.documents),
    familyResponsibilities: join(diagnostic.constraints.familyResponsibilities),
    availability: join(diagnostic.constraints.availability),
    notes: diagnostic.notes || '',
    priorityIds: diagnostic.priorities.map((entry) => entry.id),
  };
};

const buildDiagnostic = (form: AdvisorForm): AdvisorDiagnosticInput => {
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
      healthOrDisability: [],
      documents: csv(form.documents),
      availableModes: form.internetAccess === 'regular'
        ? ['presentiel', 'online']
        : ['presentiel'],
    },
    preferences: {
      interests: csv(form.interests),
      activities: csv(form.activities),
      favouriteSubjects: csv(form.subjects),
      workEnvironments: csv(form.workEnvironments),
      workStyles: csv(form.workStyles),
      values: csv(form.values),
    },
    capabilities: {
      skills: csv(form.skills),
      internships: csv(form.internships),
      volunteering: [],
      jobs: csv(form.jobs),
      personalProjects: csv(form.personalProjects),
      responsibilities: [],
      languages: csv(form.languages),
      digitalSkills: csv(form.digitalSkills),
      evidence: [],
      regulatoryQualifications: [],
    },
    priorities: form.priorityIds.map((id, index) => ({
      id,
      importance: Math.max(0.5, 1 - index * 0.08),
    })),
    notes: form.notes || undefined,
  };
};

const listBlock = (title: string, values: string[], className = '') => values.length > 0 && (
  <div className={className}>
    <h4 className="text-sm font-semibold">{title}</h4>
    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
      {values.map((value) => <li key={value}>• {value}</li>)}
    </ul>
  </div>
);

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
  <Card className={selected ? 'border-primary shadow-md' : ''} data-testid={`advisor-option-${scenario.rank}`}>
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
        {listBlock('Conditions à vérifier', scenario.conditions)}
        {listBlock('Risques et limites', scenario.risks, 'rounded-md border border-amber-200 bg-amber-50 p-3')}
        {listBlock('Informations manquantes', scenario.missingInformation)}
        <div>
          <h4 className="text-sm font-semibold">Accès local identifié</h4>
          {scenario.localOpportunities.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Aucune opportunité locale précise vérifiée.</p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {scenario.localOpportunities.map((opportunity) => (
                <li key={opportunity.id} className="rounded-md border p-2">
                  <span className="font-medium">{opportunity.title}</span>
                  <span className="block text-muted-foreground">{opportunity.organization || 'Organisme à confirmer'} · {opportunity.zone || 'Zone à confirmer'} · {opportunity.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="rounded-md border border-green-200 bg-green-50 p-3">
        <h4 className="text-sm font-semibold text-green-950">Première action sous sept jours</h4>
        {scenario.firstActions.map((action) => (
          <div key={action.title} className="mt-2 text-sm text-green-950">
            <p className="font-medium">{action.title} — sous {action.deadlineDays} jour(s)</p>
            <p>Preuve attendue : {action.expectedEvidence}</p>
          </div>
        ))}
      </div>
      <div>
        <h4 className="text-sm font-semibold">Sources</h4>
        <ul className="mt-2 space-y-2 text-sm">
          {scenario.sourceReferences.map((source) => (
            <li key={source.id}>
              {source.url ? (
                <a className="font-medium text-primary underline underline-offset-4" href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
              ) : source.title}
              <span className="ml-2 text-muted-foreground">{source.verificationStatus}{source.verifiedAt ? ` · vérifiée le ${new Date(source.verifiedAt).toLocaleDateString('fr-FR')}` : ''}</span>
              {source.scope && <p className="text-muted-foreground">{source.scope}</p>}
            </li>
          ))}
        </ul>
      </div>
      <Button type="button" variant={selected ? 'secondary' : 'default'} disabled={saving || selected} onClick={onSelect}>
        {selected ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Target className="mr-2 h-4 w-4" />}
        {selected ? 'Choix provisoire enregistré' : 'Retenir provisoirement cette option'}
      </Button>
    </CardContent>
  </Card>
);

export default function AdvisorLifeProjectPage() {
  const [capability, setCapability] = useState<'loading' | 'enabled' | 'disabled' | 'error'>('loading');
  const [projects, setProjects] = useState<AdvisorProjectSummary[]>([]);
  const [current, setCurrent] = useState<AdvisorEnvelope | null>(null);
  const [form, setForm] = useState<AdvisorForm>(() => readDraft());
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
      setError(loadError instanceof Error ? loadError.message : 'Le dossier ne peut pas être chargé.');
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
        return;
      }
      setCapability('enabled');
      const response = await listAdvisorProjects();
      setProjects(response.projects);
      if (response.projects[0]) await loadProject(response.projects[0].id);
      else setLoading(false);
    } catch (loadError) {
      setCapability('error');
      setError(loadError instanceof Error ? loadError.message : 'L’espace conseiller est indisponible.');
      setLoading(false);
    }
  }, [loadProject]);

  useEffect(() => {
    void initialise();
  }, [initialise]);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  const update = <K extends keyof AdvisorForm>(field: K, value: AdvisorForm[K]) => {
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
          form.title.trim() || 'Projet de vie — séance conseiller',
          'Produire des options crédibles, expliquées, sourcées et actionnables en séance.',
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
        ? 'Les options sont calculées. Elles restent modifiables et doivent être vérifiées avec le jeune.'
        : 'Le référentiel ou le diagnostic ne permet pas encore trois options valides. Les inconnues sont affichées au lieu d’être inventées.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Le diagnostic ou les options n’ont pas pu être enregistrés.');
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
      setNotice('Le choix est enregistré comme provisoire, pas comme décision définitive.');
    } catch (selectError) {
      setError(selectError instanceof Error ? selectError.message : 'Le choix provisoire n’a pas pu être enregistré.');
    } finally {
      setSaving(false);
    }
  };

  const recommendation = current?.project.recommendation;
  const selectedScenario = recommendation?.scenarios.find((scenario) => scenario.id === current?.project.activeScenarioId)
    || recommendation?.scenarios[0]
    || null;
  const diagnostic = current?.project.diagnostic;
  const summaryMissing = useMemo(() => recommendation?.missingInformation || current?.project.missingInformation || [], [current, recommendation]);

  if (capability === 'loading' || loading) {
    return <div className="flex min-h-[60vh] items-center justify-center" role="status"><Loader2 className="mr-2 h-6 w-6 animate-spin" />Chargement de l’espace conseiller…</div>;
  }

  if (capability === 'disabled') {
    return <div className="container py-16"><Card><CardHeader><CardTitle>Projet de vie indisponible</CardTitle><CardDescription>La capacité serveur n’est pas activée dans cet environnement. Aucune simulation locale ne remplace le moteur métier.</CardDescription></CardHeader></Card></div>;
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container max-w-7xl space-y-8">
        <header className="space-y-3">
          <Badge variant="outline">Programme P0 · Projet de vie opérationnel</Badge>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Espace de séance conseiller</h1>
          <p className="max-w-4xl text-muted-foreground">Conduisez le diagnostic, obtenez trois à cinq options explicables, comparez-les, retenez un choix provisoire et imprimez une synthèse. Une source inconnue reste inconnue.</p>
          <div className="grid gap-2 text-sm sm:grid-cols-4">
            {['1. Diagnostic', '2. Options', '3. Comparaison', '4. Synthèse'].map((label) => <div key={label} className="rounded-md border bg-background p-3 font-medium">{label}</div>)}
          </div>
        </header>

        {error && <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900"><AlertTriangle className="mr-2 inline h-4 w-4" />{error}</div>}
        {notice && <div role="status" className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-950"><CheckCircle2 className="mr-2 inline h-4 w-4" />{notice}</div>}

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <form className="space-y-6" onSubmit={(event) => void persistAndGenerate(event)} aria-busy={saving}>
            <Card data-testid="advisor-diagnostic">
              <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" />1. Diagnostic progressif</CardTitle><CardDescription>Le conseiller peut remplir ce dossier au fil de l’entretien. Les valeurs sont déclarées tant qu’aucune preuve n’a été vérifiée.</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium">Titre du dossier<input className={fieldClass} value={form.title} onChange={(event) => update('title', event.target.value)} /></label>
                  <label className="text-sm font-medium">Tranche d’âge<input className={fieldClass} value={form.ageRange} onChange={(event) => update('ageRange', event.target.value)} placeholder="16-20" /></label>
                  <label className="text-sm font-medium">Pays<input required className={fieldClass} value={form.country} onChange={(event) => update('country', event.target.value)} /></label>
                  <label className="text-sm font-medium">Ville ou zone<input required className={fieldClass} value={form.zone} onChange={(event) => update('zone', event.target.value)} placeholder="Brazzaville" /></label>
                  <label className="text-sm font-medium">Situation actuelle<input required className={fieldClass} value={form.situation} onChange={(event) => update('situation', event.target.value)} placeholder="Terminale, étudiant, sans emploi…" /></label>
                  <label className="text-sm font-medium">Dernier niveau atteint<select required className={fieldClass} value={form.educationLevel} onChange={(event) => update('educationLevel', event.target.value)}><option value="">Choisir</option><option value="middle_school">Collège</option><option value="high_school">Lycée sans baccalauréat</option><option value="baccalaureate">Baccalauréat obtenu ou préparé</option><option value="vocational">Diplôme professionnel</option><option value="bac_plus_2">Bac+2</option><option value="licence">Licence</option><option value="master">Master</option></select></label>
                  <label className="text-sm font-medium">Diplôme obtenu ou préparé<input className={fieldClass} value={form.diploma} onChange={(event) => update('diploma', event.target.value)} /></label>
                  <label className="text-sm font-medium">Objectif immédiat<select className={fieldClass} value={form.objective} onChange={(event) => update('objective', event.target.value as AdvisorObjective)}>{Object.entries(objectiveLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                </div>

                <div>
                  <h3 className="font-semibold">Contraintes réelles</h3>
                  <div className="mt-3 grid gap-4 md:grid-cols-3">
                    <label className="text-sm font-medium">Mobilité<select className={fieldClass} value={form.mobility} onChange={(event) => update('mobility', event.target.value as AdvisorForm['mobility'])}><option value="unknown">À clarifier</option><option value="none">Aucune</option><option value="local">Locale</option><option value="national">Nationale</option><option value="international">Internationale</option><option value="flexible">Flexible</option></select></label>
                    <label className="text-sm font-medium">Budget maximal (XAF)<input inputMode="numeric" className={fieldClass} value={form.budget} onChange={(event) => update('budget', event.target.value)} placeholder="Inconnu si vide" /></label>
                    <label className="text-sm font-medium">Durée maximale (mois)<input inputMode="numeric" className={fieldClass} value={form.maxDurationMonths} onChange={(event) => update('maxDurationMonths', event.target.value)} placeholder="Inconnue si vide" /></label>
                    <label className="text-sm font-medium">Revenu nécessaire sous (mois)<input inputMode="numeric" className={fieldClass} value={form.needIncomeWithinMonths} onChange={(event) => update('needIncomeWithinMonths', event.target.value)} /></label>
                    <label className="text-sm font-medium">Accès Internet<select className={fieldClass} value={form.internetAccess} onChange={(event) => update('internetAccess', event.target.value as AdvisorForm['internetAccess'])}><option value="unknown">À clarifier</option><option value="none">Aucun</option><option value="limited">Limité</option><option value="regular">Régulier</option></select></label>
                    <label className="text-sm font-medium">Disponibilité<input className={fieldClass} value={form.availability} onChange={(event) => update('availability', event.target.value)} placeholder="Temps plein, soir, week-end" /></label>
                    <label className="text-sm font-medium">Équipement<input className={fieldClass} value={form.equipment} onChange={(event) => update('equipment', event.target.value)} placeholder="Smartphone, ordinateur…" /></label>
                    <label className="text-sm font-medium">Documents disponibles<input className={fieldClass} value={form.documents} onChange={(event) => update('documents', event.target.value)} placeholder="Baccalauréat, pièce d’identité, CV…" /></label>
                    <label className="text-sm font-medium">Responsabilités familiales<input className={fieldClass} value={form.familyResponsibilities} onChange={(event) => update('familyResponsibilities', event.target.value)} /></label>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm font-medium">Matières suivies ou préférées<textarea className={`${fieldClass} min-h-20`} value={form.subjects} onChange={(event) => update('subjects', event.target.value)} placeholder="Séparer par des virgules" /></label>
                  <label className="text-sm font-medium">Résultats significatifs<textarea className={`${fieldClass} min-h-20`} value={form.results} onChange={(event) => update('results', event.target.value)} /></label>
                  <label className="text-sm font-medium">Intérêts<textarea required className={`${fieldClass} min-h-20`} value={form.interests} onChange={(event) => update('interests', event.target.value)} placeholder="Numérique, sciences, service client…" /></label>
                  <label className="text-sm font-medium">Activités appréciées<textarea className={`${fieldClass} min-h-20`} value={form.activities} onChange={(event) => update('activities', event.target.value)} /></label>
                  <label className="text-sm font-medium">Compétences déclarées<textarea required className={`${fieldClass} min-h-20`} value={form.skills} onChange={(event) => update('skills', event.target.value)} placeholder="Logique, communication, organisation…" /></label>
                  <label className="text-sm font-medium">Compétences numériques<textarea className={`${fieldClass} min-h-20`} value={form.digitalSkills} onChange={(event) => update('digitalSkills', event.target.value)} /></label>
                  <label className="text-sm font-medium">Projets personnels ou preuves<textarea className={`${fieldClass} min-h-20`} value={form.personalProjects} onChange={(event) => update('personalProjects', event.target.value)} /></label>
                  <label className="text-sm font-medium">Stages et emplois<textarea className={`${fieldClass} min-h-20`} value={[form.internships, form.jobs].filter(Boolean).join(', ')} onChange={(event) => update('internships', event.target.value)} /></label>
                  <label className="text-sm font-medium">Environnements de travail<textarea className={`${fieldClass} min-h-20`} value={form.workEnvironments} onChange={(event) => update('workEnvironments', event.target.value)} placeholder="Bureau, atelier, terrain, public…" /></label>
                  <label className="text-sm font-medium">Styles et valeurs<textarea className={`${fieldClass} min-h-20`} value={[form.workStyles, form.values].filter(Boolean).join(', ')} onChange={(event) => update('workStyles', event.target.value)} placeholder="Autonomie, équipe, stabilité, variété…" /></label>
                  <label className="text-sm font-medium">Interruptions éventuelles<textarea className={`${fieldClass} min-h-20`} value={form.interruptions} onChange={(event) => update('interruptions', event.target.value)} /></label>
                  <label className="text-sm font-medium">Notes de séance<textarea className={`${fieldClass} min-h-20`} value={form.notes} onChange={(event) => update('notes', event.target.value)} /></label>
                </div>

                <fieldset>
                  <legend className="font-semibold">Critères de décision classés</legend>
                  <p className="mt-1 text-sm text-muted-foreground">L’ordre de sélection détermine la priorité relative.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(priorityLabels).map(([id, label]) => (
                      <button key={id} type="button" onClick={() => togglePriority(id)} className={`rounded-full border px-3 py-2 text-sm ${form.priorityIds.includes(id) ? 'border-primary bg-primary text-primary-foreground' : 'bg-background'}`}>
                        {form.priorityIds.includes(id) ? `${form.priorityIds.indexOf(id) + 1}. ` : ''}{label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={saving}><Search className="mr-2 h-4 w-4" />{saving ? 'Calcul en cours…' : 'Enregistrer et générer les options'}</Button>
                  <Button type="button" variant="outline" disabled={saving} onClick={() => void initialise()}><RefreshCw className="mr-2 h-4 w-4" />Actualiser</Button>
                </div>
              </CardContent>
            </Card>
          </form>

          <aside className="space-y-4 xl:order-last">
            <Card>
              <CardHeader><CardTitle className="text-base">Dossiers</CardTitle><CardDescription>Choisissez un dossier existant ou démarrez une nouvelle séance.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <Button type="button" variant="outline" className="w-full" onClick={() => { setCurrent(null); setForm(emptyForm); setNotice('Nouveau dossier prêt à être renseigné.'); }}>Nouveau dossier</Button>
                {projects.map((project) => (
                  <button type="button" key={project.id} onClick={() => void loadProject(project.id)} className={`w-full rounded-md border p-3 text-left text-sm ${current?.project.id === project.id ? 'border-primary bg-primary/5' : ''}`}>
                    <span className="block font-medium">{project.title}</span>
                    <span className="text-muted-foreground">{project.state} · {project.scenarioCount || 0} option(s)</span>
                  </button>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" />Règle de confiance</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">Le score mesure l’adéquation. La confiance mesure la qualité des informations. Un score élevé avec des sources locales non confirmées reste une hypothèse.</CardContent>
            </Card>
          </aside>
        </div>

        {recommendation && (
          <section className="space-y-6" aria-labelledby="options-title">
            <div>
              <h2 id="options-title" className="text-2xl font-bold">2. Options recommandées</h2>
              <p className="text-muted-foreground">{recommendation.status === 'complete' ? `${recommendation.scenarios.length} options diversifiées ont été produites.` : 'Moins de trois options valides : le système refuse de compléter artificiellement la liste.'}</p>
            </div>
            {recommendation.status === 'insufficient_options' && <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><AlertTriangle className="mr-2 inline h-4 w-4" />Référentiel insuffisant ou contraintes trop fortes. Complétez les informations manquantes ou vérifiez de nouvelles options locales.</div>}
            <div className="grid gap-6 lg:grid-cols-2">
              {recommendation.scenarios.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} selected={current?.project.activeScenarioId === scenario.id} saving={saving} onSelect={() => void selectScenario(scenario.id)} />
              ))}
            </div>
            {recommendation.nonPrioritized.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Options non priorisées</CardTitle><CardDescription>Une incompatibilité n’est pas masquée.</CardDescription></CardHeader>
                <CardContent><ul className="space-y-3 text-sm">{recommendation.nonPrioritized.map((option) => <li key={option.optionId}><span className="font-medium">{option.title}</span><span className="block text-muted-foreground">{option.reasons.join(' · ')}</span></li>)}</ul></CardContent>
              </Card>
            )}
          </section>
        )}

        {recommendation && recommendation.scenarios.length > 0 && (
          <section className="space-y-4" aria-labelledby="comparison-title">
            <h2 id="comparison-title" className="text-2xl font-bold">3. Comparaison</h2>
            <div className="overflow-x-auto rounded-lg border bg-background">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-muted"><tr><th className="p-3">Option</th><th className="p-3">Adéquation</th><th className="p-3">Confiance</th><th className="p-3">Accès / mobilité</th><th className="p-3">Conditions</th><th className="p-3">Risques</th><th className="p-3">Action immédiate</th></tr></thead>
                <tbody>{recommendation.scenarios.map((scenario) => <tr key={scenario.id} className="border-t align-top"><td className="p-3 font-medium">{scenario.title}</td><td className="p-3">{Math.round(scenario.fitScore)}/100</td><td className="p-3">{confidenceLabels[scenario.confidence]}</td><td className="p-3">{scenario.localOpportunities.map((entry) => entry.zone).filter(Boolean).join(', ') || 'À confirmer'}</td><td className="p-3">{scenario.conditions[0] || 'À vérifier'}</td><td className="p-3">{scenario.risks[0] || 'Aucun risque documenté'}</td><td className="p-3">{scenario.firstActions[0]?.title || 'À définir'}</td></tr>)}</tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">La durée et le coût ne sont affichés que lorsqu’ils sont documentés dans le référentiel. Dans cette version, ils apparaissent parmi les informations à vérifier lorsqu’ils sont inconnus.</p>
          </section>
        )}

        {recommendation && (
          <section id="life-project-summary" className="space-y-4 rounded-lg border bg-background p-6 print:border-0 print:p-0" aria-labelledby="summary-title">
            <div className="flex flex-wrap items-center justify-between gap-3 print:block">
              <div><h2 id="summary-title" className="text-2xl font-bold">4. Synthèse remise au jeune</h2><p className="text-sm text-muted-foreground">Générée le {new Date(recommendation.generatedAt).toLocaleString('fr-FR')} · moteur {recommendation.engineVersion}</p></div>
              <Button type="button" variant="outline" className="print:hidden" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Imprimer ou enregistrer en PDF</Button>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div><h3 className="font-semibold">Votre situation</h3><p className="mt-2 text-sm">{String(diagnostic?.identity.situation.value || 'Situation à préciser')} · niveau {String(diagnostic?.identity.educationLevel.value || 'à préciser')} · {String(diagnostic?.identity.zone.value || 'zone à préciser')}</p><p className="mt-1 text-sm text-muted-foreground">Objectif : {diagnostic ? objectiveLabels[diagnostic.objective] : 'à clarifier'}. Intérêts : {diagnostic?.preferences.interests.join(', ') || 'à préciser'}.</p></div>
              <div><h3 className="font-semibold">Choix provisoire</h3><p className="mt-2 text-sm font-medium">{selectedScenario?.title || 'Aucun choix provisoire'}</p><p className="text-sm text-muted-foreground">Ce choix n’est pas une admission, un recrutement ou un financement garanti.</p></div>
              <div>{listBlock('Options retenues', recommendation.scenarios.map((scenario) => `${scenario.rank}. ${scenario.title} — ${Math.round(scenario.fitScore)}/100, confiance ${confidenceLabels[scenario.confidence].toLowerCase()}`))}</div>
              <div>{listBlock('Points restant à vérifier', summaryMissing)}</div>
              <div><h3 className="font-semibold">Action sous sept jours</h3><p className="mt-2 text-sm">{selectedScenario?.firstActions[0]?.title || 'Définir une première action avec le conseiller.'}</p><p className="text-sm text-muted-foreground">Preuve attendue : {selectedScenario?.firstActions[0]?.expectedEvidence || 'Une preuve observable à convenir.'}</p></div>
              <div><h3 className="font-semibold">Décision suivante</h3><p className="mt-2 text-sm">Vérifier les conditions locales, réaliser la première action, puis revoir le choix avec le conseiller avant toute inscription ou dépense.</p></div>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><FileText className="mr-2 inline h-4 w-4" />Limite : cette synthèse soutient une décision accompagnée. Elle ne remplace ni l’avis officiel de l’établissement, ni le règlement d’admission, ni une validation financière.</div>
          </section>
        )}
      </div>
    </div>
  );
}
