import { PaymentService, PaymentPlan } from './PaymentService';

export interface RevenueStream {
  id: string;
  name: string;
  type: 'subscription' | 'one_time' | 'commission' | 'advertising' | 'premium_feature';
  description: string;
  target_market: string[];
  pricing_model: {
    base_price?: number;
    commission_rate?: number;
    ad_revenue_share?: number;
    currency: string;
  };
  projected_monthly_revenue: number;
  current_monthly_revenue: number;
  conversion_rate: number;
  customer_segment: string[];
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  characteristics: {
    age_range: [number, number];
    income_level: 'low' | 'medium' | 'high';
    education_level: string[];
    career_stage: string[];
    location: string[];
  };
  size_estimate: number;
  willingness_to_pay: number;
  preferred_payment_methods: string[];
  pricing_sensitivity: 'high' | 'medium' | 'low';
}

export interface PricingStrategy {
  id: string;
  name: string;
  type: 'penetration' | 'premium' | 'freemium' | 'tiered' | 'dynamic';
  description: string;
  target_segments: string[];
  implementation: {
    free_tier?: {
      features: string[];
      limitations: Record<string, number>;
      conversion_goals: string[];
    };
    paid_tiers: {
      tier_name: string;
      price: number;
      currency: string;
      billing_cycle: string;
      value_proposition: string;
      target_conversion_rate: number;
    }[];
  };
  expected_outcomes: {
    market_penetration: number;
    revenue_per_user: number;
    churn_rate: number;
  };
}

export interface BusinessModel {
  id: string;
  name: string;
  description: string;
  primary_revenue_streams: string[];
  target_customer_segments: string[];
  value_propositions: string[];
  key_partnerships: string[];
  cost_structure: {
    fixed_costs: { item: string; monthly_amount: number }[];
    variable_costs: { item: string; per_user_cost: number }[];
  };
  projected_financials: {
    year_1: { revenue: number; costs: number; users: number };
    year_2: { revenue: number; costs: number; users: number };
    year_3: { revenue: number; costs: number; users: number };
  };
}

export class MonetizationService {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  // Segments de clientèle pour le marché congolais
  getCustomerSegments(): CustomerSegment[] {
    return [
      {
        id: 'students_lycee',
        name: 'Lycéens et Bacheliers',
        description: 'Étudiants en fin de secondaire cherchant leur orientation post-bac',
        characteristics: {
          age_range: [16, 19],
          income_level: 'low',
          education_level: ['lycée', 'baccalauréat'],
          career_stage: ['orientation', 'choix_etudes'],
          location: ['Brazzaville', 'Pointe-Noire', 'Dolisie']
        },
        size_estimate: 45000,
        willingness_to_pay: 5000,
        preferred_payment_methods: ['mobile_money', 'family_payment'],
        pricing_sensitivity: 'high'
      },
      {
        id: 'university_students',
        name: 'Étudiants Universitaires',
        description: 'Étudiants en université cherchant à affiner leur parcours',
        characteristics: {
          age_range: [18, 25],
          income_level: 'low',
          education_level: ['université', 'licence', 'master'],
          career_stage: ['études', 'stages', 'premier_emploi'],
          location: ['Brazzaville', 'Pointe-Noire']
        },
        size_estimate: 25000,
        willingness_to_pay: 8000,
        preferred_payment_methods: ['mobile_money', 'express_union'],
        pricing_sensitivity: 'high'
      },
      {
        id: 'young_professionals',
        name: 'Jeunes Professionnels',
        description: 'Professionnels de 25-35 ans en début/milieu de carrière',
        characteristics: {
          age_range: [25, 35],
          income_level: 'medium',
          education_level: ['licence', 'master', 'écoles'],
          career_stage: ['junior', 'confirmé', 'évolution'],
          location: ['Brazzaville', 'Pointe-Noire', 'international']
        },
        size_estimate: 18000,
        willingness_to_pay: 25000,
        preferred_payment_methods: ['bank_card', 'mobile_money', 'bank_transfer'],
        pricing_sensitivity: 'medium'
      },
      {
        id: 'senior_professionals',
        name: 'Cadres et Séniors',
        description: 'Professionnels expérimentés en reconversion ou évolution',
        characteristics: {
          age_range: [35, 55],
          income_level: 'high',
          education_level: ['master', 'mba', 'écoles_ingénieurs'],
          career_stage: ['senior', 'manager', 'reconversion'],
          location: ['Brazzaville', 'Pointe-Noire', 'diaspora']
        },
        size_estimate: 8000,
        willingness_to_pay: 75000,
        preferred_payment_methods: ['bank_card', 'bank_transfer'],
        pricing_sensitivity: 'low'
      },
      {
        id: 'entrepreneurs',
        name: 'Entrepreneurs',
        description: 'Créateurs d\'entreprise et porteurs de projets',
        characteristics: {
          age_range: [25, 45],
          income_level: 'medium',
          education_level: ['licence', 'master', 'autodidacte'],
          career_stage: ['entrepreneur', 'porteur_projet'],
          location: ['Brazzaville', 'Pointe-Noire', 'régions']
        },
        size_estimate: 12000,
        willingness_to_pay: 45000,
        preferred_payment_methods: ['mobile_money', 'bank_card'],
        pricing_sensitivity: 'medium'
      },
      {
        id: 'organizations',
        name: 'Organisations (B2B)',
        description: 'Entreprises, écoles, institutions publiques',
        characteristics: {
          age_range: [0, 0], // N/A pour organisations
          income_level: 'high',
          education_level: ['institutional'],
          career_stage: ['b2b'],
          location: ['national', 'cemac']
        },
        size_estimate: 500,
        willingness_to_pay: 500000,
        preferred_payment_methods: ['bank_transfer', 'invoice'],
        pricing_sensitivity: 'low'
      }
    ];
  }

