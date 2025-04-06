
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Star, StarIcon, Download, MessageSquare, Phone, Check, X, UserPlus, FileText, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Candidate } from '@/types/candidates';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function ATSAdmin() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      
      // In a real application, you would fetch from your database
      // For now, we'll use mock data
      const mockCandidates: Candidate[] = [
        {
          id: '1',
          created_at: '2024-02-15T10:20:30Z',
          full_name: 'Jean Dupont',
          email: 'jean.dupont@example.com',
          phone: '06 12 34 56 78',
          position: 'Développeur Front-end',
          resume_url: null,
          motivation: 'Je souhaite rejoindre votre équipe pour développer des applications web modernes.',
          experience: '3 ans dans le développement web',
          status: 'new',
          rating: 3,
          notes: null
        },
        {
          id: '2',
          created_at: '2024-02-14T09:15:00Z',
          full_name: 'Marie Lambert',
          email: 'marie.lambert@example.com',
          phone: '07 23 45 67 89',
          position: 'UX Designer',
          resume_url: null,
          motivation: 'Passionnée par la création d\'expériences utilisateurs intuitives.',
          experience: '5 ans en design UX/UI',
          status: 'reviewing',
          rating: 4,
          notes: 'Expérience intéressante en design mobile.'
        },
        {
          id: '3',
          created_at: '2024-02-10T14:30:00Z',
          full_name: 'Thomas Martin',
          email: 'thomas.martin@example.com',
          phone: '06 34 56 78 90',
          position: 'Développeur Back-end',
          resume_url: null,
          motivation: 'Intéressé par les défis techniques liés aux architectures distribuées.',
          experience: '4 ans en développement backend avec Node.js et Python',
          status: 'interview',
          rating: 5,
          notes: 'Très bon profil technique, à rencontrer rapidement.'
        }
      ];
      
      setCandidates(mockCandidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Erreur lors du chargement des candidats');
    } finally {
      setLoading(false);
    }
  };

  const updateCandidateStatus = async (id: string, newStatus: 'new' | 'reviewing' | 'interview' | 'rejected' | 'hired') => {
    try {
      // In a real application, update in your database
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === id 
            ? { ...candidate, status: newStatus } 
            : candidate
        ) as Candidate[]
      );
      
      toast.success(`Statut mis à jour avec succès`);
    } catch (error) {
      console.error('Error updating candidate status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  const updateCandidateRating = async (id: string, newRating: number) => {
    try {
      // In a real application, update in your database
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === id 
            ? { ...candidate, rating: newRating } 
            : candidate
        ) as Candidate[]
      );
      
      toast.success('Évaluation mise à jour avec succès');
    } catch (error) {
      console.error('Error updating candidate rating:', error);
      toast.error('Erreur lors de la mise à jour de l\'évaluation');
    }
  };

  const saveNotes = async () => {
    if (!selectedCandidate) return;
    
    try {
      // In a real application, save to your database
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === selectedCandidate.id 
            ? { ...candidate, notes } 
            : candidate
        ) as Candidate[]
      );
      
      setShowNotesDialog(false);
      toast.success('Notes enregistrées avec succès');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Erreur lors de l\'enregistrement des notes');
    }
  };

  const handleOpenNotes = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setNotes(candidate.notes || '');
    setShowNotesDialog(true);
  };

  const handleOpenDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowDetailDialog(true);
  };

  const downloadResume = (resumeUrl: string | null) => {
    if (!resumeUrl) {
      toast.error('Aucun CV disponible pour ce candidat');
      return;
    }
    
    // In a real application, handle the file download
    toast.success('Téléchargement du CV en cours...');
  };

  const getStatusBadge = (status: 'new' | 'reviewing' | 'interview' | 'rejected' | 'hired') => {
    switch (status) {
      case 'new':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Nouveau</Badge>;
      case 'reviewing':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">En cours d'analyse</Badge>;
      case 'interview':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Entretien</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Refusé</Badge>;
      case 'hired':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Embauché</Badge>;
    }
  };

  const renderRatingStars = (rating: number, candidateId: string) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => updateCandidateRating(candidateId, star)}
            className="focus:outline-none"
          >
            {star <= rating ? (
              <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <Star className="h-4 w-4 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus ? candidate.status === filterStatus : true;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Gestion des Candidatures</h1>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter un candidat
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Candidatures</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold">{candidates.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">En cours d'analyse</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold">
                {candidates.filter(c => c.status === 'reviewing').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entretiens planifiés</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold">
                {candidates.filter(c => c.status === 'interview').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taux d'embauche</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold">
                {candidates.length > 0 
                  ? Math.round(candidates.filter(c => c.status === 'hired').length / candidates.length * 100)
                  : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Rechercher un candidat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <Select value={filterStatus || ''} onValueChange={(value) => setFilterStatus(value || null)}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <span>{filterStatus ? 'Filtrer par statut' : 'Tous les statuts'}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les statuts</SelectItem>
              <SelectItem value="new">Nouveaux</SelectItem>
              <SelectItem value="reviewing">En cours d'analyse</SelectItem>
              <SelectItem value="interview">Entretien</SelectItem>
              <SelectItem value="rejected">Refusé</SelectItem>
              <SelectItem value="hired">Embauché</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="new">Nouveaux</TabsTrigger>
            <TabsTrigger value="reviewing">En analyse</TabsTrigger>
            <TabsTrigger value="interview">Entretiens</TabsTrigger>
            <TabsTrigger value="hired">Embauchés</TabsTrigger>
            <TabsTrigger value="rejected">Refusés</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <CandidateTable
              candidates={filteredCandidates}
              loading={loading}
              onStatusUpdate={updateCandidateStatus}
              onNotes={handleOpenNotes}
              onViewDetails={handleOpenDetails}
              onDownloadResume={downloadResume}
              renderRatingStars={renderRatingStars}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
          
          <TabsContent value="new" className="mt-6">
            <CandidateTable
              candidates={filteredCandidates.filter(c => c.status === 'new')}
              loading={loading}
              onStatusUpdate={updateCandidateStatus}
              onNotes={handleOpenNotes}
              onViewDetails={handleOpenDetails}
              onDownloadResume={downloadResume}
              renderRatingStars={renderRatingStars}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
          
          <TabsContent value="reviewing" className="mt-6">
            <CandidateTable
              candidates={filteredCandidates.filter(c => c.status === 'reviewing')}
              loading={loading}
              onStatusUpdate={updateCandidateStatus}
              onNotes={handleOpenNotes}
              onViewDetails={handleOpenDetails}
              onDownloadResume={downloadResume}
              renderRatingStars={renderRatingStars}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
          
          <TabsContent value="interview" className="mt-6">
            <CandidateTable
              candidates={filteredCandidates.filter(c => c.status === 'interview')}
              loading={loading}
              onStatusUpdate={updateCandidateStatus}
              onNotes={handleOpenNotes}
              onViewDetails={handleOpenDetails}
              onDownloadResume={downloadResume}
              renderRatingStars={renderRatingStars}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
          
          <TabsContent value="hired" className="mt-6">
            <CandidateTable
              candidates={filteredCandidates.filter(c => c.status === 'hired')}
              loading={loading}
              onStatusUpdate={updateCandidateStatus}
              onNotes={handleOpenNotes}
              onViewDetails={handleOpenDetails}
              onDownloadResume={downloadResume}
              renderRatingStars={renderRatingStars}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-6">
            <CandidateTable
              candidates={filteredCandidates.filter(c => c.status === 'rejected')}
              loading={loading}
              onStatusUpdate={updateCandidateStatus}
              onNotes={handleOpenNotes}
              onViewDetails={handleOpenDetails}
              onDownloadResume={downloadResume}
              renderRatingStars={renderRatingStars}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notes sur le candidat</DialogTitle>
            <DialogDescription>
              {selectedCandidate?.full_name} - {selectedCandidate?.position}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Saisissez vos notes ici..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>Annuler</Button>
            <Button onClick={saveNotes}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Candidate Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profil du candidat</DialogTitle>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{selectedCandidate.full_name}</h2>
                  <p className="text-muted-foreground">{selectedCandidate.position}</p>
                </div>
                <div>{getStatusBadge(selectedCandidate.status)}</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Coordonnées</h3>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${selectedCandidate.email}`} className="text-blue-600 hover:underline">
                        {selectedCandidate.email}
                      </a>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${selectedCandidate.phone}`} className="text-blue-600 hover:underline">
                        {selectedCandidate.phone}
                      </a>
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Évaluation</h3>
                    {renderRatingStars(selectedCandidate.rating, selectedCandidate.id)}
                  </div>
                  <p className="text-sm">
                    Candidature reçue le {selectedCandidate.created_at ? 
                      format(new Date(selectedCandidate.created_at), 'dd/MM/yyyy') : 
                      'N/A'}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Motivation</h3>
                <Card className="p-4 bg-muted/50">
                  <p>{selectedCandidate.motivation}</p>
                </Card>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Expérience</h3>
                <Card className="p-4 bg-muted/50">
                  <p>{selectedCandidate.experience}</p>
                </Card>
              </div>
              
              {selectedCandidate.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                  <Card className="p-4 bg-muted/50">
                    <p>{selectedCandidate.notes}</p>
                  </Card>
                </div>
              )}
              
              <div className="flex justify-between">
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => downloadResume(selectedCandidate.resume_url)}
                    disabled={!selectedCandidate.resume_url}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger CV
                  </Button>
                  <Button variant="outline" onClick={() => handleOpenNotes(selectedCandidate)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ajouter des notes
                  </Button>
                </div>
                
                <div className="space-x-2">
                  <Button 
                    variant={selectedCandidate.status === 'rejected' ? 'default' : 'outline'}
                    className={selectedCandidate.status === 'rejected' ? 'bg-red-500 hover:bg-red-600' : ''}
                    onClick={() => updateCandidateStatus(selectedCandidate.id, 'rejected')}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Refuser
                  </Button>
                  <Button 
                    variant={selectedCandidate.status === 'hired' ? 'default' : 'outline'}
                    className={selectedCandidate.status === 'hired' ? 'bg-green-500 hover:bg-green-600' : ''}
                    onClick={() => updateCandidateStatus(selectedCandidate.id, 'hired')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Embaucher
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

interface CandidateTableProps {
  candidates: Candidate[];
  loading: boolean;
  onStatusUpdate: (id: string, status: 'new' | 'reviewing' | 'interview' | 'rejected' | 'hired') => void;
  onNotes: (candidate: Candidate) => void;
  onViewDetails: (candidate: Candidate) => void;
  onDownloadResume: (resumeUrl: string | null) => void;
  renderRatingStars: (rating: number, candidateId: string) => React.ReactNode;
  getStatusBadge: (status: 'new' | 'reviewing' | 'interview' | 'rejected' | 'hired') => React.ReactNode;
}

function CandidateTable({
  candidates,
  loading,
  onStatusUpdate,
  onNotes,
  onViewDetails,
  onDownloadResume,
  renderRatingStars,
  getStatusBadge
}: CandidateTableProps) {
  if (loading) {
    return <p>Chargement des candidats...</p>;
  }

  if (candidates.length === 0) {
    return <p className="text-center py-8 text-muted-foreground">Aucun candidat trouvé</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Poste</TableHead>
          <TableHead>Date de candidature</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Évaluation</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate) => (
          <TableRow key={candidate.id}>
            <TableCell className="font-medium">
              <span 
                className="cursor-pointer hover:text-primary hover:underline"
                onClick={() => onViewDetails(candidate)}
              >
                {candidate.full_name}
              </span>
            </TableCell>
            <TableCell>{candidate.position}</TableCell>
            <TableCell>
              {candidate.created_at ? 
                format(new Date(candidate.created_at), 'dd/MM/yyyy') : 
                'N/A'}
            </TableCell>
            <TableCell>
              <Select 
                defaultValue={candidate.status}
                onValueChange={(value) => 
                  onStatusUpdate(
                    candidate.id, 
                    value as 'new' | 'reviewing' | 'interview' | 'rejected' | 'hired'
                  )
                }
              >
                <SelectTrigger className="w-[160px]">
                  {getStatusBadge(candidate.status as 'new' | 'reviewing' | 'interview' | 'rejected' | 'hired')}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Nouveau</SelectItem>
                  <SelectItem value="reviewing">En cours d'analyse</SelectItem>
                  <SelectItem value="interview">Entretien</SelectItem>
                  <SelectItem value="rejected">Refusé</SelectItem>
                  <SelectItem value="hired">Embauché</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              {renderRatingStars(candidate.rating, candidate.id)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownloadResume(candidate.resume_url)}
                  disabled={!candidate.resume_url}
                  title={candidate.resume_url ? "Télécharger le CV" : "Aucun CV disponible"}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNotes(candidate)}
                  title="Ajouter ou modifier des notes"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(candidate)}
                  title="Voir les détails"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
