
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Search, 
  FileText, 
  Check, 
  X, 
  Mail, 
  ArrowUpDown, 
  Calendar,
  Star,
  StarOff
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Candidate {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  resume_url: string | null;
  motivation: string;
  experience: string;
  status: 'new' | 'reviewing' | 'interview' | 'rejected' | 'hired';
  rating: number;
  notes: string | null;
}

const ATSAdmin = () => {
  const { profileData } = useAuth();
  const isSuperAdmin = profileData?.role === 'super_admin';
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRatingCandidate, setIsRatingCandidate] = useState(false);
  const [isContacting, setIsContacting] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [positionFilter, setPositionFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Candidate>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [positions, setPositions] = useState<string[]>([]);

  useEffect(() => {
    fetchCandidates();
  }, [sortField, sortDirection, statusFilter, positionFilter]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('candidates')
        .select('*');
      
      // Apply filters if set
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      if (positionFilter) {
        query = query.eq('position', positionFilter);
      }
      
      // Apply sorting
      query = query.order(sortField, { ascending: sortDirection === 'asc' });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setCandidates(data || []);
      
      // Extract unique positions for filtering
      if (data) {
        const uniquePositions = [...new Set(data.map(candidate => candidate.position))];
        setPositions(uniquePositions);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast.error('Erreur lors du chargement des candidatures');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Candidate) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: Candidate['status']) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === id ? { ...candidate, status } : candidate
        )
      );
      
      toast.success(`Statut mis à jour avec succès`);
    } catch (error) {
      console.error('Error updating candidate status:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleUpdateRating = async (rating: number) => {
    if (!selectedCandidate) return;
    
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ rating })
        .eq('id', selectedCandidate.id);
      
      if (error) throw error;
      
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === selectedCandidate.id ? { ...candidate, rating } : candidate
        )
      );
      
      setSelectedCandidate({...selectedCandidate, rating });
      setIsRatingCandidate(false);
      toast.success(`Évaluation mise à jour avec succès`);
    } catch (error) {
      console.error('Error updating candidate rating:', error);
      toast.error("Erreur lors de la mise à jour de l'évaluation");
    }
  };

  const handleSaveNotes = async (notes: string) => {
    if (!selectedCandidate) return;
    
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ notes })
        .eq('id', selectedCandidate.id);
      
      if (error) throw error;
      
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === selectedCandidate.id ? { ...candidate, notes } : candidate
        )
      );
      
      setSelectedCandidate({...selectedCandidate, notes });
      toast.success(`Notes enregistrées avec succès`);
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error("Erreur lors de l'enregistrement des notes");
    }
  };

  const handleContactCandidate = async () => {
    if (!selectedCandidate) return;
    
    try {
      // Simulate sending an email
      toast.success(`Email envoyé à ${selectedCandidate.email}`);
      setIsContacting(false);
      setEmailSubject('');
      setEmailBody('');
    } catch (error) {
      console.error('Error contacting candidate:', error);
      toast.error("Erreur lors de l'envoi de l'email");
    }
  };

  const downloadResume = async (resumeUrl: string, candidateName: string) => {
    try {
      if (!resumeUrl) {
        toast.error("Aucun CV disponible pour ce candidat");
        return;
      }
      
      // Download the resume from Supabase Storage
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(resumeUrl);
      
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV_${candidateName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error("Erreur lors du téléchargement du CV");
    }
  };

  const getStatusBadge = (status: Candidate['status']) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500">Nouveau</Badge>;
      case 'reviewing':
        return <Badge className="bg-purple-500">En cours d'analyse</Badge>;
      case 'interview':
        return <Badge className="bg-amber-500">Entretien</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Refusé</Badge>;
      case 'hired':
        return <Badge className="bg-green-500">Embauché</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredCandidates = candidates.filter(candidate => {
    const searchLower = searchTerm.toLowerCase();
    return (
      candidate.full_name.toLowerCase().includes(searchLower) ||
      candidate.email.toLowerCase().includes(searchLower) ||
      candidate.position.toLowerCase().includes(searchLower)
    );
  });

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`text-${star <= rating ? 'yellow' : 'gray'}-500`}>
            {star <= rating ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Système de Recrutement ATS</h1>
          <p className="text-red-500">Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Système de Recrutement (ATS)</h1>

        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:w-4/5">
            <div className="relative md:w-1/2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher par nom, email ou poste..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter || ''}
              onValueChange={(value) => setStatusFilter(value || null)}
            >
              <SelectTrigger className="md:w-1/4">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="new">Nouveau</SelectItem>
                <SelectItem value="reviewing">En cours d'analyse</SelectItem>
                <SelectItem value="interview">Entretien</SelectItem>
                <SelectItem value="rejected">Refusé</SelectItem>
                <SelectItem value="hired">Embauché</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={positionFilter || ''}
              onValueChange={(value) => setPositionFilter(value || null)}
            >
              <SelectTrigger className="md:w-1/4">
                <SelectValue placeholder="Poste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les postes</SelectItem>
                {positions.map((position) => (
                  <SelectItem key={position} value={position}>{position}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('full_name')}
                  >
                    Nom
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('position')}
                  >
                    Poste
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Aucun candidat trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">{candidate.full_name}</TableCell>
                    <TableCell>{candidate.position}</TableCell>
                    <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                    <TableCell>
                      {new Date(candidate.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(candidate)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                      {candidate.resume_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadResume(candidate.resume_url!, candidate.full_name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Candidate Details Dialog */}
        {selectedCandidate && (
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Détails du candidat</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Nom complet</p>
                      <p>{selectedCandidate.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p>{selectedCandidate.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p>{selectedCandidate.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Poste</p>
                      <p>{selectedCandidate.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date de candidature</p>
                      <p>{new Date(selectedCandidate.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Évaluation</p>
                      <div className="flex items-center">
                        {renderRatingStars(selectedCandidate.rating)}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-2" 
                          onClick={() => setIsRatingCandidate(true)}
                        >
                          Évaluer
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CV</p>
                      {selectedCandidate.resume_url ? (
                        <Button 
                          variant="outline" 
                          onClick={() => downloadResume(selectedCandidate.resume_url!, selectedCandidate.full_name)}
                        >
                          <Download className="h-4 w-4 mr-1" /> 
                          Télécharger le CV
                        </Button>
                      ) : (
                        <p className="text-gray-500">Aucun CV disponible</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Informations professionnelles</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Expérience professionnelle</p>
                      <Card>
                        <CardContent className="pt-4 max-h-48 overflow-y-auto">
                          <p className="whitespace-pre-wrap">{selectedCandidate.experience}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Lettre de motivation</p>
                      <Card>
                        <CardContent className="pt-4 max-h-48 overflow-y-auto">
                          <p className="whitespace-pre-wrap">{selectedCandidate.motivation}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <Textarea
                  placeholder="Ajouter des notes sur ce candidat..."
                  className="h-24"
                  defaultValue={selectedCandidate.notes || ''}
                  onChange={(e) => handleSaveNotes(e.target.value)}
                />
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => setIsContacting(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Contacter
                  </Button>
                  
                  <Select
                    value={selectedCandidate.status}
                    onValueChange={(value) => handleUpdateStatus(selectedCandidate.id, value as Candidate['status'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Changer le statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nouveau</SelectItem>
                      <SelectItem value="reviewing">En cours d'analyse</SelectItem>
                      <SelectItem value="interview">Entretien</SelectItem>
                      <SelectItem value="rejected">Refusé</SelectItem>
                      <SelectItem value="hired">Embauché</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Rating Dialog */}
        {selectedCandidate && (
          <Dialog open={isRatingCandidate} onOpenChange={setIsRatingCandidate}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Évaluer le candidat</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center space-x-1 py-4">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="outline"
                    className="h-12 w-12"
                    onClick={() => handleUpdateRating(rating)}
                  >
                    {rating <= selectedCandidate.rating ? (
                      <Star className="h-6 w-6 text-yellow-500" />
                    ) : (
                      <StarOff className="h-6 w-6 text-gray-300" />
                    )}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Contact Dialog */}
        {selectedCandidate && (
          <Dialog open={isContacting} onOpenChange={setIsContacting}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Contacter {selectedCandidate.full_name}</DialogTitle>
                <DialogDescription>
                  Envoyer un email à {selectedCandidate.email}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Objet</label>
                  <Input
                    id="subject"
                    placeholder="Sujet de l'email"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <Textarea
                    id="message"
                    placeholder="Votre message..."
                    className="h-40"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsContacting(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleContactCandidate}
                  disabled={!emailSubject || !emailBody}
                >
                  Envoyer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ATSAdmin;