  // Flux de revenus adaptés au marché africain
  getRevenueStreams(): RevenueStream[] {
    return [
      {
        id: 'freemium_conversion',
        name: 'Conversion Freemium → Premium',
        type: 'subscription',
        description: 'Conversion des utilisateurs gratuits vers les abonnements payants',
        target_market: ['Congo', 'CEMAC'],
        pricing_model: {
          base_price: 15000,
          currency: 'XAF'
        },
        projected_monthly_revenue: 4500000, // 300 conversions × 15,000 XAF
        current_monthly_revenue: 0,
        conversion_rate: 8.5, // %
        customer_segment: ['university_students', 'young_professionals']
      },
      {
        id: 'premium_annual',
        name: 'Abonnements Annuels Premium',
        type: 'subscription',
        description: 'Abonnements annuels avec réduction pour fidéliser',
        target_market: ['Congo', 'CEMAC', 'diaspora'],
        pricing_model: {
          base_price: 150000,
          currency: 'XAF'
        },
        projected_monthly_revenue: 3750000, // 25 × 150,000 XAF
        current_monthly_revenue: 0,
        conversion_rate: 15.2, // % from monthly to annual
        customer_segment: ['young_professionals', 'senior_professionals']
      },
      {
        id: 'counselor_marketplace',
        name: 'Commission Marketplace Conseillers',
        type: 'commission',
        description: 'Commission sur les sessions de conseil payées',
        target_market: ['Congo', 'CEMAC'],
        pricing_model: {
          commission_rate: 20, // %
          currency: 'XAF'
        },
        projected_monthly_revenue: 2400000, // 20% de 12M XAF de sessions
        current_monthly_revenue: 0,
        conversion_rate: 25.0, // % users who book counselors
        customer_segment: ['all_segments']
      },
      {
        id: 'cv_optimization_service',
        name: 'Service CV Premium à la demande',
        type: 'one_time',
        description: 'Optimisation CV professionnelle par experts',
        target_market: ['Congo', 'CEMAC', 'diaspora'],
        pricing_model: {
          base_price: 25000,
          currency: 'XAF'
        },
        projected_monthly_revenue: 1500000, // 60 × 25,000 XAF
        current_monthly_revenue: 0,
        conversion_rate: 12.0, // % of users who use service
        customer_segment: ['young_professionals', 'senior_professionals']
      },
      {
        id: 'enterprise_licenses',
        name: 'Licences Entreprises et Institutions',
        type: 'subscription',
        description: 'Abonnements B2B pour universités, entreprises, gouvernement',
        target_market: ['Congo', 'CEMAC'],
        pricing_model: {
          base_price: 500000,
          currency: 'XAF'
        },
        projected_monthly_revenue: 5000000, // 10 × 500,000 XAF
        current_monthly_revenue: 0,
        conversion_rate: 35.0, // % of contacted organizations
        customer_segment: ['organizations']
      },
      {
        id: 'certification_programs',
        name: 'Programmes de Certification',
        type: 'one_time',
        description: 'Certifications professionnelles reconnues',
        target_market: ['Congo', 'CEMAC', 'Africa'],
        pricing_model: {
          base_price: 75000,
          currency: 'XAF'
        },
        projected_monthly_revenue: 2250000, // 30 × 75,000 XAF
        current_monthly_revenue: 0,
        conversion_rate: 18.0, // % of premium users
        customer_segment: ['young_professionals', 'senior_professionals', 'entrepreneurs']
      },
      {
        id: 'job_board_premium',
        name: 'Offres d\'Emploi Premium',
        type: 'commission',
        description: 'Placement d\'offres d\'emploi premium et commissions placement',
        target_market: ['Congo', 'CEMAC'],
        pricing_model: {
          base_price: 50000, // par offre
          commission_rate: 10, // % du salaire
          currency: 'XAF'
        },
        projected_monthly_revenue: 1800000,
        current_monthly_revenue: 0,
        conversion_rate: 8.0,
        customer_segment: ['organizations', 'young_professionals']
      },
      {
        id: 'training_partnerships',
        name: 'Partenariats Formation',
        type: 'commission',
        description: 'Commissions sur formations recommandées',
        target_market: ['Congo', 'CEMAC'],
        pricing_model: {
          commission_rate: 15, // %
          currency: 'XAF'
        },
        projected_monthly_revenue: 900000,
        current_monthly_revenue: 0,
        conversion_rate: 5.0,
        customer_segment: ['all_segments']
      }
    ];
  }

