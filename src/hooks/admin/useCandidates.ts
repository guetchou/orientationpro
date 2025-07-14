
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  status: string;
  resume_url?: string;
  rating: number;
  notes?: string;
  created_at?: string;
  motivation: string;
  experience: string;
}

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Charger les candidats
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCandidates(data || []);
      } catch (error: any) {
        console.error('Error fetching candidates:', error);
        setError(error.message);
        toast.error('Erreur lors du chargement des candidats');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  // Mettre à jour le statut d'un candidat
  const updateCandidateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      
      if (selectedCandidate?.id === id) {
        setSelectedCandidate(prev => prev ? { ...prev, status } : null);
      }
      
      toast.success('Statut mis à jour avec succès');
    } catch (error: any) {
      console.error('Error updating candidate status:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  // Mettre à jour la note d'un candidat
  const updateCandidateRating = async (id: string, rating: number) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ rating })
        .eq('id', id);

      if (error) throw error;
      
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, rating } : c));
      
      if (selectedCandidate?.id === id) {
        setSelectedCandidate(prev => prev ? { ...prev, rating } : null);
      }
      
      toast.success('Évaluation mise à jour avec succès');
    } catch (error: any) {
      console.error('Error updating candidate rating:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de l\'évaluation');
    }
  };

  // Mettre à jour les notes d'un candidat
  const updateCandidateNotes = async (id: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ notes })
        .eq('id', id);

      if (error) throw error;
      
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, notes } : c));
      
      if (selectedCandidate?.id === id) {
        setSelectedCandidate(prev => prev ? { ...prev, notes } : null);
      }
      
      toast.success('Notes mises à jour avec succès');
    } catch (error: any) {
      console.error('Error updating candidate notes:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour des notes');
    }
  };

  // Supprimer un candidat
  const deleteCandidate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCandidates(prev => prev.filter(c => c.id !== id));
      
      if (selectedCandidate?.id === id) {
        setSelectedCandidate(null);
      }
      
      toast.success('Candidat supprimé avec succès');
    } catch (error: any) {
      console.error('Error deleting candidate:', error);
      toast.error(error.message || 'Erreur lors de la suppression du candidat');
    }
  };

  return {
    candidates,
    loading,
    error,
    selectedCandidate,
    setSelectedCandidate,
    updateCandidateStatus,
    updateCandidateRating,
    updateCandidateNotes,
    deleteCandidate
  };
}
