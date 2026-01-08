import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface ActivityData {
  date: string;
  users: number;
  tests: number;
  appointments: number;
}

interface ActivityChartProps {
  data: ActivityData[];
  period: 'day' | 'week' | 'month';
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data, period }) => {
  const totalUsers = data.reduce((sum, item) => sum + item.users, 0);
  const totalTests = data.reduce((sum, item) => sum + item.tests, 0);
  const totalAppointments = data.reduce((sum, item) => sum + item.appointments, 0);

  const userGrowth = 12.5; // Simulé
  const testGrowth = 8.2; // Simulé
  const appointmentGrowth = -2.1; // Simulé

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Activité {period === 'day' ? 'quotidienne' : period === 'week' ? 'hebdomadaire' : 'mensuelle'}</CardTitle>
            <CardDescription>
              Évolution des métriques clés
            </CardDescription>
          </div>
          <Activity className="h-5 w-5 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Métriques principales */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Utilisateurs</div>
              <div className={`flex items-center justify-center text-xs mt-1 ${userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {userGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(userGrowth)}%
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalTests.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Tests</div>
              <div className={`flex items-center justify-center text-xs mt-1 ${testGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {testGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(testGrowth)}%
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalAppointments.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Rendez-vous</div>
              <div className={`flex items-center justify-center text-xs mt-1 ${appointmentGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {appointmentGrowth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(appointmentGrowth)}%
              </div>
            </div>
          </div>

          {/* Graphique simplifié (placeholder pour Chart.js) */}
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <Activity className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-500">Graphique interactif</p>
              <p className="text-xs text-gray-400">Chart.js ou Recharts</p>
            </div>
          </div>

          {/* Légende */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                Utilisateurs
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                Tests
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded mr-1"></div>
                Rendez-vous
              </div>
            </div>
            <div>
              Période: {period}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 