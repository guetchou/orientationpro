
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface CandidateChartsProps {
  statusChartData: Array<{ name: string; value: number }>;
  positionChartData: Array<{ name: string; value: number }>;
  loading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const CandidateCharts: React.FC<CandidateChartsProps> = ({
  statusChartData,
  positionChartData,
  loading
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-96">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full rounded-lg" />
          </CardContent>
        </Card>
        
        <Card className="h-96">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="h-96 transition-all duration-300 ease-in-out hover:shadow-lg dark:hover:shadow-primary/10">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Candidats par statut</CardTitle>
        </CardHeader>
        <CardContent className="transition-opacity duration-300 ease-in-out opacity-100">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                animationBegin={200}
                animationDuration={1500}
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="h-96 transition-all duration-300 ease-in-out hover:shadow-lg dark:hover:shadow-primary/10">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top postes demandés</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart 
              data={positionChartData}
              animationBegin={300}
              animationDuration={1500}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
