type LockManagerLike = {
  request<T>(name: string, callback: () => Promise<T>): Promise<T>;
};

export const withCvAnalysisLock = async <T>(
  operationId: string,
  work: () => Promise<T>,
): Promise<T> => {
  if (typeof navigator === 'undefined') return work();
  const locks = (navigator as Navigator & { locks?: LockManagerLike }).locks;
  if (!locks?.request) return work();
  return locks.request(`makoki-cv-analysis:${operationId}`, work);
};