  // Stratégies de prix adaptées au contexte africain
  getPricingStrategies(): PricingStrategy[] {
    return [
      {
        id: 'african_freemium',
        name: 'Freemium Africain',
        type: 'freemium',
        description: 'Stratégie freemium adaptée au pouvoir d\'achat africain',
        target_segments: ['students_lycee', 'university_students', 'young_professionals'],
        implementation: {
          free_tier: {
            features: ['test_riasec', 'analyse_cv_basique', 'chat_ia_limite', 'recommandations_basiques'],
            limitations: {
              tests_par_mois: 1,
              analyses_cv: 2,
              messages_chat: 10,
              recommandations: 3
            },
            conversion_goals: [
              'Démontrer la valeur des recommandations IA',
              'Créer une dépendance aux analyses CV',
              'Construire confiance avec Oriana'
            ]
          },
          paid_tiers: [
            {
              tier_name: 'Premium Mensuel',
              price: 15000,
              currency: 'XAF',
              billing_cycle: 'monthly',
              value_proposition: 'Accès complet pour moins de 500 XAF/jour',
              target_conversion_rate: 8.5
            },
            {
              tier_name: 'Premium Annuel',
              price: 150000,
              currency: 'XAF',
              billing_cycle: 'yearly',
              value_proposition: '2 mois offerts + fonctionnalités exclusives',
              target_conversion_rate: 15.2
            }
          ]
        },
        expected_outcomes: {
          market_penetration: 45, // %
          revenue_per_user: 12000, // XAF/mois
          churn_rate: 12 // %
        }
      },
      {
        id: 'professional_premium',
        name: 'Premium Professionnel',
        type: 'premium',
        description: 'Positionnement premium pour professionnels établis',
        target_segments: ['senior_professionals', 'entrepreneurs'],
        implementation: {
          paid_tiers: [
            {
              tier_name: 'Pro',
              price: 45000,
              currency: 'XAF',
              billing_cycle: 'monthly',
              value_proposition: 'ROI garanti pour votre évolution professionnelle',
              target_conversion_rate: 25.0
            },
            {
              tier_name: 'Entreprise',
              price: 500000,
              currency: 'XAF',
              billing_cycle: 'monthly',
              value_proposition: 'Solution complète pour organisations',
              target_conversion_rate: 35.0
            }
          ]
        },
        expected_outcomes: {
          market_penetration: 15, // %
          revenue_per_user: 45000, // XAF/mois
          churn_rate: 8 // %
        }
      },
      {
        id: 'local_pricing',
        name: 'Prix Adaptatifs Locaux',
        type: 'dynamic',
        description: 'Prix dynamiques selon localisation et pouvoir d\'achat',
        target_segments: ['all_segments'],
        implementation: {
          paid_tiers: [
            {
              tier_name: 'Brazzaville/Pointe-Noire',
              price: 15000,
              currency: 'XAF',
              billing_cycle: 'monthly',
              value_proposition: 'Prix standard centres urbains',
              target_conversion_rate: 10.0
            },
            {
              tier_name: 'Régions Congo',
              price: 10000,
              currency: 'XAF',
              billing_cycle: 'monthly',
              value_proposition: 'Prix adapté pouvoir d\'achat régional',
              target_conversion_rate: 12.0
            },
            {
              tier_name: 'Étudiants Vérifiés',
              price: 7500,
              currency: 'XAF',
              billing_cycle: 'monthly',
              value_proposition: 'Tarif préférentiel étudiant -50%',
              target_conversion_rate: 15.0
            }
          ]
        },
        expected_outcomes: {
          market_penetration: 60, // %
          revenue_per_user: 11000, // XAF/mois
          churn_rate: 10 // %
        }
      }
    ];
  }

