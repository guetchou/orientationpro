import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Target, 
  Calendar,
  Award,
  PieChart,
  BarChart3,
  Filter
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie } from 'recharts';

interface AnalyticsDashboardProps {
  timeRange: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  timeRange,
  onTimeRangeChange
}) => {
  const [selectedMetric, setSelectedMetric] = useState('candidates');

  // Données simulées pour l'exemple
  const kpiData = {
    totalCandidates: { value: 342, change: +12.5, trend: 'up' },
    activePositions: { value: 15, change: +3, trend: 'up' },
    averageTimeToHire: { value: 18, change: -2, trend: 'down' },
    conversionRate: { value: 24.5, change: +4.2, trend: 'up' },
    costPerHire: { value: 2840, change: -180, trend: 'down' },
    candidateSatisfaction: { value: 4.2, change: +0.3, trend: 'up' }
  };

  const timeSeriesData = [
    { date: '01/01', candidates: 25, interviews: 12, offers: 5, hires: 3 },
    { date: '01/02', candidates: 32, interviews: 15, offers: 7, hires: 4 },
    { date: '01/03', candidates: 28, interviews: 18, offers: 6, hires: 5 },
    { date: '01/04', candidates: 45, interviews: 22, offers: 9, hires: 6 },
    { date: '01/05', candidates: 38, interviews: 20, offers: 8, hires: 7 },
    { date: '01/06', candidates: 52, interviews: 25, offers: 12, hires: 8 },
    { date: '01/07', candidates: 41, interviews: 28, offers: 10, hires: 9 }
  ];

  const pipelineData = [
    { name: 'Nouveaux', value: 45, color: '#3B82F6' },
    { name: 'Présélection', value: 28, color: '#EAB308' },
    { name: 'Entretien', value: 18, color: '#8B5CF6' },
    { name: 'Offre', value: 12, color: '#10B981' },
    { name: 'Rejetés', value: 15, color: '#EF4444' }
  ];

  const sourceData = [
    { source: 'LinkedIn', candidates: 120, cost: 2400, conversion: 18 },
    { source: 'Indeed', candidates: 85, cost: 1700, conversion: 22 },
    { source: 'Recommandations', candidates: 65, cost: 0, conversion: 35 },
    { source: 'Site web', candidates: 45, cost: 900, conversion: 15 },
    { source: 'Autres', candidates: 27, cost: 540, conversion: 12 }
  ];

  const formatKpiValue = (key: string, value: number) => {
    switch (key) {
      case 'averageTimeToHire':
        return `${value} jours`;
      case 'conversionRate':
        return `${value}%`;
      case 'costPerHire':
        return `${value}€`;
      case 'candidateSatisfaction':
        return `${value}/5`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tableau de Bord Analytique</h2>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            Temps réel
          </Badge>
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Object.entries(kpiData).map(([key, data], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {key === 'totalCandidates' && <Users className="h-4 w-4 text-primary" />}
                    {key === 'activePositions' && <Target className="h-4 w-4 text-primary" />}
                    {key === 'averageTimeToHire' && <Clock className="h-4 w-4 text-primary" />}
                    {key === 'conversionRate' && <TrendingUp className="h-4 w-4 text-primary" />}
                    {key === 'costPerHire' && <BarChart3 className="h-4 w-4 text-primary" />}
                    {key === 'candidateSatisfaction' && <Award className="h-4 w-4 text-primary" />}
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${data.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {data.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(data.change)}
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {formatKpiValue(key, data.value)}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendances temporelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Évolution temporelle
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={selectedMetric === 'candidates' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('candidates')}
              >
                Candidats
              </Button>
              <Button
                variant={selectedMetric === 'interviews' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('interviews')}
              >
                Entretiens
              </Button>
              <Button
                variant={selectedMetric === 'hires' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('hires')}
              >
                Embauches
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition du pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Pipeline des candidats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={pipelineData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sources de recrutement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Performance par source de recrutement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sourceData.map((source, index) => (
              <motion.div
                key={source.source}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{source.source}</h4>
                    <Badge variant="secondary">{source.candidates} candidats</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Coût: </span>
                      <span className="font-medium">{source.cost}€</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Conversion: </span>
                      <span className="font-medium">{source.conversion}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">ROI: </span>
                      <span className="font-medium text-green-600">
                        {source.cost > 0 ? Math.round((source.candidates * source.conversion * 50000) / source.cost) : '∞'}x
                      </span>
                    </div>
                  </div>
                  <Progress value={source.conversion} className="mt-2" />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
