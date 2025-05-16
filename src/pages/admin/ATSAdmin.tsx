
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardNav from '@/components/DashboardNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { CandidateStatsCards } from '@/components/admin/ats/CandidateStatsCards';
import { CandidateCharts } from '@/components/admin/ats/CandidateCharts';
import { CandidateSearch } from '@/components/admin/ats/CandidateSearch';
import { CandidatesList } from '@/components/admin/ats/CandidatesList';
import { MobileNavigation } from '@/components/admin/ats/MobileNavigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion } from 'framer-motion';

interface CandidateStats {
  total: number;
  byStatus: Record<string, number>;
  byPosition: Record<string, number>;
  newThisWeek: number;
  conversionRate: number;
}

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
  new: "bg-blue-500 border-blue-600",
  screening: "bg-yellow-500 border-yellow-600",
  interview: "bg-purple-500 border-purple-600",
  offer: "bg-green-500 border-green-600",
  rejected: "bg-red-500 border-red-600"
};

const ATSAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const isMobile = useIsMobile();
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('candidates');
  const [stats, setStats] = useState<CandidateStats>({
    total: 0,
    byStatus: {},
    byPosition: {},
    newThisWeek: 0,
    conversionRate: 0
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    // Filtrer les candidats en fonction des critères de recherche et de statut
    let results = [...candidates];
    
    if (searchTerm) {
      results = results.filter(candidate => 
        candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      results = results.filter(candidate => candidate.status === filterStatus);
    }
    
    setFilteredCandidates(results);
  }, [searchTerm, filterStatus, candidates]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setStatsLoading(true);
      
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const candidateData = data as Candidate[] || [];
      setCandidates(candidateData);
      setFilteredCandidates(candidateData);
      calculateStats(candidateData);
    } catch (error) {
      handleError(error, "Erreur lors du chargement des candidats");
    } finally {
      setLoading(false);
      setTimeout(() => setStatsLoading(false), 500); // Délai pour montrer les skeletons
    }
  };

  const calculateStats = (candidateData: Candidate[]) => {
    // Calculer les statistiques globales
    const byStatus = candidateData.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    const byPosition = candidateData.reduce<Record<string, number>>((acc, c) => {
      acc[c.position] = (acc[c.position] || 0) + 1;
      return acc;
    }, {});

    // Calculer les candidats de cette semaine
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = candidateData.filter(c => 
      new Date(c.created_at) >= oneWeekAgo
    ).length;

    // Calculer le taux de conversion (pourcentage d'offres sur le total)
    const totalOffers = byStatus.offer || 0;
    const totalRejected = byStatus.rejected || 0;
    const conversionRate = candidateData.length > 0 
      ? Math.round((totalOffers / (totalOffers + totalRejected || 1)) * 100)
      : 0;

    setStats({
      total: candidateData.length,
      byStatus,
      byPosition,
      newThisWeek,
      conversionRate
    });
  };

  const handleStatusChange = async (candidateId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ status: newStatus })
        .eq('id', candidateId);

      if (error) throw error;

      // Mettre à jour l'état local
      const updatedCandidates = candidates.map(c => 
        c.id === candidateId ? { ...c, status: newStatus } : c
      );
      
      setCandidates(updatedCandidates);
      calculateStats(updatedCandidates);

      toast({
        title: "Statut mis à jour",
        description: "Le statut du candidat a été modifié avec succès.",
      });
    } catch (error) {
      handleError(error, "Impossible de mettre à jour le statut du candidat");
    }
  };

  const handleExportCSV = () => {
    try {
      // Convertir les données en CSV
      const headers = ['Nom', 'Email', 'Téléphone', 'Poste', 'Statut', 'Date de candidature'];
      
      const csvData = [
        headers.join(','),
        ...filteredCandidates.map(c => {
          const date = new Date(c.created_at).toLocaleDateString();
          return `"${c.full_name}","${c.email}","${c.phone}","${c.position}","${c.status}","${date}"`;
        })
      ].join('\n');
      
      // Créer un blob et télécharger
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'candidats.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export réussi",
        description: "Le fichier CSV a été généré et téléchargé.",
      });
    } catch (error) {
      handleError(error, "Erreur lors de l'exportation des données");
    }
  };

  // Préparer les données pour les graphiques
  const statusChartData = Object.entries(stats.byStatus).map(([name, value]) => ({ name, value }));
  const positionChartData = Object.entries(stats.byPosition)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);  // Top 5 positions

  return (
    <motion.div 
      className="container mx-auto p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-6 dark:text-white">Système de suivi des candidatures</h1>
        <ThemeToggle />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation latérale - masquée sur mobile et remplacée par une barre en haut */}
        <div className="md:col-span-1 hidden md:block">
          <DashboardNav />
        </div>
        
        {/* Navigation mobile simplifiée */}
        <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="md:col-span-3">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 w-full justify-start overflow-x-auto">
              <TabsTrigger value="dashboard" className="transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Tableau de bord
              </TabsTrigger>
              <TabsTrigger value="candidates" className="transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Candidats
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6">
              <CandidateStatsCards stats={stats} loading={statsLoading} />
              <CandidateCharts 
                statusChartData={statusChartData} 
                positionChartData={positionChartData} 
                loading={statsLoading} 
              />
            </TabsContent>
            
            <TabsContent value="candidates" className="space-y-6">
              <CandidateSearch 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                onExport={handleExportCSV}
                isMobile={isMobile}
                onAddNew={() => navigate('/recrutement')}
              />
              
              <CandidatesList 
                candidates={filteredCandidates}
                loading={loading}
                statusColors={statusColors}
                onStatusChange={handleStatusChange}
                onViewDetails={(id) => navigate(`/admin/candidate/${id}`)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
};

export default ATSAdmin;
