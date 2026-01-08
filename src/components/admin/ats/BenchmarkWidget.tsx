import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  BarChart3,
  Percent,
} from 'lucide-react';
import {
  BenchmarkingService,
  BenchmarkData,
  BenchmarkStats,
  CandidateProfile,
} from '@/services/ats/BenchmarkingService';

interface BenchmarkWidgetProps {
  candidate: CandidateProfile;
  allCandidates: CandidateProfile[];
}

/**
 * Widget de benchmarking
 * Compare le candidat avec les autres candidats
 */
export const BenchmarkWidget: React.FC<BenchmarkWidgetProps> = ({
  candidate,
  allCandidates,
}) => {
  const benchmarkingService = new BenchmarkingService();
  const [benchmark, setBenchmark] = React.useState<BenchmarkData | null>(null);
  const [stats, setStats] = React.useState<BenchmarkStats | null>(null);

  React.useEffect(() => {
    if (allCandidates.length > 0) {
      const benchmarkData = benchmarkingService.calculateBenchmark(candidate, allCandidates);
      const benchmarkStats = benchmarkingService.calculateBenchmarkStats(allCandidates);
      setBenchmark(benchmarkData);
      setStats(benchmarkStats);
    }
  }, [candidate, allCandidates]);

  if (!benchmark || !stats) {
    return null;
  }

  const getComparisonGroupColor = (group: string) => {
    switch (group) {
      case 'top_10':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'top_25':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'average':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  const getComparisonGroupLabel = (group: string) => {
    switch (group) {
      case 'top_10':
        return 'Top 10%';
      case 'top_25':
        return 'Top 25%';
      case 'average':
        return 'Moyenne';
      default:
        return 'Sous la moyenne';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Benchmarking
          </CardTitle>
          <CardDescription>Position par rapport aux autres candidats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Position globale */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Position</div>
              <div className="text-2xl font-bold">
                #{benchmark.rank} / {stats.totalCandidates}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Percentile</div>
              <div className="text-2xl font-bold text-primary">
                {benchmark.percentile}%
              </div>
            </div>
          </div>

          {/* Groupe de comparaison */}
          <div>
            <div className="text-sm font-medium mb-2">Groupe de comparaison</div>
            <Badge className={`${getComparisonGroupColor(benchmark.comparisonGroup)} px-3 py-1`}>
              <Award className="h-4 w-4 mr-1" />
              {getComparisonGroupLabel(benchmark.comparisonGroup)}
            </Badge>
          </div>

          {/* Score vs moyenne */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Score candidat</span>
              <span className="font-bold">{benchmark.score}/100</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Moyenne</span>
              <span className="text-muted-foreground">{stats.averageScore.toFixed(1)}/100</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Médiane</span>
              <span className="text-muted-foreground">{stats.medianScore.toFixed(1)}/100</span>
            </div>
            <Progress
              value={benchmark.score}
              className="h-2 mt-2"
            />
          </div>

          {/* Distribution */}
          <div className="pt-4 border-t space-y-2">
            <div className="text-sm font-medium mb-3">Distribution des percentiles</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-muted-foreground">P10</div>
                <div className="font-semibold">{stats.percentiles.p10}</div>
              </div>
              <div>
                <div className="text-muted-foreground">P50 (Médiane)</div>
                <div className="font-semibold">{stats.percentiles.p50}</div>
              </div>
              <div>
                <div className="text-muted-foreground">P90</div>
                <div className="font-semibold">{stats.percentiles.p90}</div>
              </div>
            </div>
          </div>

          {/* Indicateur de performance */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Performance</span>
              {benchmark.score >= stats.averageScore ? (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-semibold">
                    +{(benchmark.score - stats.averageScore).toFixed(1)} points
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-orange-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-semibold">
                    {(benchmark.score - stats.averageScore).toFixed(1)} points
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

