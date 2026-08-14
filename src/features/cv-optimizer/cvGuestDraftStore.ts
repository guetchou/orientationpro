import type { CvPreview } from './cvApi';

const DB_NAME = 'makoki-cv-drafts';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';
const ACTIVE_DRAFT_KEY = 'active';
const DRAFT_TTL_MS = 2 * 60 * 60 * 1000;

interface StoredCvGuestDraft {
  id: typeof ACTIVE_DRAFT_KEY;
  schemaVersion: 1;
  file: File;
  preview?: CvPreview;
  createdAt: number;
  expiresAt: number;
}

export interface CvGuestDraft {
  file: File;
  preview?: CvPreview;
  createdAt: number;
  expiresAt: number;
}

const indexedDbAvailable = () =>
  typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

const openDatabase = () => new Promise<IDBDatabase>((resolve, reject) => {
  if (!indexedDbAvailable()) {
    reject(new Error('IndexedDB unavailable'));
    return;
  }

  const request = window.indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(STORE_NAME)) {
      database.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  };

  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('IndexedDB open failed'));
});

const withStore = async <T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const database = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const request = action(transaction.objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
      transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted'));
    });
  } finally {
    database.close();
  }
};

export const saveCvGuestDraft = async ({
  file,
  preview,
}: {
  file: File;
  preview?: CvPreview;
}): Promise<boolean> => {
  if (!indexedDbAvailable()) return false;

  const now = Date.now();
  const draft: StoredCvGuestDraft = {
    id: ACTIVE_DRAFT_KEY,
    schemaVersion: 1,
    file,
    preview,
    createdAt: now,
    expiresAt: now + DRAFT_TTL_MS,
  };

  try {
    await withStore('readwrite', (store) => store.put(draft));
    return true;
  } catch {
    return false;
  }
};

export const loadCvGuestDraft = async (): Promise<CvGuestDraft | null> => {
  if (!indexedDbAvailable()) return null;

  try {
    const stored = await withStore<StoredCvGuestDraft | undefined>(
      'readonly',
      (store) => store.get(ACTIVE_DRAFT_KEY),
    );

    if (
      !stored
      || stored.schemaVersion !== 1
      || !(stored.file instanceof File)
      || !Number.isFinite(stored.expiresAt)
      || stored.expiresAt <= Date.now()
    ) {
      await clearCvGuestDraft();
      return null;
    }

    return {
      file: stored.file,
      preview: stored.preview,
      createdAt: stored.createdAt,
      expiresAt: stored.expiresAt,
    };
  } catch {
    return null;
  }
};

export const clearCvGuestDraft = async (): Promise<void> => {
  if (!indexedDbAvailable()) return;

  try {
    await withStore('readwrite', (store) => store.delete(ACTIVE_DRAFT_KEY));
  } catch {
    // Le nettoyage local ne doit jamais bloquer le parcours CV.
  }
};

export { DRAFT_TTL_MS };
