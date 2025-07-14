
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Search, Download, Filter, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface User {
  id: string;
  email: string;
  department: string;
  position: string;
  status: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  education?: string;
  experience?: string;
  interests?: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    status: "",
    dateRange: "",
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = filters.department ? user.department === filters.department : true;
      const matchesStatus = filters.status ? user.status === filters.status : true;
      
      if (filters.dateRange) {
        const userDate = new Date(user.created_at);
        const today = new Date();
        switch (filters.dateRange) {
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return matchesSearch && matchesDepartment && matchesStatus && userDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return matchesSearch && matchesDepartment && matchesStatus && userDate >= monthAgo;
          case "year":
            const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
            return matchesSearch && matchesDepartment && matchesStatus && userDate >= yearAgo;
          default:
            return matchesSearch && matchesDepartment && matchesStatus;
        }
      }

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  };

  const exportUsers = () => {
    const filteredUsers = getFilteredUsers();
    const csvContent = [
      ["ID", "Email", "Prénom", "Nom", "Rôle", "Statut", "Téléphone", "Date de création"],
      ...filteredUsers.map(user => [
        user.id,
        user.email,
        user.first_name || "",
        user.last_name || "",
        user.department,
        user.status,
        user.phone || "",
        format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })
      ])
    ]
    .map(row => row.join(","))
    .join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export réussi !");
  };

  const updateUserRole = async (userId: string, newDepartment: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ department: newDepartment })
        .eq('id', userId);

      if (error) throw error;
      toast.success("Rôle mis à jour avec succès");
      fetchUsers();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      toast.error("Erreur lors de la mise à jour du rôle");
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;
      toast.success("Statut mis à jour avec succès");
      fetchUsers();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtres
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2 space-y-2">
              <Select
                value={filters.department}
                onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les rôles</SelectItem>
                  <SelectItem value="etudiant">Étudiant</SelectItem>
                  <SelectItem value="conseiller">Conseiller</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les dates</SelectItem>
                  <SelectItem value="week">7 derniers jours</SelectItem>
                  <SelectItem value="month">30 derniers jours</SelectItem>
                  <SelectItem value="year">12 derniers mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          onClick={exportUsers}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Exporter
        </Button>

        <Button
          onClick={() => fetchUsers()}
          variant="outline"
          disabled={loading}
        >
          Actualiser
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getFilteredUsers().map((user) => (
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
                      onValueChange={(value) => updateUserRole(user.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="etudiant">Étudiant</SelectItem>
                        <SelectItem value="conseiller">Conseiller</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={user.status}
                      onValueChange={(value) => updateUserStatus(user.id, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserDetails(true);
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Informations personnelles</h3>
                <p><span className="text-gray-500">Email:</span> {selectedUser.email}</p>
                <p><span className="text-gray-500">Nom:</span> {selectedUser.first_name} {selectedUser.last_name}</p>
                <p><span className="text-gray-500">Téléphone:</span> {selectedUser.phone || "-"}</p>
                <p><span className="text-gray-500">Rôle:</span> {selectedUser.department}</p>
                <p><span className="text-gray-500">Statut:</span> {selectedUser.status}</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Profil</h3>
                <p><span className="text-gray-500">Bio:</span> {selectedUser.bio || "-"}</p>
                <p><span className="text-gray-500">Centres d'intérêt:</span> {selectedUser.interests || "-"}</p>
                <p><span className="text-gray-500">Formation:</span> {selectedUser.education || "-"}</p>
                <p><span className="text-gray-500">Expérience:</span> {selectedUser.experience || "-"}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
