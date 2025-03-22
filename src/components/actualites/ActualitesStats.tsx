
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, FileText, Share2, Users } from 'lucide-react';

interface ActualitesStatsProps {
  categoriesCount: Record<string, number>;
  totalArticles: number;
}

export const ActualitesStats = ({ categoriesCount, totalArticles }: ActualitesStatsProps) => {
  // Transform categories data for the chart
  const chartData = Object.entries(categoriesCount).map(([name, value]) => ({
    name,
    value,
  }));

  // Metrics to display
  const metrics = [
    {
      title: "Articles Publiés",
      value: totalArticles,
      icon: FileText,
      description: "Total d'articles disponibles",
      trend: "+12% ce mois",
    },
    {
      title: "Catégories",
      value: Object.keys(categoriesCount).length,
      icon: TrendingUp,
      description: "Différentes rubriques",
      trend: "+2 nouvelles",
    },
    {
      title: "Partages",
      value: Math.floor(totalArticles * 3.5),
      icon: Share2,
      description: "Sur les réseaux sociaux",
      trend: "+28% ce mois",
    },
    {
      title: "Lecteurs",
      value: Math.floor(totalArticles * 32),
      icon: Users,
      description: "Lecteurs uniques",
      trend: "+18% ce mois",
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-xl font-bold mb-4">Statistiques des Actualités</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-white/90 backdrop-blur">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              <div className="text-xs font-medium text-green-500 mt-2">{metric.trend}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {chartData.length > 0 && (
        <Card className="bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle>Répartition par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  articles: {
                    theme: {
                      light: "#3b82f6",
                      dark: "#3b82f6",
                    },
                  },
                }}
              >
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-articles)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
