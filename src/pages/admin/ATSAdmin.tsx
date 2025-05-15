
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Search, UserPlus, Download, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DashboardNav from '@/components/DashboardNav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const statusColors = {
  new: "bg-blue-500 border-blue-600",
  screening: "bg-yellow-500 border-yellow-600",
  interview: "bg-purple-500 border-purple-600",
  offer: "bg-green-500 border-green-600",
  rejected: "bg-red-500 border-red-600"
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ATSAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
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
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCandidates(data || []);
      setFilteredCandidates(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des candidats:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger la liste des candidats",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (candidateData) => {
    // Calculer les statistiques globales
    const byStatus = candidateData.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    const byPosition = candidateData.reduce((acc, c) => {
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
    // Fix: Convert each operand to a number first
    const conversionRate = candidateData.length > 0 
      ? Math.round((Number(totalOffers) / (Number(totalOffers) + Number(totalRejected))) * 100) || 0
      : 0;

    setStats({
      total: candidateData.length,
      byStatus,
      byPosition,
      newThisWeek,
      conversionRate
    });
  };

  const handleStatusChange = async (candidateId, newStatus) => {
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
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du candidat",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
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
  };

  // Préparer les données pour les graphiques
  const statusChartData = Object.entries(stats.byStatus).map(([name, value]) => ({ name, value }));
  const positionChartData = Object.entries(stats.byPosition)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);  // Top 5 positions

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Système de suivi des candidatures</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <DashboardNav />
        </div>
        
        <div className="md:col-span-3">
          <Tabs defaultValue="candidates">
            <TabsList className="mb-4">
              <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
              <TabsTrigger value="candidates">Candidats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Total Candidats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Nouveaux cette semaine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.newThisWeek}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      En cours d'entretien
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Fix: Added optional chaining to safely access the interview property */}
                    <div className="text-2xl font-bold">{stats.byStatus?.interview || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      Taux de conversion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.conversionRate}%</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-96">
                  <CardHeader>
                    <CardTitle>Candidats par statut</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card className="h-96">
                  <CardHeader>
                    <CardTitle>Top postes demandés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={positionChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="candidates" className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="relative w-full sm:w-auto sm:min-w-[320px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <Input 
                      placeholder="Rechercher un candidat..." 
                      className="pl-10" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <div className="flex items-center gap-2">
                        <Filter size={18} />
                        <SelectValue placeholder="Filtrer par statut" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="new">Nouveaux</SelectItem>
                      <SelectItem value="screening">Présélection</SelectItem>
                      <SelectItem value="interview">Entretien</SelectItem>
                      <SelectItem value="offer">Offre</SelectItem>
                      <SelectItem value="rejected">Rejetés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => navigate('/recrutement')} variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Nouveau
                  </Button>
                  <Button onClick={handleExportCSV} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exporter
                  </Button>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-10">Chargement des candidats...</div>
              ) : filteredCandidates.length > 0 ? (
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="min-w-full divide-y divide-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Candidat
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Poste
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCandidates.map((candidate) => {
                          const createdDate = new Date(candidate.created_at).toLocaleDateString('fr-FR');
                          const initials = candidate.full_name.split(' ').map(n => n[0]).join('');
                          
                          return (
                            <tr 
                              key={candidate.id} 
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => navigate(`/admin/candidate/${candidate.id}`)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-3">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{candidate.full_name}</div>
                                    <div className="text-sm text-gray-500">{candidate.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {candidate.position}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {createdDate}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[candidate.status]}`}>
                                  {candidate.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm">Changer statut</Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(candidate.id, "new");
                                    }}>
                                      Nouveau
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(candidate.id, "screening");
                                    }}>
                                      Présélection
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(candidate.id, "interview");
                                    }}>
                                      Entretien
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(candidate.id, "offer");
                                    }}>
                                      Offre
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleStatusChange(candidate.id, "rejected");
                                    }}>
                                      Rejeté
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-white shadow rounded-lg">
                  <p className="text-gray-500">Aucun candidat trouvé</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ATSAdmin;
