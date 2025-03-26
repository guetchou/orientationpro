
import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { NoDiplomaCareerResults } from "@/types/test";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, Share2, BookOpen } from "lucide-react";

interface CareerAnalysisChartProps {
  results: NoDiplomaCareerResults;
}

export const CareerAnalysisChart = ({ results }: CareerAnalysisChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const data = [
      {
        subject: "Compétences pratiques",
        value: results.practicalSkills,
        fullMark: 100,
      },
      {
        subject: "Créativité",
        value: results.creativity,
        fullMark: 100,
      },
      {
        subject: "Esprit entrepreneurial",
        value: results.entrepreneurialSpirit,
        fullMark: 100,
      },
      {
        subject: "Résilience",
        value: results.resilience,
        fullMark: 100,
      },
      {
        subject: "Intelligence sociale",
        value: results.socialIntelligence,
        fullMark: 100,
      },
      {
        subject: "Auto-apprentissage",
        value: results.selfLearningCapacity,
        fullMark: 100,
      },
    ];
    
    setChartData(data);
  }, [results]);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 dark:from-teal-900/30 dark:to-emerald-900/30">
        <CardTitle className="text-xl text-teal-800 dark:text-teal-300 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Analyse de votre profil professionnel
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar
                name="Profil"
                dataKey="value"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.5}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <Separator className="my-4" />
        
        <div className="mt-4">
          <h3 className="font-medium text-lg mb-2">Domaines recommandés</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {results.recommendedFields?.map((field, index) => (
              <Badge key={index} variant="outline" className="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300">
                {field}
              </Badge>
            ))}
          </div>
          
          <h3 className="font-medium text-lg mb-2">Parcours recommandés</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {results.recommendedPaths?.map((path, index) => (
              <Badge key={index} variant="secondary" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                {path}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 mt-6">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Partager
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
