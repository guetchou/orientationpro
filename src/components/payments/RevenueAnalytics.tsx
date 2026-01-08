import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Eye,
  Smartphone
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart as RechartsPieChart, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { PaymentService } from '@/services/payments/PaymentService';
import { MonetizationService, RevenueStream } from '@/services/payments/MonetizationService';

interface RevenueAnalyticsProps {
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  className?: string;
}

interface RevenueStats {
  total_revenue: number;
  transactions_count: number;
  average_transaction: number;
  payment_methods_breakdown: Record<string, number>;
  plans_breakdown: Record<string, number>;
  currency: string;
  growth_rate?: number;
  conversion_rate?: number;
}

interface ChartData {
  name: string;
  value: number;
  change?: number;
  fill?: string;
}

export const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = ({
  timeRange = 'month',
  className = ''
}) => {
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [paymentService] = useState(() => new PaymentService());
  const [monetizationService] = useState(() => new MonetizationService());

  // Données simulées pour demo (à remplacer par vraies données API)
  const mockRevenueData = [
    { name: 'Jan', revenue: 2400000, transactions: 45, users: 120 },
    { name: 'Fév', revenue: 3200000, transactions: 62, users: 180 },
    { name: 'Mar', revenue: 4100000, transactions: 78, users: 250 },
    { name: 'Avr', revenue: 3800000, transactions: 71, users: 320 },
    { name: 'Mai', revenue: 5200000, transactions: 95, users: 420 },
    { name: 'Jun', revenue: 6800000, transactions: 120, users: 580 },
    { name: 'Jul', revenue: 7500000, transactions: 142, users: 750 },
    { name: 'Août', revenue: 8200000, transactions: 158, users: 920 },
    { name: 'Sep', revenue: 9100000, transactions: 175, users: 1100 },
    { name: 'Oct', revenue: 10500000, transactions: 198, users: 1350 },
    { name: 'Nov', revenue: 12200000, transactions: 225, users: 1650 },
    { name: 'Déc', revenue: 15000000, transactions: 275, users: 2000 }
  ];

  const mockPaymentMethodsData: ChartData[] = [
    { name: 'MTN MoMo', value: 45, fill: '#FFD700' },
    { name: 'Airtel Money', value: 28, fill: '#FF6B35' },
    { name: 'Cartes bancaires', value: 18, fill: '#4ECDC4' },
    { name: 'Express Union', value: 9, fill: '#45B7D1' }
  ];

  const mockPlansData: ChartData[] = [
    { name: 'Premium Mensuel', value: 8200000, change: 15.4, fill: '#8884d8' },
    { name: 'Premium Annuel', value: 4500000, change: 22.1, fill: '#82ca9d' },
    { name: 'Pro', value: 2100000, change: 8.7, fill: '#ffc658' },
    { name: 'Entreprise', value: 800000, change: 45.2, fill: '#ff7300' }
  ];

  useEffect(() => {
    loadRevenueData();
    const streams = monetizationService.getRevenueStreams();
    setRevenueStreams(streams);
  }, [selectedTimeRange, monetizationService]);

  const loadRevenueData = async () => {
    setIsLoading(true);
    
    try {
      // Simuler un appel API
      setTimeout(() => {
        const mockStats: RevenueStats = {
          total_revenue: 15600000,
          transactions_count: 275,
          average_transaction: 56727,
          payment_methods_breakdown: {
            'mtn_momo': 7020000,
            'airtel_money': 4368000,
            'visa_card': 2808000,
            'express_union': 1404000
          },
          plans_breakdown: {
            'premium_monthly': 8200000,
            'premium_yearly': 4500000,
            'pro': 2100000,
            'enterprise': 800000
          },
          currency: 'XAF',
          growth_rate: 18.5,
          conversion_rate: 12.3
        };
        
        setRevenueStats(mockStats);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur chargement données revenus:', error);
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' XAF';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getGrowthIcon = (change: number) => {
    return change >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics des Revenus</h2>
          <p className="text-gray-600">Suivi des performances financières en temps réel</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadRevenueData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(revenueStats?.total_revenue || 0)}
                  </p>
                  {revenueStats?.growth_rate && (
                    <div className="flex items-center gap-1 mt-1">
                      {getGrowthIcon(revenueStats.growth_rate)}
                      <span className={`text-sm font-medium ${getGrowthColor(revenueStats.growth_rate)}`}>
                        {revenueStats.growth_rate > 0 ? '+' : ''}{revenueStats.growth_rate.toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-500">vs mois dernier</span>
                    </div>
                  )}
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {revenueStats?.transactions_count || 0}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">+12.5%</span>
                    <span className="text-xs text-gray-500">vs mois dernier</span>
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ticket moyen</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(revenueStats?.average_transaction || 0)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">+5.2%</span>
                    <span className="text-xs text-gray-500">vs mois dernier</span>
                  </div>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux conversion</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {revenueStats?.conversion_rate?.toFixed(1) || 0}%
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">+2.1%</span>
                    <span className="text-xs text-gray-500">vs mois dernier</span>
                  </div>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Évolution des revenus */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution des revenus
            </CardTitle>
            <CardDescription>
              Revenus mensuels et croissance sur les 12 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatNumber} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), 'Revenus']}
                  labelStyle={{ color: '#374151' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par méthode de paiement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Méthodes de paiement
            </CardTitle>
            <CardDescription>
              Répartition par mode de paiement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Pie
                  data={mockPaymentMethodsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockPaymentMethodsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </RechartsPieChart>
            </ResponsiveContainer>
            
            <div className="space-y-2 mt-4">
              {mockPaymentMethodsData.map((method) => (
                <div key={method.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: method.fill }}
                    />
                    <span>{method.name}</span>
                  </div>
                  <span className="font-medium">{method.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyse détaillée */}
      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Plans tarifaires</TabsTrigger>
          <TabsTrigger value="streams">Flux de revenus</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance par plan</CardTitle>
              <CardDescription>
                Analyse détaillée des revenus par plan tarifaire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPlansData.map((plan) => (
                  <div key={plan.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{plan.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {formatCurrency(plan.value)}
                        </span>
                        <Badge variant={plan.change! >= 0 ? "default" : "destructive"}>
                          {plan.change! >= 0 ? '+' : ''}{plan.change!.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={(plan.value / Math.max(...mockPlansData.map(p => p.value))) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streams" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {revenueStreams.slice(0, 6).map((stream) => (
              <Card key={stream.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">{stream.name}</h3>
                      <Badge variant="outline">{stream.type}</Badge>
                    </div>
                    <p className="text-xs text-gray-600">{stream.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Projection</span>
                      <span className="font-medium">
                        {formatCurrency(stream.projected_monthly_revenue)}
                      </span>
                    </div>
                    <Progress 
                      value={(stream.current_monthly_revenue / stream.projected_monthly_revenue) * 100}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Conversion: {stream.conversion_rate}%</span>
                      <span>
                        {((stream.current_monthly_revenue / stream.projected_monthly_revenue) * 100).toFixed(1)}% atteint
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projections financières</CardTitle>
              <CardDescription>
                Prévisions de croissance sur les 12 prochains mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockRevenueData.map((item, index) => ({
                  ...item,
                  projected: item.revenue * (1 + (index * 0.1))
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={formatNumber} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="Revenus actuels"
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Projections"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