  // Modèle économique principal
  getBusinessModel(): BusinessModel {
    return {
      id: 'orientation_pro_congo_2024',
      name: 'Orientation Pro Congo - Modèle SaaS Africain',
      description: 'Plateforme SaaS d\'orientation professionnelle avec IA, adaptée au marché africain',
      primary_revenue_streams: [
        'freemium_conversion',
        'enterprise_licenses', 
        'counselor_marketplace',
        'certification_programs'
      ],
      target_customer_segments: [
        'university_students',
        'young_professionals', 
        'organizations',
        'senior_professionals'
      ],
      value_propositions: [
        'Première IA d\'orientation spécialisée Afrique Centrale',
        'ROI mesurable sur développement de carrière',
        'Accompagnement culturellement adapté',
        'Réseau professionnel local et diaspora',
        'Certifications reconnues marché du travail'
      ],
      key_partnerships: [
        'Université Marien Ngouabi - Pipeline étudiants',
        'MTN/Airtel - Intégration paiements mobile money',
        'Grandes entreprises Congo - Recrutement et formation',
        'Ministère Emploi - Programmes gouvernementaux',
        'Diaspora congolaise - Marché international'
      ],
      cost_structure: {
        fixed_costs: [
          { item: 'Infrastructure cloud (AWS/GCP)', monthly_amount: 850000 },
          { item: 'Équipe développement (5 pers)', monthly_amount: 2500000 },
          { item: 'Équipe conseillers (10 pers)', monthly_amount: 1500000 },
          { item: 'Marketing digital', monthly_amount: 1200000 },
          { item: 'Licences OpenAI et outils', monthly_amount: 400000 },
          { item: 'Frais généraux et admin', monthly_amount: 650000 }
        ],
        variable_costs: [
          { item: 'Frais paiement (2.5% MTN/Airtel)', per_user_cost: 375 },
          { item: 'Coût IA par utilisateur actif', per_user_cost: 850 },
          { item: 'Support client', per_user_cost: 200 },
          { item: 'Acquisition client (CAC)', per_user_cost: 8500 }
        ]
      },
      projected_financials: {
        year_1: { 
          revenue: 252000000, // 21M/mois × 12
          costs: 180000000,
          users: 15000 
        },
        year_2: { 
          revenue: 720000000, // 60M/mois × 12
          costs: 450000000,
          users: 45000 
        },
        year_3: { 
          revenue: 1800000000, // 150M/mois × 12
          costs: 900000000,
          users: 120000 
        }
      }
    };
  }

