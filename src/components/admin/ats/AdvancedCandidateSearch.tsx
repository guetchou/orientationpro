
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Star, 
  Calendar,
  Briefcase,
  GraduationCap,
  Target
} from 'lucide-react';

interface SearchFilters {
  searchTerm: string;
  skills: string[];
  location: string;
  radius: number[];
  experience: string;
  rating: number[];
  status: string;
  dateRange: string;
  education: string;
  position: string;
}

interface AdvancedCandidateSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
  candidateCount: number;
}

export const AdvancedCandidateSearch: React.FC<AdvancedCandidateSearchProps> = ({
  onSearch,
  onReset,
  candidateCount
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    skills: [],
    location: '',
    radius: [50],
    experience: '',
    rating: [0],
    status: 'all',
    dateRange: 'all',
    education: '',
    position: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const commonSkills = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
    'Java', 'SQL', 'MongoDB', 'AWS', 'Docker',
    'Project Management', 'Agile', 'Scrum', 'Leadership',
    'Communication', 'Marketing', 'Sales', 'Design'
  ];

  const handleAddSkill = (skill: string) => {
    if (skill && !filters.skills.includes(skill)) {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      searchTerm: '',
      skills: [],
      location: '',
      radius: [50],
      experience: '',
      rating: [0],
      status: 'all',
      dateRange: 'all',
      education: '',
      position: ''
    });
    onReset();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche Avancée
          </div>
          <Badge variant="outline">
            {candidateCount} candidat{candidateCount > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recherche principale */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <Input
            placeholder="Rechercher par nom, email, poste..."
            className="pl-10"
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
          />
        </div>

        {/* Filtres rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
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

          <Select value={filters.position} onValueChange={(value) => setFilters(prev => ({ ...prev, position: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Poste" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les postes</SelectItem>
              <SelectItem value="Développeur Full Stack">Développeur Full Stack</SelectItem>
              <SelectItem value="Développeur Frontend">Développeur Frontend</SelectItem>
              <SelectItem value="Développeur Backend">Développeur Backend</SelectItem>
              <SelectItem value="Chef de Projet">Chef de Projet</SelectItem>
              <SelectItem value="Designer UX/UI">Designer UX/UI</SelectItem>
              <SelectItem value="Data Scientist">Data Scientist</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {isExpanded ? 'Moins de filtres' : 'Plus de filtres'}
          </Button>
        </div>

        {/* Filtres avancés */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            {/* Compétences */}
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Compétences
              </Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Ajouter une compétence..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(newSkill))}
                />
                <Button 
                  type="button" 
                  onClick={() => handleAddSkill(newSkill)}
                  size="sm"
                >
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {filters.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {commonSkills.filter(skill => !filters.skills.includes(skill)).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-white"
                    onClick={() => handleAddSkill(skill)}
                  >
                    + {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Géolocalisation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Localisation
                </Label>
                <Input
                  placeholder="Ville, région, code postal..."
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2">
                  Rayon de recherche: {filters.radius[0]} km
                </Label>
                <Slider
                  value={filters.radius}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, radius: value }))}
                  max={200}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Expérience et Note */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Expérience
                </Label>
                <Select value={filters.experience} onValueChange={(value) => setFilters(prev => ({ ...prev, experience: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Niveau d'expérience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous niveaux</SelectItem>
                    <SelectItem value="junior">Junior (0-2 ans)</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire (2-5 ans)</SelectItem>
                    <SelectItem value="senior">Senior (5+ ans)</SelectItem>
                    <SelectItem value="expert">Expert (10+ ans)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Note minimale: {filters.rating[0]}/5
                </Label>
                <Slider
                  value={filters.rating}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}
                  max={5}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Éducation et Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Niveau d'éducation
                </Label>
                <Select value={filters.education} onValueChange={(value) => setFilters(prev => ({ ...prev, education: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Niveau d'éducation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous niveaux</SelectItem>
                    <SelectItem value="bac">Baccalauréat</SelectItem>
                    <SelectItem value="bac+2">Bac+2</SelectItem>
                    <SelectItem value="bac+3">Bac+3</SelectItem>
                    <SelectItem value="bac+5">Bac+5</SelectItem>
                    <SelectItem value="doctorat">Doctorat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Période de candidature
                </Label>
                <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les périodes</SelectItem>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="week">Cette semaine</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                    <SelectItem value="quarter">Ce trimestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-4">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
