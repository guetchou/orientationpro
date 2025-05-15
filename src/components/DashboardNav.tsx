
import React from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Key,
  BookOpen,
  Briefcase,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const DashboardNav = () => {
  const { isSuperAdmin, profile } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Tableau de bord", icon: <LayoutDashboard size={16} /> },
    { href: "/admin/blog", label: "Gestion du blog", icon: <BookOpen size={16} /> },
    { href: "/admin/ats", label: "Recrutement (ATS)", icon: <Briefcase size={16} /> }
  ];
  
  // Ajouter les options administrateur si l'utilisateur est super admin
  if (isSuperAdmin || profile?.is_super_admin) {
    navItems.push(
      { href: "/admin/cms", label: "Gestion de contenu", icon: <FileText size={16} /> },
      { href: "/admin/user-management", label: "Gestion des utilisateurs", icon: <Users size={16} /> },
      { href: "/admin/user-credentials", label: "Identifiants & Rôles", icon: <Key size={16} /> }
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="mr-3 text-gray-500 dark:text-gray-400">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default DashboardNav;
export { DashboardNav };
