import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, Settings, Bell, Shield, FileText, 
  CreditCard, LogOut, CheckCircle, Mail, Phone,
  Camera, Lock, Save, RefreshCw
} from 'lucide-react';

const Profile = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Profil mis à jour avec succès",
        variant: "default"
      });
    }, 1500);
  };

  const handleLogout = () => {
    signOut();
    toast({
      title: "Vous avez été déconnecté avec succès",
      variant: "default"
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Non connecté</CardTitle>
            <CardDescription>Veuillez vous connecter pour accéder à votre profil.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="/login">Se connecter</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Calculer le nom d'affichage
  const displayName = user.displayName || 
    (profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Utilisateur');
  
  // Calculer l'initiale pour l'avatar
  const avatarInitial = displayName.charAt(0) || user.email?.charAt(0) || 'U';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-white">
      <div className="container mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">Profil utilisateur</h1>
            <p className="text-gray-600">Gérez vos informations personnelles et préférences</p>
          </div>

          <div className="grid md:grid-cols-[240px_1fr] gap-6">
            {/* Profile sidebar */}
            <div className="order-2 md:order-1">
              <Card className="sticky top-20">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center mb-6 pt-4">
                    <div className="relative mb-3">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                        <AvatarImage src={profile?.avatar_url || user.photoURL || "https://github.com/shadcn.png"} />
                        <AvatarFallback className="text-xl bg-primary text-primary-foreground">{avatarInitial}</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow bg-white">
                        <Camera size={14} />
                      </Button>
                    </div>
                    <h2 className="text-xl font-bold">{displayName}</h2>
                    <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Compte Premium</Badge>
                  </div>

                  <Separator className="my-4" />

                  <nav className="space-y-1.5">
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <UserIcon size={18} />
                      Profil
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Settings size={18} />
                      Paramètres
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Bell size={18} />
                      Notifications
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Shield size={18} />
                      Sécurité
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <FileText size={18} />
                      Documents
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <CreditCard size={18} />
                      Paiements
                    </Button>
                    <Separator className="my-2" />
                    <Button
                      variant="ghost" 
                      className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
                      Déconnexion
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main content */}
            <div className="order-1 md:order-2">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid grid-cols-3 w-full mb-6">
                  <TabsTrigger value="personal">Informations</TabsTrigger>
                  <TabsTrigger value="security">Sécurité</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informations personnelles</CardTitle>
                      <CardDescription>
                        Mettez à jour vos informations personnelles
                      </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSaveProfile}>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">Prénom</Label>
                            <Input id="firstName" defaultValue={profile?.first_name || displayName.split(' ')[0] || ''} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Nom</Label>
                            <Input id="lastName" defaultValue={profile?.last_name || displayName.split(' ')[1] || ''} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="flex">
                            <Input id="email" defaultValue={user.email} readOnly />
                            <Badge className="ml-2 bg-green-100 text-green-800 border-0 flex items-center gap-1">
                              <CheckCircle size={12} />
                              Vérifié
                            </Badge>
                          </div>
                        </div>

                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <div className="flex">
                              <Phone size={18} className="mr-2 text-gray-400 self-center" />
                              <Input id="phone" placeholder="+33 6 12 34 56 78" defaultValue={profile?.phone || ""} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="birthday">Date de naissance</Label>
                            <Input id="birthday" type="date" defaultValue="" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bio">Biographie</Label>
                          <textarea
                            id="bio"
                            className="w-full min-h-[100px] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Parlez-nous de vous..."
                            defaultValue={profile?.bio || ""}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline">Annuler</Button>
                        <Button type="submit" disabled={saving}>
                          {saving ? (
                            <>
                              <RefreshCw size={16} className="mr-2 animate-spin" />
                              Enregistrement...
                            </>
                          ) : (
                            <>
                              <Save size={16} className="mr-2" />
                              Enregistrer
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>

                
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sécurité</CardTitle>
                      <CardDescription>
                        Gérez la sécurité de votre compte
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Mot de passe actuel</Label>
                          <div className="flex">
                            <Lock size={18} className="mr-2 text-gray-400 self-center" />
                            <Input id="current-password" type="password" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-password">Nouveau mot de passe</Label>
                            <Input id="new-password" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                            <Input id="confirm-password" type="password" />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Authentification à deux facteurs</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Authentification par application</p>
                            <p className="text-sm text-gray-500">Utilisez une application d'authentification pour générer des codes de vérification.</p>
                          </div>
                          <Switch defaultChecked={false} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Authentification par SMS</p>
                            <p className="text-sm text-gray-500">Recevez un code de vérification par SMS.</p>
                          </div>
                          <Switch defaultChecked={true} />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Mettre à jour</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Préférences de notification</CardTitle>
                      <CardDescription>
                        Configurez comment et quand vous souhaitez être notifié
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Email</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Nouveaux résultats de test</p>
                              <p className="text-sm text-gray-500">Recevez une notification lorsque vos résultats de test sont disponibles.</p>
                            </div>
                            <Switch defaultChecked={true} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Rappels de rendez-vous</p>
                              <p className="text-sm text-gray-500">Recevez des rappels pour vos rendez-vous d'orientation.</p>
                            </div>
                            <Switch defaultChecked={true} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Nouveautés et mises à jour</p>
                              <p className="text-sm text-gray-500">Restez informé des nouvelles fonctionnalités et améliorations.</p>
                            </div>
                            <Switch defaultChecked={false} />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Application</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Notifications push</p>
                              <p className="text-sm text-gray-500">Activez les notifications push pour les alertes importantes.</p>
                            </div>
                            <Switch defaultChecked={true} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Sons de notification</p>
                              <p className="text-sm text-gray-500">Activez les sons pour les notifications.</p>
                            </div>
                            <Switch defaultChecked={false} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button>Enregistrer les préférences</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
