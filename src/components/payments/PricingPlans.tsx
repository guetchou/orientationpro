import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  Building2, 
  Sparkles,
  Users,
  TrendingUp,
  Shield,
  Heart,
  Target,
  Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentService, PaymentPlan } from '@/services/payments/PaymentService';
import { MonetizationService } from '@/services/payments/MonetizationService';
import { useMobile } from '@/hooks/useMobile';

interface PricingPlansProps {
  currentPlan?: string;
  onPlanSelect: (planId: string) => void;
  userSegment?: string;
  showAnnualDiscount?: boolean;
  className?: string;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({
  currentPlan,
  onPlanSelect,
  userSegment = 'young_professionals',
  showAnnualDiscount = true,
  className = ''
}) => {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [isAnnual, setIsAnnual] = useState(false);
  const [paymentService] = useState(() => new PaymentService());
  const [monetizationService] = useState(() => new MonetizationService());
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { isMobile } = useMobile();

  useEffect(() => {
    const availablePlans = paymentService.getAvailablePlans();
    setPlans(availablePlans);
  }, [paymentService]);

  const getPlanIcon = (type: string) => {
    switch (type) {
      case 'freemium':
        return <Heart className="h-6 w-6 text-blue-500" />;
      case 'premium':
        return <Star className="h-6 w-6 text-yellow-500" />;
      case 'pro':
        return <Crown className="h-6 w-6 text-purple-500" />;
      case 'enterprise':
        return <Building2 className="h-6 w-6 text-gray-700" />;
      default:
        return <Zap className="h-6 w-6 text-blue-500" />;
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    if (amount === 0) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR').format(amount) + ' ' + currency;
  };

  const getDiscountedPrice = (plan: PaymentPlan) => {
    if (plan.price.billing_cycle === 'yearly') {
      const monthlyPrice = plan.price.amount / 12;
      const yearlyDiscount = 0.17; // 17% de réduction (2 mois gratuits)
      return Math.floor(monthlyPrice * (1 - yearlyDiscount));
    }
    return plan.price.amount;
  };

  const getSavings = (plan: PaymentPlan) => {
    if (plan.price.billing_cycle === 'yearly') {
      const monthlyEquivalent = plan.price.amount / 12;
      const monthlyPlan = plans.find(p => p.type === plan.type && p.price.billing_cycle === 'monthly');
      if (monthlyPlan) {
        const annualCost = monthlyPlan.price.amount * 12;
        const savings = annualCost - plan.price.amount;
        return Math.floor(savings);
      }
    }
    return 0;
  };

  const getRecommendedBadge = (plan: PaymentPlan) => {
    if (plan.popular) {
      return (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <Star className="h-3 w-3 mr-1" />
          Le plus populaire
        </Badge>
      );
    }
    
    if (plan.type === 'premium' && userSegment === 'university_students') {
      return (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <Target className="h-3 w-3 mr-1" />
          Recommandé pour vous
        </Badge>
      );
    }
    
    return null;
  };

  const getValueProposition = (plan: PaymentPlan) => {
    const propositions = {
      freemium: "Parfait pour découvrir votre potentiel",
      premium: "L'investissement qui change votre carrière",
      pro: "Pour les professionnels ambitieux",
      enterprise: "Solutions sur mesure pour organisations"
    };
    return propositions[plan.type] || plan.description;
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    onPlanSelect(planId);
  };

  const filteredPlans = plans.filter(plan => {
    if (!showAnnualDiscount) return plan.price.billing_cycle !== 'yearly';
    if (isAnnual) return plan.price.billing_cycle === 'yearly' || plan.price.billing_cycle === 'one_time';
    return plan.price.billing_cycle === 'monthly' || plan.price.billing_cycle === 'one_time';
  });

  return (
    <div className={`space-y-8 ${className}`}>
      {/* En-tête avec toggle annuel */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">
            Choisissez votre plan d'accompagnement
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Des solutions adaptées à votre parcours professionnel et à votre budget.
            Investissez dans votre avenir dès aujourd'hui.
          </p>
        </div>

        {showAnnualDiscount && (
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isAnnual ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
              Mensuel
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-green-500"
            />
            <span className={`text-sm ${isAnnual ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
              Annuel
            </span>
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <TrendingUp className="h-3 w-3 mr-1" />
              2 mois offerts
            </Badge>
          </div>
        )}
      </div>

      {/* Grille des plans */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'} max-w-7xl mx-auto`}>
        <AnimatePresence mode="wait">
          {filteredPlans.map((plan, index) => {
            const isCurrentPlan = currentPlan === plan.id;
            const isSelected = selectedPlan === plan.id;
            const savings = getSavings(plan);
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {getRecommendedBadge(plan)}
                
                <Card className={`
                  relative overflow-hidden transition-all duration-300 hover:shadow-xl
                  ${isCurrentPlan ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                  ${isSelected ? 'ring-2 ring-purple-500 transform scale-105' : ''}
                  ${plan.popular ? 'ring-2 ring-yellow-400' : ''}
                `}>
                  <CardHeader className="text-center pb-2">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      {getPlanIcon(plan.type)}
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                          {formatPrice(getDiscountedPrice(plan), plan.price.currency)}
                        </span>
                        {plan.price.billing_cycle !== 'one_time' && (
                          <span className="text-gray-500">
                            /{plan.price.billing_cycle === 'yearly' ? 'mois' : 'mois'}
                          </span>
                        )}
                      </div>
                      
                      {savings > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500 line-through">
                            {formatPrice(plan.price.amount / 12, plan.price.currency)}/mois
                          </p>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Économisez {formatPrice(savings, plan.price.currency)}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardDescription className="text-sm mt-2">
                      {getValueProposition(plan)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Fonctionnalités */}
                    <div className="space-y-2">
                      {plan.features.slice(0, 6).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {feature.included ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                              {feature.feature_name}
                              {feature.limit && (
                                <span className="text-gray-500 ml-1">
                                  ({feature.limit}{feature.feature_name.includes('sessions') ? '/mois' : ''})
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                      
                      {plan.features.length > 6 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{plan.features.length - 6} autres fonctionnalités
                        </p>
                      )}
                    </div>

                    {/* Audience cible */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Idéal pour :</p>
                      <div className="flex flex-wrap gap-1">
                        {plan.target_audience.map((audience, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {audience}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Bouton d'action */}
                    <Button
                      onClick={() => handlePlanSelect(plan.id)}
                      className={`w-full transition-all duration-300 ${
                        isCurrentPlan 
                          ? 'bg-gray-600 hover:bg-gray-700' 
                          : plan.popular
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white'
                          : plan.type === 'pro'
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                          : ''
                      }`}
                      variant={isCurrentPlan ? 'secondary' : 'default'}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Plan actuel
                        </>
                      ) : (
                        <>
                          {plan.type === 'freemium' ? (
                            <>
                              <Heart className="h-4 w-4 mr-2" />
                              Commencer gratuitement
                            </>
                          ) : plan.type === 'enterprise' ? (
                            <>
                              <Building2 className="h-4 w-4 mr-2" />
                              Nous contacter
                            </>
                          ) : (
                            <>
                              <Rocket className="h-4 w-4 mr-2" />
                              Choisir ce plan
                            </>
                          )}
                        </>
                      )}
                    </Button>

                    {/* Garantie satisfaction */}
                    {plan.type !== 'freemium' && plan.type !== 'enterprise' && (
                      <p className="text-xs text-center text-gray-500">
                        <Shield className="h-3 w-3 inline mr-1" />
                        Garantie satisfait ou remboursé 30 jours
                      </p>
                    )}
                  </CardContent>

                  {/* Effet visuel pour plan populaire */}
                  {plan.popular && (
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 pointer-events-none" />
                  )}
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* FAQ rapide ou informations supplémentaires */}
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">2,500+ étudiants</h3>
                <p className="text-sm text-gray-600">accompagnés avec succès</p>
              </div>
              
              <div className="space-y-2">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">95% de réussite</h3>
                <p className="text-sm text-gray-600">dans l'optimisation CV</p>
              </div>
              
              <div className="space-y-2">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">IA spécialisée</h3>
                <p className="text-sm text-gray-600">pour le marché congolais</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support et contact */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Besoin d'aide pour choisir ? Contactez notre équipe au{' '}
          <a href="tel:+24206123456" className="text-blue-600 hover:underline font-medium">
            +242 06 123 45 67
          </a>
        </p>
        <p className="text-xs text-gray-500">
          Paiements sécurisés • MTN MoMo • Airtel Money • Cartes bancaires
        </p>
      </div>
    </div>
  );
};
