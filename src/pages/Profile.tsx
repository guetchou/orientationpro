import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdaptiveProfileWizard from '@/features/profile/AdaptiveProfileWizard';
import ProfileHypothesisPanel from '@/features/profile/ProfileHypothesisPanel';
import ProfileSynthesisPanel from '@/features/profile/ProfileSynthesisPanel';

export default function Profile() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="container mx-auto max-w-5xl space-y-6 px-4 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700">
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Link>
        <ProfileHypothesisPanel />
        <ProfileSynthesisPanel />
        <AdaptiveProfileWizard />
      </div>
    </main>
  );
}
