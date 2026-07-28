import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  User,
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
  EducationRecord,
  EscoSkillSuggestion,
  getAdaptiveProfile,
  ProfileHypothesis,
  ProfileInput,
  ProfileSkill,
  saveDeclaredSkills,
  saveEducationHistory,
  saveProfileDetails,
  searchEscoSkills,
} from '@/features/profile/profileApi';

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
  choose_studies: "Choisir mes études",
  find_job: 'Trouver un emploi',
  career_change: 'Réussir ma reconversion',
  improve_skills: 'Développer mes compétences',
  start_business: 'Créer une activité',
  other: 'Clarifier mon projet',
} as const;

const mobilityLabels = {
  local: 'Dans ma ville ou mon département',
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

interface StepDefinition {
  key: StepKey;
  label: string;
  description: string;
}

export default function Profile() {
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
    const nextProfile = payload.profile;
    setProfile({
      first_name: nextProfile?.first_name ?? null,
      last_name: nextProfile?.last_name ?? null,
      phone: nextProfile?.phone ?? null,
      city: nextProfile?.city ?? null,
      country_code: nextProfile?.country_code ?? 'CG',
      current_situation: nextProfile?.current_situation ?? null,
      primary_goal: nextProfile?.primary_goal ?? null,
      mobility_scope: nextProfile?.mobility_scope ?? null,
      profile_summary: nextProfile?.profile_summary ?? null,
    });
    setCompletionPercent(nextProfile?.completion_percent ?? 0);
    setEducation(payload.education || []);
    setSkills(payload.skills || []);
    setHypotheses(payload.hypotheses || []);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        applyPayload(await getAdaptiveProfile());
      } catch (error) {
        console.error('Unable to load adaptive profile', error);
        toast.error('Impossible de charger votre profil. Vérifiez votre session puis réessayez.');
      } finally {
        setLoading(false);
      }
    };
    void loadProfile();
  }, []);

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
    const timeout = window.setTimeout(async () => {
      setSearchingSkills(true);
      setSkillSearchError(null);
      try {
        const result = await searchEscoSkills(query, { locale: 'fr', limit: 8, signal: controller.signal });
        setSkillSuggestions(result.skills);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('ESCO skill search failed', error);
        setSkillSearchError('La recherche ESCO est momentanément indisponible. Vous pouvez ajouter le libellé manuellement.');
        setSkillSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setSearchingSkills(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
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

  const saveCurrentStep = async () => {
    if (!currentStep) return;
    setSaving(true);
    try {
      let payload;
      if (currentStep.key === 'education') {
        payload = await saveEducationHistory(education.map(({ id: _id, ...entry }) => entry));
      } else if (currentStep.key === 'skills') {
        payload = await saveDeclaredSkills(declaredSkills.map(({ id: _id, source: _source, confirmation_status: _status, ...skill }) => skill));
      } else if (currentStep.key === 'hypotheses') {
        return;
      } else {
        payload = await saveProfileDetails(profile);
      }
      applyPayload(payload);
    } finally {
      setSaving(false);
    }
  };

  const goNext = async () => {
    try {
      await saveCurrentStep();
      if (activeStep < steps.length - 1) setActiveStep((step) => step + 1);
    } catch (error) {
      console.error('Unable to save profile step', error);
      toast.error("Impossible d'enregistrer cette étape.");
    }
  };

  const finishProfile = async () => {
    try {
      await saveCurrentStep();
      toast.success('Votre profil intelligent est à jour.');
    } catch (error) {
      console.error('Unable to finish adaptive profile', error);
      toast.error("Impossible d'enregistrer la synthèse.");
    }
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
    return (
      <div className="flex min-h-screen items-center justify-center" aria-label="Chargement du profil">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
        </Link>

        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_280px]">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle id="profile-title" className="flex items-center gap-2 text-2xl">
                    <Sparkles className="h-6 w-6 text-blue-600" /> Mon profil intelligent
                  </CardTitle>
                  <CardDescription className="mt-2 max-w-2xl">
                    Répondez uniquement aux questions utiles à votre situation. Vos choix améliorent les recommandations de métiers et de formations.
                  </CardDescription>
                </div>
                <Badge variant="secondary">Profil complété à {completionPercent} %</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                <span>Étape {activeStep + 1} sur {steps.length}</span>
                <span>{currentStep?.label}</span>
              </div>
              <Progress value={progressValue} aria-label={`Progression : ${progressValue} %`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Compte Auth V1</CardTitle>
              <CardDescription>Source sécurisée de votre profil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="truncate font-medium">{storedUser?.email || 'Session active'}</p>
              <p className="text-gray-500">Les données sont isolées par compte et enregistrées dans MySQL.</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <nav aria-label="Étapes du profil" className="lg:sticky lg:top-6 lg:self-start">
            <ol className="space-y-2">
              {steps.map((step, index) => {
                const active = index === activeStep;
                const completed = index < activeStep;
                return (
                  <li key={step.key}>
                    <button
                      type="button"
                      onClick={() => setActiveStep(index)}
                      aria-current={active ? 'step' : undefined}
                      className={`w-full rounded-lg border p-3 text-left transition ${
                        active ? 'border-blue-500 bg-blue-50' : 'border-transparent bg-white/70 hover:border-gray-200'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                          completed ? 'bg-emerald-600 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {completed ? <Check className="h-3.5 w-3.5" /> : index + 1}
                        </span>
                        {step.label}
                      </span>
                      <span className="mt-1 block pl-8 text-xs text-gray-500">{step.description}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <Card aria-labelledby="step-title">
            <CardHeader>
              <CardTitle id="step-title">{currentStep?.label}</CardTitle>
              <CardDescription>{currentStep?.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep?.key === 'identity' && (
                <section className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="first_name">Prénom</Label>
                      <Input id="first_name" autoComplete="given-name" value={profile.first_name || ''} onChange={(event) => updateProfile('first_name', event.target.value || null)} />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Nom</Label>
                      <Input id="last_name" autoComplete="family-name" value={profile.last_name || ''} onChange={(event) => updateProfile('last_name', event.target.value || null)} />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="phone">Téléphone <span className="text-gray-500">(facultatif)</span></Label>
                      <Input id="phone" type="tel" autoComplete="tel" value={profile.phone || ''} onChange={(event) => updateProfile('phone', event.target.value || null)} />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail du compte</Label>
                      <Input id="email" value={storedUser?.email || ''} disabled />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-[1fr_120px]">
                    <div>
                      <Label htmlFor="city">Ville de résidence</Label>
                      <Input id="city" autoComplete="address-level2" value={profile.city || ''} onChange={(event) => updateProfile('city', event.target.value || null)} />
                    </div>
                    <div>
                      <Label htmlFor="country_code">Pays</Label>
                      <Input id="country_code" maxLength={2} aria-describedby="country-help" value={profile.country_code || ''} onChange={(event) => updateProfile('country_code', event.target.value.toUpperCase() || null)} />
                      <p id="country-help" className="mt-1 text-xs text-gray-500">Code à 2 lettres, ex. CG</p>
                    </div>
                  </div>
                </section>
              )}

              {currentStep?.key === 'objective' && (
                <section className="space-y-5">
                  <div>
                    <Label htmlFor="current_situation">Quelle est votre situation actuelle ?</Label>
                    <select id="current_situation" className={selectClassName} value={profile.current_situation || ''} onChange={(event) => updateProfile('current_situation', (event.target.value || null) as ProfileInput['current_situation'])}>
                      <option value="">Sélectionnez votre situation</option>
                      {Object.entries(situationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="primary_goal">Quel résultat attendez-vous en priorité ?</Label>
                    <select id="primary_goal" className={selectClassName} value={profile.primary_goal || ''} onChange={(event) => updateProfile('primary_goal', (event.target.value || null) as ProfileInput['primary_goal'])}>
                      <option value="">Sélectionnez votre objectif</option>
                      {Object.entries(goalLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="mobility_scope">Jusqu’où pouvez-vous vous déplacer ou travailler ?</Label>
                    <select id="mobility_scope" className={selectClassName} value={profile.mobility_scope || ''} onChange={(event) => updateProfile('mobility_scope', (event.target.value || null) as ProfileInput['mobility_scope'])}>
                      <option value="">Sélectionnez une préférence</option>
                      {Object.entries(mobilityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  {!showEducation && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                      Votre situation ne nécessite pas de questionnaire scolaire détaillé. Vous pourrez toujours ajouter un diplôme plus tard.
                    </div>
                  )}
                </section>
              )}

              {currentStep?.key === 'education' && (
                <section className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">Parcours d’études</h3>
                      <p className="text-sm text-gray-500">Ajoutez seulement les étapes utiles pour comprendre votre projet.</p>
                    </div>
                    <Button type="button" variant="outline" onClick={() => setEducation((current) => [...current, emptyEducation()])}>
                      <Plus className="mr-2 h-4 w-4" /> Ajouter une formation
                    </Button>
                  </div>

                  {!education.length && (
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      <BookOpen className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                      <p className="font-medium">Aucune formation ajoutée</p>
                      <p className="mt-1 text-sm text-gray-500">Cette étape est facultative et peut être complétée plus tard.</p>
                    </div>
                  )}

                  {education.map((entry, index) => (
                    <div key={entry.id || index} className="space-y-4 rounded-xl border p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Formation {index + 1}</h4>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setEducation((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                          <Trash2 className="mr-2 h-4 w-4" /> Retirer
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor={`education-level-${index}`}>Niveau</Label>
                          <select id={`education-level-${index}`} className={selectClassName} value={entry.education_level} onChange={(event) => updateEducation(index, { education_level: event.target.value as EducationRecord['education_level'] })}>
                            {Object.entries(educationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                          </select>
                        </div>
                        <div>
                          <Label htmlFor={`education-status-${index}`}>Statut</Label>
                          <select id={`education-status-${index}`} className={selectClassName} value={entry.status} onChange={(event) => updateEducation(index, { status: event.target.value as EducationRecord['status'] })}>
                            {Object.entries(educationStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div><Label htmlFor={`diploma-${index}`}>Diplôme ou certification</Label><Input id={`diploma-${index}`} value={entry.diploma_name || ''} onChange={(event) => updateEducation(index, { diploma_name: event.target.value || null })} /></div>
                        <div><Label htmlFor={`field-${index}`}>Domaine étudié</Label><Input id={`field-${index}`} value={entry.field_of_study || ''} onChange={(event) => updateEducation(index, { field_of_study: event.target.value || null })} /></div>
                      </div>
                      <div><Label htmlFor={`institution-${index}`}>Établissement</Label><Input id={`institution-${index}`} value={entry.institution || ''} onChange={(event) => updateEducation(index, { institution: event.target.value || null })} /></div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div><Label htmlFor={`start-year-${index}`}>Année de début</Label><Input id={`start-year-${index}`} inputMode="numeric" value={entry.start_year || ''} onChange={(event) => updateEducation(index, { start_year: event.target.value ? Number(event.target.value) : null })} /></div>
                        <div><Label htmlFor={`end-year-${index}`}>Année de fin</Label><Input id={`end-year-${index}`} inputMode="numeric" value={entry.end_year || ''} onChange={(event) => updateEducation(index, { end_year: event.target.value ? Number(event.target.value) : null })} /></div>
                        <div><Label htmlFor={`education-country-${index}`}>Pays</Label><Input id={`education-country-${index}`} maxLength={2} value={entry.country_code || ''} onChange={(event) => updateEducation(index, { country_code: event.target.value.toUpperCase() || null })} /></div>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {currentStep?.key === 'skills' && (
                <section className="space-y-6">
                  <div>
                    <Label htmlFor="skill-search">Rechercher une compétence</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="skill-search"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={Boolean(skillSuggestions.length)}
                        aria-controls="skill-suggestions"
                        className="pl-9"
                        value={skillQuery}
                        onChange={(event) => setSkillQuery(event.target.value)}
                        placeholder="Ex. analyser des données, accueillir un client…"
                      />
                      {searchingSkills && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Les suggestions viennent du catalogue officiel ESCO français installé sur MAKOKI.</p>
                    <div aria-live="polite" className="text-sm">
                      {skillSearchError && <p className="mt-2 text-amber-700">{skillSearchError}</p>}
                    </div>
                    {skillSuggestions.length > 0 && (
                      <ul id="skill-suggestions" role="listbox" className="mt-2 max-h-72 overflow-auto rounded-lg border bg-white shadow-lg">
                        {skillSuggestions.map((suggestion) => (
                          <li key={suggestion.id} role="option" aria-selected="false" className="border-b last:border-b-0">
                            <button type="button" className="w-full p-3 text-left hover:bg-blue-50" onClick={() => addSkill(suggestion)}>
                              <span className="block font-medium">{suggestion.label}</span>
                              <span className="mt-1 line-clamp-2 block text-xs text-gray-500">{suggestion.description || suggestion.skill_kind}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {skillQuery.trim().length >= 2 && !searchingSkills && (
                      <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={addManualSkill}>
                        <Plus className="mr-2 h-4 w-4" /> Ajouter « {skillQuery.trim()} » sans lien ESCO
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold">Compétences déclarées</h3>
                    {!declaredSkills.length && <p className="rounded-lg border border-dashed p-5 text-sm text-gray-500">Ajoutez au moins une compétence que vous utilisez déjà ou souhaitez valoriser.</p>}
                    {declaredSkills.map((skill, index) => (
                      <div key={skill.id || skill.esco_uri || `${skill.label}-${index}`} className="grid items-center gap-3 rounded-lg border p-3 md:grid-cols-[1fr_180px_auto]">
                        <div>
                          <p className="font-medium">{skill.label}</p>
                          <p className="text-xs text-gray-500">{skill.esco_uri ? 'Compétence ESCO vérifiée' : 'Compétence libre'}</p>
                        </div>
                        <select
                          aria-label={`Niveau pour ${skill.label}`}
                          className={selectClassName}
                          value={skill.proficiency}
                          onChange={(event) => {
                            const next = declaredSkills.map((item, itemIndex) => itemIndex === index
                              ? { ...item, proficiency: event.target.value as ProfileSkill['proficiency'] }
                              : item);
                            setSkills([...next, ...sourcedSkills]);
                          }}
                        >
                          {Object.entries(proficiencyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                        <Button type="button" variant="ghost" size="icon" aria-label={`Retirer ${skill.label}`} onClick={() => setSkills((current) => current.filter((item) => item !== skill))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {sourcedSkills.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">Compétences issues de vos résultats</h3>
                      <div className="grid gap-2 md:grid-cols-2">
                        {sourcedSkills.map((skill) => (
                          <div key={skill.id || skill.label} className="rounded-lg border bg-gray-50 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-medium">{skill.label}</p>
                              <Badge variant="outline">{sourceLabels[skill.source || 'declared']}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">{proficiencyLabels[skill.proficiency]}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {currentStep?.key === 'hypotheses' && (
                <section className="space-y-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                    <Lightbulb className="mr-2 inline h-4 w-4" /> Une suggestion reste une hypothèse tant que vous ne la confirmez pas.
                  </div>
                  {proposedHypotheses.map((hypothesis) => (
                    <article key={hypothesis.id} className="rounded-xl border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <Badge variant="secondary">{hypothesis.hypothesis_type}</Badge>
                          <h3 className="mt-2 text-lg font-semibold">{displayHypothesisValue(hypothesis.value_json)}</h3>
                        </div>
                        {hypothesis.confidence !== null && <span className="text-sm text-gray-500">Confiance : {Math.round(hypothesis.confidence * 100)} %</span>}
                      </div>
                      <p className="mt-3 text-sm text-gray-600">{hypothesis.rationale}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button type="button" onClick={() => void decideHypothesis(hypothesis.id, 'confirmed')} disabled={decidingHypothesis === hypothesis.id}>
                          {decidingHypothesis === hypothesis.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} Confirmer
                        </Button>
                        <Button type="button" variant="outline" onClick={() => void decideHypothesis(hypothesis.id, 'rejected')} disabled={decidingHypothesis === hypothesis.id}>
                          Refuser
                        </Button>
                      </div>
                    </article>
                  ))}
                </section>
              )}

              {currentStep?.key === 'summary' && (
                <section className="space-y-5">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border p-4"><p className="text-xs uppercase text-gray-500">Situation</p><p className="mt-1 font-semibold">{profile.current_situation ? situationLabels[profile.current_situation] : 'À préciser'}</p></div>
                    <div className="rounded-lg border p-4"><p className="text-xs uppercase text-gray-500">Objectif</p><p className="mt-1 font-semibold">{profile.primary_goal ? goalLabels[profile.primary_goal] : 'À préciser'}</p></div>
                    <div className="rounded-lg border p-4"><p className="text-xs uppercase text-gray-500">Formations</p><p className="mt-1 font-semibold">{education.length}</p></div>
                    <div className="rounded-lg border p-4"><p className="text-xs uppercase text-gray-500">Compétences</p><p className="mt-1 font-semibold">{skills.filter((skill) => skill.confirmation_status !== 'rejected').length}</p></div>
                  </div>
                  <div>
                    <Label htmlFor="profile_summary">Votre projet en quelques phrases <span className="text-gray-500">(facultatif)</span></Label>
                    <Textarea id="profile_summary" rows={6} value={profile.profile_summary || ''} onChange={(event) => updateProfile('profile_summary', event.target.value || null)} placeholder="Ex. Je souhaite évoluer vers un métier numérique qui combine analyse, créativité et utilité sociale…" />
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    Votre profil reste modifiable. Les recommandations futures devront distinguer vos déclarations, vos résultats et les hypothèses confirmées.
                  </div>
                </section>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
                <Button type="button" variant="outline" onClick={() => setActiveStep((step) => Math.max(0, step - 1))} disabled={activeStep === 0 || saving}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
                </Button>
                <div className="flex flex-wrap gap-2">
                  {currentStep?.key === 'education' && education.length === 0 && (
                    <Button type="button" variant="ghost" onClick={() => setActiveStep((step) => Math.min(steps.length - 1, step + 1))}>
                      Passer cette étape
                    </Button>
                  )}
                  {activeStep < steps.length - 1 ? (
                    <Button type="button" onClick={() => void goNext()} disabled={saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Enregistrer et continuer <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="button" onClick={() => void finishProfile()} disabled={saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                      Finaliser mon profil
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
