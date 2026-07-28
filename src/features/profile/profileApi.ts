import { apiFetch } from '@/lib/apiClient';

export type CurrentSituation =
  | 'student'
  | 'employee'
  | 'job_seeker'
  | 'entrepreneur'
  | 'career_change'
  | 'other';

export type PrimaryGoal =
  | 'choose_studies'
  | 'find_job'
  | 'career_change'
  | 'improve_skills'
  | 'start_business'
  | 'other';

export type MobilityScope = 'local' | 'national' | 'international' | 'remote' | 'unknown';
export type EducationLevel =
  | 'primary'
  | 'middle_school'
  | 'high_school'
  | 'baccalaureate'
  | 'vocational'
  | 'bac_plus_1'
  | 'bac_plus_2'
  | 'licence'
  | 'master'
  | 'doctorate'
  | 'other';
export type EducationStatus = 'in_progress' | 'completed' | 'interrupted';
export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'unknown';
export type HypothesisDecision = 'confirmed' | 'rejected';

export interface ProfileRecord {
  account_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  city: string | null;
  country_code: string | null;
  current_situation: CurrentSituation | null;
  primary_goal: PrimaryGoal | null;
  mobility_scope: MobilityScope | null;
  profile_summary: string | null;
  completion_percent: number;
}

export interface EducationRecord {
  id?: string;
  education_level: EducationLevel;
  status: EducationStatus;
  diploma_name: string | null;
  field_of_study: string | null;
  institution: string | null;
  country_code: string | null;
  start_year: number | null;
  end_year: number | null;
}

export interface ProfileSkill {
  id?: string;
  label: string;
  esco_uri: string | null;
  proficiency: SkillProficiency;
  source?: 'declared' | 'test' | 'cv' | 'inferred';
  confirmation_status?: 'proposed' | 'confirmed' | 'rejected';
  evidence?: string | null;
}

export interface ProfileHypothesis {
  id: string;
  hypothesis_type: string;
  value_json: unknown;
  rationale: string;
  confidence: number | null;
  status: 'proposed' | 'confirmed' | 'rejected';
}

export interface AdaptiveProfilePayload {
  profile: ProfileRecord | null;
  education: EducationRecord[];
  skills: ProfileSkill[];
  hypotheses: ProfileHypothesis[];
}

export interface EscoSkillSuggestion {
  id: string;
  esco_uri: string;
  label: string;
  description: string;
  skill_kind: string;
  esco_version: string;
  locale: string;
}

export type ProfileInput = Omit<ProfileRecord, 'account_id' | 'completion_percent'>;

export const getAdaptiveProfile = () =>
  apiFetch<AdaptiveProfilePayload>('/v1/profile');

export const saveProfileDetails = (profile: ProfileInput) =>
  apiFetch<AdaptiveProfilePayload>('/v1/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });

export const saveEducationHistory = (education: EducationRecord[]) =>
  apiFetch<AdaptiveProfilePayload>('/v1/profile/education', {
    method: 'PUT',
    body: JSON.stringify({ education }),
  });

export const saveDeclaredSkills = (skills: ProfileSkill[]) =>
  apiFetch<AdaptiveProfilePayload>('/v1/profile/skills', {
    method: 'PUT',
    body: JSON.stringify({ skills }),
  });

export const decideProfileHypothesis = (hypothesisId: string, status: HypothesisDecision) =>
  apiFetch<AdaptiveProfilePayload>(`/v1/profile/hypotheses/${encodeURIComponent(hypothesisId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const searchEscoSkills = (
  query: string,
  options: { locale?: string; limit?: number; signal?: AbortSignal } = {},
) => {
  const params = new URLSearchParams({
    q: query,
    locale: options.locale || 'fr',
    limit: String(options.limit || 10),
  });
  return apiFetch<{ skills: EscoSkillSuggestion[] }>(
    `/v1/profile/skills/search?${params.toString()}`,
    { signal: options.signal },
  );
};
