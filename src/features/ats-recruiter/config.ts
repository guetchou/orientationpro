export const isAtsRecruiterFrontendEnabled = (
  value = import.meta.env.VITE_ATS_RECRUITER_ENABLED,
) => String(value ?? '').trim().toLowerCase() === 'true';
