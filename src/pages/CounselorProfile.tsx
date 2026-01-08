
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, Phone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCounselorData } from '@/hooks/data/useCounselorData';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export default function CounselorProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const { 
    counselor, 
    isLoading, 
    isError
  } = useCounselorData(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <main className="container mx-auto px-4 py-20">
          <div className="animate-pulse">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3">
                <div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-96"></div>
              </div>
              <div className="w-full md:w-2/3">
                <div className="bg-gray-200 dark:bg-gray-800 h-10 rounded mb-4"></div>
                <div className="bg-gray-200 dark:bg-gray-800 h-6 rounded mb-2"></div>
                <div className="bg-gray-200 dark:bg-gray-800 h-6 rounded mb-6"></div>
                <div className="bg-gray-200 dark:bg-gray-800 h-24 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isError || !counselor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <main className="container mx-auto px-4 py-20">
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Impossible de charger les données du conseiller.
              <Button
                variant="link"
                onClick={() => navigate('/conseillers')}
                className="ml-2 p-0 h-auto"
              >
                Retour à la liste
              </Button>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const fullName = `${counselor.first_name} ${counselor.last_name}`;
  const initials = `${counselor.first_name?.[0] || ''}${counselor.last_name?.[0] || ''}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-6">
                  {counselor.avatar_url ? (
                    <AvatarImage 
                      src={counselor.avatar_url} 
                      alt={fullName}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <h2 className="text-2xl font-bold">{fullName}</h2>
                
                {counselor.department && (
                  <Badge variant="outline" className="mt-2 mb-4">
                    {counselor.department}
                  </Badge>
                )}
                
                <div className="grid gap-3 w-full mt-4">
                  <Button className="w-full flex gap-2 items-center">
                    <Calendar className="h-4 w-4" />
                    Prendre rendez-vous
                  </Button>
                  
                  {counselor.email && (
                    <Button variant="outline" className="w-full flex gap-2 items-center">
                      <Mail className="h-4 w-4" />
                      Contacter par email
                    </Button>
                  )}
                  
                  {counselor.phone && (
                    <Button variant="outline" className="w-full flex gap-2 items-center">
                      <Phone className="h-4 w-4" />
                      Appeler
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="w-full md:w-2/3">
            <Card className="border-0 shadow-lg h-full">
              <CardHeader>
                <CardTitle>À propos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  {counselor.bio ? (
                    <p>{counselor.bio}</p>
                  ) : (
                    <p>Aucune biographie disponible pour ce conseiller.</p>
                  )}
                  
                  {counselor.specialties && counselor.specialties.length > 0 && (
                    <>
                      <h3>Spécialités</h3>
                      <div className="flex flex-wrap gap-2">
                        {counselor.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
