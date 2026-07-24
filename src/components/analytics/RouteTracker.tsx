import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/services/analytics/FrontendAnalytics';

const PUBLIC_ORIGIN = 'https://makoki.org';

const titleForPath = (pathname: string) => {
  if (pathname === '/') return 'MAKOKI — Orientation, compétences et emploi';
  if (pathname === '/tests') return 'Tests d’orientation — MAKOKI';
  if (pathname === '/careers') return 'Catalogue des métiers — MAKOKI';
  if (pathname === '/jobs') return 'Offres d’emploi — MAKOKI';
  if (pathname === '/recruitment') return 'Espace recrutement — MAKOKI';
  if (pathname === '/book-appointment') return 'Rendez-vous d’orientation — MAKOKI';
  if (pathname === '/cv-optimizer') return 'Préparer son CV — MAKOKI';
  if (pathname === '/blog') return 'Ressources d’orientation — MAKOKI';
  if (pathname === '/about') return 'À propos — MAKOKI';
  if (pathname === '/privacy') return 'Confidentialité — MAKOKI';
  if (pathname === '/terms') return 'Conditions d’utilisation — MAKOKI';
  if (pathname === '/cookies') return 'Cookies et stockage local — MAKOKI';
  if (pathname === '/login') return 'Connexion — MAKOKI';
  if (pathname === '/register') return 'Créer un compte — MAKOKI';
  if (pathname.startsWith('/careers/')) return 'Fiche métier — MAKOKI';
  if (pathname.startsWith('/orientation/results/')) return 'Résultat d’orientation — MAKOKI';
  return 'MAKOKI — Orientation, compétences et emploi';
};

export function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    const title = titleForPath(location.pathname);
    document.title = title;

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${PUBLIC_ORIGIN}${location.pathname === '/' ? '/' : location.pathname}`;

    trackPageView(location.pathname, title);
  }, [location.pathname]);

  return null;
}
