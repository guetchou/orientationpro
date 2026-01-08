
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";

interface CreateUserFormProps {
  loading: boolean;
  isMasterAdmin: boolean;
  formData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    department: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDepartmentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

export function CreateUserForm({
  loading,
  isMasterAdmin,
  formData,
  onInputChange,
  onDepartmentChange,
  onSubmit,
  onCancel,
}: CreateUserFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">Prénom</Label>
            <Input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={onInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Nom</Label>
            <Input
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={onInputChange}
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
            onChange={onInputChange}
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
              onChange={onInputChange}
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
            onValueChange={onDepartmentChange}
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
          <Button type="button" variant="outline" onClick={onCancel}>
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
  );
}
