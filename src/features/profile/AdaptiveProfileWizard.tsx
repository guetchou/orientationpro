import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Loader2,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { getStoredUserData } from '@/lib/apiClient';
import {
  decideProfileHypothesis,
  getAdaptiveProfile,
  saveDeclaredSkills,
  saveEducationHistory,
  saveProfileDetails,
  searchEscoSkills,
} from './profileApi';
import type {
  EducationRecord,
  EscoSkillSuggestion,
  ProfileHypothesis,
  ProfileInput,
  ProfileSkill,
} from './profileApi';

const selectClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

const situationLabels = {
  student: 'Étudiant ou lycéen',
  employee: 'En emploi',
  job_seeker: "En recherche d'emploi",
  entrepreneur: 'Entrepreneur',
  career_change: 'En reconversion',
  other: 'Autre situation',
} as const;

const goalLabels = {
  choose_studies: 'Choisir mes études',
  find_job: 'Trouver un emploi',
  career_change: 'Réussir ma reconversion',
  improve_skills: 'Développer mes compétences',
  start_business: 'Créer une activité',
  other: 'Clarifier mon projet',
} as const;

const mobilityLabels = {
  local: 'Dans ma ville',
  national: 'Partout dans mon pays',
  international: "À l'international",
  remote: 'À distance',
  unknown: 'Je ne sais pas encore',
} as const;

const educationLabels = {
  primary: 'Primaire',
  middle_school: 'Collège',
  high_school: 'Lycée',
  baccalaureate: 'Baccalauréat',
  vocational: 'Formation professionnelle',
  bac_plus_1: 'Bac +1',
  bac_plus_2: 'Bac +2',
  licence: 'Licence / Bac +3',
  master: 'Master / Bac +5',
  doctorate: 'Doctorat',
  other: 'Autre niveau',
} as const;

const educationStatusLabels = {
  in_progress: 'En cours',
  completed: 'Terminé',
  interrupted: 'Interrompu',
} as const;

const proficiencyLabels = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
  expert: 'Expert',
  unknown: 'Non évalué',
} as const;

const sourceLabels = {
  declared: 'Déclarée',
  test: 'Test',
  cv: 'CV',
  inferred: 'Proposée',
} as const;

const emptyProfile: ProfileInput = {
  first_name: null,
  last_name: null,
  phone: null,
  city: null,
  country_code: 'CG',
  current_situation: null,
  primary_goal: null,
  mobility_scope: null,
  profile_summary: null,
};

const emptyEducation = (): EducationRecord => ({
  education_level: 'baccalaureate',
  status: 'in_progress',
  diploma_name: null,
  field_of_study: null,
  institution: null,
  country_code: 'CG',
  start_year: null,
  end_year: null,
});

interface LocalDraft {
  activeStep: number;
  profile: ProfileInput;
  education: EducationRecord[];
  skills: ProfileSkill[];
  savedAt: string;
}

// Une étape n'est enregistrée côté serveur qu'au clic sur « Enregistrer et
// continuer » (issue #151) : sans brouillon local, fermer l'onglet en cours
// de saisie perd les champs. Repris du pattern déjà éprouvé dans RiasecTest.tsx.
const draftKey = (userId: string | number | undefined) => `makoki.profile.draft.v1.${userId ?? 'anonymous'}`;

