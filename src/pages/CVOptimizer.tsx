import React from 'react';
import { CVUploadZone } from '@/components/admin/ats/CVUploadZone';

export default function CVOptimizerPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Optimiser mon CV</h1>
      <p className="text-gray-600 text-center mb-8">Téléchargez votre CV pour obtenir une analyse et des conseils d'optimisation adaptés au marché ATS.</p>
      <div className="max-w-2xl mx-auto">
        <CVUploadZone onCandidateCreated={() => {}} />
      </div>
    </div>
  );
} 