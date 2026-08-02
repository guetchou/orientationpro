'use strict';

const fs = require('node:fs');

const target = 'src/features/life-project/LifeProjectWorkspace.tsx';
let source = fs.readFileSync(target, 'utf8');

const replaceOnce = (before, after, label) => {
  if (!source.includes(before)) {
    throw new Error(`Patch anchor missing: ${label}`);
  }
  source = source.replace(before, after);
};

replaceOnce(
  "import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';",
  "import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, Printer, RefreshCw } from 'lucide-react';",
  'printer import',
);

replaceOnce(
  `const scenarioSummary = (scenario: AdvisorRecommendationScenario) => {\n  const parts: string[] = [];\n  if (scenario.durationMonths !== null) parts.push(\`${'${scenario.durationMonths}'} mois environ\`);\n  if (scenario.cost.amount !== null) {\n    parts.push(\`${'${new Intl.NumberFormat(\'fr-FR\').format(scenario.cost.amount)}'} ${'${scenario.cost.currency || \'FCFA\'}'}\`);\n  }\n  return parts.join(' · ') || 'Durée et coût à confirmer';\n};`,
  `const scenarioSummary = (scenario: AdvisorRecommendationScenario) => {\n  const parts: string[] = [];\n  if (scenario.durationMonths !== null) parts.push(\`${'${scenario.durationMonths}'} mois environ\`);\n  if (scenario.cost.amount !== null) {\n    parts.push(\`${'${new Intl.NumberFormat(\'fr-FR\').format(scenario.cost.amount)}'} ${'${scenario.cost.currency || \'FCFA\'}'}\`);\n  }\n  return parts.join(' · ') || 'Durée et coût à confirmer';\n};\n\nconst scenarioCalendar = (scenario: AdvisorRecommendationScenario) => {\n  if (scenario.calendar.status === 'closed') return 'Inscriptions fermées pour la période connue';\n  if (scenario.calendar.status === 'unknown') return 'Dates à confirmer auprès de l’organisme';\n  const details = ['Inscriptions ouvertes'];\n  if (scenario.calendar.applicationDeadlineAt) {\n    details.push(\`candidature avant le ${'${new Date(scenario.calendar.applicationDeadlineAt).toLocaleDateString(\'fr-FR\')}'}\`);\n  }\n  if (scenario.calendar.nextStartAt) {\n    details.push(\`prochain démarrage le ${'${new Date(scenario.calendar.nextStartAt).toLocaleDateString(\'fr-FR\')}'}\`);\n  }\n  return details.join(' · ');\n};\n\nconst scenarioModes = (scenario: AdvisorRecommendationScenario) => (\n  scenario.modes.length > 0 ? scenario.modes.join(', ') : 'Modalités à confirmer'\n);`,
  'scenario formatting helpers',
);

replaceOnce(
  `                    <CardDescription>{scenarioSummary(scenario)}</CardDescription>\n                  </CardHeader>`,
  `                    <CardDescription>{scenarioSummary(scenario)}</CardDescription>\n                  </CardHeader>\n                  <CardContent className=\"grid gap-3 border-b pb-4 text-sm sm:grid-cols-2\">\n                    <div className=\"rounded-lg bg-muted/40 p-3\">\n                      <h3 className=\"font-semibold\">Calendrier</h3>\n                      <p className=\"mt-1 text-muted-foreground\">{scenarioCalendar(scenario)}</p>\n                    </div>\n                    <div className=\"rounded-lg bg-muted/40 p-3\">\n                      <h3 className=\"font-semibold\">Modalités</h3>\n                      <p className=\"mt-1 text-muted-foreground\">{scenarioModes(scenario)}</p>\n                    </div>\n                  </CardContent>`,
  'scenario calendar and modes',
);

replaceOnce(
  `      {selectedScenario && (\n        <Card className=\"border-emerald-200 bg-emerald-50/50\">\n          <CardHeader>\n            <CardTitle>Ta prochaine étape</CardTitle>\n            <CardDescription>\n              Vérifie les conditions réelles de « {selectedScenario.title} », puis note une première action concrète à réaliser cette semaine.\n            </CardDescription>\n          </CardHeader>\n        </Card>\n      )}`,
  `      {selectedScenario && (\n        <section id=\"life-project-summary\" aria-labelledby=\"life-project-summary-title\" className=\"space-y-4\">\n          <Card className=\"border-emerald-200 bg-emerald-50/50\">\n            <CardHeader>\n              <Badge className=\"w-fit\">Choix provisoire</Badge>\n              <CardTitle id=\"life-project-summary-title\">Ta synthèse de projet</CardTitle>\n              <CardDescription>\n                Cette synthèse t’aide à préparer la prochaine vérification. Elle ne remplace ni les conditions officielles ni une décision accompagnée.\n              </CardDescription>\n            </CardHeader>\n            <CardContent className=\"space-y-5\">\n              <div>\n                <h3 className=\"font-semibold\">Piste retenue</h3>\n                <p className=\"mt-1 text-lg font-medium\">{selectedScenario.title}</p>\n                <p className=\"mt-1 text-sm text-muted-foreground\">{scenarioSummary(selectedScenario)}</p>\n              </div>\n              <div className=\"grid gap-3 text-sm sm:grid-cols-2\">\n                <div className=\"rounded-lg border bg-background p-3\">\n                  <h3 className=\"font-semibold\">Calendrier</h3>\n                  <p className=\"mt-1 text-muted-foreground\">{scenarioCalendar(selectedScenario)}</p>\n                </div>\n                <div className=\"rounded-lg border bg-background p-3\">\n                  <h3 className=\"font-semibold\">Modalités</h3>\n                  <p className=\"mt-1 text-muted-foreground\">{scenarioModes(selectedScenario)}</p>\n                </div>\n              </div>\n              {selectedScenario.firstActions[0] && (\n                <div>\n                  <h3 className=\"font-semibold\">Première action</h3>\n                  <p className=\"mt-1\">{selectedScenario.firstActions[0].title}</p>\n                  <p className=\"mt-1 text-sm text-muted-foreground\">\n                    À réaliser sous {selectedScenario.firstActions[0].deadlineDays} jour(s). Preuve attendue : {selectedScenario.firstActions[0].expectedEvidence}\n                  </p>\n                </div>\n              )}\n              <p className=\"text-sm text-muted-foreground\">\n                Vérifie les admissions, les coûts, les dates, les modalités et les débouchés auprès des organismes concernés avant tout engagement.\n              </p>\n              <Button type=\"button\" variant=\"outline\" className=\"print:hidden\" onClick={() => window.print()}>\n                <Printer className=\"mr-2 h-4 w-4\" />Imprimer ma synthèse\n              </Button>\n            </CardContent>\n          </Card>\n          <Card className=\"border-emerald-200 bg-emerald-50/50 print:hidden\">\n            <CardHeader>\n              <CardTitle>Ta prochaine étape</CardTitle>\n              <CardDescription>\n                Vérifie les conditions réelles de « {selectedScenario.title} », puis réalise la première action proposée cette semaine.\n              </CardDescription>\n            </CardHeader>\n          </Card>\n        </section>\n      )}`,
  'printable synthesis',
);

fs.writeFileSync(target, source);
process.stdout.write(`Updated ${target}\n`);
