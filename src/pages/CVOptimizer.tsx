import { usePageMeta } from '@/hooks/usePageMeta';
import CvOptimizerPage from '@/features/cv-optimizer/CvOptimizerPage';

// Parcours public d'optimisation de CV (moteur makoki-cv-rules-v1, API v1).
export default function CVOptimizer() {
  usePageMeta({ title: "Optimiser mon CV", description: "Analysez et améliorez votre CV avec le moteur ATS explicable de MAKOKI.", path: "/cv-optimizer" });
  return <CvOptimizerPage />;
}
