import React from 'react';
import { CalendarClock, UserCircle, CalendarPlus, Compass } from 'lucide-react';
import {
  RoleDashboardScaffold,
  DashboardGrid,
  DashboardActionCard,
  DashboardEmptyState,
} from '@/components/dashboards/RoleDashboardScaffold';

export default function CoachDashboard() {
  return (
    <RoleDashboardScaffold
      roleLabel="Coach"
      title="Tableau de bord Coach"
      subtitle="Suivez vos coachés, planifiez des sessions et accédez à vos outils d'accompagnement."
    >
      <DashboardEmptyState
        icon={CalendarClock}
        title="Votre espace Coach arrive bientôt"
        description="Les outils dédiés au suivi des coachés et à la planification des sessions sont en cours de préparation. En attendant, ces raccourcis restent accessibles."
      />
      <DashboardGrid>
        <DashboardActionCard
          to="/profile"
          icon={UserCircle}
          title="Mon profil"
          description="Complétez vos informations et vos préférences."
        />
        <DashboardActionCard
          to="/book-appointment"
          icon={CalendarPlus}
          title="Prendre rendez-vous"
          description="Planifiez un rendez-vous d'accompagnement."
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
