
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Key,
  BookOpen,
  Briefcase,
} from "lucide-react";

import { NavItem, NavList } from "@/components/ui/nav";
import { useAuth } from "@/hooks/useAuth";

export function DashboardNav() {
  const { isSuperAdmin, profile } = useAuth();

  return (
    <NavList>
      {(isSuperAdmin || profile?.is_super_admin) && (
        <>
          <NavItem href="/admin/dashboard" label="Tableau de bord" icon={<LayoutDashboard size={16} />} />
          <NavItem href="/admin/cms" label="Gestion de contenu" icon={<FileText size={16} />} />
          <NavItem href="/admin/blog" label="Gestion du blog" icon={<BookOpen size={16} />} />
          <NavItem href="/admin/ats" label="Recrutement (ATS)" icon={<Briefcase size={16} />} />
          <NavItem href="/admin/user-management" label="Gestion des utilisateurs" icon={<Users size={16} />} />
          <NavItem href="/admin/user-credentials" label="Identifiants & Rôles" icon={<Key size={16} />} />
        </>
      )}
    </NavList>
  );
}
