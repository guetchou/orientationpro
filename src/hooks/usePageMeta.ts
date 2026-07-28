import { useEffect } from 'react';

const SITE = 'https://makoki.org';
const DEFAULT_TITLE = 'MAKOKI — Orientation, compétences et emploi';

interface PageMeta {
  /** Partie spécifique du titre ; « — MAKOKI » est ajouté. Omis => titre par défaut. */
  title?: string;
  description?: string;
  /** Chemin canonique (ex. « /tests »). Défaut : chemin courant. */
  path?: string;
  image?: string;
}

function upsertMeta(keyAttr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${keyAttr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(keyAttr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Met à jour le titre et les balises SEO/OpenGraph pour la route courante.
 * Approche DOM sans dépendance, adaptée à cette SPA : les moteurs qui
 * exécutent le JS (Googlebot, etc.) lisent les balises mises à jour, et
 * chaque page obtient enfin son propre titre, sa description et son
 * canonical (au lieu de ceux, figés, de l'accueil).
 */
export function usePageMeta({ title, description, path, image }: PageMeta) {
  useEffect(() => {
    const fullTitle = title ? `${title} — MAKOKI` : DEFAULT_TITLE;
    document.title = fullTitle;
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('name', 'twitter:title', fullTitle);

    if (description) {
      upsertMeta('name', 'description', description);
      upsertMeta('property', 'og:description', description);
      upsertMeta('name', 'twitter:description', description);
    }

    const url = SITE + (path ?? window.location.pathname);
    upsertCanonical(url);
    upsertMeta('property', 'og:url', url);

    if (image) {
      upsertMeta('property', 'og:image', image);
      upsertMeta('name', 'twitter:image', image);
    }
  }, [title, description, path, image]);
}
