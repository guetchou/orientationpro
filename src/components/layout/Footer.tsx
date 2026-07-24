import { Link } from 'react-router-dom';
import { openConsentManager } from '@/lib/privacyConsent';

const sections = [
  {
    title: 'Orientation',
    links: [
      { label: 'Tests d’orientation', path: '/tests' },
      { label: 'Mes résultats', path: '/orientation/results' },
      { label: 'Catalogue métiers', path: '/careers' },
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
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_3fr]">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-3" aria-label="Accueil MAKOKI">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold">M</span>
              <span>
                <span className="block text-2xl font-bold">MAKOKI</span>
                <span className="block text-xs text-slate-400">Orientation • Compétences • Emploi</span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              MAKOKI aide chacun à mieux comprendre ses intérêts, explorer des métiers et préparer son parcours. Les résultats d’orientation organisent des pistes à approfondir ; ils ne garantissent ni emploi, ni salaire, ni aptitude à exercer un métier réglementé.
            </p>
            <div className="mt-4 space-y-1 text-sm text-slate-300">
              <p><a className="font-medium text-emerald-300 hover:text-white" href="mailto:contact@makoki.org">contact@makoki.org</a></p>
              <p><a className="font-medium text-emerald-300 hover:text-white" href="mailto:support@makoki.org">support@makoki.org</a></p>
              <p><a className="font-medium text-emerald-300 hover:text-white" href="tel:+242055344253">+242 05 534 42 53</a></p>
              <p className="text-slate-400">Support annoncé : 08h00–20h00, jours à préciser</p>
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
