
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Candidate } from '@/types/candidates';
import { toast } from 'sonner';

export function useCandidates() {
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
      
      // Ensure all required fields are present in the data by providing defaults if needed
      const formattedCandidates: Candidate[] = (data || []).map(candidate => ({
        ...candidate,
        created_at: candidate.created_at || new Date().toISOString(), // Ensure created_at is always present
        status: candidate.status || 'new',
        rating: candidate.rating || 0
      }));
      
      setCandidates(formattedCandidates);
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

  return {
    candidates,
    loading,
    selectedCandidate,
    setSelectedCandidate,
    updateCandidateStatus,
    updateCandidateRating,
    updateCandidateNotes,
    deleteCandidate
  };
}
