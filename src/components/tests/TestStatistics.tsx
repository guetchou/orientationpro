
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface TestStatisticsProps {
  testType: string;
  completionCount: number;
  averageScore?: number;
  distributionData?: Array<{name: string, value: number}>; 
  categoryData?: Array<{name: string, value: number}>;
}

const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

const TestStatistics = ({ 
  testType, 
  completionCount, 
  averageScore, 
  distributionData,
  categoryData 
}: TestStatisticsProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Statistiques du test {testType}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-950/40 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">Nombre de tests complétés</p>
            <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-400">{completionCount}</h3>
          </div>
          
          {averageScore && (
            <div className="bg-green-50 dark:bg-green-950/40 rounded-lg p-4">
              <p className="text-sm text-green-700 dark:text-green-300">Score moyen</p>
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-400">{averageScore}%</h3>
            </div>
          )}
        </div>
        
        {distributionData && (
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">Distribution des scores</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      color: '#333'
                    }} 
                  />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {categoryData && (
          <div>
            <h4 className="text-sm font-medium mb-3">Répartition par catégorie</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Pourcentage']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      color: '#333'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestStatistics;
