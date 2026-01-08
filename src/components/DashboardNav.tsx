import React from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Key,
  BookOpen,
  Briefcase,
  User as UserIcon,
  UserCheck,
  UserCog,
  UserPlus,
  UserCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const DashboardNav = () => {
  const { user, isSuperAdmin } = useAuth();

  if (!user) return null;

  let navItems = [];

  switch (user.role) {
    case 'admin':
      navItems = [
        { href: "/admin/dashboard", label: "Tableau de bord Admin", icon: <LayoutDashboard size={16} /> },
        { href: "/admin/blog", label: "Gestion du blog", icon: <BookOpen size={16} /> },
        { href: "/admin/ats", label: "Recrutement (ATS)", icon: <Briefcase size={16} /> },
        { href: "/admin/user-management", label: "Gestion des utilisateurs", icon: <Users size={16} /> },
        { href: "/admin/user-credentials", label: "Identifiants & Rôles", icon: <Key size={16} /> },
      ];
      break;
    case 'superadmin':
      navItems = [
        { href: "/superadmin/dashboard", label: "Tableau de bord Super Admin", icon: <LayoutDashboard size={16} /> },
        { href: "/admin/user-management", label: "Gestion des utilisateurs", icon: <Users size={16} /> },
        { href: "/admin/user-credentials", label: "Identifiants & Rôles", icon: <Key size={16} /> },
        { href: "/admin/cms", label: "Gestion de contenu", icon: <FileText size={16} /> },
        { href: "/admin/settings", label: "Paramètres", icon: <Settings size={16} /> },
      ];
      break;
    case 'conseiller':
      navItems = [
        { href: "/conseiller/dashboard", label: "Tableau de bord Conseiller", icon: <UserCheck size={16} /> },
        { href: "/conseiller/appointments", label: "Rendez-vous", icon: <UserPlus size={16} /> },
        { href: "/conseiller/students", label: "Étudiants", icon: <UserIcon size={16} /> },
        { href: "/conseiller/availability", label: "Disponibilités", icon: <UserCog size={16} /> },
      ];
      break;
    case 'coach':
      navItems = [
        { href: "/coach/dashboard", label: "Tableau de bord Coach", icon: <UserCheck size={16} /> },
        { href: "/coach/sessions", label: "Sessions de coaching", icon: <UserPlus size={16} /> },
        { href: "/coach/coachees", label: "Coachés", icon: <UserIcon size={16} /> },
      ];
      break;
    case 'recruteur':
      navItems = [
        { href: "/recruteur/dashboard", label: "Tableau de bord Recruteur", icon: <Briefcase size={16} /> },
        { href: "/recruteur/offres", label: "Offres d'emploi", icon: <FileText size={16} /> },
        { href: "/recruteur/candidatures", label: "Candidatures", icon: <UserIcon size={16} /> },
      ];
      break;
    case 'rh':
      navItems = [
        { href: "/rh/dashboard", label: "Tableau de bord RH", icon: <UserCircle size={16} /> },
        { href: "/rh/collaborateurs", label: "Collaborateurs", icon: <Users size={16} /> },
        { href: "/rh/dossiers", label: "Dossiers RH", icon: <FileText size={16} /> },
      ];
      break;
    default:
      navItems = [
        { href: "/dashboard", label: "Tableau de bord", icon: <LayoutDashboard size={16} /> },
        { href: "/profile", label: "Profil", icon: <UserIcon size={16} /> },
        { href: "/tests", label: "Tests", icon: <BookOpen size={16} /> },
      ];
      break;
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
