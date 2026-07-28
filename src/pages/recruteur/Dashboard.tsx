import React from 'react';
import { Briefcase, ClipboardList, Search, FileText } from 'lucide-react';
import {
  RoleDashboardScaffold,
  DashboardGrid,
  DashboardActionCard,
} from '@/components/dashboards/RoleDashboardScaffold';

export default function RecruteurDashboard() {
  return (
    <RoleDashboardScaffold
      roleLabel="Recruteur"
      title="Tableau de bord Recruteur"
      subtitle="Gérez vos offres, suivez les candidatures et accédez aux outils de recrutement."
    >
      <DashboardGrid>
        <DashboardActionCard
          to="/admin/ats"
          icon={Briefcase}
          title="Recrutement (ATS)"
          description="Suivez les candidatures, les scores et le pipeline de recrutement."
        />
        <DashboardActionCard
          to="/recrutement"
          icon={ClipboardList}
          title="Offres & pipeline"
          description="Gérez les offres et l'avancement des candidats."
        />
        <DashboardActionCard
          to="/jobs"
          icon={Search}
          title="Offres publiées"
          description="Consultez les offres d'emploi visibles côté public."
        />
        <DashboardActionCard
          to="/cv-optimizer"
          icon={FileText}
          title="Analyse de CV"
          description="Évaluez et comparez les CV avec le moteur ATS."
        />
      </DashboardGrid>
    </RoleDashboardScaffold>
  );
}
