import { apiFetch, getStoredAccessToken } from '@/lib/apiClient';
import type { RiasecAttempt, RiasecInstrument, RiasecResult } from '@/types/riasec';

export interface RiasecAnswer {
  itemId: string;
  value: number;
}

export interface GuestOrientationClaim {
  status: 'claimed' | 'not_found' | 'expired';
  attempts: number;
  results: number;
}

export const getRiasecInstrument = async () => {
  const payload = await apiFetch<{ instrument: RiasecInstrument }>(
    '/v1/orientation/riasec/instrument',
  );
  return payload.instrument;
};

export const claimGuestOrientation = async (): Promise<GuestOrientationClaim | null> => {
  if (!getStoredAccessToken()) return null;
  const payload = await apiFetch<{ claim: GuestOrientationClaim }>(
    '/v1/orientation/guest/claim',
    { method: 'POST' },
  );
  return payload.claim;
};

export const createRiasecAttempt = async () => {
  return apiFetch<{
    attempt: RiasecAttempt;
    instrument: RiasecInstrument;
  }>('/v1/orientation/riasec/attempts', {
    method: 'POST',
  });
};

export const getRiasecAttempt = async (attemptId: string) => {
  return apiFetch<{
    attempt: RiasecAttempt;
    instrument: RiasecInstrument;
  }>(`/v1/orientation/riasec/attempts/${encodeURIComponent(attemptId)}`);
};

export const submitRiasecAttempt = async (
  attemptId: string,
  responses: RiasecAnswer[],
) => {
  return apiFetch<{
    status: 'completed' | 'already_completed';
    result: RiasecResult;
  }>(`/v1/orientation/riasec/attempts/${encodeURIComponent(attemptId)}/submit`, {
    method: 'POST',
    body: JSON.stringify({ responses }),
  });
};

export const listRiasecResults = async (limit = 20, offset = 0) => {
  const payload = await apiFetch<{ results: RiasecResult[] }>(
    `/v1/orientation/results?limit=${limit}&offset=${offset}`,
  );
  return payload.results;
};

export const getRiasecResult = async (resultId: string) => {
  const payload = await apiFetch<{ result: RiasecResult }>(
    `/v1/orientation/results/${encodeURIComponent(resultId)}`,
  );
  return payload.result;
};