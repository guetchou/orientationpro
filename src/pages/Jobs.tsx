import React from 'react';
import { LiveJobBoard } from '@/components/jobs/LiveJobBoard';

/**
 * Page des offres d'emploi
 */
export default function Jobs() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LiveJobBoard />
    </div>
  );
}
