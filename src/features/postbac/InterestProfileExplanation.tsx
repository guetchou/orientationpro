import type { RiasecDimensionCode, RiasecResult } from '@/types/riasec';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DIMENSION_COPY, isDimensionCode } from './dimensions';

// Explique en langage accessible les trois dimensions dominantes deja calculees
// par le serveur. Ne recalcule rien : lit result.ranking.ordered.
export const InterestProfileExplanation = ({ result }: { result: RiasecResult }) => {
  const ordered = result.ranking?.ordered ?? [];
  const top = ordered
    .map((entry) => entry.dimension)
    .filter((code): code is RiasecDimensionCode => isDimensionCode(code))
    .slice(0, 3);

  return (
    <Card className="border border-stone-200 shadow-sm">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Profil Makoki des intérêts professionnels</CardTitle>
        <p className="text-sm text-stone-600">
          Vos réponses font ressortir trois familles d’intérêts dominantes. Elles décrivent des
          activités qui vous attirent, pas un niveau de compétence ni une aptitude prouvée.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {top.map((code, index) => {
          const copy = DIMENSION_COPY[code];
          return (
            <div key={code} className="rounded-xl border border-stone-200 p-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-700 hover:bg-emerald-700">{`#${index + 1}`}</Badge>
                <h3 className="font-semibold text-stone-900">{copy.name}</h3>
              </div>
              <p className="mt-2 text-sm text-stone-600">
                Vous êtes attiré·e par {copy.everyday}.
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
