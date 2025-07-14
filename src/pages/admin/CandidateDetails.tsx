
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CandidateHeader } from '@/components/admin/ats/CandidateHeader';
import { CandidateInfo } from '@/components/admin/ats/CandidateInfo';
import { CandidateTabs } from '@/components/admin/ats/CandidateTabs';
import { motion } from 'framer-motion';

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  status: string;
  created_at: string;
  updated_at?: string;
  notes?: string;
  rating?: number;
  experience?: string;
  motivation?: string;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  screening: "bg-yellow-500",
  interview: "bg-purple-500",
  offer: "bg-green-500",
  rejected: "bg-red-500"
};

const CandidateDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const isMobile = useIsMobile();
  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setCandidate(data as Candidate);
        setNotes(data.notes || '');
        setStatus(data.status);
        setRating(data.rating || 0);
      } catch (error) {
        const errorMessage = "Impossible de charger les données du candidat";
        handleError(error, errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCandidate();
  }, [id, handleError]);

  const handleSave = async () => {
    if (!id) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('candidates')
        .update({
          status,
          rating,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Les informations du candidat ont été mises à jour",
      });
    } catch (error) {
      handleError(error, "Impossible de mettre à jour les informations");
    } finally {
      setSaving(false);
    }
  };
  
  // État d'erreur 
  if (error) {
    return (
      <motion.div 
        className="container mx-auto py-8 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin/ats')} className="mb-4">
            <Loader2 className="mr-2 h-4 w-4" /> Retour à la liste
          </Button>
          <ThemeToggle />
        </div>
        
        <Card className="border-red-300 shadow-lg">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-t-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">Erreur</h2>
            </div>
            <p className="text-red-600 dark:text-red-300 mt-1">
              {error}
            </p>
          </div>
          <div className="text-center py-6 px-4">
            <p className="mb-4 dark:text-gray-300">Impossible de charger les informations du candidat.</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="transition-all duration-300 hover:bg-primary hover:text-white">
              Réessayer
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="ml-3 text-lg">Chargement du profil...</span>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2 dark:text-white">Candidat non trouvé</h2>
        <Button variant="outline" onClick={() => navigate('/admin/ats')} className="transition-colors hover:bg-primary hover:text-white">
          Retour à la liste
        </Button>
      </div>
    );
  }

  const createdDate = new Date(candidate.created_at).toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });

  return (
    <motion.div 
      className="container mx-auto py-8 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <CandidateHeader 
            name={candidate.full_name}
            status={candidate.status}
            statusColors={statusColors}
            createdDate={createdDate}
          />
        </div>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="md:col-span-1"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CandidateInfo 
            candidate={candidate}
            createdDate={createdDate}
            status={status}
            setStatus={setStatus}
            rating={rating}
            setRating={setRating}
            onSave={handleSave}
            saving={saving}
          />
        </motion.div>

        <motion.div 
          className="md:col-span-2"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CandidateTabs 
            candidate={candidate}
            createdDate={createdDate}
            notes={notes}
            setNotes={setNotes}
            onSave={handleSave}
            saving={saving}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CandidateDetails;
