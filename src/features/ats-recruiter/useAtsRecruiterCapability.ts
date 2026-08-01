import { useEffect, useState } from 'react';
import { getCapabilityRegistry } from './api';

export type AtsCapabilityState = 'loading' | 'enabled' | 'disabled' | 'error';

const CAPABILITY_ID = 'ats.workflow-v1';

// Même capacité serveur que côté candidat (même flag ATS_WORKFLOW_V1_ENABLED,
// même routeur) : la capacité fait toujours foi, aucune page ne présume que
// l'ATS est actif.
export const useAtsRecruiterCapability = (): AtsCapabilityState => {
  const [state, setState] = useState<AtsCapabilityState>('loading');

  useEffect(() => {
    let cancelled = false;
    getCapabilityRegistry()
      .then((registry) => {
        if (cancelled) return;
        const entry = registry.capabilities.find((capability) => capability.id === CAPABILITY_ID);
        const enabled = Boolean(entry?.configured) && ['active', 'experimental'].includes(entry?.status ?? '');
        setState(enabled ? 'enabled' : 'disabled');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
