import { usePageMeta } from '@/hooks/usePageMeta';
import { CalendarClock, Mail, MessageCircle, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const waysToPrepare = [
  {
    title: 'Faire le point sur ta situation',
    description: 'Note tes questions, tes objectifs et les choix qui te posent problème.',
    icon: UserCheck,
  },
  {
    title: 'Rassembler les informations utiles',
    description: 'Prépare tes résultats, diplômes, contraintes et pistes déjà envisagées.',
    icon: CalendarClock,
  },
];

export default function BookAppointment() {
  usePageMeta({ title: 'Demander un accompagnement', description: 'Contacte MAKOKI pour une demande d’accompagnement en orientation.', path: '/book-appointment' });
  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-20 pt-28">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="font-semibold text-emerald-700">Accompagnement</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Besoin d’aide pour avancer dans ton projet ?
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-700">
            Présente ta situation et tes questions à MAKOKI. Nous pourrons t’orienter vers la prochaine étape la plus adaptée.
          </p>
        </div>

        <Card className="mt-10 border-emerald-200 bg-emerald-50 shadow-none">
          <CardHeader>
            <CardTitle>Envoyer une demande</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <a href="mailto:contact@makoki.org?subject=Demande%20d%27accompagnement%20MAKOKI"><Mail className="mr-2 h-4 w-4" />Écrire à MAKOKI</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://wa.me/242055344253" target="_blank" rel="noreferrer"><MessageCircle className="mr-2 h-4 w-4" />Contacter par WhatsApp</a>
            </Button>
            <Button variant="ghost" asChild><Link to="/parcours">Commencer mon projet</Link></Button>
          </CardContent>
        </Card>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {waysToPrepare.map((item) => (
            <Card key={item.title} className="border-slate-200 shadow-sm">
              <CardHeader>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><item.icon className="h-5 w-5" /></span>
                <CardTitle className="mt-3 text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-slate-700">{item.description}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
