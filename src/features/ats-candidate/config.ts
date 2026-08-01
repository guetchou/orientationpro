export const isAtsCandidateFrontendEnabled = (
  value = import.meta.env.VITE_ATS_CANDIDATE_ENABLED,
) => String(value ?? '').trim().toLowerCase() === 'true';
