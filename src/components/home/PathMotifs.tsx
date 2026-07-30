import { motion, useReducedMotion } from 'framer-motion';

/**
 * Vocabulaire visuel "boussole et chemin" du cahier de direction artistique :
 * arcs, trajectoires, points reliés, cercles incomplets, jalons.
 * Purement décoratif (aria-hidden) — ne doit jamais porter d'information.
 */
export const TrajectoryLine = () => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1200 48"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-0 hidden h-12 w-full lg:block"
    >
      <motion.path
        d="M40 24 C 260 6, 420 42, 620 24 S 980 6, 1160 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 12"
        className="text-primary/60"
        initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
        whileInView={shouldReduceMotion ? undefined : { pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
      />
    </svg>
  );
};

export const CompassMarker = ({ number }: { number: string }) => (
  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
    <svg aria-hidden="true" viewBox="0 0 48 48" className="absolute inset-0 h-full w-full text-primary">
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="96 30"
        transform="rotate(-70 24 24)"
      />
    </svg>
    <span className="relative text-lg font-bold text-primary">{number}</span>
  </span>
);
