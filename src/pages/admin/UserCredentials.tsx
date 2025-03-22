
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Search, UserPlus, Save, Eye, EyeOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  status?: string;
}

export default function UserCredentials() {
  const { isSuperAdmin, isMasterAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    department: "etudiant",
  });

  useEffect(() => {
    // Vérifier si l'utilisateur est un super admin ou master admin
    if (!isSuperAdmin && !isMasterAdmin) {
      toast.error("Vous n'avez pas les autorisations nécessaires.");
      navigate("/dashboard");
      return;
    }

    fetchUsers();
  }, [isSuperAdmin, isMasterAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, department, status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.department) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setLoading(true);
      
      // Créer un nouvel utilisateur dans Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
      if (data.user) {
        // Mettre à jour le profil
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            department: formData.department,
            status: 'active',
          })
          .eq('id', data.user.id);

        if (profileError) throw profileError;
        
        toast.success("Utilisateur créé avec succès");
        setShowCreateDialog(false);
        resetForm();
        fetchUsers();
      }
    } catch (error: any) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      toast.error(error.message || "Erreur lors de la création de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      setLoading(true);
      
      // Déterminer si le nouveau rôle inclut des privilèges d'admin
      let updates: any = { department: newRole };
      
      if (newRole === 'admin') {
        updates.is_super_admin = true;
      } else if (newRole === 'master_admin') {
        updates.is_super_admin = true;
        updates.is_master_admin = true;
      } else {
        updates.is_super_admin = false;
        updates.is_master_admin = false;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      
      toast.success("Rôle mis à jour avec succès");
      fetchUsers();
    } catch (error: any) {
      console.error("Erreur lors de la modification du rôle:", error);
      toast.error(error.message || "Erreur lors de la modification du rôle");
    } finally {
      setLoading(false);
    }
  };

  const resetUserPassword = async (userId: string, email: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir réinitialiser le mot de passe pour ${email}?`)) {
      try {
        setLoading(true);
        
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;
        
        toast.success("Email de réinitialisation envoyé avec succès");
      } catch (error: any) {
        console.error("Erreur lors de la réinitialisation du mot de passe:", error);
        toast.error(error.message || "Erreur lors de la réinitialisation du mot de passe");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      department: "etudiant",
    });
    setShowPassword(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Gestion des Identifiants Utilisateurs</h1>
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-1/3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Rechercher un utilisateur..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Créer un nouvel utilisateur
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            Gérez les identifiants et les rôles des utilisateurs de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={user.department} 
                          onValueChange={(value) => handleChangeUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="etudiant">Étudiant</SelectItem>
                            <SelectItem value="conseiller">Conseiller</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            {isMasterAdmin && (
                              <SelectItem value="master_admin">Master Admin</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 
                          user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {user.status === 'active' ? 'Actif' : 
                           user.status === 'pending' ? 'En attente' : 'Inactif'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => resetUserPassword(user.id, user.email)}
                        >
                          Réinitialiser mot de passe
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour créer un nouvel utilisateur */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Rôle *</Label>
                <Select 
                  value={formData.department}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="etudiant">Étudiant</SelectItem>
                    <SelectItem value="conseiller">Conseiller</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {isMasterAdmin && (
                      <SelectItem value="master_admin">Master Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Créer
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
