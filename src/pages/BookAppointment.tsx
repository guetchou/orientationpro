import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Clock, 
  DollarSign, 
  Users, 
  MessageSquare,
  Calendar,
  MapPin,
  Award,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AppointmentScheduler } from '@/components/conseiller/AppointmentScheduler';

interface Counselor {
  id: number;
  name: string;
  email: string;
  specializations: string[];
  experience_years: number;
  hourly_rate: number;
  rating: number;
  total_sessions: number;
  bio: string;
  is_verified: boolean;
  avatar_url?: string;
}

export default function BookAppointment() {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCounselors();
  }, []);

  const loadCounselors = async () => {
    setIsLoading(true);
    
    // Mock data pour la démo
    setTimeout(() => {
      setCounselors([
        {
          id: 1,
          name: 'Dr. Marie Kimboula',
          email: 'marie.kimboula@orientationpro.cg',
          specializations: ['Orientation professionnelle', 'Développement de carrière', 'Leadership'],
          experience_years: 8,
          hourly_rate: 15000,
          rating: 4.8,
          total_sessions: 245,
          bio: 'Experte en orientation professionnelle avec plus de 8 ans d\'expérience. Spécialisée dans l\'accompagnement des jeunes diplômés et des professionnels en transition de carrière.',
          is_verified: true,
          avatar_url: '/avatars/marie-kimboula.jpg'
        },
        {
          id: 2,
          name: 'Prof. Jean Makaya',
          email: 'jean.makaya@orientationpro.cg',
          specializations: ['Ressources humaines', 'Gestion de carrière', 'Formation'],
          experience_years: 12,
          hourly_rate: 20000,
          rating: 4.9,
          total_sessions: 312,
          bio: 'Expert en ressources humaines et gestion de carrière. Ancien DRH de grandes entreprises, il accompagne les professionnels dans leur évolution professionnelle.',
          is_verified: true,
          avatar_url: '/avatars/jean-makaya.jpg'
        },
        {
          id: 3,
          name: 'Mme. Sarah Nzouba',
          email: 'sarah.nzouba@orientationpro.cg',
          specializations: ['Coaching', 'Mentorat', 'Entrepreneuriat'],
          experience_years: 6,
          hourly_rate: 12000,
          rating: 4.7,
          total_sessions: 189,
          bio: 'Coach certifiée et entrepreneure. Spécialisée dans l\'accompagnement des entrepreneurs et la création d\'entreprise au Congo.',
          is_verified: true,
          avatar_url: '/avatars/sarah-nzouba.jpg'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
  };

  if (selectedCounselor) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedCounselor(null)}
            className="mb-4"
          >
            ← Retour à la liste des conseillers
          </Button>
          
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={selectedCounselor.avatar_url} />
              <AvatarFallback className="text-lg">
                {getInitials(selectedCounselor.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{selectedCounselor.name}</h1>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-medium">{selectedCounselor.rating}</span>
                <span className="text-gray-600">({selectedCounselor.total_sessions} sessions)</span>
                {selectedCounselor.is_verified && (
                  <Badge variant="secondary" className="ml-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Vérifié
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <AppointmentScheduler
          counselorId={selectedCounselor.id}
          counselorName={selectedCounselor.name}
          onAppointmentCreated={(appointment) => {
            console.log('Rendez-vous créé:', appointment);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Prendre rendez-vous avec un conseiller</h1>
        <p className="text-gray-600 max-w-2xl">
          Choisissez un conseiller d'orientation professionnelle expérimenté pour vous accompagner dans votre parcours. 
          Nos experts vous aideront à clarifier vos objectifs et à développer votre potentiel.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Chargement des conseillers...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counselors.map((counselor, index) => (
            <motion.div
              key={counselor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={counselor.avatar_url} />
                      <AvatarFallback>
                        {getInitials(counselor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{counselor.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{counselor.rating}</span>
                        <span className="text-gray-600 text-sm">({counselor.total_sessions})</span>
                      </div>
                    </div>
                    {counselor.is_verified && (
                      <Badge variant="secondary">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Vérifié
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-3">{counselor.bio}</p>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Spécialisations */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">Spécialisations</p>
                      <div className="flex flex-wrap gap-1">
                        {counselor.specializations.slice(0, 2).map((spec, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {counselor.specializations.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{counselor.specializations.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Informations clés */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{counselor.experience_years} ans exp.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span>{counselor.hourly_rate.toLocaleString()} FCFA/h</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3">
                      <Button 
                        className="flex-1"
                        onClick={() => setSelectedCounselor(counselor)}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Prendre RDV
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Section informations */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Pourquoi choisir nos conseillers ?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Conseillers certifiés</h3>
                <p className="text-sm text-gray-600">
                  Tous nos conseillers sont certifiés et ont une expérience professionnelle solide.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Satisfaction garantie</h3>
                <p className="text-sm text-gray-600">
                  Plus de 95% de nos clients sont satisfaits de leurs sessions de conseil.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Réunions en ligne</h3>
                <p className="text-sm text-gray-600">
                  Sessions de conseil en ligne sécurisées, accessibles de partout au Congo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