  // Calcul du Customer Lifetime Value (CLV)
  calculateCLV(segment: CustomerSegment, averageMonthlyRevenue: number, churnRate: number): {
    clv: number;
    payback_period: number;
    profit_margin: number;
  } {
    const monthlyChurn = churnRate / 100;
    const averageLifetime = 1 / monthlyChurn; // en mois
    const clv = averageMonthlyRevenue * averageLifetime;
    
    // Coût d'acquisition client estimé
    const cac = 8500; // XAF
    const paybackPeriod = cac / averageMonthlyRevenue;
    
    // Marge profit (revenue - coûts variables)
    const variableCostPerUser = 1425; // XAF/mois
    const monthlyProfit = averageMonthlyRevenue - variableCostPerUser;
    const profitMargin = (monthlyProfit / averageMonthlyRevenue) * 100;

    return {
      clv,
      payback_period: paybackPeriod,
      profit_margin: profitMargin
    };
  }

  // Projections de revenus par segment
  getRevenueProjections(timeframe: 'monthly' | 'quarterly' | 'yearly'): {
    segment: string;
    current_users: number;
    projected_users: number;
    revenue_per_user: number;
    total_revenue: number;
    growth_rate: number;
  }[] {
    const segments = this.getCustomerSegments();
    const multiplier = timeframe === 'yearly' ? 12 : timeframe === 'quarterly' ? 3 : 1;

    return segments.map(segment => {
      const currentUsers = Math.floor(segment.size_estimate * 0.02); // 2% pénétration actuelle
      const projectedUsers = Math.floor(segment.size_estimate * 0.15); // 15% pénétration cible
      const revenuePerUser = segment.willingness_to_pay * multiplier;
      const totalRevenue = projectedUsers * revenuePerUser;
      const growthRate = ((projectedUsers - currentUsers) / currentUsers) * 100;

      return {
        segment: segment.name,
        current_users: currentUsers,
        projected_users: projectedUsers,
        revenue_per_user: revenuePerUser,
        total_revenue: totalRevenue,
        growth_rate: growthRate
      };
    });
  }

  // Optimisation des prix par segment
  optimizePricing(segment: CustomerSegment): {
    recommended_price: number;
    price_sensitivity_analysis: {
      price: number;
      demand: number;
      revenue: number;
    }[];
    optimal_price_point: number;
  } {
    const baseLine = segment.willingness_to_pay;
    const sensitivity = segment.pricing_sensitivity;
    
    // Facteur de sensibilité
    const sensitivityFactor = sensitivity === 'high' ? 0.3 : sensitivity === 'medium' ? 0.5 : 0.7;
    
    const pricePoints = [
      baseLine * 0.5,
      baseLine * 0.75,
      baseLine,
      baseLine * 1.25,
      baseLine * 1.5
    ];

    const analysis = pricePoints.map(price => {
      // Modèle de demande simple basé sur élasticité prix
      const priceRatio = price / baseLine;
      const demandReduction = (priceRatio - 1) * sensitivityFactor;
      const demand = Math.max(0.1, 1 - demandReduction) * segment.size_estimate * 0.15;
      const revenue = price * demand;

      return { price, demand, revenue };
    });

    const optimalPoint = analysis.reduce((max, current) => 
      current.revenue > max.revenue ? current : max
    );

    return {
      recommended_price: Math.round(optimalPoint.price),
      price_sensitivity_analysis: analysis,
      optimal_price_point: optimalPoint.price
    };
  }
}
