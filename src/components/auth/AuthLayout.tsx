import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface AuthLayoutProps {
  /** Accroche du panneau de marque (grand titre). */
  headline: string;
  /** Sous-titre du panneau de marque. */
  tagline: string;
  /** Nom de base d'une image de /images/hero (sans extension). */
  imageName: string;
  children: ReactNode;
}

const POINTS = [
  "Tests d'orientation basés sur le modèle RIASEC",
  'Métiers sourcés (O*NET), adaptés au Congo',
  'Des résultats expliqués — tu gardes la décision',
];

/**
 * Mise en page « split-screen » des écrans d'authentification : un panneau
 * de marque (image + accroche) à gauche sur grand écran, le formulaire à
 * droite. Sur mobile, seul le formulaire s'affiche, précédé du logo.
 */
export function AuthLayout({ headline, tagline, imageName, children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Panneau de marque (grand écran) */}
      <aside className="relative hidden overflow-hidden lg:block">
        <img
          src={`/images/hero/${imageName}.webp`}
          srcSet={`/images/hero/${imageName}-sm.webp 768w, /images/hero/${imageName}.webp 1600w`}
          sizes="50vw"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/95 via-emerald-950/85 to-emerald-900/70" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link to="/" className="flex w-fit items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl font-bold backdrop-blur-sm">
              M
            </span>
            <span className="text-xl font-bold tracking-tight">MAKOKI</span>
          </Link>

          <div>
            <h2 className="font-heading text-4xl font-bold leading-[1.15]">{headline}</h2>
            <p className="mt-4 max-w-md text-lg leading-8 text-emerald-50">{tagline}</p>
            <ul className="mt-8 space-y-3">
              {POINTS.map((point) => (
                <li key={point} className="flex gap-3 text-emerald-50">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-emerald-100/80">Orientation • Compétences • Emploi — Congo</p>
        </div>
      </aside>

      {/* Zone formulaire */}
      <div className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12">
        <Link to="/" className="mb-8 flex w-fit items-center gap-3 lg:hidden">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-lg font-bold text-white">
            M
          </span>
          <span className="text-lg font-bold text-slate-900">MAKOKI</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mx-auto w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </main>
  );
}
