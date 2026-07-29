export const isLifeProjectFrontendEnabled = (
  value = import.meta.env.VITE_LIFE_PROJECT_ENABLED,
) => String(value ?? '').trim().toLowerCase() === 'true';
