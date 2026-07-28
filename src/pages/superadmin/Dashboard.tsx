import React from 'react';
import { LayoutDashboard, ShieldCheck, Briefcase, BookOpen, Image } from 'lucide-react';
import {
  RoleDashboardScaffold,
  DashboardGrid,
  DashboardActionCard,
} from '@/components/dashboards/RoleDashboardScaffold';

export default function SuperAdminDashboard() {
  return (
    <RoleDashboardScaffold
      roleLabel="Super Admin"
      title="Tableau de bord Super Admin"
      subtitle="Gestion avancée de la plateforme : administration, recrutement, contenus et médias."
    >
      <DashboardGrid>
        <DashboardActionCard
          to="/admin/dashboard"
          icon={LayoutDashboard}
          title="Administration"
          description="Vue d'ensemble et gestion courante de la plateforme."
        />
        <DashboardActionCard
          to="/admin/super-admin"
          icon={ShieldCheck}
          title="Super administration"
          description="Réglages sensibles, rôles et sécurité globale."
        />
        <DashboardActionCard
          to="/admin/ats"
          icon={Briefcase}
          title="Recrutement (ATS)"
          description="Pilotez le module de recrutement et les candidatures."
        />
        <DashboardActionCard
          to="/admin/blog"
          icon={BookOpen}
          title="Blog & contenus"
          description="Rédigez et publiez les articles éditoriaux."
        />
        <DashboardActionCard
          to="/admin/media"
          icon={Image}
          title="Médiathèque"
          description="Gérez les images et fichiers de la plateforme."
        />
      </DashboardGrid>
    </RoleDashboardScaffold>
  );
}
