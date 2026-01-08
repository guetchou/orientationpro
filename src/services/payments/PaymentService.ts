export interface PaymentMethod {
  id: string;
  type: 'mobile_money' | 'bank_card' | 'bank_transfer' | 'crypto';
  provider: 'mtn_momo' | 'airtel_money' | 'visa' | 'mastercard' | 'express_union' | 'bitcoin' | 'ecobank';
  name: string;
  icon: string;
  fees: {
    percentage: number;
    fixed_amount?: number;
    currency: string;
  };
  limits: {
    min_amount: number;
    max_amount: number;
    daily_limit?: number;
    currency: string;
  };
  availability: {
    countries: string[];
    is_active: boolean;
  };
}

export interface PaymentPlan {
  id: string;
  name: string;
  type: 'freemium' | 'premium' | 'pro' | 'enterprise';
  price: {
    amount: number;
    currency: string;
    billing_cycle: 'monthly' | 'yearly' | 'one_time';
  };
  features: {
    feature_id: string;
    feature_name: string;
    limit?: number;
    included: boolean;
  }[];
  popular?: boolean;
  description: string;
  target_audience: string[];
}

export interface Transaction {
  id: string;
  user_id: string;
  plan_id?: string;
  service_id?: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  created_at: Date;
  updated_at: Date;
  payment_gateway_id?: string;
  reference_number: string;
  metadata?: Record<string, any>;
}

export interface PaymentGatewayResponse {
  success: boolean;
  transaction_id: string;
  reference: string;
  status: string;
  payment_url?: string;
  qr_code?: string;
  instructions?: string;
  error_message?: string;
}

