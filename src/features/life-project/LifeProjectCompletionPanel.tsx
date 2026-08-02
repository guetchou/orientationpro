import { useCallback, useEffect, useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getAdvisorProject,
  LIFE_PROJECT_UPDATED_EVENT,
  listAdvisorProjects,
} from './advisor-api';
import type { AdvisorEnvelope, AdvisorRecommendationScenario } from './advisor-types';

const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC' }).format(date);
};

const formatDuration = (scenario: AdvisorRecommendationScenario) => (
  scenario.durationMonths === null ? 'À confirmer' : `${scenario.durationMonths} mois`
);

const formatCost = (scenario: AdvisorRecommendationScenario) => {
  if (scenario.cost.status === 'unknown' || scenario.cost.amount === null) return 'À confirmer';
  const amount = new Intl.NumberFormat('fr-FR').format(scenario.cost.amount);
  const value = `${amount} ${scenario.cost.currency || 'FCFA'}`;
  return scenario.cost.status === 'range' ? `À partir de ${value}` : value;
};

const formatCalendar = (scenario: AdvisorRecommendationScenario) => {
  if (scenario.calendar.status === 'closed') return 'Fermé pour la période connue';
  if (scenario.calendar.status === 'unknown') return 'À confirmer';

  const details = ['Ouvert'];
  const deadline = formatDate(scenario.calendar.applicationDeadlineAt);
  const start = formatDate(scenario.calendar.nextStartAt);
  if (deadline) details.push(`candidature avant le ${deadline}`);
  if (start) details.push(`démarrage le ${start}`);
  return details.join(' · ');
};

const formatModes = (scenario: AdvisorRecommendationScenario) => (
  scenario.modes.length > 0 ? scenario.modes.join(', ') : 'À confirmer'
);

const formatAccess = (scenario: AdvisorRecommendationScenario) => {
  const values = [...new Set([
    ...scenario.geographies,
    ...scenario.localOpportunities
      .map((opportunity) => opportunity.zone)
      .filter((zone): zone is string => Boolean(zone)),
  ])];
  return values.join(', ') || 'À confirmer';
};

const facts = (scenario: AdvisorRecommendationScenario) => [
  { label: 'Durée', value: formatDuration(scenario) },
  { label: 'Coût', value: formatCost(scenario) },
  { label: 'Calendrier', value: formatCalendar(scenario) },
  { label: 'Modalités', value: formatModes(scenario) },
  { label: 'Accès / zone', value: formatAccess(scenario) },
];

