import { ArrowLeft, CheckCircle2, Compass, ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import AdaptiveProfileWizard from '@/features/profile/AdaptiveProfileWizard';
import ProfileHypothesisPanel from '@/features/profile/ProfileHypothesisPanel';
import ProfileSynthesisPanel from '@/features/profile/ProfileSynthesisPanel';

export default function Profile() {
  usePageMeta({
    title: 'Mon profil',
    description: 'Complète ton profil pour recevoir des pistes plus adaptées à ta situation.',
    path: '/profile',
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto max-w-5xl space-y-8 px-4 pb-12 pt-24 lg:pt-28">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" />
          Retour à mon espace
        </Link>

        <header className="max-w-3xl">
          <p className="font-semibold text-emerald-700">Mon espace personnel</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">Mon profil</h1>
          <p className="mt-3 text-lg leading-8 text-gray-600">
            Quelques informations suffisent pour mieux adapter les métiers et les prochaines étapes à ta situation. Tu peux les modifier à tout moment.
          </p>
        </header>

        <section className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5" aria-labelledby="profile-benefits-title">
          <h2 id="profile-benefits-title" className="flex items-center gap-2 text-xl font-semibold text-blue-950">
            <Compass className="h-5 w-5" /> Pourquoi compléter ton profil ?
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-blue-950 sm:grid-cols-3">
            <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> Découvrir des métiers plus proches de ta situation.</p>
            <p className="flex gap-2"><ListChecks className="mt-0.5 h-4 w-4 shrink-0" /> Organiser tes prochaines étapes plus clairement.</p>
            <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> Retrouver une synthèse utile pour avancer.</p>
          </div>
        </section>

        <AdaptiveProfileWizard />
        <ProfileHypothesisPanel />
        <ProfileSynthesisPanel />
      </div>
    </main>
  );
}
