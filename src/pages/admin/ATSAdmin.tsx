
import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Search,
  Filter,
  Star,
  StarOff,
  Download,
  Mail,
  Phone,
  MailIcon,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Candidate } from "@/types/candidates";

export default function ATSAdmin() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [candidates, searchTerm, filterStatus]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setCandidates(data || []);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Erreur lors du chargement des candidats");
    } finally {
      setLoading(false);
    }
  };

  const filterCandidates = () => {
    let filtered = [...candidates];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (candidate) =>
          candidate.full_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (candidate) => candidate.status === filterStatus
      );
    }

    setFilteredCandidates(filtered);
  };

  const handleStatusChange = async () => {
    if (!selectedCandidate || !newStatus) return;

    try {
      const { error } = await supabase
        .from("candidates")
        .update({
          status: newStatus,
          notes: selectedCandidate.notes
            ? `${selectedCandidate.notes}\n\n${new Date().toLocaleString()}: Status changed to ${newStatus}.\n${
                statusNote ? `Note: ${statusNote}` : ""
              }`
            : `${new Date().toLocaleString()}: Status changed to ${newStatus}.\n${
                statusNote ? `Note: ${statusNote}` : ""
              }`,
        })
        .eq("id", selectedCandidate.id);

      if (error) throw error;

      toast.success("Statut du candidat mis à jour");
      fetchCandidates();
      setShowStatusDialog(false);
    } catch (error) {
      console.error("Error updating candidate status:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const updateRating = async (candidateId: string, newRating: number) => {
    try {
      const { error } = await supabase
        .from("candidates")
        .update({ rating: newRating })
        .eq("id", candidateId);

      if (error) throw error;

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId ? { ...c, rating: newRating } : c
        )
      );
    } catch (error) {
      console.error("Error updating rating:", error);
      toast.error("Erreur lors de la mise à jour de la note");
    }
  };

  const handleDownloadResume = async (candidate: Candidate) => {
    if (!candidate.resume_url) {
      toast.error("Aucun CV disponible pour ce candidat");
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from("resumes")
        .download(candidate.resume_url.split("/").pop() || "");

      if (error) throw error;

      // Create a URL for the downloaded blob
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CV_${candidate.full_name.replace(/ /g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading resume:", error);
      toast.error("Erreur lors du téléchargement du CV");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500">Nouveau</Badge>;
      case "contacted":
        return <Badge className="bg-purple-500">Contacté</Badge>;
      case "interview":
        return <Badge className="bg-amber-500">Entretien</Badge>;
      case "offer":
        return <Badge className="bg-green-500">Offre</Badge>;
      case "hired":
        return <Badge className="bg-emerald-600">Embauché</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejeté</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderRating = (rating: number, candidateId: string) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          onClick={() => updateRating(candidateId, i)}
          className="focus:outline-none"
        >
          {i <= rating ? (
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          ) : (
            <StarOff className="w-4 h-4 text-gray-300" />
          )}
        </button>
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestion des candidatures</h1>
            <p className="text-gray-500">
              Gérez les candidats et suivez leur progression
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Rechercher un candidat..."
                className="pl-9 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filtrer par statut" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="new">Nouveau</SelectItem>
                <SelectItem value="contacted">Contacté</SelectItem>
                <SelectItem value="interview">Entretien</SelectItem>
                <SelectItem value="offer">Offre</SelectItem>
                <SelectItem value="hired">Embauché</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="new">Nouveaux</TabsTrigger>
            <TabsTrigger value="active">En cours</TabsTrigger>
            <TabsTrigger value="archived">Archivés</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidat</TableHead>
                      <TableHead>Poste</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Évaluation</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-2"></div>
                            <p>Chargement des candidats...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredCandidates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <p className="text-gray-500">
                            Aucun candidat trouvé pour cette recherche.
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCandidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{candidate.full_name}</p>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <MailIcon className="h-3 w-3" />
                                {candidate.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{candidate.position}</TableCell>
                          <TableCell>
                            {new Date(
                              candidate.created_at
                            ).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                          <TableCell>
                            {renderRating(candidate.rating || 0, candidate.id)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCandidate(candidate);
                                    setShowDetailsDialog(true);
                                  }}
                                >
                                  Voir les détails
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCandidate(candidate);
                                    setNewStatus(candidate.status);
                                    setStatusNote("");
                                    setShowStatusDialog(true);
                                  }}
                                >
                                  Changer le statut
                                </DropdownMenuItem>
                                {candidate.resume_url && (
                                  <DropdownMenuItem
                                    onClick={() => handleDownloadResume(candidate)}
                                  >
                                    Télécharger le CV
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={async () => {
                                    if (
                                      confirm(
                                        "Êtes-vous sûr de vouloir supprimer ce candidat ?"
                                      )
                                    ) {
                                      try {
                                        const { error } = await supabase
                                          .from("candidates")
                                          .delete()
                                          .eq("id", candidate.id);

                                        if (error) throw error;

                                        toast.success("Candidat supprimé avec succès");
                                        fetchCandidates();
                                      } catch (error) {
                                        console.error("Error deleting candidate:", error);
                                        toast.error(
                                          "Erreur lors de la suppression du candidat"
                                        );
                                      }
                                    }
                                  }}
                                >
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidat</TableHead>
                      <TableHead>Poste</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Évaluation</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates
                      .filter((c) => c.status === "new")
                      .map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{candidate.full_name}</p>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <MailIcon className="h-3 w-3" />
                                {candidate.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{candidate.position}</TableCell>
                          <TableCell>
                            {new Date(
                              candidate.created_at
                            ).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                          <TableCell>
                            {renderRating(candidate.rating || 0, candidate.id)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCandidate(candidate);
                                    setShowDetailsDialog(true);
                                  }}
                                >
                                  Voir les détails
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCandidate(candidate);
                                    setNewStatus("contacted");
                                    setStatusNote("");
                                    setShowStatusDialog(true);
                                  }}
                                >
                                  Marquer comme contacté
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDownloadResume(candidate)}
                                >
                                  Télécharger le CV
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidat</TableHead>
                      <TableHead>Poste</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Évaluation</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates
                      .filter(
                        (c) =>
                          c.status === "contacted" ||
                          c.status === "interview" ||
                          c.status === "offer"
                      )
                      .map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{candidate.full_name}</p>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <MailIcon className="h-3 w-3" />
                                {candidate.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{candidate.position}</TableCell>
                          <TableCell>
                            {new Date(
                              candidate.created_at
                            ).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                          <TableCell>
                            {renderRating(candidate.rating || 0, candidate.id)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCandidate(candidate);
                                    setShowDetailsDialog(true);
                                  }}
                                >
                                  Voir les détails
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCandidate(candidate);
                                    setNewStatus(candidate.status);
                                    setStatusNote("");
                                    setShowStatusDialog(true);
                                  }}
                                >
                                  Changer le statut
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDownloadResume(candidate)}
                                >
                                  Télécharger le CV
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archived">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidat</TableHead>
                      <TableHead>Poste</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Évaluation</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates
                      .filter(
                        (c) => c.status === "hired" || c.status === "rejected"
                      )
                      .map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{candidate.full_name}</p>
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <MailIcon className="h-3 w-3" />
                                {candidate.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{candidate.position}</TableCell>
                          <TableCell>
                            {new Date(
                              candidate.created_at
                            ).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell>{getStatusBadge(candidate.status)}</TableCell>
                          <TableCell>
                            {renderRating(candidate.rating || 0, candidate.id)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCandidate(candidate);
                                    setShowDetailsDialog(true);
                                  }}
                                >
                                  Voir les détails
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDownloadResume(candidate)}
                                >
                                  Télécharger le CV
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={async () => {
                                    try {
                                      const { error } = await supabase
                                        .from("candidates")
                                        .delete()
                                        .eq("id", candidate.id);

                                      if (error) throw error;

                                      toast.success("Candidat supprimé avec succès");
                                      fetchCandidates();
                                    } catch (error) {
                                      console.error("Error deleting candidate:", error);
                                      toast.error(
                                        "Erreur lors de la suppression du candidat"
                                      );
                                    }
                                  }}
                                >
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Candidate Detail Dialog */}
        {selectedCandidate && (
          <Dialog
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
          >
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedCandidate.full_name}
                </DialogTitle>
                <DialogDescription>
                  Candidature pour le poste de {selectedCandidate.position}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Statut</h3>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedCandidate.status)}
                      <span className="text-sm text-gray-500">
                        depuis le{" "}
                        {new Date(
                          selectedCandidate.created_at
                        ).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-1">Coordonnées</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MailIcon className="h-4 w-4 text-gray-500" />
                        <span>{selectedCandidate.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedCandidate.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-1">Évaluation</h3>
                    <div className="flex items-center gap-4">
                      {renderRating(
                        selectedCandidate.rating || 0,
                        selectedCandidate.id
                      )}
                      <span className="text-sm text-gray-500">
                        {selectedCandidate.rating}/5
                      </span>
                    </div>
                  </div>

                  {selectedCandidate.resume_url && (
                    <div>
                      <h3 className="font-medium mb-1">CV</h3>
                      <Button
                        variant="outline"
                        onClick={() => handleDownloadResume(selectedCandidate)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Télécharger
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Expérience</h3>
                    <p className="text-sm">{selectedCandidate.experience}</p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-1">Motivation</h3>
                    <p className="text-sm">{selectedCandidate.motivation}</p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-1">Notes</h3>
                    <p className="text-sm whitespace-pre-line">
                      {selectedCandidate.notes || "Aucune note"}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsDialog(false)}
                >
                  Fermer
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowDetailsDialog(false);
                      setNewStatus(selectedCandidate.status);
                      setStatusNote("");
                      setShowStatusDialog(true);
                    }}
                  >
                    Changer le statut
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Status Change Dialog */}
        {selectedCandidate && (
          <Dialog
            open={showStatusDialog}
            onOpenChange={setShowStatusDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Changer le statut</DialogTitle>
                <DialogDescription>
                  Mise à jour du statut pour {selectedCandidate.full_name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Statut actuel</Label>
                  <div>{getStatusBadge(selectedCandidate.status)}</div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-status">Nouveau statut</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger id="new-status">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nouveau</SelectItem>
                      <SelectItem value="contacted">Contacté</SelectItem>
                      <SelectItem value="interview">Entretien</SelectItem>
                      <SelectItem value="offer">Offre</SelectItem>
                      <SelectItem value="hired">Embauché</SelectItem>
                      <SelectItem value="rejected">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-note">Note (optionnelle)</Label>
                  <Textarea
                    id="status-note"
                    placeholder="Ajouter une note concernant ce changement de statut..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowStatusDialog(false)}
                >
                  Annuler
                </Button>
                <Button onClick={handleStatusChange}>
                  Mettre à jour le statut
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
