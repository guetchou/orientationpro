import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar,
  Send,
  CheckCircle,
  AlertCircle,
  Upload,
  FileText,
  Star,
  Clock
} from 'lucide-react';

interface JobPosting {
  id: number;
  title: string;
  description: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  benefits: string[];
  skills_required: string[];
  company_name: string;
  company_logo?: string;
  company_verified: boolean;
}

interface JobApplicationModalProps {
  job: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  candidateId: number;
}

export const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  job,
  isOpen,
  onClose,
  candidateId
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    cover_letter: '',
    expected_salary: '',
    availability_date: '',
    source: 'website'
  });

  const handleSubmit = async () => {
    if (!job) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/applications/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_posting_id: job.id,
          candidate_id: candidateId,
          cover_letter: formData.cover_letter,
          expected_salary: formData.expected_salary ? parseFloat(formData.expected_salary) : null,
          availability_date: formData.availability_date || null,
          source: formData.source
        })
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          setIsSuccess(false);
          setFormData({
            cover_letter: '',
            expected_salary: '',
            availability_date: '',
            source: 'website'
          });
        }, 2000);
      } else {
        setError(data.message || 'Erreur lors de l\'envoi de la candidature');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels = {
      'full_time': 'CDI',
      'part_time': 'CDD',
      'contract': 'Contrat',
      'internship': 'Stage',
      'freelance': 'Freelance'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getExperienceLevelLabel = (level: string) => {
    const labels = {
      'entry': 'Débutant',
      'junior': 'Junior',
      'mid': 'Intermédiaire',
      'senior': 'Senior',
      'lead': 'Lead',
      'executive': 'Executive'
    };
    return labels[level as keyof typeof labels] || level;
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min || !max) return 'Salaire non spécifié';
    return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
  };

  if (!job) return null;

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-600 mb-2">Candidature envoyée !</h3>
            <p className="text-gray-600">
              Votre candidature pour le poste de <strong>{job.title}</strong> a été envoyée avec succès.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              L'entreprise vous contactera prochainement.
            </p>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-blue-600" />
            Candidature pour {job.title}
          </DialogTitle>
          <DialogDescription>
            Postulez à cette offre d'emploi en remplissant le formulaire ci-dessous.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Résumé de l'offre */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {job.company_logo ? (
                  <img 
                    src={job.company_logo} 
                    alt={job.company_name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{job.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-700">{job.company_name}</span>
                    {job.company_verified && (
                      <Star className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{getEmploymentTypeLabel(job.employment_type)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{getExperienceLevelLabel(job.experience_level)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatSalary(job.salary_min, job.salary_max, job.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message d'erreur */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700">{error}</span>
            </motion.div>
          )}

          {/* Formulaire de candidature */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="cover_letter">Lettre de motivation</Label>
              <Textarea
                id="cover_letter"
                placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste..."
                value={formData.cover_letter}
                onChange={(e) => setFormData({ ...formData, cover_letter: e.target.value })}
                className="mt-1"
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-1">
                Maximum 500 mots. Soyez concis et mettez en avant vos compétences pertinentes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expected_salary">Salaire attendu (FCFA)</Label>
                <Input
                  id="expected_salary"
                  type="number"
                  placeholder="Ex: 800000"
                  value={formData.expected_salary}
                  onChange={(e) => setFormData({ ...formData, expected_salary: e.target.value })}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Salaire proposé: {formatSalary(job.salary_min, job.salary_max, job.currency)}
                </p>
              </div>

              <div>
                <Label htmlFor="availability_date">Date de disponibilité</Label>
                <Input
                  id="availability_date"
                  type="date"
                  value={formData.availability_date}
                  onChange={(e) => setFormData({ ...formData, availability_date: e.target.value })}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Quand pouvez-vous commencer ?
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="source">Comment avez-vous trouvé cette offre ?</Label>
              <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Site web de l'entreprise</SelectItem>
                  <SelectItem value="job_board">Job board (OrientationPro)</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="referral">Recommandation</SelectItem>
                  <SelectItem value="social_media">Réseaux sociaux</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Compétences requises */}
          <div>
            <Label>Compétences requises pour ce poste</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {job.skills_required.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Avantages */}
          {job.benefits.length > 0 && (
            <div>
              <Label>Avantages proposés</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {job.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.cover_letter.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer ma candidature
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

