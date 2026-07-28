import React from 'react';
import { Users, UserCircle, Briefcase, Compass } from 'lucide-react';
import {
  RoleDashboardScaffold,
  DashboardGrid,
  DashboardActionCard,
  DashboardEmptyState,
} from '@/components/dashboards/RoleDashboardScaffold';

export default function RhDashboard() {
  return (
    <RoleDashboardScaffold
      roleLabel="RH"
      title="Tableau de bord RH"
      subtitle="Suivez les collaborateurs, gérez les dossiers RH et accédez aux outils de gestion humaine."
    >
      <DashboardEmptyState
        icon={Users}
        title="Votre espace RH arrive bientôt"
        description="Les outils dédiés au suivi des collaborateurs et à la gestion des dossiers RH sont en cours de préparation. En attendant, ces raccourcis restent accessibles."
      />
      <DashboardGrid>
        <DashboardActionCard
          to="/profile"
          icon={UserCircle}
          title="Mon profil"
          description="Complétez vos informations et vos préférences."
        />
        <DashboardActionCard
          to="/ats"
          icon={Briefcase}
          title="Recrutement"
          description="Accédez à l'espace de recrutement de la plateforme."
        />
        <DashboardActionCard
          to="/tests"
          icon={Compass}
          title="Tests d'orientation"
          description="Explorez les outils de connaissance de soi proposés."
        />
      </DashboardGrid>
    </RoleDashboardScaffold>
  );
}
