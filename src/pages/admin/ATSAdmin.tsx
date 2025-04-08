
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Candidate } from '@/types/candidates';
import { toast } from 'sonner';
import CandidateTable from '@/components/admin/ats/CandidateTable';
import CandidateDetail from '@/components/admin/ats/CandidateDetail';

export default function ATSAdmin() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Erreur lors du chargement des candidats');
    } finally {
      setLoading(false);
    }
  }

  async function updateCandidateStatus(id: string, status: Candidate['status']) {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setCandidates(candidates.map(candidate => 
        candidate.id === id ? { ...candidate, status } : candidate
      ));
      
      if (selectedCandidate?.id === id) {
        setSelectedCandidate({ ...selectedCandidate, status });
      }
      
      toast.success(`Statut mis à jour: ${status}`);
    } catch (error) {
      console.error('Error updating candidate status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  }

  async function updateCandidateRating(id: string, rating: number) {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ rating })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setCandidates(candidates.map(candidate => 
        candidate.id === id ? { ...candidate, rating } : candidate
      ));
      
      if (selectedCandidate?.id === id) {
        setSelectedCandidate({ ...selectedCandidate, rating });
      }
      
      toast.success(`Note mise à jour: ${rating}/5`);
    } catch (error) {
      console.error('Error updating candidate rating:', error);
      toast.error('Erreur lors de la mise à jour de la note');
    }
  }

  async function updateCandidateNotes(id: string, notes: string) {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ notes })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setCandidates(candidates.map(candidate => 
        candidate.id === id ? { ...candidate, notes } : candidate
      ));
      
      if (selectedCandidate?.id === id) {
        setSelectedCandidate({ ...selectedCandidate, notes });
      }
      
      toast.success('Notes mises à jour');
    } catch (error) {
      console.error('Error updating candidate notes:', error);
      toast.error('Erreur lors de la mise à jour des notes');
    }
  }

  async function deleteCandidate(id: string) {
    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setCandidates(candidates.filter(candidate => candidate.id !== id));
      
      if (selectedCandidate?.id === id) {
        setSelectedCandidate(null);
      }
      
      toast.success('Candidat supprimé');
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Erreur lors de la suppression du candidat');
    }
  }

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
