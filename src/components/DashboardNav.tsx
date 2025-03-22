import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Key,
} from "lucide-react";

import { MainNavItem } from "@/types";
import { NavItem, NavList } from "@/components/ui/nav";
import { useAuth } from "@/hooks/useAuth";

interface DashboardNavProps {
  items?: MainNavItem[];
}

export function DashboardNav() {
  const { isSuperAdmin } = useAuth();

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
