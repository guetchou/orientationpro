
import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import { NoDiplomaCareerResults } from "@/types/test";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, Share2, BookOpen, ArrowRight, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface CareerAnalysisChartProps {
  results: NoDiplomaCareerResults;
}

export const CareerAnalysisChart = ({ results }: CareerAnalysisChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'chart' | 'fields'>('chart');

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

  const handleExport = () => {
    toast.success("Rapport exporté avec succès");
    // Logic for exporting the report would go here
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié dans le presse-papier");
  };

  const formatTooltipValue = (value: number) => {
    if (value >= 80) return `${value} - Excellent`;
    if (value >= 60) return `${value} - Bon`;
    if (value >= 40) return `${value} - Moyen`;
    return `${value} - À améliorer`;
  };

  const getStrengthLevel = (value: number) => {
    if (value >= 80) return "Force majeure";
    if (value >= 60) return "Point fort";
    if (value >= 40) return "Compétence moyenne";
    return "Point à développer";
  };

  const getBadgeColor = (value: number) => {
    if (value >= 80) return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300";
    if (value >= 60) return "bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300";
    if (value >= 40) return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300";
    return "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300";
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 dark:from-teal-900/30 dark:to-emerald-900/30">
        <CardTitle className="text-xl text-teal-800 dark:text-teal-300 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Analyse de votre profil professionnel
        </CardTitle>
        <CardDescription>
          Basé sur l'analyse de vos réponses et notre algorithme d'orientation
        </CardDescription>
        
        <div className="flex mt-2 bg-white/60 dark:bg-gray-800/60 rounded-lg p-1">
          <Button 
            variant={activeTab === 'chart' ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab('chart')}
            className="flex-1"
          >
            Graphique
          </Button>
          <Button 
            variant={activeTab === 'fields' ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab('fields')}
            className="flex-1"
          >
            Domaines recommandés
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {activeTab === 'chart' ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius="80%" data={chartData}>
                <PolarGrid strokeDasharray="3 3" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'var(--foreground)', fontSize: 12 }} 
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Profil"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.5}
                />
                <Tooltip 
                  formatter={(value: number) => [formatTooltipValue(value), 'Score']}
                  contentStyle={{ 
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.5rem',
                  }} 
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="mt-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-4 rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20"
            >
              <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-teal-600" />
                Vos domaines les plus prometteurs
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {results.recommendedFields?.map((field, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Badge variant="outline" className="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 px-3 py-1 text-sm">
                      {field}
                    </Badge>
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ces domaines correspondent le mieux à votre profil d'après l'analyse de vos compétences et aptitudes.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
            >
              <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Parcours recommandés
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {results.recommendedPaths?.map((path, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 text-sm">
                      {path}
                    </Badge>
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Voici les voies de formation et d'apprentissage qui pourraient vous convenir le mieux.
              </p>
            </motion.div>
            
            <div className="space-y-3 mt-4">
              <h3 className="font-medium text-lg mb-2">Vos compétences clés</h3>
              {chartData.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{item.subject}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full bg-teal-500" 
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                    <Badge variant="outline" className={getBadgeColor(item.value)}>
                      {getStrengthLevel(item.value)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Separator className="my-4" />
        
        <div className="flex gap-2 mt-4 justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              Partager
            </Button>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700"
          >
            Explorer les formations
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
