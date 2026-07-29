import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Compass, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  createProjectFromTriage,
  getCapabilityRegistry,
  getLifeProject,
  listLifeProjects,
  moveLifeProjectToClarification,
  selectLifeProjectScenario,
} from './api';
import type { LifeProjectEnvelope, LifeProjectSummary, TriageDraft } from './types';

const DRAFT_KEY = 'makoki.life-project.triage-draft.v1';
const CACHE_KEY = 'makoki.life-project.last-readable.v1';

const emptyDraft: TriageDraft = {
  situation: '',
  need: '',
  mobility: '',
  urgency: '',
  detail: '',
};

const readJson = <T,>(key: string): T | null => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
};

const stateLabels: Record<string, string> = {
  exploration: 'Exploration',
  clarification: 'Clarification',
  comparison: 'Comparaison',
  provisional_choice: 'Choix provisoire',
  preparation: 'Préparation',
  experimentation: 'Expérimentation',
  action: 'Action',
  follow_up: 'Suivi',
  confirmation: 'Confirmation',
  reorientation: 'Réorientation',
};

const situations = [
  ['college', 'Je suis au collège'],
  ['lycee', 'Je suis au lycée'],
  ['university', 'Je suis dans l’enseignement supérieur'],
  ['finished_school', 'J’ai terminé mon parcours scolaire'],
  ['left_school', 'J’ai interrompu ou abandonné mes études'],
  ['working', 'Je travaille actuellement'],
  ['job_seeking', 'Je cherche un emploi'],
  ['other', 'Ma situation est différente'],
];

const needs = [
  ['studies', 'Choisir ou poursuivre des études'],
  ['training', 'Trouver une formation'],
  ['employment', 'Préparer un emploi'],
  ['career_change', 'Changer de métier ou de domaine'],
  ['entrepreneurship', 'Explorer une activité ou un projet entrepreneurial'],
  ['skills', 'Développer mes compétences'],
  ['wellbeing', 'Retrouver un équilibre pour avancer'],
  ['uncertain', 'Je ne sais pas encore'],
];

