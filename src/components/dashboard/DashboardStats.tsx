
import { ConseillerStats } from "@/types/dashboard";

interface DashboardStatsProps {
  stats: ConseillerStats;
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Étudiants Total</h3>
        <p className="text-3xl font-bold">{stats.total_students}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Tests Complétés</h3>
        <p className="text-3xl font-bold">{stats.tests_completed}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold">RDV Programmés</h3>
        <p className="text-3xl font-bold">{stats.appointments_scheduled}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Progression Moyenne</h3>
        <p className="text-3xl font-bold">{stats.average_progress}%</p>
      </div>
    </div>
  );
};
