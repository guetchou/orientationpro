import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { RiasecDimensionCode } from '@/types/riasec';
import type { CareerMatch } from '@/types/career';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildCareerReason } from './reasons';

// Carte d'un metier prioritaire : intitule + raison explicable + lien fiche.
// Le fitScore affiche provient de l'API ; aucun score n'est calcule ici.
export const CareerReasonCard = ({
  match,
  userTopCodes,
  rank,
}: {
  match: CareerMatch;
  userTopCodes: RiasecDimensionCode[];
  rank: number;
}) => {
  const reason = buildCareerReason(match, userTopCodes);
  return (
    <Card className="flex flex-col border border-stone-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline">Piste {rank}</Badge>
          <span className="text-xs text-stone-500">{reason.proximityLabel}</span>
        </div>
        <CardTitle className="font-heading text-lg leading-tight">{match.preferredLabel}</CardTitle>
      </CardHeader>
      <CardContent className="mt-auto space-y-4">
        <p className="text-sm leading-6 text-stone-600">{reason.text}</p>
        <Button asChild variant="outline" className="w-full">
          <Link to={`/careers/${encodeURIComponent(match.occupationId)}`}>
            Voir la fiche métier <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
