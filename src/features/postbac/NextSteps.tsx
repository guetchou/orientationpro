import { Link } from 'react-router-dom';
import { BookOpen, ListChecks, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdvisorCta } from './AdvisorCta';

// Section « Prochaines étapes » : oriente vers l'exploration approfondie et
// l'accompagnement humain. Bloc formation volontairement prudent : aucune base
// d'etablissements n'est inventee.
export const NextSteps = ({ resultId }: { resultId: string }) => (
  <Card className="border border-stone-200 shadow-sm">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 font-heading text-xl">
        <ListChecks className="h-5 w-5 text-emerald-700" /> Prochaines étapes
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 text-sm text-stone-700">
      <div className="flex items-start gap-3">
        <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
        <p>
          <Link to={`/orientation/results/${encodeURIComponent(resultId)}/careers`} className="font-medium text-emerald-700 hover:underline">
            Consultez le classement complet des métiers
          </Link>{' '}
          pour comparer davantage de pistes et ouvrir chaque fiche métier.
        </p>
      </div>

      {/* Direction de formation — prudente, sans base d'etablissements inventee. */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <p className="font-semibold">Formations</p>
        <p className="mt-1">
          Les parcours de formation détaillés seront progressivement ajoutés et vérifiés. Pour le
          moment, consultez la fiche métier et demandez un accompagnement pour identifier les
          diplômes et établissements correspondant à votre situation.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <Users className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
        <div className="space-y-3">
          <p>Un conseiller peut vous aider à transformer ces pistes en projet concret.</p>
          <AdvisorCta compact />
        </div>
      </div>
    </CardContent>
  </Card>
);
