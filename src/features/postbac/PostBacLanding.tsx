import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  FileSearch,
  Info,
  ListChecks,
  MessageCircle,
  Sparkles,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AdvisorCta } from './AdvisorCta';

const STEPS = [
  { icon: FileSearch, title: 'Répondez au questionnaire', text: 'Un questionnaire sur vos intérêts, sans bonne ni mauvaise réponse.' },
  { icon: Sparkles, title: 'Obtenez un profil immédiat', text: 'Vos familles d’intérêts dominantes, expliquées en langage clair.' },
  { icon: Target, title: 'Découvrez des métiers à explorer', text: 'Des métiers rapprochés de votre profil, avec le pourquoi de chaque piste.' },
  { icon: Compass, title: 'Ouvrez les fiches métiers', text: 'Comprenez ce que recouvre chaque métier avant de choisir.' },
  { icon: MessageCircle, title: 'Faites-vous accompagner', text: 'Un conseiller peut vous aider à transformer les pistes en projet.' },
];

// Page publique de presentation du parcours post-bac. Le vocabulaire commercial
// n'emploie pas « RIASEC » ; la methode est evoquee dans les limites.
export const PostBacLanding = () => (
  <main className="min-h-screen bg-stone-50">
    {/* Hero */}
    <section className="relative isolate overflow-hidden bg-emerald-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-white/10 px-4 py-1.5 text-sm font-medium text-amber-100">
          <Sparkles className="h-4 w-4" /> Après le bac
        </span>
        <h1 className="mt-6 font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
          Le bac est obtenu. Découvrez maintenant les métiers et les parcours qui pourraient vous
          correspondre.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-emerald-50/90">
          Répondez à un questionnaire sur vos intérêts et obtenez immédiatement des métiers à
          explorer, des explications et de premières pistes de formation.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild className="bg-amber-400 text-emerald-950 hover:bg-amber-300">
            <Link to="/tests">
              Découvrir mon profil <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link to="/conseiller">Être accompagné</Link>
          </Button>
        </div>
      </div>
    </section>

    {/* Problème */}
    <section className="mx-auto max-w-4xl px-6 py-14">
      <h2 className="font-heading text-2xl font-bold text-stone-900">Après le bac, le vrai défi commence</h2>
      <p className="mt-3 text-lg leading-8 text-stone-600">
        Choisir une voie sans repères clairs est difficile. MAKOKI vous aide à partir de vous-même :
        vos intérêts d’abord, puis des métiers concrets à explorer, expliqués simplement.
      </p>
    </section>

    {/* Étapes */}
    <section className="border-y border-stone-200 bg-white py-14">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-8 font-heading text-2xl font-bold text-stone-900">Comment ça fonctionne</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Card className="h-full border border-stone-200 shadow-sm">
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <step.icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold text-stone-500">Étape {index + 1}</span>
                  </div>
                  <h3 className="font-semibold text-stone-900">{step.title}</h3>
                  <p className="text-sm text-stone-600">{step.text}</p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>

    {/* Limites méthodologiques */}
    <section className="mx-auto max-w-4xl px-6 py-14">
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <p className="flex items-center gap-2 font-semibold text-stone-800">
          <Info className="h-5 w-5 text-stone-500" /> Ce que ces réponses sont, et ne sont pas
        </p>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm leading-6 text-stone-600">
          <li>Le questionnaire mesure des <strong>intérêts</strong>, pas des aptitudes ni des notes.</li>
          <li>Les métiers proposés sont des <strong>pistes à explorer</strong>, pas une orientation certaine.</li>
          <li>La méthode s’appuie sur le modèle d’intérêts RIASEC et un catalogue métiers sourcé (O*NET) ; elle ne garantit ni admission, ni emploi.</li>
          <li>Aucune note, matière, probabilité de réussite ou condition d’admission n’est déduite de vos réponses.</li>
        </ul>
      </div>
    </section>

    {/* CTA final */}
    <section className="bg-emerald-950 py-16 text-center text-white">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="flex items-center justify-center gap-2 font-heading text-2xl font-bold sm:text-3xl">
          <ListChecks className="h-6 w-6 text-amber-300" /> Prêt à obtenir vos premières pistes ?
        </h2>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild className="bg-amber-400 text-emerald-950 hover:bg-amber-300">
            <Link to="/tests">
              Découvrir mon profil <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <div className="sm:self-center">
            <AdvisorCta compact />
          </div>
        </div>
      </div>
    </section>
  </main>
);

export default PostBacLanding;
