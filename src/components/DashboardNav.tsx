
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Key,
} from "lucide-react";

import { NavItem, NavList } from "@/components/ui/nav";
import { useAuth } from "@/hooks/useAuth";

export function DashboardNav() {
  const { user, profileData } = useAuth();
  const isSuperAdmin = profileData?.role === 'super_admin';

  return (
    <NavList>
      {isSuperAdmin && (
        <>
          <NavItem href="/admin/dashboard" label="Tableau de bord" icon={<LayoutDashboard size={16} />} />
          <NavItem href="/admin/cms" label="Gestion de contenu" icon={<FileText size={16} />} />
          <NavItem href="/admin/user-management" label="Gestion des utilisateurs" icon={<Users size={16} />} />
          <NavItem href="/admin/user-credentials" label="Identifiants & Rôles" icon={<Key size={16} />} />
        </>
      )}
    </NavList>
  );
}