export default function LifeProjectCompletionPanel() {
  const [current, setCurrent] = useState<AdvisorEnvelope | null>(null);

  const loadLatest = useCallback(async () => {
    try {
      const response = await listAdvisorProjects();
      if (!response.projects[0]) {
        setCurrent(null);
        return;
      }
      setCurrent(await getAdvisorProject(response.projects[0].id));
    } catch {
      setCurrent(null);
    }
  }, []);

  useEffect(() => {
    void loadLatest();
    const handleUpdate = (event: Event) => {
      const envelope = (event as CustomEvent<AdvisorEnvelope>).detail;
      if (envelope?.project?.id) setCurrent(envelope);
      else void loadLatest();
    };
    window.addEventListener(LIFE_PROJECT_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(LIFE_PROJECT_UPDATED_EVENT, handleUpdate);
  }, [loadLatest]);

  const recommendations = current?.project.recommendation?.scenarios || [];
  const selectedScenario = useMemo(
    () => recommendations.find((scenario) => scenario.id === current?.project.activeScenarioId) || null,
    [current?.project.activeScenarioId, recommendations],
  );

  if (!current || recommendations.length === 0) return null;

  return (
    <div className="space-y-6">
      <section className="space-y-4 print:hidden" aria-labelledby="life-project-comparison-title">
        <div>
          <h2 id="life-project-comparison-title" className="text-2xl font-bold">Comparaison complète de tes pistes</h2>
          <p className="mt-2 text-muted-foreground">
            Compare les informations connues. Une donnée non vérifiée reste indiquée « À confirmer ».
          </p>
        </div>
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[880px] border-collapse text-left text-sm">
              <thead className="bg-muted/60">
                <tr>
                  {['Option', 'Durée', 'Coût', 'Calendrier', 'Modalités', 'Accès / zone'].map((heading) => (
                    <th key={heading} scope="col" className="border-b px-4 py-3 font-semibold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recommendations.map((scenario) => (
                  <tr key={scenario.id} className={scenario.id === current.project.activeScenarioId ? 'bg-emerald-50/70' : ''}>
                    <th scope="row" className="border-b px-4 py-4 align-top font-semibold">
                      {scenario.title}
                      {scenario.id === current.project.activeScenarioId && (
                        <Badge className="mt-2 block w-fit">Choix provisoire</Badge>
                      )}
                    </th>
                    <td className="border-b px-4 py-4 align-top">{formatDuration(scenario)}</td>
                    <td className="border-b px-4 py-4 align-top">{formatCost(scenario)}</td>
                    <td className="border-b px-4 py-4 align-top">{formatCalendar(scenario)}</td>
                    <td className="border-b px-4 py-4 align-top">{formatModes(scenario)}</td>
                    <td className="border-b px-4 py-4 align-top">{formatAccess(scenario)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      {selectedScenario && (
        <section id="life-project-summary" aria-labelledby="life-project-summary-title" className="break-inside-avoid">
          <Card className="border-emerald-300 bg-emerald-50/40 print:border-0 print:bg-white print:shadow-none">
            <CardHeader>
              <Badge className="w-fit">Synthèse de ton projet</Badge>
              <CardTitle id="life-project-summary-title">Ton choix provisoire et ta prochaine action</CardTitle>
              <CardDescription>
                Cette synthèse aide à poursuivre les vérifications. Elle ne remplace pas la confirmation des admissions, coûts et dates auprès des organismes concernés.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground">Projet</p>
                <p className="font-semibold">{current.project.title}</p>
                <p className="mt-3 text-sm text-muted-foreground">Piste retenue provisoirement</p>
                <p className="text-lg font-bold">{selectedScenario.title}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {facts(selectedScenario).map((fact) => (
                  <div key={fact.label} className="rounded-lg border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{fact.label}</p>
                    <p className="mt-2 text-sm font-medium">{fact.value}</p>
                  </div>
                ))}
              </div>

              {selectedScenario.reasons.length > 0 && (
                <div>
                  <h3 className="font-semibold">Pourquoi cette piste ressort</h3>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    {selectedScenario.reasons.slice(0, 3).map((reason) => (
                      <li key={reason.signal}>• {reason.explanation}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedScenario.conditions.length > 0 && (
                <div>
                  <h3 className="font-semibold">Points à vérifier</h3>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    {selectedScenario.conditions.slice(0, 4).map((condition) => <li key={condition}>• {condition}</li>)}
                  </ul>
                </div>
              )}

              {selectedScenario.firstActions[0] && (
                <div className="rounded-lg border border-emerald-300 bg-emerald-100/60 p-4 text-emerald-950">
                  <h3 className="font-semibold">Première action à réaliser</h3>
                  <p className="mt-2 font-medium">{selectedScenario.firstActions[0].title}</p>
                  <p className="mt-1 text-sm">Délai conseillé : sous {selectedScenario.firstActions[0].deadlineDays} jour(s).</p>
                  <p className="mt-1 text-sm">Preuve attendue : {selectedScenario.firstActions[0].expectedEvidence}</p>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Le choix reste provisoire jusqu’à vérification des conditions locales et des informations encore inconnues.
              </p>

              <Button type="button" variant="outline" className="print:hidden" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />Imprimer ou télécharger en PDF
              </Button>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
