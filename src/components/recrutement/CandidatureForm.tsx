
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

const CandidatureForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    motivation: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, position: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Vérification des champs obligatoires
      if (!formData.full_name || !formData.email || !formData.phone || !formData.position || !formData.experience || !formData.motivation) {
        toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      // Insertion dans la base de données
      const { data, error } = await supabase.from('candidates').insert([
        { 
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          experience: formData.experience,
          motivation: formData.motivation,
          status: 'new',
          rating: 0
        }
      ]);

      if (error) throw error;

      toast({ title: "Succès", description: "Votre candidature a été soumise avec succès", variant: "default" });
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        motivation: ''
      });
    } catch (error: any) {
      console.error("Erreur lors de la soumission:", error.message);
      toast({ title: "Erreur", description: "Une erreur est survenue lors de la soumission de votre candidature", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <h3 className="text-2xl font-bold mb-6">Déposez votre candidature</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium mb-1">Nom complet *</label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Prénom et Nom"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email *</label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="exemple@email.com"
            required
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">Téléphone *</label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1234567890"
            required
          />
        </div>
        
        <div>
          <label htmlFor="position" className="block text-sm font-medium mb-1">Poste souhaité *</label>
          <Select onValueChange={handleSelectChange} value={formData.position}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un poste" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Conseiller d'orientation">Conseiller d'orientation</SelectItem>
              <SelectItem value="Psychologue scolaire">Psychologue scolaire</SelectItem>
              <SelectItem value="Développeur">Développeur</SelectItem>
              <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
              <SelectItem value="Assistant administratif">Assistant administratif</SelectItem>
              <SelectItem value="Chef de projet">Chef de projet</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
              <SelectItem value="Autre">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="experience" className="block text-sm font-medium mb-1">Expérience professionnelle *</label>
          <Textarea
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="Décrivez votre parcours professionnel et vos compétences..."
            rows={4}
            required
          />
        </div>
        
        <div>
          <label htmlFor="motivation" className="block text-sm font-medium mb-1">Lettre de motivation *</label>
          <Textarea
            id="motivation"
            name="motivation"
            value={formData.motivation}
            onChange={handleChange}
            placeholder="Pourquoi souhaitez-vous rejoindre notre équipe ?"
            rows={6}
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Envoi en cours..." : "Soumettre ma candidature"}
        </Button>
      </form>
    </div>
  );
};

export default CandidatureForm;
