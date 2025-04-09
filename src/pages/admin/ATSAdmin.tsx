
import React from 'react';
import CandidateTable from '@/components/admin/ats/CandidateTable';
import CandidateDetail from '@/components/admin/ats/CandidateDetail';
import { useCandidates } from '@/hooks/admin/useCandidates';

export default function ATSAdmin() {
  const {
    candidates,
    loading,
    selectedCandidate,
    setSelectedCandidate,
    updateCandidateStatus,
    updateCandidateRating,
    updateCandidateNotes,
    deleteCandidate
  } = useCandidates();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des Candidatures</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CandidateTable 
            candidates={candidates}
            loading={loading}
            onSelectCandidate={setSelectedCandidate}
            onUpdateStatus={updateCandidateStatus}
            onUpdateRating={updateCandidateRating}
            onDeleteCandidate={deleteCandidate}
            selectedCandidateId={selectedCandidate?.id}
          />
        </div>
        
        <div>
          {selectedCandidate ? (
            <CandidateDetail
              candidate={selectedCandidate}
              onUpdateStatus={updateCandidateStatus}
              onUpdateRating={updateCandidateRating}
              onUpdateNotes={updateCandidateNotes}
              onClose={() => setSelectedCandidate(null)}
            />
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 h-full flex items-center justify-center text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Sélectionnez un candidat pour voir les détails
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
