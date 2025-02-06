import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentTests } from "@/components/dashboard/RecentTests";
import { Goals } from "@/components/dashboard/Goals";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de Bord</h1>
      </div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentTests />
        <Goals />
      </div>
    </div>
  );
};

export default Dashboard;