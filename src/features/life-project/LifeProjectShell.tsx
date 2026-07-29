import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CloudOff,
  Loader2,
  RefreshCw,
  Route,
} from 'lucide-react';
import { isLifeProjectFrontendEnabled } from './config';
import {
  createProjectFromTriage,
  getLifeProject,
  getLifeProjectCapability,
  listLifeProjects,
} from './lifeProjectApi';
import type { LifeProject, TriageInput } from './types';

const STATE_LABELS: Record<LifeProject['state'], string> = {
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

const SITUATIONS = [
  'Je suis élève ou étudiant',
  'Je cherche un emploi',
  'Je travaille déjà',
  'Je souhaite changer de voie',
  'Je développe une activité',
];

const NEEDS = [
  'Clarifier mon orientation',
  'Choisir une étude ou une formation',
  'Construire une piste professionnelle',
  'Préparer une reconversion',
  'Développer une activité',
];

interface Props {
  frontendEnabled?: boolean;
}

export default function LifeProjectShell({
  frontendEnabled = isLifeProjectFrontendEnabled(),
}: Props) {
  const [project, setProject] = useState<LifeProject | null>(null);
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'ready' | 'unavailable' | 'error'
  >('idle');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const load = useCallback(async () => {
    if (!frontendEnabled) {
      setStatus('unavailable');
      return;
    }
    if (!navigator.onLine) {
      setStatus('ready');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const capability = await getLifeProjectCapability();
      if (!capability?.configured || capability.status === 'disabled') {
        setStatus('unavailable');
        return;
      }
      const projects = await listLifeProjects();
      if (projects.length === 0) {
        setProject(null);
        setStatus('ready');
        return;
      }
      const loaded = await getLifeProject(projects[0].id);
      setProject(loaded.project);
      setStatus('ready');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Le parcours ne peut pas être chargé.');
      setStatus('error');
    }
  }, [frontendEnabled]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveTriage = async (input: TriageInput) => {
    if (!online || saving) return;
    setSaving(true);
    setError('');
    try {
      const loaded = await createProjectFromTriage(input);
      setProject(loaded.project);
      setStatus('ready');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'La sauvegarde a échoué.');
    } finally {
      setSaving(false);
    }
  };

  if (!frontendEnabled || status === 'unavailable') return null;

  if (status === 'loading' || status === 'idle') {
    return (
      <section className="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center px-4">
        <p className="flex items-center gap-3 text-slate-700" role="status" aria-live="polite">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          Reprise de votre parcours…
        </p>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="mx-auto max-w-xl px-4 py-12 text-center" role="alert">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-orange-600" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-slate-950">Parcours momentanément indisponible</h1>
        <p className="mt-3 text-slate-700">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Réessayer
        </button>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50">
      {!online && (
        <div className="bg-amber-100 px-4 py-3 text-center text-sm font-medium text-amber-950" role="status">
          <CloudOff className="mr-2 inline h-4 w-4" aria-hidden="true" />
          Vous êtes hors ligne. La consultation reste possible, mais la sauvegarde attendra la reconnexion.
        </div>
      )}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {project
          ? <ProjectOverview project={project} />
          : <TriageForm disabled={!online || saving} saving={saving} error={error} onSubmit={saveTriage} />}
      </div>
    </section>
  );
}

function TriageForm({
  disabled,
  saving,
  error,
  onSubmit,
}: {
  disabled: boolean;
  saving: boolean;
  error: string;
  onSubmit: (input: TriageInput) => Promise<void>;
}) {
  const [situation, setSituation] = useState('');
  const [need, setNeed] = useState('');
  const title = need || 'Mon parcours MAKOKI';

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Parcours MAKOKI</p>
      <h1 className="mt-2 text-3xl font-bold text-blue-950 sm:text-4xl">Commençons par votre situation</h1>
      <p className="mt-4 text-lg text-slate-700">
        Deux réponses suffisent pour enregistrer un premier projet. Vous pourrez le reprendre plus tard.
      </p>
      <form
        className="mt-8 space-y-8"
        onSubmit={(event) => {
          event.preventDefault();
          if (situation && need) void onSubmit({ situation, need, title });
        }}
      >
        <ChoiceGroup legend="Quelle est votre situation actuelle ?" name="situation" options={SITUATIONS} value={situation} onChange={setSituation} />
        <ChoiceGroup legend="De quoi avez-vous besoin maintenant ?" name="need" options={NEEDS} value={need} onChange={setNeed} />
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
        <button
          type="submit"
          disabled={disabled || !situation || !need}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-950 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-5 w-5" aria-hidden="true" />}
          {saving ? 'Sauvegarde…' : 'Créer mon parcours'}
        </button>
      </form>
    </div>
  );
}

function ChoiceGroup({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-lg font-semibold text-slate-950">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option} className={`flex min-h-12 cursor-pointer items-center rounded-xl border p-4 ${value === option ? 'border-blue-800 bg-blue-50' : 'border-slate-300 bg-white'}`}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="mr-3 h-4 w-4"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ProjectOverview({ project }: { project: LifeProject }) {
  const activeScenario = project.scenarios.find((scenario) => scenario.id === project.activeScenarioId);
  const nextActions = useMemo(
    () => project.actionPlans
      .filter((plan) => plan.status === 'active' || plan.status === 'draft')
      .flatMap((plan) => plan.items)
      .filter((item) => item.status === 'planned' || item.status === 'in_progress'),
    [project.actionPlans],
  );
  const missingInformation = [
    ...project.missingInformation,
    ...project.scenarios.flatMap((scenario) => scenario.missingInformation),
  ].filter((value, index, all) => all.indexOf(value) === index);

  return (
    <>
      <header className="rounded-2xl bg-blue-950 p-6 text-white sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">Parcours MAKOKI</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">{project.title}</h1>
            {project.purpose && <p className="mt-3 max-w-2xl text-blue-100">{project.purpose}</p>}
          </div>
          <span className="w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
            {STATE_LABELS[project.state]}
          </span>
        </div>
      </header>

      <div className="mt-6 rounded-xl border-l-4 border-orange-500 bg-orange-50 p-4 text-sm text-slate-800">
        Ce parcours s’appuie d’abord sur vos informations déclarées. Les pistes restent à vérifier :
        elles ne garantissent ni emploi, ni admission, ni réussite.
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-blue-950">
            <Route className="h-5 w-5 text-orange-600" aria-hidden="true" />
            Scénarios à explorer
          </h2>
          <div className="mt-4 space-y-3">
            {project.scenarios.length === 0
              ? <p className="text-slate-600">Aucun scénario enregistré pour le moment.</p>
              : project.scenarios.map((scenario) => (
                <div key={scenario.id} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-slate-950">{scenario.title}</h3>
                    {activeScenario?.id === scenario.id && (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">Actif</span>
                    )}
                  </div>
                  {scenario.description && <p className="mt-2 text-sm text-slate-700">{scenario.description}</p>}
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    {scenario.status === 'exploring' ? 'À explorer' : scenario.status}
                  </p>
                </div>
              ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-bold text-blue-950">Informations à compléter</h2>
          {missingInformation.length === 0
            ? <p className="mt-4 flex gap-2 text-emerald-800"><CheckCircle2 className="h-5 w-5" aria-hidden="true" />Aucune information manquante signalée.</p>
            : (
              <ul className="mt-4 space-y-3">
                {missingInformation.map((item) => (
                  <li key={item} className="flex gap-3 text-slate-700">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
        </article>
      </div>

      <article className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="text-xl font-bold text-blue-950">Prochaines actions</h2>
        {nextActions.length === 0
          ? <p className="mt-3 text-slate-600">Les prochaines actions apparaîtront après la clarification d’un scénario.</p>
          : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {nextActions.map((item) => (
                <li key={item.id} className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">{item.title}</p>
                  {item.description && <p className="mt-1 text-sm text-slate-700">{item.description}</p>}
                </li>
              ))}
            </ul>
          )}
      </article>
    </>
  );
}
