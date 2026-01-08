
import React from "react";
import { Loader2, Search, Eye, EyeOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  status?: string;
}

interface UserTableProps {
  users: User[];
  loading: boolean;
  searchTerm: string;
  isMasterAdmin: boolean;
  onResetPassword: (userId: string, email: string) => void;
  onChangeRole: (userId: string, newRole: string) => void;
}

export function UserTable({
  users,
  loading,
  searchTerm,
  isMasterAdmin,
  onResetPassword,
  onChangeRole,
}: UserTableProps) {
  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
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
                      onValueChange={(value) => onChangeRole(user.id, value)}
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
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : user.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status === "active"
                        ? "Actif"
                        : user.status === "pending"
                        ? "En attente"
                        : "Inactif"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResetPassword(user.id, user.email)}
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
    </>
  );
}
