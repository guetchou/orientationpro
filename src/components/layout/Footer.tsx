import { Link, useLocation } from 'react-router-dom';
import { isAuthRoute } from '@/lib/authRoutes';
import { openConsentManager } from '@/lib/privacyConsent';

const sections = [
  {
    title: 'Orientation',
    links: [
      { label: 'Construire mon projet', path: '/parcours' },
      { label: 'Explorer les métiers', path: '/careers' },
      { label: 'Parler à un conseiller', path: '/conseiller' },
    ],
  },
  {
    title: 'Opportunités',
    links: [
      { label: 'Offres d’emploi', path: '/jobs' },
      { label: 'Espace recrutement', path: '/recruitment' },
      { label: 'Optimiser mon CV', path: '/cv-optimizer' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Blog', path: '/blog' },
      { label: 'Prendre rendez-vous', path: '/book-appointment' },
      { label: 'À propos', path: '/about' },
    ],
  },
  {
    title: 'Informations',
    links: [
      { label: 'Mentions légales', path: '/legal' },
      { label: 'Confidentialité', path: '/privacy' },
      { label: 'Conditions d’utilisation', path: '/terms' },
      { label: 'Cookies', path: '/cookies' },
    ],
  },
];

export const Footer = () => {
  const { pathname } = useLocation();
  if (isAuthRoute(pathname)) return null;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_3fr]">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center" aria-label="MAKOKI — accueil">
              <img
                src="/logo/makoki-wordmark-white.png"
                alt="MAKOKI — Orientation, Compétences, Emploi"
                width={399}
                height={133}
                className="h-11 w-auto"
              />
            </Link>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              MAKOKI t’aide à mieux comprendre tes intérêts, explorer des métiers et construire des prochaines étapes adaptées à ta situation.
            </p>
            <div className="mt-4 space-y-1 text-sm text-slate-300">
              <p><a className="font-medium text-emerald-300 hover:text-white" href="mailto:contact@makoki.org">contact@makoki.org</a></p>
              <p><a className="font-medium text-emerald-300 hover:text-white" href="mailto:support@makoki.org">support@makoki.org</a></p>
              <p><a className="font-medium text-emerald-300 hover:text-white" href="tel:+242055344253">+242 05 534 42 53</a></p>
              <p className="text-slate-400">Assistance par e-mail, téléphone et WhatsApp.</p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-semibold text-white">{section.title}</h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  {section.links.map((link) => (
                    <li key={link.path}>
                      <Link className="transition-colors hover:text-white" to={link.path}>{link.label}</Link>
                    </li>
                  ))}
                  {section.title === 'Informations' ? (
                    <li>
                      <button type="button" className="text-left transition-colors hover:text-white" onClick={openConsentManager}>
                        Gérer mes cookies
                      </button>
                    </li>
                  ) : null}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-800 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Nexora — MAKOKI. Tous droits réservés.</p>
          <p>Brazzaville, République du Congo.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