export class PaymentService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:6465';
    this.apiKey = import.meta.env.VITE_PAYMENT_API_KEY || '';
  }

  // Méthodes de paiement disponibles au Congo
  getAvailablePaymentMethods(country: string = 'CG'): PaymentMethod[] {
    const methods: PaymentMethod[] = [
      {
        id: 'mtn_momo_cg',
        type: 'mobile_money',
        provider: 'mtn_momo',
        name: 'MTN Mobile Money',
        icon: '/payment-icons/mtn-momo.png',
        fees: { percentage: 2.5, currency: 'XAF' },
        limits: { min_amount: 100, max_amount: 2000000, daily_limit: 5000000, currency: 'XAF' },
        availability: { countries: ['CG', 'CM', 'CI'], is_active: true }
      },
      {
        id: 'airtel_money_cg',
        type: 'mobile_money',
        provider: 'airtel_money',
        name: 'Airtel Money',
        icon: '/payment-icons/airtel-money.png',
        fees: { percentage: 2.0, currency: 'XAF' },
        limits: { min_amount: 100, max_amount: 1500000, daily_limit: 3000000, currency: 'XAF' },
        availability: { countries: ['CG', 'CM', 'GA'], is_active: true }
      },
      {
        id: 'express_union_cg',
        type: 'bank_transfer',
        provider: 'express_union',
        name: 'Express Union',
        icon: '/payment-icons/express-union.png',
        fees: { percentage: 1.5, fixed_amount: 500, currency: 'XAF' },
        limits: { min_amount: 1000, max_amount: 10000000, currency: 'XAF' },
        availability: { countries: ['CG', 'CM', 'GA', 'CF', 'TD'], is_active: true }
      },
      {
        id: 'visa_card',
        type: 'bank_card',
        provider: 'visa',
        name: 'Carte Visa',
        icon: '/payment-icons/visa.png',
        fees: { percentage: 3.5, currency: 'XAF' },
        limits: { min_amount: 500, max_amount: 5000000, currency: 'XAF' },
        availability: { countries: ['CG', 'CM', 'GA', 'CI', 'SN'], is_active: true }
      },
      {
        id: 'mastercard',
        type: 'bank_card',
        provider: 'mastercard',
        name: 'Mastercard',
        icon: '/payment-icons/mastercard.png',
        fees: { percentage: 3.5, currency: 'XAF' },
        limits: { min_amount: 500, max_amount: 5000000, currency: 'XAF' },
        availability: { countries: ['CG', 'CM', 'GA', 'CI', 'SN'], is_active: true }
      }
    ];

    return methods.filter(method => 
      method.availability.countries.includes(country) && 
      method.availability.is_active
    );
  }

  // Plans tarifaires adaptés au marché congolais
  getAvailablePlans(): PaymentPlan[] {
    return [
      {
        id: 'freemium',
        name: 'Découverte',
        type: 'freemium',
        price: { amount: 0, currency: 'XAF', billing_cycle: 'monthly' },
        description: 'Parfait pour découvrir vos premières orientations',
        target_audience: ['étudiant', 'premier emploi'],
        features: [
          { feature_id: 'riasec_test', feature_name: 'Test RIASEC', limit: 1, included: true },
          { feature_id: 'basic_cv_analysis', feature_name: 'Analyse CV basique', limit: 2, included: true },
          { feature_id: 'chat_ai', feature_name: 'Chat avec Oriana', limit: 10, included: true },
          { feature_id: 'career_recommendations', feature_name: 'Recommandations carrière', limit: 3, included: true },
          { feature_id: 'premium_support', feature_name: 'Support prioritaire', included: false }
        ]
      },
      {
        id: 'premium_monthly',
        name: 'Premium',
        type: 'premium',
        price: { amount: 15000, currency: 'XAF', billing_cycle: 'monthly' },
        description: 'L\'accompagnement complet pour votre réussite professionnelle',
        target_audience: ['professionnel', 'reconversion', 'développement'],
        popular: true,
        features: [
          { feature_id: 'all_tests', feature_name: 'Tous les tests d\'orientation', included: true },
          { feature_id: 'unlimited_cv_analysis', feature_name: 'Analyse CV illimitée', included: true },
          { feature_id: 'cv_optimization', feature_name: 'Optimisation CV automatique', included: true },
          { feature_id: 'unlimited_chat', feature_name: 'Chat illimité avec Oriana', included: true },
          { feature_id: 'counselor_sessions', feature_name: 'Sessions conseiller', limit: 2, included: true },
          { feature_id: 'skill_gap_analysis', feature_name: 'Analyse écarts compétences', included: true },
          { feature_id: 'premium_support', feature_name: 'Support prioritaire', included: true }
        ]
      },
      {
        id: 'premium_yearly',
        name: 'Premium Annuel',
        type: 'premium',
        price: { amount: 150000, currency: 'XAF', billing_cycle: 'yearly' },
        description: 'Premium avec 2 mois offerts - L\'investissement de l\'année',
        target_audience: ['professionnel', 'reconversion', 'développement'],
        features: [
          { feature_id: 'all_tests', feature_name: 'Tous les tests d\'orientation', included: true },
          { feature_id: 'unlimited_cv_analysis', feature_name: 'Analyse CV illimitée', included: true },
          { feature_id: 'cv_optimization', feature_name: 'Optimisation CV automatique', included: true },
          { feature_id: 'unlimited_chat', feature_name: 'Chat illimité avec Oriana', included: true },
          { feature_id: 'counselor_sessions', feature_name: 'Sessions conseiller', limit: 24, included: true },
          { feature_id: 'skill_gap_analysis', feature_name: 'Analyse écarts compétences', included: true },
          { feature_id: 'career_coaching', feature_name: 'Coaching carrière mensuel', included: true },
          { feature_id: 'premium_support', feature_name: 'Support prioritaire', included: true },
          { feature_id: 'exclusive_content', feature_name: 'Contenu exclusif', included: true }
        ]
      },
      {
        id: 'pro',
        name: 'Professionnel',
        type: 'pro',
        price: { amount: 45000, currency: 'XAF', billing_cycle: 'monthly' },
        description: 'Pour les professionnels exigeants et les entrepreneurs',
        target_audience: ['cadre', 'entrepreneur', 'consultant'],
        features: [
          { feature_id: 'all_premium_features', feature_name: 'Toutes les fonctionnalités Premium', included: true },
          { feature_id: 'unlimited_counselor', feature_name: 'Sessions conseiller illimitées', included: true },
          { feature_id: 'personal_branding', feature_name: 'Accompagnement personal branding', included: true },
          { feature_id: 'network_access', feature_name: 'Accès réseau professionnel VIP', included: true },
          { feature_id: 'custom_reports', feature_name: 'Rapports personnalisés', included: true },
          { feature_id: 'priority_support', feature_name: 'Support dédié 24/7', included: true },
          { feature_id: 'api_access', feature_name: 'Accès API', included: true }
        ]
      },
      {
        id: 'enterprise',
        name: 'Entreprise',
        type: 'enterprise',
        price: { amount: 0, currency: 'XAF', billing_cycle: 'one_time' }, // Sur devis
        description: 'Solutions sur mesure pour organisations et institutions',
        target_audience: ['entreprise', 'université', 'gouvernement'],
        features: [
          { feature_id: 'unlimited_users', feature_name: 'Utilisateurs illimités', included: true },
          { feature_id: 'custom_integration', feature_name: 'Intégrations sur mesure', included: true },
          { feature_id: 'dedicated_support', feature_name: 'Support dédié', included: true },
          { feature_id: 'custom_branding', feature_name: 'Branding personnalisé', included: true },
          { feature_id: 'analytics_dashboard', feature_name: 'Tableau de bord analytics', included: true },
          { feature_id: 'sla_guarantee', feature_name: 'Garantie SLA', included: true },
          { feature_id: 'onsite_training', feature_name: 'Formation sur site', included: true }
        ]
      }
    ];
  }

  // Initier un paiement
  async initiatePayment(
    userId: string,
    planId: string,
    paymentMethodId: string,
    metadata?: Record<string, any>
  ): Promise<PaymentGatewayResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          user_id: userId,
          plan_id: planId,
          payment_method_id: paymentMethodId,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur paiement: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur initiation paiement:', error);
      throw error;
    }
  }

  // Vérifier le statut d'un paiement
  async checkPaymentStatus(transactionId: string): Promise<Transaction> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/status/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur vérification: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur vérification paiement:', error);
      throw error;
    }
  }

  // Obtenir l'historique des transactions
  async getTransactionHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ transactions: Transaction[], total: number }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/payments/history/${userId}?limit=${limit}&offset=${offset}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur historique: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur historique paiements:', error);
      throw error;
    }
  }

  // Calculer les frais de transaction
  calculateFees(amount: number, paymentMethod: PaymentMethod): number {
    const percentageFee = (amount * paymentMethod.fees.percentage) / 100;
    const fixedFee = paymentMethod.fees.fixed_amount || 0;
    return percentageFee + fixedFee;
  }

  // Valider les limites de paiement
  validatePaymentLimits(amount: number, paymentMethod: PaymentMethod): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (amount < paymentMethod.limits.min_amount) {
      errors.push(`Montant minimum: ${paymentMethod.limits.min_amount} ${paymentMethod.limits.currency}`);
    }

    if (amount > paymentMethod.limits.max_amount) {
      errors.push(`Montant maximum: ${paymentMethod.limits.max_amount} ${paymentMethod.limits.currency}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Obtenir les statistiques de revenus
  async getRevenueStats(
    startDate: Date,
    endDate: Date
  ): Promise<{
    total_revenue: number;
    transactions_count: number;
    average_transaction: number;
    payment_methods_breakdown: Record<string, number>;
    plans_breakdown: Record<string, number>;
    currency: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur statistiques: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur statistiques revenus:', error);
      throw error;
    }
  }

  // Traitement des webhooks de paiement
  async handlePaymentWebhook(webhookData: any): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(webhookData)
      });
    } catch (error) {
      console.error('Erreur traitement webhook:', error);
      throw error;
    }
  }
}
