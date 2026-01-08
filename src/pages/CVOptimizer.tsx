import React from 'react';
import { CVUploadZone } from '@/components/admin/ats/CVUploadZone';

export default function CVOptimizerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto py-12">
        <CVUploadZone onCandidateCreated={() => {}} />
      </div>
    </div>
  );
} 