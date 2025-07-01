import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Plus,
  Search,
  Filter,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

// Import des composants ATS
import { CandidateSearch } from '@/components/admin/ats/CandidateSearch';
import { CandidatesList } from '@/components/admin/ats/CandidatesList';
import { CandidateCharts } from '@/components/admin/ats/CandidateCharts';
import { CandidateAnalytics } from '@/components/admin/ats/CandidateAnalytics';
import { CandidateActionCenter } from '@/components/admin/ats/CandidateActionCenter';
import { CandidatePipeline } from '@/components/admin/ats/CandidatePipeline';
import { CVUploadZone } from '@/components/admin/ats/CVUploadZone';
import { ManualCandidateForm } from '@/components/admin/ats/ManualCandidateForm';
import { MobileNavigation } from '@/components/admin/ats/MobileNavigation';
import { ThemeToggle } from '@/components/ThemeToggle';

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
}

const ATSAdmin = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('upload');
  const [showManualForm, setShowManualForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching candidates:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les candidats",
          variant: "destructive"
        });
      } else {
        setCandidates(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut",
          variant: "destructive"
        });
      } else {
        setCandidates(prev =>
          prev.map(c => (c.id === id ? { ...c, status } : c))
        );
        toast({
          title: "Succès",
          description: "Statut mis à jour avec succès",
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const handleCandidateCreated = (newCandidate: Candidate) => {
    setCandidates(prev => [newCandidate, ...prev]);
    setShowManualForm(false);
    setActiveTab('candidates');
  };

  const handleViewDetails = (id: string) => {
    navigate(`/admin/candidate/${id}`);
  };

  const handleExport = () => {
    // Implémenter l'export CSV ici
    toast({
      title: "Info",
      description: "Fonction d'export CSV à implémenter",
    });
  };

  const handleCandidateMove = (candidateId: string, fromStage: string, toStage: string) => {
    // Implémenter le déplacement du candidat entre les étapes
    console.log(`Moving candidate ${candidateId} from ${fromStage} to ${toStage}`);
    toast({
      title: "Info",
      description: "Fonction de déplacement à implémenter",
    });
  };

  const filteredCandidates = candidates.filter(candidate => {
    const searchTermLower = searchTerm.toLowerCase();
    const fullNameLower = candidate.full_name.toLowerCase();
  
    const matchesSearch = fullNameLower.includes(searchTermLower) ||
                           candidate.email.toLowerCase().includes(searchTermLower) ||
                           candidate.position.toLowerCase().includes(searchTermLower);
  
    const matchesStatus = filterStatus === 'all' || candidate.status === filterStatus;
  
    return matchesSearch && matchesStatus;
  });

  const statusChartData = Object.entries(
    candidates.reduce((acc: Record<string, number>, candidate) => {
      acc[candidate.status] = (acc[candidate.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const positionChartData = Object.entries(
    candidates.reduce((acc: Record<string, number>, candidate) => {
      acc[candidate.position] = (acc[candidate.position] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const analyticsData = {
    conversionRate: 15,
    averageTimeToHire: 45,
    sourceEffectiveness: [
      { source: 'LinkedIn', candidates: 120, hired: 20 },
      { source: 'Indeed', candidates: 100, hired: 15 },
      { source: 'Recommandation', candidates: 80, hired: 25 }
    ],
    monthlyTrends: [
      { month: 'Jan', applications: 50, hires: 8 },
      { month: 'Fév', applications: 55, hires: 10 },
      { month: 'Mar', applications: 60, hires: 12 }
    ]
  };

  const pipelineStages = [
    {
      id: 'new',
      name: 'Nouveau',
      candidates: filteredCandidates.filter(c => c.status === 'new'),
      color: 'bg-blue-500'
    },
    {
      id: 'screening',
      name: 'Présélection',
      candidates: filteredCandidates.filter(c => c.status === 'screening'),
      color: 'bg-yellow-500'
    },
    {
      id: 'interview',
      name: 'Entretien',
      candidates: filteredCandidates.filter(c => c.status === 'interview'),
      color: 'bg-purple-500'
    },
    {
      id: 'offer',
      name: 'Offre',
      candidates: filteredCandidates.filter(c => c.status === 'offer'),
      color: 'bg-green-500'
    },
    {
      id: 'rejected',
      name: 'Rejeté',
      candidates: filteredCandidates.filter(c => c.status === 'rejected'),
      color: 'bg-red-500'
    }
  ];

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    screening: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    interview: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    offer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header avec thème toggle */}
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              ATS - Système de Recrutement
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestion intelligente des candidatures
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              {candidates.length} candidats
            </Badge>
            <ThemeToggle />
          </div>
        </motion.div>

        {/* Navigation mobile */}
        {isMobile && (
          <MobileNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            candidatesCount={candidates.length}
          />
        )}

        {/* Statistiques rapides */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{candidates.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nouveaux</p>
                  <p className="text-2xl font-bold text-green-600">
                    {candidates.filter(c => c.status === 'new').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Entretiens</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {candidates.filter(c => c.status === 'interview').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Embauchés</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {candidates.filter(c => c.status === 'offer').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contenu principal avec onglets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {!isMobile && (
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <TabsTrigger value="upload" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Zap className="h-4 w-4" />
                  Upload CV
                </TabsTrigger>
                <TabsTrigger value="candidates" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Candidats
                </TabsTrigger>
                <TabsTrigger value="pipeline" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Pipeline
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="actions" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Actions
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Rapports
                </TabsTrigger>
              </TabsList>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Onglet Upload CV */}
                <TabsContent value="upload" className="space-y-6">
                  {showManualForm ? (
                    <ManualCandidateForm
                      onCandidateCreated={handleCandidateCreated}
                      onCancel={() => setShowManualForm(false)}
                    />
                  ) : (
                    <CVUploadZone onCandidateCreated={handleCandidateCreated} />
                  )}
                </TabsContent>

                {/* Onglet Liste des candidats */}
                <TabsContent value="candidates" className="space-y-6">
                  <CandidateSearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    onExport={handleExport}
                    isMobile={isMobile}
                    onAddNew={() => setShowManualForm(true)}
                  />
                  
                  <CandidatesList
                    candidates={filteredCandidates}
                    loading={loading}
                    statusColors={statusColors}
                    onStatusChange={handleStatusChange}
                    onViewDetails={handleViewDetails}
                  />
                </TabsContent>

                {/* Onglet Pipeline */}
                <TabsContent value="pipeline" className="space-y-6">
                  <CandidatePipeline
                    stages={pipelineStages}
                    onCandidateMove={handleCandidateMove}
                    onCandidateClick={handleViewDetails}
                  />
                </TabsContent>

                {/* Onglet Analytics */}
                <TabsContent value="analytics" className="space-y-6">
                  <CandidateAnalytics
                    data={analyticsData}
                    loading={loading}
                  />
                </TabsContent>

                {/* Onglet Actions */}
                <TabsContent value="actions" className="space-y-6">
                  <CandidateActionCenter
                    onActionComplete={(action, details) => {
                      console.log('Action completed:', action, details);
                    }}
                  />
                </TabsContent>

                {/* Onglet Rapports */}
                <TabsContent value="reports" className="space-y-6">
                  <CandidateCharts
                    statusChartData={statusChartData}
                    positionChartData={positionChartData}
                    loading={loading}
                  />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ATSAdmin;
