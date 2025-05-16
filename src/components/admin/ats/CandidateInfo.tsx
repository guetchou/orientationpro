
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, Briefcase, Calendar, Star, Loader2 } from 'lucide-react';

interface CandidateInfoProps {
  candidate: {
    full_name: string;
    email: string;
    phone: string;
    position: string;
    status: string;
    rating?: number;
  };
  createdDate: string;
  status: string;
  setStatus: (status: string) => void;
  rating: number;
  setRating: (rating: number) => void;
  onSave: () => void;
  saving: boolean;
}

export const CandidateInfo: React.FC<CandidateInfoProps> = ({
  candidate,
  createdDate,
  status,
  setStatus,
  rating,
  setRating,
  onSave,
  saving
}) => {
  const renderRatingStars = () => {
    return Array(5).fill(0).map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 cursor-pointer transition-colors duration-200 ${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
        onClick={() => setRating(index + 1)}
      />
    ));
  };

  const initials = candidate.full_name.split(' ').map(n => n[0]).join('');

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-md dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Informations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center mb-6">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-2xl bg-primary text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            <a href={`mailto:${candidate.email}`} className="text-blue-600 dark:text-blue-400 hover:underline transition-colors">
              {candidate.email}
            </a>
          </div>
          
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            <a href={`tel:${candidate.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline transition-colors">
              {candidate.phone}
            </a>
          </div>
          
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            <span className="dark:text-gray-200">{candidate.position}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
            <span className="dark:text-gray-200">{createdDate}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2 dark:text-gray-200">Évaluation</h4>
          <div className="flex items-center">
            {renderRatingStars()}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-2 dark:text-gray-200">Statut</h4>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full transition-all focus:ring-2 focus:ring-primary/30">
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
        <Button 
          onClick={onSave} 
          className="w-full transition-all duration-300 hover:bg-primary/90" 
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer les modifications"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
