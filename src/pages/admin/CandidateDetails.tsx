
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Mail, Phone, Calendar, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const statusColors = {
  new: "bg-blue-500",
  screening: "bg-yellow-500",
  interview: "bg-purple-500",
  offer: "bg-green-500",
  rejected: "bg-red-500"
};

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        setCandidate(data);
        setNotes(data.notes || '');
        setStatus(data.status);
        setRating(data.rating || 0);
      } catch (error) {
        console.error('Erreur lors du chargement du candidat:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du candidat",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCandidate();
  }, [id, toast]);

  const handleSave = async () => {
    try {
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
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les informations",
        variant: "destructive",
      });
    }
  };

  const renderRatingStars = () => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 cursor-pointer ${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        onClick={() => setRating(index + 1)}
      />
    ));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>;
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Candidat non trouvé</h2>
        <Button variant="outline" onClick={() => navigate('/admin/ats')}>
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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/ats')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
        </Button>
        <h1 className="text-3xl font-bold">{candidate.full_name}</h1>
        <div className="flex items-center mt-2">
          <Badge variant="secondary" className={statusColors[candidate.status]}>
            {candidate.status}
          </Badge>
          <span className="text-sm text-gray-500 ml-4">Candidature reçue le {createdDate}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl bg-primary text-white">
                    {candidate.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline">
                    {candidate.email}
                  </a>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <a href={`tel:${candidate.phone}`} className="text-blue-600 hover:underline">
                    {candidate.phone}
                  </a>
                </div>
                
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{candidate.position}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{createdDate}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium mb-2">Évaluation</h4>
                <div className="flex items-center">
                  {renderRatingStars()}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium mb-2">Statut</h4>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nouveau</SelectItem>
                    <SelectItem value="screening">Présélection</SelectItem>
                    <SelectItem value="interview">Entretien</SelectItem>
                    <SelectItem value="offer">Offre</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} className="w-full">Enregistrer les modifications</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="experience">Expérience</TabsTrigger>
              <TabsTrigger value="motivation">Motivation</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>À propos du candidat</CardTitle>
                  <CardDescription>Résumé du profil du candidat</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p>Candidature pour le poste de : <strong>{candidate.position}</strong></p>
                    <p>Candidat depuis : <strong>{createdDate}</strong></p>
                    <p>Statut actuel : <strong>{candidate.status}</strong></p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="experience" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Expérience professionnelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p>{candidate.experience || "Aucune expérience mentionnée."}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="motivation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lettre de motivation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p>{candidate.motivation || "Aucune lettre de motivation fournie."}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notes internes</CardTitle>
                  <CardDescription>Notes privées concernant ce candidat</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ajouter des notes concernant ce candidat..."
                    rows={8}
                  />
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSave}>Enregistrer les notes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;
