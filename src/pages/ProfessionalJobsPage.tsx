import React from 'react';
import { ProfessionalJobBoard } from '@/components/recruitment/ProfessionalJobBoard';

/**
 * Page professionnelle des offres d'emploi
 * Design inspiré des meilleurs sites de recrutement mondiaux
 */
export default function ProfessionalJobsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ProfessionalJobBoard />
    </div>
  );
}
