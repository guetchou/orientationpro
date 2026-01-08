
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CandidateStatsCardsProps {
  stats: {
    total: number;
    byStatus: Record<string, number>;
    newThisWeek: number;
    conversionRate: number;
  };
  loading: boolean;
}

export const CandidateStatsCards: React.FC<CandidateStatsCardsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((key) => (
          <Card key={key} className="animate-pulse">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-300 ease-in-out">
      <Card className="transform hover:scale-105 transition-transform duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Total Candidats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold animate-fade-in">{stats.total}</div>
        </CardContent>
      </Card>
      
      <Card className="transform hover:scale-105 transition-transform duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Nouveaux cette semaine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold animate-fade-in">{stats.newThisWeek}</div>
        </CardContent>
      </Card>
      
      <Card className="transform hover:scale-105 transition-transform duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            En cours d'entretien
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold animate-fade-in">{stats.byStatus?.interview || 0}</div>
        </CardContent>
      </Card>
      
      <Card className="transform hover:scale-105 transition-transform duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">
            Taux de conversion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold animate-fade-in">{stats.conversionRate}%</div>
        </CardContent>
      </Card>
    </div>
  );
};
