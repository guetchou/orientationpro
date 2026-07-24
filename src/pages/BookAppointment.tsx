import { CalendarClock, ClipboardCheck, ShieldCheck, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const requirements = [
  {
    title: 'Identité professionnelle vérifiée',
    description: 'Le nom, le rôle, les qualifications déclarées et le cadre d’intervention doivent être contrôlés avant publication.',
    icon: UserCheck,
  },
  {
    title: 'Créneaux réellement disponibles',
    description: 'Le calendrier doit provenir du système de rendez-vous et empêcher les doubles réservations.',
    icon: CalendarClock,
  },
  {
    title: 'Conditions clairement annoncées',
    description: 'Le format, la durée, le tarif éventuel, le lieu et les modalités d’annulation doivent être affichés avant confirmation.',
    icon: ClipboardCheck,
  },
];

export default function BookAppointment() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-20 pt-28">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="font-semibold text-emerald-700">Accompagnement</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Prendre rendez-vous avec un conseiller
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-700">
            L’annuaire public des conseillers n’est pas encore ouvert. MAKOKI n’affiche aucun profil, tarif, avis ou disponibilité de démonstration à la place de professionnels réellement référencés.
          </p>
        </div>

        <Card className="mt-10 border-amber-200 bg-amber-50 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-950">
              <ShieldCheck className="h-5 w-5" />Module en préparation
            </CardTitle>
            <CardDescription className="text-amber-900">
              La réservation sera activée après validation de l’annuaire, des disponibilités et du processus de confirmation.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button asChild><Link to="/tests">Commencer par les tests</Link></Button>
            <Button variant="outline" asChild><Link to="/orientation/results">Consulter mes résultats</Link></Button>
          </CardContent>
        </Card>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {requirements.map((requirement) => (
            <Card key={requirement.title} className="border-slate-200 shadow-sm">
              <CardHeader>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                  <requirement.icon className="h-5 w-5" />
                </span>
                <CardTitle className="mt-3 text-lg">{requirement.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-slate-700">
                {requirement.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
