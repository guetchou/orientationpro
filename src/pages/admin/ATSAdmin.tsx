
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Candidate } from "@/types/candidates";
import { Loader2, Search, Filter, Star, StarHalf, Download, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ATSAdmin() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showCandidateDetails, setShowCandidateDetails] = useState(false);
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des candidats:", error);
      toast.error("Erreur lors du chargement des candidats");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCandidates = () => {
    return candidates.filter((candidate) => {
      const matchesSearch =
        candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter ? candidate.status === statusFilter : true;
      const matchesPosition = positionFilter
        ? candidate.position === positionFilter
        : true;

      return matchesSearch && matchesStatus && matchesPosition;
    });
  };

  const uniquePositions = Array.from(
    new Set(candidates.map((candidate) => candidate.position))
  );

  const updateCandidateStatus = async (candidateId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("candidates")
        .update({ status: newStatus })
        .eq("id", candidateId);

      if (error) throw error;
      
      // Update local state
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, status: newStatus } : c))
      );
      
      toast.success("Statut mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const updateCandidateNotes = async () => {
    if (!selectedCandidate) return;

    try {
      const { error } = await supabase
        .from("candidates")
        .update({ 
          notes, 
          rating 
        })
        .eq("id", selectedCandidate.id);

      if (error) throw error;
      
      // Update local state
      setCandidates((prev) =>
        prev.map((c) => (c.id === selectedCandidate.id ? { ...c, notes, rating } : c))
      );
      
      toast.success("Notes et évaluation mises à jour");
      setShowCandidateDetails(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des notes:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const deleteCandidate = async (candidateId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce candidat ?")) return;
    
    try {
      const { error } = await supabase
        .from("candidates")
        .delete()
        .eq("id", candidateId);

      if (error) throw error;
      
      // Update local state
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
      
      toast.success("Candidat supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const downloadResume = async (resumeUrl: string | null, candidateName: string) => {
    if (!resumeUrl) {
      toast.error("Aucun CV disponible pour ce candidat");
      return;
    }
    
    try {
      const { data, error } = await supabase.storage
        .from("resumes")
        .download(resumeUrl);
        
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CV_${candidateName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erreur lors du téléchargement du CV:", error);
      toast.error("Erreur lors du téléchargement du CV");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "reviewing":
        return "bg-yellow-100 text-yellow-800";
      case "interview":
        return "bg-purple-100 text-purple-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "hired":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "Nouveau";
      case "reviewing":
        return "En cours d'examen";
      case "interview":
        return "Entretien";
      case "rejected":
        return "Refusé";
      case "hired":
        return "Embauché";
      default:
        return status;
    }
  };

  const exportCandidates = () => {
    const filteredCandidates = getFilteredCandidates();
    const csvContent = [
      ["Nom", "Email", "Téléphone", "Poste", "Statut", "Évaluation", "Date de candidature"],
      ...filteredCandidates.map((candidate) => [
        candidate.full_name,
        candidate.email,
        candidate.phone,
        candidate.position,
        getStatusLabel(candidate.status),
        candidate.rating.toString(),
        format(new Date(candidate.created_at), "dd/MM/yyyy HH:mm", { locale: fr })
      ])
    ]
    .map(row => row.join(","))
    .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `candidats_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-8">
        <h1 className="text-3xl font-bold">Système de Gestion des Candidatures</h1>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">Tous les candidats</TabsTrigger>
            <TabsTrigger value="new">Nouveaux</TabsTrigger>
            <TabsTrigger value="reviewing">En cours d'examen</TabsTrigger>
            <TabsTrigger value="interview">Entretien</TabsTrigger>
            <TabsTrigger value="hired">Embauchés</TabsTrigger>
          </TabsList>
          
          <div className="my-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un candidat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-full sm:w-52">
                  <SelectValue placeholder="Filtrer par poste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les postes</SelectItem>
                  {uniquePositions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 w-full lg:w-auto">
              <Button
                variant="outline"
                onClick={exportCandidates}
                className="whitespace-nowrap"
              >
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
              
              <Button
                onClick={fetchCandidates}
                variant="outline"
                disabled={loading}
                className="whitespace-nowrap"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualiser"}
              </Button>
            </div>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <CandidatesTable 
              candidates={getFilteredCandidates()}
              loading={loading}
              onStatusChange={updateCandidateStatus}
              onViewDetails={(candidate) => {
                setSelectedCandidate(candidate);
                setNotes(candidate.notes || "");
                setRating(candidate.rating);
                setShowCandidateDetails(true);
              }}
              onDelete={deleteCandidate}
              onDownloadResume={downloadResume}
              getStatusBadgeClass={getStatusBadgeClass}
              getStatusLabel={getStatusLabel}
            />
          </TabsContent>
          
          <TabsContent value="new" className="mt-0">
            <CandidatesTable 
              candidates={getFilteredCandidates().filter(c => c.status === "new")}
              loading={loading}
              onStatusChange={updateCandidateStatus}
              onViewDetails={(candidate) => {
                setSelectedCandidate(candidate);
                setNotes(candidate.notes || "");
                setRating(candidate.rating);
                setShowCandidateDetails(true);
              }}
              onDelete={deleteCandidate}
              onDownloadResume={downloadResume}
              getStatusBadgeClass={getStatusBadgeClass}
              getStatusLabel={getStatusLabel}
            />
          </TabsContent>
          
          <TabsContent value="reviewing" className="mt-0">
            <CandidatesTable 
              candidates={getFilteredCandidates().filter(c => c.status === "reviewing")}
              loading={loading}
              onStatusChange={updateCandidateStatus}
              onViewDetails={(candidate) => {
                setSelectedCandidate(candidate);
                setNotes(candidate.notes || "");
                setRating(candidate.rating);
                setShowCandidateDetails(true);
              }}
              onDelete={deleteCandidate}
              onDownloadResume={downloadResume}
              getStatusBadgeClass={getStatusBadgeClass}
              getStatusLabel={getStatusLabel}
            />
          </TabsContent>
          
          <TabsContent value="interview" className="mt-0">
            <CandidatesTable 
              candidates={getFilteredCandidates().filter(c => c.status === "interview")}
              loading={loading}
              onStatusChange={updateCandidateStatus}
              onViewDetails={(candidate) => {
                setSelectedCandidate(candidate);
                setNotes(candidate.notes || "");
                setRating(candidate.rating);
                setShowCandidateDetails(true);
              }}
              onDelete={deleteCandidate}
              onDownloadResume={downloadResume}
              getStatusBadgeClass={getStatusBadgeClass}
              getStatusLabel={getStatusLabel}
            />
          </TabsContent>
          
          <TabsContent value="hired" className="mt-0">
            <CandidatesTable 
              candidates={getFilteredCandidates().filter(c => c.status === "hired")}
              loading={loading}
              onStatusChange={updateCandidateStatus}
              onViewDetails={(candidate) => {
                setSelectedCandidate(candidate);
                setNotes(candidate.notes || "");
                setRating(candidate.rating);
                setShowCandidateDetails(true);
              }}
              onDelete={deleteCandidate}
              onDownloadResume={downloadResume}
              getStatusBadgeClass={getStatusBadgeClass}
              getStatusLabel={getStatusLabel}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={showCandidateDetails} onOpenChange={setShowCandidateDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails du candidat</DialogTitle>
            <DialogDescription>
              Consultez et mettez à jour les informations du candidat
            </DialogDescription>
          </DialogHeader>
          
          {selectedCandidate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Informations personnelles</h3>
                <div className="space-y-3">
                  <p><span className="font-medium">Nom:</span> {selectedCandidate.full_name}</p>
                  <p><span className="font-medium">Email:</span> {selectedCandidate.email}</p>
                  <p><span className="font-medium">Téléphone:</span> {selectedCandidate.phone}</p>
                  <p><span className="font-medium">Poste:</span> {selectedCandidate.position}</p>
                  <p>
                    <span className="font-medium">Statut:</span>{" "}
                    <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeClass(selectedCandidate.status)}`}>
                      {getStatusLabel(selectedCandidate.status)}
                    </span>
                  </p>
                  <p><span className="font-medium">Date de candidature:</span> {format(new Date(selectedCandidate.created_at), "dd MMMM yyyy", { locale: fr })}</p>
                  
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadResume(selectedCandidate.resume_url, selectedCandidate.full_name)}
                      disabled={!selectedCandidate.resume_url}
                    >
                      <FileText className="mr-2 h-4 w-4" /> 
                      {selectedCandidate.resume_url ? "Télécharger le CV" : "Aucun CV disponible"}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <h3 className="font-semibold text-lg">Évaluation</h3>
                  <div className="flex items-center mt-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        {star <= rating ? (
                          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        ) : (
                          <Star className="w-6 h-6 text-gray-300" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes" className="font-semibold">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={5}
                    placeholder="Ajouter des notes sur ce candidat..."
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Expérience</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {selectedCandidate.experience}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Lettre de motivation</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {selectedCandidate.motivation}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setShowCandidateDetails(false)}>
              Annuler
            </Button>
            <Button onClick={updateCandidateNotes}>
              Sauvegarder les notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// Create a separate component for the candidates table
interface CandidatesTableProps {
  candidates: Candidate[];
  loading: boolean;
  onStatusChange: (id: string, status: string) => void;
  onViewDetails: (candidate: Candidate) => void;
  onDelete: (id: string) => void;
  onDownloadResume: (resumeUrl: string | null, candidateName: string) => void;
  getStatusBadgeClass: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

function CandidatesTable({
  candidates,
  loading,
  onStatusChange,
  onViewDetails,
  onDelete,
  onDownloadResume,
  getStatusBadgeClass,
  getStatusLabel
}: CandidatesTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            Aucun candidat trouvé
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Évaluation</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{candidate.full_name}</div>
                      <div className="text-sm text-gray-500">{candidate.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{candidate.position}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={candidate.status}
                      onValueChange={(value) => onStatusChange(candidate.id, value)}
                    >
                      <SelectTrigger className={`w-full max-w-[180px] ${getStatusBadgeClass(candidate.status)}`}>
                        <SelectValue placeholder="Changer de statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Nouveau</SelectItem>
                        <SelectItem value="reviewing">En cours d'examen</SelectItem>
                        <SelectItem value="interview">Entretien</SelectItem>
                        <SelectItem value="rejected">Refusé</SelectItem>
                        <SelectItem value="hired">Embauché</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < candidate.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(candidate.created_at), "dd/MM/yyyy", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(candidate)}
                      >
                        Détails
                      </Button>
                      {candidate.resume_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDownloadResume(candidate.resume_url, candidate.full_name)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(candidate.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
