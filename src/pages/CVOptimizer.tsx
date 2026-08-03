import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import CvOptimizerPage from '@/features/cv-optimizer/CvOptimizerPage';
import { ServiceRequestCard } from '@/components/services/ServiceRequestCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const checks = [
  'Le poste recherché est clairement indiqué.',
  'Les coordonnées sont faciles à trouver.',
  'Les expériences décrivent des résultats concrets.',
  'Les compétences correspondent au poste ciblé.',
  'Le document utilise des titres simples et lisibles.',
  'Aucune information fausse ou impossible à vérifier n’est ajoutée.',
];

export default function CVOptimizer() {
  usePageMeta({
    title: 'Optimiser mon CV',
    description: 'Vérifie ton CV et demande un accompagnement personnalisé avec MAKOKI.',
    path: '/cv-optimizer',
  });

  const automatedAnalysisEnabled = String(
    import.meta.env.VITE_CV_ANALYSIS_ENABLED ?? import.meta.env.VITE_CV_OPTIMIZER_ENABLED ?? '',
  ).trim().toLowerCase() === 'true';
  const [selected, setSelected] = useState<string[]>([]);
  const completed = useMemo(() => selected.length, [selected]);

  if (automatedAnalysisEnabled) return <CvOptimizerPage />;

  return (
    <main className="min-h-screen bg-stone-50 px-6 pb-20 pt-28">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="max-w-3xl">
          <p className="font-semibold text-emerald-700">CV et candidature</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">Améliore ton CV avec une méthode simple</h1>
          <p className="mt-5 text-lg leading-8 text-stone-700">
            Commence par cette vérification gratuite. Pour une analyse détaillée, tu peux ensuite demander une revue humaine adaptée au poste recherché.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-emerald-700" />
              Auto-vérification du CV — {completed}/{checks.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checks.map((item) => {
              const checked = selected.includes(item);
              return (
                <label key={item} className="flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-4">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={checked}
                    onChange={() => setSelected((current) => (
                      checked ? current.filter((entry) => entry !== item) : [...current, item]
                    ))}
                  />
                  <span className="flex-1 text-sm leading-6">{item}</span>
                  {checked ? <CheckCircle2 className="h-5 w-5 text-emerald-700" /> : null}
                </label>
              );
            })}
          </CardContent>
        </Card>

        <ServiceRequestCard
          service="cv"
          title="Demander une analyse personnalisée de ton CV"
          description="Indique le poste ciblé, ton niveau d’expérience et les difficultés rencontrées. MAKOKI confirme le format de la revue, le délai et le tarif éventuel avant que tu transmettes ton document."
          submitLabel="Demander une analyse"
        />
      </div>
    </main>
  );
}
