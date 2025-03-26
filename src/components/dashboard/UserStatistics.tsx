
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, FileBarChart, GraduationCap } from "lucide-react";
import { ConseillerStats } from "@/types/dashboard";

interface UserStatisticsProps {
  stats: ConseillerStats;
}

export const UserStatistics = ({ stats }: UserStatisticsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tests complétés</p>
              <p className="text-3xl font-bold">{stats.tests_completed}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FileBarChart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link to="/dashboard/results">
                Voir les résultats →
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Rendez-vous</p>
              <p className="text-3xl font-bold">{stats.appointments_scheduled}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link to="/conseillers">
                Prendre rendez-vous →
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Orientation</p>
              <p className="text-3xl font-bold">{stats.average_progress}%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-gray-200 h-2 rounded-full">
              <div 
                className="bg-primary h-full rounded-full"
                style={{ width: `${stats.average_progress}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
