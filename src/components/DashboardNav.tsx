import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ClipboardList, LogOut } from "lucide-react";

export const DashboardNav = () => {
  return (
    <nav className="flex flex-col gap-2 p-4">
      <Link to="/dashboard">
        <Button variant="ghost" className="w-full justify-start">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Tableau de bord
        </Button>
      </Link>
      <Link to="/dashboard/results">
        <Button variant="ghost" className="w-full justify-start">
          <ClipboardList className="mr-2 h-4 w-4" />
          Mes résultats
        </Button>
      </Link>
      <Link to="/login">
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </Link>
    </nav>
  );
};