import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { UserPlus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserTable } from "@/components/admin/UserTable";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import type { ProfileData } from "@/hooks/useAuth";

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  status?: string;
}

export default function UserCredentials() {
  const { user, isSuperAdmin, isMasterAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    department: "etudiant",
  });

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté et a les autorisations
    if (!user) {
      toast.error("Vous devez être connecté pour accéder à cette page.");
      navigate("/login");
      return;
    }

    // Vérifier si l'utilisateur est un super admin ou master admin
    if (!isSuperAdmin && !isMasterAdmin) {
      toast.error("Vous n'avez pas les autorisations nécessaires.");
      navigate("/dashboard");
      return;
    }

    fetchUsers();
  }, [user, isSuperAdmin, isMasterAdmin, navigate]);

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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDepartmentChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      department: value 
    }));
  };

  // Si l'utilisateur n'est pas connecté, afficher un message de chargement
  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

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
          <UserTable 
            users={users}
            loading={loading}
            searchTerm={searchTerm}
            isMasterAdmin={isMasterAdmin}
            onResetPassword={resetUserPassword}
            onChangeRole={handleChangeUserRole}
          />
        </CardContent>
      </Card>

      {/* Dialog pour créer un nouvel utilisateur */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
          </DialogHeader>
          <CreateUserForm 
            loading={loading}
            isMasterAdmin={isMasterAdmin}
            formData={formData}
            onInputChange={handleInputChange}
            onDepartmentChange={handleDepartmentChange}
            onSubmit={handleCreateUser}
            onCancel={resetForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
