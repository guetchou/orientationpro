import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  /** Accroche du panneau de marque (grand titre). */
  headline: string;
  /** Sous-titre du panneau de marque. */
  tagline: string;
  /** Nom de base d'une image de /images/hero (sans extension). */
  imageName: string;
  /** Côté du panneau de marque sur grand écran (par défaut à gauche). */
  imageSide?: 'left' | 'right';
  children: ReactNode;
}

const POINTS = [
  "Tests d'orientation basés sur le modèle RIASEC",
  'Métiers sourcés (O*NET), adaptés au Congo',
  'Des résultats expliqués — tu gardes la décision',
];

/**
 * Mise en page « split-screen » plein écran des écrans d'authentification :
 * un panneau de marque (image + accroche) d'un côté sur grand écran, le
 * formulaire de l'autre. Le côté de l'image alterne selon la page pour les
 * distinguer. Sur mobile, seul le formulaire s'affiche, précédé du logo.
 * Ces pages sont volontairement autonomes (sans header/footer du site).
 */
export function AuthLayout({ headline, tagline, imageName, imageSide = 'left', children }: AuthLayoutProps) {
  const rightSide = imageSide === 'right';
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Panneau de marque (grand écran) */}
      <aside className={cn('relative hidden overflow-hidden lg:block', rightSide && 'lg:order-2')}>
        <img
          src={`/images/hero/${imageName}.webp`}
          srcSet={`/images/hero/${imageName}-sm.webp 768w, /images/hero/${imageName}.webp 1600w`}
          sizes="50vw"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br from-emerald-950/95 via-emerald-950/85 to-emerald-900/70',
            rightSide && 'bg-gradient-to-bl',
          )}
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link to="/" className="flex w-fit items-center" aria-label="MAKOKI — accueil">
            <img
              src="/logo/makoki-wordmark-white.png"
              alt="MAKOKI — Orientation, Compétences, Emploi"
              width={399}
              height={133}
              className="h-10 w-auto"
            />
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
      <div className={cn('flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12', rightSide && 'lg:order-1')}>
        <Link to="/" className="mb-8 flex w-fit items-center lg:hidden" aria-label="MAKOKI — accueil">
          <img
            src="/logo/makoki-wordmark.png"
            alt="MAKOKI — Orientation, Compétences, Emploi"
            width={405}
            height={133}
            className="h-9 w-auto"
          />
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