const readDraft = (userId: string | number | undefined): LocalDraft | null => {
  try {
    const raw = localStorage.getItem(draftKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(draftKey(userId));
    return null;
  }
};

const displayHypothesisValue = (value: unknown) => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(String).join(', ');
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key} : ${String(item)}`)
      .join(' · ');
  }
  return 'Proposition à examiner';
};

type StepKey = 'identity' | 'objective' | 'education' | 'skills' | 'hypotheses' | 'summary';
interface StepDefinition { key: StepKey; label: string; description: string }

export default function AdaptiveProfileWizard() {
  const storedUser = getStoredUserData();
  const [profile, setProfile] = useState<ProfileInput>(emptyProfile);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [education, setEducation] = useState<EducationRecord[]>([]);
  const [skills, setSkills] = useState<ProfileSkill[]>([]);
  const [hypotheses, setHypotheses] = useState<ProfileHypothesis[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillQuery, setSkillQuery] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<EscoSkillSuggestion[]>([]);
  const [searchingSkills, setSearchingSkills] = useState(false);
  const [skillSearchError, setSkillSearchError] = useState<string | null>(null);
  const [decidingHypothesis, setDecidingHypothesis] = useState<string | null>(null);
  const [resumedFromDraft, setResumedFromDraft] = useState(false);

  const proposedHypotheses = useMemo(
    () => hypotheses.filter((hypothesis) => hypothesis.status === 'proposed'),
    [hypotheses],
  );
  const showEducation = Boolean(
    profile.current_situation
      && ['student', 'job_seeker', 'career_change'].includes(profile.current_situation),
  ) || ['choose_studies', 'improve_skills', 'career_change'].includes(profile.primary_goal || '');
  const steps = useMemo<StepDefinition[]>(() => [
    { key: 'identity', label: 'Vous', description: 'Vos informations essentielles' },
    { key: 'objective', label: 'Projet', description: 'Votre situation et votre objectif' },
    ...(showEducation
      ? [{ key: 'education' as const, label: 'Études', description: 'Votre parcours scolaire et académique' }]
      : []),
    { key: 'skills', label: 'Compétences', description: 'Ce que vous savez déjà faire' },
    ...(proposedHypotheses.length
      ? [{ key: 'hypotheses' as const, label: 'Suggestions', description: 'Confirmez ou refusez nos propositions' }]
      : []),
    { key: 'summary', label: 'Synthèse', description: 'Relisez et finalisez votre profil' },
  ], [proposedHypotheses.length, showEducation]);
  const currentStep = steps[Math.min(activeStep, steps.length - 1)];
  const declaredSkills = skills.filter((skill) => !skill.source || skill.source === 'declared');
  const sourcedSkills = skills.filter((skill) => skill.source && skill.source !== 'declared');
  const progressValue = Math.round(((activeStep + 1) / steps.length) * 100);

  const applyPayload = (payload: Awaited<ReturnType<typeof getAdaptiveProfile>>) => {
    const next = payload.profile;
    setProfile({
      first_name: next?.first_name ?? null,
      last_name: next?.last_name ?? null,
      phone: next?.phone ?? null,
      city: next?.city ?? null,
      country_code: next?.country_code ?? 'CG',
      current_situation: next?.current_situation ?? null,
      primary_goal: next?.primary_goal ?? null,
      mobility_scope: next?.mobility_scope ?? null,
      profile_summary: next?.profile_summary ?? null,
    });
    setCompletionPercent(next?.completion_percent ?? 0);
    setEducation(payload.education || []);
    setSkills(payload.skills || []);
    setHypotheses(payload.hypotheses || []);
  };

  useEffect(() => {
    void getAdaptiveProfile()
      .then((payload) => {
        applyPayload(payload);
        const draft = readDraft(storedUser?.id);
        if (draft) {
          setProfile(draft.profile);
          setEducation(draft.education);
          setSkills(draft.skills);
          setActiveStep(draft.activeStep);
          setResumedFromDraft(true);
        }
      })
      .catch((error) => {
        console.error('Unable to load adaptive profile', error);
        toast.error('Impossible de charger votre profil. Vérifiez votre session.');
      })
      .finally(() => setLoading(false));
    // Le brouillon local n'est lu qu'au montage : storedUser vient de localStorage,
    // pas d'un état réactif, et une session ne change pas sans remontage du composant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;
    const draft: LocalDraft = { activeStep, profile, education, skills, savedAt: new Date().toISOString() };
    localStorage.setItem(draftKey(storedUser?.id), JSON.stringify(draft));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, profile, education, skills, loading]);

  useEffect(() => {
    if (activeStep >= steps.length) setActiveStep(Math.max(steps.length - 1, 0));
  }, [activeStep, steps.length]);

  useEffect(() => {
    const query = skillQuery.trim();
    if (query.length < 2) {
      setSkillSuggestions([]);
      setSkillSearchError(null);
      return undefined;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearchingSkills(true);
      setSkillSearchError(null);
      void searchEscoSkills(query, { locale: 'fr', limit: 8, signal: controller.signal })
        .then((result) => setSkillSuggestions(result.skills))
        .catch((error) => {
          if (controller.signal.aborted) return;
          console.error('ESCO skill search failed', error);
          setSkillSearchError('La recherche ESCO est indisponible. Vous pouvez ajouter un libellé libre.');
          setSkillSuggestions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearchingSkills(false);
        });
    }, 300);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [skillQuery]);

  const updateProfile = <Key extends keyof ProfileInput>(key: Key, value: ProfileInput[Key]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };
  const updateEducation = (index: number, patch: Partial<EducationRecord>) => {
    setEducation((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, ...patch } : item
    )));
  };

  const saveStep = async (step: StepKey) => {
    if (step === 'education') {
      return saveEducationHistory(education.map(({ id: _id, ...entry }) => entry));
    }
    if (step === 'skills') {
      return saveDeclaredSkills(declaredSkills.map(({
        id: _id,
        source: _source,
        confirmation_status: _status,
        ...skill
      }) => skill));
    }
    if (step === 'hypotheses') return null;
    return saveProfileDetails(profile);
  };

  const moveTo = async (target: number) => {
    if (!currentStep || target === activeStep || saving) return;
    setSaving(true);
    try {
      const payload = await saveStep(currentStep.key);
      if (payload) applyPayload(payload);
      setActiveStep(Math.max(0, Math.min(target, steps.length - 1)));
    } catch (error) {
      console.error('Unable to save profile step', error);
      toast.error("Impossible d'enregistrer cette étape.");
    } finally {
      setSaving(false);
    }
  };

  const finish = async () => {
    if (!currentStep || saving) return;
    setSaving(true);
    try {
      const payload = await saveStep(currentStep.key);
      if (payload) applyPayload(payload);
      localStorage.removeItem(draftKey(storedUser?.id));
      setResumedFromDraft(false);
      toast.success('Votre profil intelligent est à jour.');
    } catch (error) {
      console.error('Unable to finish adaptive profile', error);
      toast.error("Impossible d'enregistrer la synthèse.");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (suggestion: EscoSkillSuggestion) => {
    if (skills.some((skill) => skill.esco_uri === suggestion.esco_uri)) {
      toast.info('Cette compétence est déjà dans votre profil.');
      return;
    }
    setSkills((current) => [...current, {
      label: suggestion.label,
      esco_uri: suggestion.esco_uri,
      proficiency: 'unknown',
      source: 'declared',
      confirmation_status: 'confirmed',
    }]);
    setSkillQuery('');
    setSkillSuggestions([]);
  };

  const addManualSkill = () => {
    const label = skillQuery.trim();
    if (label.length < 2) return;
    if (skills.some((skill) => skill.label.toLocaleLowerCase('fr') === label.toLocaleLowerCase('fr'))) {
      toast.info('Cette compétence est déjà dans votre profil.');
      return;
    }
    setSkills((current) => [...current, {
      label,
      esco_uri: null,
      proficiency: 'unknown',
      source: 'declared',
      confirmation_status: 'confirmed',
    }]);
    setSkillQuery('');
    setSkillSuggestions([]);
  };

  const decideHypothesis = async (hypothesisId: string, status: 'confirmed' | 'rejected') => {
    setDecidingHypothesis(hypothesisId);
    try {
      applyPayload(await decideProfileHypothesis(hypothesisId, status));
      toast.success(status === 'confirmed' ? 'Suggestion confirmée.' : 'Suggestion refusée.');
    } catch (error) {
      console.error('Unable to decide profile hypothesis', error);
      toast.error('Impossible de traiter cette suggestion.');
    } finally {
      setDecidingHypothesis(null);
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center" aria-label="Chargement du profil"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {resumedFromDraft && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <Save className="h-4 w-4 shrink-0" /> Brouillon local repris sur cet appareil.
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight"><Sparkles className="h-6 w-6 text-blue-600" /> Mon profil intelligent</h2>
                <CardDescription className="mt-2 max-w-2xl">Répondez uniquement aux questions utiles à votre situation. Chaque section est enregistrée avant de changer d’étape.</CardDescription>
              </div>
              <Badge variant="secondary">Complété à {completionPercent} %</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex justify-between text-sm text-gray-600"><span>Étape {activeStep + 1} sur {steps.length}</span><span>{currentStep?.label}</span></div>
            <Progress value={progressValue} aria-label={`Progression : ${progressValue} %`} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Compte Auth V1</CardTitle><CardDescription>Source sécurisée du profil</CardDescription></CardHeader>
          <CardContent className="space-y-2 text-sm"><p className="truncate font-medium">{storedUser?.email || 'Session active'}</p><p className="text-gray-500">Données isolées par compte dans MySQL.</p></CardContent>
        </Card>
      </div>

      <ol aria-label="Progression du profil" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        {steps.map((step, index) => (
          <li key={step.key} aria-current={index === activeStep ? 'step' : undefined} className={`rounded-lg border p-3 text-sm ${index === activeStep ? 'border-blue-500 bg-blue-50' : index < activeStep ? 'border-emerald-200 bg-emerald-50' : 'bg-white'}`}>
            <span className="flex items-center gap-2 font-semibold"><span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${index <= activeStep ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{index < activeStep ? <Check className="h-3.5 w-3.5" /> : index + 1}</span>{step.label}</span>
          </li>
        ))}
      </ol>

      <Card aria-labelledby="profile-step-title">
        <CardHeader><CardTitle id="profile-step-title">{currentStep?.label}</CardTitle><CardDescription>{currentStep?.description}</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          {currentStep?.key === 'identity' && (
            <section className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label htmlFor="first_name">Prénom</Label><Input id="first_name" autoComplete="given-name" value={profile.first_name || ''} onChange={(event) => updateProfile('first_name', event.target.value || null)} /></div>
                <div><Label htmlFor="last_name">Nom</Label><Input id="last_name" autoComplete="family-name" value={profile.last_name || ''} onChange={(event) => updateProfile('last_name', event.target.value || null)} /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div><Label htmlFor="phone">Téléphone <span className="text-gray-500">(facultatif)</span></Label><Input id="phone" type="tel" autoComplete="tel" value={profile.phone || ''} onChange={(event) => updateProfile('phone', event.target.value || null)} /><p className="mt-1 text-xs text-gray-500">Sert uniquement à vous recontacter si nécessaire.</p></div>
                <div><Label htmlFor="email">E-mail du compte</Label><Input id="email" value={storedUser?.email || ''} disabled /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-[1fr_120px]">
                <div><Label htmlFor="city">Ville de résidence</Label><Input id="city" autoComplete="address-level2" value={profile.city || ''} onChange={(event) => updateProfile('city', event.target.value || null)} /></div>
                <div><Label htmlFor="country_code">Pays</Label><Input id="country_code" maxLength={2} value={profile.country_code || ''} onChange={(event) => updateProfile('country_code', event.target.value.toUpperCase() || null)} /><p className="mt-1 text-xs text-gray-500">Code ISO, ex. CG</p></div>
              </div>
            </section>
          )}

          {currentStep?.key === 'objective' && (
            <section className="space-y-5">
              <div><Label htmlFor="current_situation">Situation actuelle</Label><select id="current_situation" className={selectClassName} value={profile.current_situation || ''} onChange={(event) => updateProfile('current_situation', (event.target.value || null) as ProfileInput['current_situation'])}><option value="">Sélectionnez</option>{Object.entries(situationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
              <div><Label htmlFor="primary_goal">Objectif prioritaire</Label><select id="primary_goal" className={selectClassName} value={profile.primary_goal || ''} onChange={(event) => updateProfile('primary_goal', (event.target.value || null) as ProfileInput['primary_goal'])}><option value="">Sélectionnez</option>{Object.entries(goalLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
              <div><Label htmlFor="mobility_scope">Mobilité</Label><select id="mobility_scope" className={selectClassName} value={profile.mobility_scope || ''} onChange={(event) => updateProfile('mobility_scope', (event.target.value || null) as ProfileInput['mobility_scope'])}><option value="">Sélectionnez</option>{Object.entries(mobilityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
              {!showEducation && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Le questionnaire scolaire détaillé n’est pas nécessaire pour votre situation. Vos diplômes existants restent conservés.</p>}
            </section>
          )}

          {currentStep?.key === 'education' && (
            <section className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Parcours d’études</h3><p className="text-sm text-gray-500">Étape facultative, modifiable à tout moment.</p></div><Button type="button" variant="outline" onClick={() => setEducation((current) => [...current, emptyEducation()])}><Plus className="mr-2 h-4 w-4" /> Ajouter</Button></div>
              {!education.length && <div className="rounded-lg border border-dashed p-8 text-center"><BookOpen className="mx-auto mb-3 h-8 w-8 text-gray-400" /><p className="font-medium">Aucune formation ajoutée</p></div>}
              {education.map((entry, index) => (
                <div key={entry.id || index} className="space-y-4 rounded-xl border p-4">
                  <div className="flex items-center justify-between"><h4 className="font-semibold">Formation {index + 1}</h4><Button type="button" variant="ghost" size="sm" onClick={() => setEducation((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="mr-2 h-4 w-4" /> Retirer</Button></div>
                  <div className="grid gap-4 md:grid-cols-2"><div><Label htmlFor={`level-${index}`}>Niveau</Label><select id={`level-${index}`} className={selectClassName} value={entry.education_level} onChange={(event) => updateEducation(index, { education_level: event.target.value as EducationRecord['education_level'] })}>{Object.entries(educationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div><Label htmlFor={`status-${index}`}>Statut</Label><select id={`status-${index}`} className={selectClassName} value={entry.status} onChange={(event) => updateEducation(index, { status: event.target.value as EducationRecord['status'] })}>{Object.entries(educationStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
                  <div className="grid gap-4 md:grid-cols-2"><div><Label htmlFor={`diploma-${index}`}>Diplôme</Label><Input id={`diploma-${index}`} value={entry.diploma_name || ''} onChange={(event) => updateEducation(index, { diploma_name: event.target.value || null })} /></div><div><Label htmlFor={`field-${index}`}>Domaine</Label><Input id={`field-${index}`} value={entry.field_of_study || ''} onChange={(event) => updateEducation(index, { field_of_study: event.target.value || null })} /></div></div>
                  <div><Label htmlFor={`institution-${index}`}>Établissement</Label><Input id={`institution-${index}`} value={entry.institution || ''} onChange={(event) => updateEducation(index, { institution: event.target.value || null })} /></div>
                  <div className="grid gap-4 md:grid-cols-3"><div><Label htmlFor={`start-${index}`}>Début</Label><Input id={`start-${index}`} inputMode="numeric" value={entry.start_year || ''} onChange={(event) => updateEducation(index, { start_year: event.target.value ? Number(event.target.value) : null })} /></div><div><Label htmlFor={`end-${index}`}>Fin</Label><Input id={`end-${index}`} inputMode="numeric" value={entry.end_year || ''} onChange={(event) => updateEducation(index, { end_year: event.target.value ? Number(event.target.value) : null })} /></div><div><Label htmlFor={`country-${index}`}>Pays</Label><Input id={`country-${index}`} maxLength={2} value={entry.country_code || ''} onChange={(event) => updateEducation(index, { country_code: event.target.value.toUpperCase() || null })} /></div></div>
                </div>
              ))}
            </section>
          )}

          {currentStep?.key === 'skills' && (
            <section className="space-y-6">
              <div><Label htmlFor="skill-search">Rechercher une compétence</Label><div className="relative mt-1"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input id="skill-search" type="search" className="pl-9" value={skillQuery} onChange={(event) => setSkillQuery(event.target.value)} placeholder="Ex. analyser des données…" />{searchingSkills && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />}</div><p className="mt-2 text-xs text-gray-500">Catalogue ESCO français installé sur MAKOKI.</p><div aria-live="polite">{skillSearchError && <p className="mt-2 text-sm text-amber-700">{skillSearchError}</p>}</div>
                {skillSuggestions.length > 0 && <ul aria-label="Suggestions de compétences ESCO" className="mt-2 max-h-72 overflow-auto rounded-lg border bg-white shadow-lg">{skillSuggestions.map((suggestion) => <li key={suggestion.id} className="border-b last:border-b-0"><button type="button" className="w-full p-3 text-left hover:bg-blue-50" onClick={() => addSkill(suggestion)}><span className="block font-medium">{suggestion.label}</span><span className="mt-1 line-clamp-2 block text-xs text-gray-500">{suggestion.description || suggestion.skill_kind}</span></button></li>)}</ul>}
                {skillQuery.trim().length >= 2 && !searchingSkills && <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={addManualSkill}><Plus className="mr-2 h-4 w-4" /> Ajouter « {skillQuery.trim()} » sans lien ESCO</Button>}
              </div>
              <div className="space-y-3"><h3 className="font-semibold">Compétences déclarées</h3>{!declaredSkills.length && <p className="rounded-lg border border-dashed p-5 text-sm text-gray-500">Ajoutez une compétence que vous utilisez déjà.</p>}{declaredSkills.map((skill, index) => <div key={skill.id || skill.esco_uri || `${skill.label}-${index}`} className="grid items-center gap-3 rounded-lg border p-3 md:grid-cols-[1fr_180px_auto]"><div><p className="font-medium">{skill.label}</p><p className="text-xs text-gray-500">{skill.esco_uri ? 'Compétence ESCO vérifiée' : 'Compétence libre'}</p></div><select aria-label={`Niveau pour ${skill.label}`} className={selectClassName} value={skill.proficiency} onChange={(event) => { const next = declaredSkills.map((item, itemIndex) => itemIndex === index ? { ...item, proficiency: event.target.value as ProfileSkill['proficiency'] } : item); setSkills([...next, ...sourcedSkills]); }}>{Object.entries(proficiencyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><Button type="button" variant="ghost" size="icon" aria-label={`Retirer ${skill.label}`} onClick={() => setSkills((current) => current.filter((item) => item !== skill))}><Trash2 className="h-4 w-4" /></Button></div>)}</div>
              {sourcedSkills.length > 0 && <div className="space-y-3"><h3 className="font-semibold">Compétences issues de vos résultats</h3><div className="grid gap-2 md:grid-cols-2">{sourcedSkills.map((skill) => <div key={skill.id || skill.label} className="rounded-lg border bg-gray-50 p-3"><div className="flex justify-between gap-2"><p className="font-medium">{skill.label}</p><Badge variant="outline">{sourceLabels[skill.source || 'declared']}</Badge></div><p className="mt-1 text-xs text-gray-500">{proficiencyLabels[skill.proficiency]}</p></div>)}</div></div>}
            </section>
          )}

          {currentStep?.key === 'hypotheses' && (
            <section className="space-y-4"><p className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"><Lightbulb className="mr-2 inline h-4 w-4" /> Une suggestion reste une hypothèse tant que vous ne la confirmez pas.</p>{proposedHypotheses.map((hypothesis) => <article key={hypothesis.id} className="rounded-xl border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><Badge variant="secondary">{hypothesis.hypothesis_type}</Badge><h3 className="mt-2 text-lg font-semibold">{displayHypothesisValue(hypothesis.value_json)}</h3></div>{hypothesis.confidence !== null && <span className="text-sm text-gray-500">Confiance : {Math.round(hypothesis.confidence * 100)} %</span>}</div><p className="mt-3 text-sm text-gray-600">{hypothesis.rationale}</p><div className="mt-4 flex gap-2"><Button type="button" onClick={() => void decideHypothesis(hypothesis.id, 'confirmed')} disabled={decidingHypothesis === hypothesis.id}>{decidingHypothesis === hypothesis.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Confirmer</Button><Button type="button" variant="outline" onClick={() => void decideHypothesis(hypothesis.id, 'rejected')} disabled={decidingHypothesis === hypothesis.id}>Refuser</Button></div></article>)}</section>
          )}

          {currentStep?.key === 'summary' && (
            <section className="space-y-5"><div className="grid gap-3 md:grid-cols-2"><div className="rounded-lg border p-4"><p className="text-xs uppercase text-gray-500">Situation</p><p className="mt-1 font-semibold">{profile.current_situation ? situationLabels[profile.current_situation] : 'À préciser'}</p></div><div className="rounded-lg border p-4"><p className="text-xs uppercase text-gray-500">Objectif</p><p className="mt-1 font-semibold">{profile.primary_goal ? goalLabels[profile.primary_goal] : 'À préciser'}</p></div><div className="rounded-lg border p-4"><p className="text-xs uppercase text-gray-500">Formations</p><p className="mt-1 font-semibold">{education.length}</p></div><div className="rounded-lg border p-4"><p className="text-xs uppercase text-gray-500">Compétences</p><p className="mt-1 font-semibold">{skills.filter((skill) => skill.confirmation_status !== 'rejected').length}</p></div></div><div><Label htmlFor="profile_summary">Votre projet en quelques phrases <span className="text-gray-500">(facultatif)</span></Label><Textarea id="profile_summary" rows={6} value={profile.profile_summary || ''} onChange={(event) => updateProfile('profile_summary', event.target.value || null)} /></div><p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Vos déclarations, résultats et hypothèses confirmées restent distingués.</p></section>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
            <Button type="button" variant="outline" onClick={() => void moveTo(activeStep - 1)} disabled={activeStep === 0 || saving}><ChevronLeft className="mr-2 h-4 w-4" /> Précédent</Button>
            {activeStep < steps.length - 1
              ? <Button type="button" onClick={() => void moveTo(activeStep + 1)} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{currentStep?.key === 'education' && !education.length ? 'Passer et continuer' : 'Enregistrer et continuer'} <ChevronRight className="ml-2 h-4 w-4" /></Button>
              : <Button type="button" onClick={() => void finish()} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Finaliser mon profil</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
