import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Download,
  FileText,
  Info,
  Loader2,
  RefreshCw,
  Target,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CvAnalysis, CvSeverity } from './types';
import { SCORE_DEFINITIONS, type ScoreKey } from './scoreDefs';
import { downloadCvReport, describeCvError } from './cvApi';

const SEVERITY_STYLE: Record<CvSeverity, string> = {
  critique: 'border-red-200 bg-red-50 text-red-800',
  important: 'border-amber-200 bg-amber-50 text-amber-800',
  suggestion: 'border-stone-200 bg-stone-50 text-stone-700',
};

const SECTION_LABELS: Record<string, string> = {
  contact: 'Coordonnées',
  summary: 'Résumé',
  experience: 'Expérience',
  education: 'Formation',
  skills: 'Compétences',
  languages: 'Langues',
};

// Barre d'un score avec son maximum reel (jamais /100 pour une composante).
const ScoreBar = ({ scoreKey, value }: { scoreKey: ScoreKey; value: number | null }) => {
  if (value === null) return null;
  const { label, maximum } = SCORE_DEFINITIONS[scoreKey];
  const ratio = Math.max(0, Math.min(1, value / maximum));
  const isTop = scoreKey === 'generalReadiness';
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className={isTop ? 'font-semibold text-stone-900' : 'text-stone-700'}>{label}</span>
        <span className={`font-heading font-bold ${isTop ? 'text-emerald-700' : 'text-stone-700'}`}>
          {value} / {maximum}
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-stone-200"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={maximum}
        aria-label={`${label} : ${value} sur ${maximum}`}
      >
        <div
          className={`h-full rounded-full ${isTop ? 'bg-emerald-700' : 'bg-emerald-500'}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
};

export const AnalysisResult = ({
  analysis,
  onRestart,
  onDelete,
}: {
  analysis: CvAnalysis;
  onRestart?: () => void;
  onDelete?: (id: string) => void;
}) => {
  const [downloading, setDownloading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const snap = analysis.snapshot;
  const scores = snap.scores;
  const target = snap.targetMatch;

  const handleDownload = async () => {
    setActionError(null);
    setDownloading(true);
    try {
      const blob = await downloadCvReport(analysis.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-cv-makoki-${analysis.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setActionError(describeCvError(error).message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* En-tete */}
      <Card className="overflow-hidden border border-stone-200 shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-amber-500 to-emerald-700" />
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-emerald-700 hover:bg-emerald-700">Analyse de CV</Badge>
            <Badge variant="outline">{analysis.algorithmVersion}</Badge>
          </div>
          <CardTitle className="font-heading text-2xl">
            Indice général : <span className="text-emerald-700">{scores.generalReadiness} / 100</span>
          </CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2 text-stone-500">
            <FileText className="h-4 w-4" />
            <span className="break-all">{snap.document.fileName || 'Document'}</span>
            <span>·</span>
            <span>Langue : {snap.document.detectedLanguage}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScoreBar scoreKey="structure" value={scores.structure} />
          <ScoreBar scoreKey="contentClarity" value={scores.contentClarity} />
          <ScoreBar scoreKey="impact" value={scores.impact} />
          <ScoreBar scoreKey="technicalUsability" value={scores.technicalUsability} />
          {scores.targetRelevance !== null ? (
            <ScoreBar scoreKey="targetRelevance" value={scores.targetRelevance} />
          ) : null}
        </CardContent>
      </Card>

      {/* Sections + compétences détectées */}
      <Card className="border border-stone-200 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Éléments détectés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {snap.sections.map((section) => (
              <Badge
                key={section.key}
                variant={section.present ? 'secondary' : 'outline'}
                className={section.present ? '' : 'text-stone-400'}
              >
                {section.present ? '✓ ' : '– '}
                {SECTION_LABELS[section.key] || section.key}
              </Badge>
            ))}
          </div>
          {snap.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {snap.skills.map((skill) => (
                <span
                  key={`${skill.domain}:${skill.canonical}`}
                  className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-800"
                >
                  {skill.canonical}
                </span>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Forces */}
      {snap.strengths.length > 0 ? (
        <Card className="border border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <BadgeCheck className="h-5 w-5 text-emerald-700" /> Points forts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {snap.strengths.map((strength) => (
                <li key={strength.code} className="flex items-center gap-2 text-stone-700">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                  {strength.title}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {/* Constats et recommandations explicables */}
      {snap.issues.length > 0 ? (
        <Card className="border border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" /> Axes d’amélioration
            </CardTitle>
            <CardDescription>Chaque point est expliqué et rattaché à une recommandation concrète.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snap.issues.map((issue) => (
              <div
                key={issue.code}
                className={`rounded-xl border p-4 ${SEVERITY_STYLE[issue.severity]}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold">{issue.title}</h4>
                  <Badge variant="outline" className="shrink-0 capitalize">{issue.severity}</Badge>
                </div>
                <p className="mt-1 text-sm opacity-90">{issue.observation}</p>
                <p className="mt-2 flex items-start gap-2 text-sm font-medium">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
                  {issue.recommendation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* Analyse ciblée si une offre a été fournie */}
      {target ? (
        <Card className="border border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-lg">
              <Target className="h-5 w-5 text-emerald-700" /> Analyse par rapport au poste ciblé
            </CardTitle>
            {target.jobTitle ? <CardDescription>Poste : {target.jobTitle}</CardDescription> : null}
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-stone-600">
              Recouvrement des mots-clés : <strong>{target.keywordOverlapPercent} / 100</strong>
            </p>
            {target.presentSkills.length > 0 ? (
              <div>
                <p className="font-semibold text-stone-800">Compétences du poste détectées</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {target.presentSkills.map((skill) => (
                    <span key={skill} className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">{skill}</span>
                  ))}
                </div>
              </div>
            ) : null}
            {target.missingSkills.length > 0 ? (
              <div>
                <p className="font-semibold text-stone-800">Compétences non détectées</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {target.missingSkills.map((skill) => (
                    <span key={skill} className="rounded-full bg-stone-100 px-3 py-1 text-stone-600">{skill}</span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-stone-500">
                  Mentionnez-les uniquement si vous les maîtrisez réellement.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Méthode et limites */}
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-600">
        <p className="flex items-center gap-2 font-semibold text-stone-800">
          <Info className="h-4 w-4" /> Méthode et limites
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          {snap.methodology.limitations.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
      </div>

      {actionError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {actionError}
        </p>
      ) : null}

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={handleDownload} disabled={downloading} className="bg-emerald-700 hover:bg-emerald-800">
          {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Télécharger le rapport PDF
        </Button>
        {onRestart ? (
          <Button variant="outline" onClick={onRestart}>
            <RefreshCw className="mr-2 h-4 w-4" /> Analyser un autre CV
          </Button>
        ) : null}
        {onDelete ? (
          <Button variant="ghost" className="text-red-600" onClick={() => onDelete(analysis.id)}>
            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
          </Button>
        ) : null}
      </div>
    </div>
  );
};