const fieldClass = 'mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function LifeProjectPage() {
  const [capability, setCapability] = useState<'loading' | 'enabled' | 'disabled' | 'error'>('loading');
  const [projects, setProjects] = useState<LifeProjectSummary[]>([]);
  const [current, setCurrent] = useState<LifeProjectEnvelope | null>(null);
  const [draft, setDraft] = useState<TriageDraft>(() => readJson<TriageDraft>(DRAFT_KEY) || emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(() => navigator.onLine);
  const [cached, setCached] = useState(false);

  const persistEnvelope = useCallback((envelope: LifeProjectEnvelope) => {
    setCurrent(envelope);
    setCached(false);
    localStorage.setItem(CACHE_KEY, JSON.stringify(envelope));
  }, []);

  const loadProject = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const envelope = await getLifeProject(projectId);
      persistEnvelope(envelope);
    } catch (loadError) {
      const local = readJson<LifeProjectEnvelope>(CACHE_KEY);
      if (local?.project.id === projectId) {
        setCurrent(local);
        setCached(true);
        setError('La version enregistrée sur cet appareil est affichée. La synchronisation sera retentée avec une connexion disponible.');
      } else {
        setError(loadError instanceof Error ? loadError.message : 'Le projet ne peut pas être chargé.');
      }
    } finally {
      setLoading(false);
    }
  }, [persistEnvelope]);

  const initialise = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const registry = await getCapabilityRegistry();
      const entry = registry.capabilities.find((item) => item.id === 'life-project.core-v1');
      if (!entry || !entry.configured || !['active', 'experimental'].includes(entry.status)) {
        setCapability('disabled');
        setCurrent(null);
        return;
      }
      setCapability('enabled');
      const response = await listLifeProjects();
      setProjects(response.projects);
      if (response.projects.length > 0) {
        await loadProject(response.projects[0].id);
      }
    } catch (loadError) {
      const local = readJson<LifeProjectEnvelope>(CACHE_KEY);
      if (local) {
        setCapability('enabled');
        setCurrent(local);
        setCached(true);
        setError('Connexion indisponible : la dernière version enregistrée est affichée en lecture seule.');
      } else {
        setCapability('error');
        setError(loadError instanceof Error ? loadError.message : 'Le Parcours MAKOKI est momentanément indisponible.');
      }
    } finally {
      setLoading(false);
    }
  }, [loadProject]);

  useEffect(() => {
    void initialise();
  }, [initialise]);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateDraft = (field: keyof TriageDraft, value: string) => {
    const next = { ...draft, [field]: value };
    setDraft(next);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
  };

  const createProject = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.situation || !draft.need || !draft.mobility || !draft.urgency) {
      setError('Renseignez les quatre premières étapes du triage.');
      return;
    }
    if (!online) {
      setError('Le brouillon est conservé sur cet appareil. Une connexion est nécessaire pour créer le projet.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const envelope = await createProjectFromTriage(draft);
      persistEnvelope(envelope);
      setProjects((existing) => [{
        id: envelope.project.id,
        title: envelope.project.title,
        state: envelope.project.state,
        persistenceVersion: envelope.persistenceVersion,
      }, ...existing.filter((item) => item.id !== envelope.project.id)]);
      localStorage.removeItem(DRAFT_KEY);
      setDraft(emptyDraft);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Le projet n’a pas pu être créé. Le brouillon reste enregistré.');
    } finally {
      setSaving(false);
    }
  };

  const chooseScenario = async (scenarioId: string) => {
    if (!current || !online || cached) return;
    setSaving(true);
    setError(null);
    try {
      persistEnvelope(await selectLifeProjectScenario(
        current.project.id,
        scenarioId,
        current.persistenceVersion,
      ));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Le scénario n’a pas pu être sélectionné.');
    } finally {
      setSaving(false);
    }
  };

  const clarify = async () => {
    if (!current || !online || cached) return;
    setSaving(true);
    setError(null);
    try {
      persistEnvelope(await moveLifeProjectToClarification(
        current.project.id,
        current.persistenceVersion,
      ));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Le projet n’a pas pu évoluer.');
    } finally {
      setSaving(false);
    }
  };

  const nextActions = useMemo(() => {
    if (!current) return [];
    const actions: string[] = [];
    if (!current.project.activeScenarioId && current.project.scenarios.length > 0) {
      actions.push('Choisir provisoirement un scénario à vérifier.');
    }
    if (current.project.missingInformation.length > 0) {
      actions.push(`Préciser : ${current.project.missingInformation[0]}.`);
    }
    if (current.project.actionPlans.length === 0) {
      actions.push('Transformer le scénario retenu en premières actions observables.');
    }
    if (current.project.state === 'exploration') {
      actions.push('Passer en clarification lorsque les premières pistes sont suffisamment comprises.');
    }
    return actions.slice(0, 4);
  }, [current]);

  if (capability === 'loading' || (loading && !current)) {
    return <div className="flex min-h-[60vh] items-center justify-center" role="status"><Loader2 className="h-8 w-8 animate-spin" /><span className="sr-only">Chargement du Parcours MAKOKI</span></div>;
  }

  if (capability === 'disabled') {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Card>
          <CardHeader><CardTitle>Parcours MAKOKI non activé</CardTitle><CardDescription>Cette fonctionnalité expérimentale reste masquée tant que l’API correspondante n’est pas activée.</CardDescription></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Les tests et services existants restent accessibles. Aucun projet de vie n’est annoncé comme disponible dans cet environnement.</p></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-5xl space-y-6 px-4 py-8 sm:py-12">
        <header className="space-y-3">
          <Badge variant="secondary" className="w-fit">Expérimental</Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Construire mon projet de vie</h1>
          <p className="max-w-3xl text-muted-foreground">Makoki organise votre situation déclarée, plusieurs possibilités et les prochaines étapes. Il ne choisit pas votre avenir et ne garantit ni admission, ni emploi, ni réussite.</p>
        </header>

        {!online && <div role="status" className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900"><WifiOff className="mt-0.5 h-5 w-5 shrink-0" /><p>Vous êtes hors ligne. Le brouillon et la dernière version lisible restent disponibles sur cet appareil.</p></div>}
        {error && <div role="alert" className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><p>{error}</p></div>}

        {current ? (
          <div className="space-y-6" data-testid="life-project-shell">
            {projects.length > 1 && (
              <label className="block text-sm font-medium">Projet affiché
                <select className={fieldClass} value={current.project.id} onChange={(event) => void loadProject(event.target.value)}>
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
                </select>
              </label>
            )}

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div><CardTitle>{current.project.title}</CardTitle><CardDescription className="mt-2">{current.project.purpose}</CardDescription></div>
                  <Badge>{stateLabels[current.project.state] || current.project.state}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {cached && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">Version locale en lecture seule.</p>}
                <div>
                  <h2 className="font-semibold">Scénarios à explorer</h2>
                  {current.project.scenarios.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Le projet existe, mais son premier scénario n’a pas encore été enregistré. Rechargez avec une connexion stable.</p> : (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {current.project.scenarios.map((scenario) => {
                        const selected = current.project.activeScenarioId === scenario.id;
                        return <div key={scenario.id} className="rounded-lg border bg-background p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-medium">{scenario.title}</h3>{selected && <CheckCircle2 className="h-5 w-5 text-green-600" aria-label="Scénario choisi" />}</div><p className="mt-2 text-sm text-muted-foreground">{scenario.description}</p>{!selected && <Button className="mt-4 w-full" variant="outline" disabled={saving || !online || cached} onClick={() => void chooseScenario(scenario.id)}>Choisir provisoirement</Button>}</div>;
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="font-semibold">Prochaines étapes</h2>
                  <ol className="mt-3 space-y-2">
                    {nextActions.map((action, index) => <li key={action} className="flex gap-3 rounded-md bg-muted p-3 text-sm"><span className="font-semibold">{index + 1}.</span><span>{action}</span></li>)}
                  </ol>
                </div>

                {current.project.state === 'exploration' && (
                  <Button disabled={saving || !online || cached} onClick={() => void clarify()}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}Passer à la clarification</Button>
                )}
              </CardContent>
            </Card>

            <Button variant="outline" onClick={() => void initialise()} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />Actualiser</Button>
          </div>
        ) : (
          <Card data-testid="life-project-triage">
            <CardHeader><CardTitle className="flex items-center gap-2"><Compass className="h-5 w-5" />Où en êtes-vous aujourd’hui ?</CardTitle><CardDescription>Ces réponses sont des déclarations de départ, pas des faits vérifiés. Elles servent à créer une première hypothèse de parcours que vous pourrez corriger.</CardDescription></CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={(event) => void createProject(event)}>
                <label className="block text-sm font-medium">Ma situation actuelle
                  <select required className={fieldClass} value={draft.situation} onChange={(event) => updateDraft('situation', event.target.value)}><option value="">Choisir une situation</option>{situations.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                </label>
                <label className="block text-sm font-medium">Mon besoin principal
                  <select required className={fieldClass} value={draft.need} onChange={(event) => updateDraft('need', event.target.value)}><option value="">Choisir un besoin</option>{needs.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                </label>
                <label className="block text-sm font-medium">Où envisager les possibilités ?
                  <select required className={fieldClass} value={draft.mobility} onChange={(event) => updateDraft('mobility', event.target.value)}><option value="">Choisir</option><option value="local">Dans mon environnement actuel</option><option value="abroad">À l’étranger</option><option value="online">À distance</option><option value="compare">Comparer local, étranger et distance</option><option value="unknown">Je ne sais pas encore</option></select>
                </label>
                <label className="block text-sm font-medium">À quel horizon souhaitez-vous avancer ?
                  <select required className={fieldClass} value={draft.urgency} onChange={(event) => updateDraft('urgency', event.target.value)}><option value="">Choisir</option><option value="now">J’ai besoin d’une première action rapidement</option><option value="months">Dans les prochains mois</option><option value="year">Sur une année ou plus</option><option value="explore">Je veux d’abord comprendre mes possibilités</option></select>
                </label>
                <label className="block text-sm font-medium">Une précision utile <span className="font-normal text-muted-foreground">(facultatif)</span>
                  <textarea className={`${fieldClass} min-h-24`} value={draft.detail} onChange={(event) => updateDraft('detail', event.target.value)} maxLength={500} placeholder="Décrivez une contrainte, une idée, une responsabilité ou une question importante." />
                </label>
                <Button type="submit" className="w-full sm:w-auto" disabled={saving || !online}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer mon premier projet</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
