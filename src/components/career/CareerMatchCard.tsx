import { ArrowRight, BookOpenCheck, Languages, Sparkles, Target, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { careerFitBand, percentFromRatio } from '@/lib/careerPresentation';
import type { CareerMatch } from '@/types/career';

interface CareerMatchCardProps {
  match: CareerMatch;
  rank?: number;
  compact?: boolean;
}

export function CareerMatchCard({ match, rank, compact = false }: CareerMatchCardProps) {
  const score = match.recommendationScore ?? match.fitScore;
  const band = careerFitBand(score);
  const cosinePercent = percentFromRatio(match.components.cosineSimilarity);
  const rankPercent = percentFromRatio(match.components.rankAgreement);
  const fallback = match.translationStatus === 'unavailable';
  const profile = match.profileComponents;
  const explanations = match.explanations || [];
  const caution = match.cautions?.[0]
    || 'Ce score mesure une proximité d’intérêts. Il ne garantit ni emploi, ni salaire, ni aptitude réglementaire.';

  return (
    <Card className="h-full min-w-0 overflow-hidden border-slate-200 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className={compact ? 'space-y-3 p-5' : 'space-y-4 p-6'}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {typeof rank === 'number' ? <Badge variant="outline">#{rank}</Badge> : null}
            <Badge>{score}%</Badge>
            {profile ? <Badge variant="secondary"><Sparkles className="mr-1 h-3 w-3" />Profil contextualisé</Badge> : null}
          </div>
          <Badge variant="secondary">{match.occupationCode || 'RIASEC'}</Badge>
        </div>
        <CardTitle className="break-words text-xl leading-tight">{match.preferredLabel}</CardTitle>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">RIASEC · O*NET {match.riasecSource.version}</Badge>
          {fallback ? (
            <Badge variant="outline"><Languages className="mr-1 h-3 w-3" />Anglais par défaut</Badge>
          ) : (
            <Badge variant="outline">Libellé · ESCO {match.presentationSource.version}</Badge>
          )}
        </div>
        <div>
          <p className="font-medium text-emerald-800">{band.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{band.description}</p>
        </div>
      </CardHeader>
      <CardContent className={compact ? 'space-y-4 p-5 pt-0' : 'space-y-5 p-6 pt-0'}>
        {profile ? (
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="min-w-0 rounded-lg bg-slate-50 p-3">
              <p className="flex items-center gap-1 text-slate-500"><Target className="h-3.5 w-3.5" />RIASEC</p>
              <p className="mt-1 font-semibold text-slate-900">{profile.riasec.score}%</p>
            </div>
            <div className="min-w-0 rounded-lg bg-slate-50 p-3">
              <p className="flex items-center gap-1 text-slate-500"><Wrench className="h-3.5 w-3.5" />Compétences</p>
              <p className="mt-1 font-semibold text-slate-900">
                {profile.skills.available ? `${profile.skills.score ?? 0}%` : 'Non renseigné'}
              </p>
            </div>
            <div className="min-w-0 rounded-lg bg-slate-50 p-3">
              <p className="flex items-center gap-1 text-slate-500"><BookOpenCheck className="h-3.5 w-3.5" />Préparation</p>
              <p className="mt-1 font-semibold text-slate-900">
                {profile.education.available ? `${profile.education.score ?? 0}%` : 'Non renseigné'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="min-w-0 rounded-lg bg-slate-50 p-3">
              <p className="text-slate-500">Proximité globale</p>
              <p className="mt-1 font-semibold text-slate-900">{cosinePercent}%</p>
            </div>
            <div className="min-w-0 rounded-lg bg-slate-50 p-3">
              <p className="text-slate-500">Intérêts dominants</p>
              <p className="mt-1 font-semibold text-slate-900">{rankPercent}%</p>
            </div>
          </div>
        )}

        {profile?.skills.matchedSkills.length ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Compétences reliées</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.skills.matchedSkills.slice(0, compact ? 3 : 6).map((skill) => (
                <Badge key={skill.escoUri} variant="outline" className="max-w-full whitespace-normal text-left">
                  {skill.label}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        {profile && explanations.length > 0 ? (
          <ul className="space-y-2 text-sm leading-relaxed text-slate-700">
            {explanations.slice(0, compact ? 2 : 3).map((explanation) => (
              <li key={explanation.code} className="rounded-lg border border-slate-200 p-3">{explanation.message}</li>
            ))}
          </ul>
        ) : null}

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
          <Target className="mr-1 inline h-3.5 w-3.5" />
          {caution}
        </div>
        <Button asChild className="w-full" variant="outline">
          <Link className="min-w-0" to={`/careers/${encodeURIComponent(match.occupationId)}`}>
            Voir la fiche métier <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
