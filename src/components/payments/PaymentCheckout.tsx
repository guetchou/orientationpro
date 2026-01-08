import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Smartphone,
  Building2,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Lock,
  Star,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentService, PaymentMethod, PaymentPlan } from '@/services/payments/PaymentService';
import { useMobile } from '@/hooks/useMobile';

interface PaymentCheckoutProps {
  selectedPlan: PaymentPlan;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
  onBack: () => void;
  userLocation?: string;
  className?: string;
}

interface PaymentFormData {
  email: string;
  full_name: string;
  phone_number: string;
  payment_method_id: string;
  billing_address?: {
    country: string;
    city: string;
  };
}

export const PaymentCheckout: React.FC<PaymentCheckoutProps> = ({
  selectedPlan,
  onPaymentSuccess,
  onPaymentError,
  onBack,
  userLocation = 'CG',
  className = ''
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    email: '',
    full_name: '',
    phone_number: '',
    payment_method_id: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentService] = useState(() => new PaymentService());
  const { isMobile } = useMobile();

  useEffect(() => {
    const methods = paymentService.getAvailablePaymentMethods(userLocation);
    setPaymentMethods(methods);
    
    // Sélectionner automatiquement MTN MoMo si disponible (plus populaire au Congo)
    const mtnMomo = methods.find(m => m.provider === 'mtn_momo');
    if (mtnMomo) {
      setSelectedPaymentMethod(mtnMomo);
      setFormData(prev => ({ ...prev, payment_method_id: mtnMomo.id }));
    } else if (methods.length > 0) {
      setSelectedPaymentMethod(methods[0]);
      setFormData(prev => ({ ...prev, payment_method_id: methods[0].id }));
    }
  }, [paymentService, userLocation]);

  const handlePaymentMethodChange = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method) {
      setSelectedPaymentMethod(method);
      setFormData(prev => ({ ...prev, payment_method_id: methodId }));
      setErrors(prev => ({ ...prev, payment_method: '' }));
    }
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Le nom complet est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Le numéro de téléphone est requis';
    } else if (selectedPaymentMethod?.type === 'mobile_money') {
      // Validation spécifique pour mobile money
      const phoneRegex = /^\+?242[0-9]{8,9}$/;
      if (!phoneRegex.test(formData.phone_number.replace(/\s/g, ''))) {
        newErrors.phone_number = 'Format: +242 XX XXX XX XX';
      }
    }

    if (!selectedPaymentMethod) {
      newErrors.payment_method = 'Veuillez sélectionner une méthode de paiement';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedPaymentMethod) return;

    setIsProcessing(true);

    try {
      // Validation des limites de paiement
      const validation = paymentService.validatePaymentLimits(
        selectedPlan.price.amount,
        selectedPaymentMethod
      );

      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Initier le paiement
      const response = await paymentService.initiatePayment(
        'current_user_id', // À remplacer par l'ID utilisateur réel
        selectedPlan.id,
        selectedPaymentMethod.id,
        {
          customer_info: {
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone_number
          },
          plan_info: {
            name: selectedPlan.name,
            amount: selectedPlan.price.amount,
            currency: selectedPlan.price.currency
          }
        }
      );

      if (response.success) {
        // Gérer selon le type de méthode de paiement
        if (selectedPaymentMethod.type === 'mobile_money') {
          // Instructions pour mobile money
          if (response.instructions) {
            alert(`Instructions de paiement:\n${response.instructions}`);
          }
        } else if (selectedPaymentMethod.type === 'bank_card') {
          // Redirection vers passerelle
          if (response.payment_url) {
            window.location.href = response.payment_url;
            return;
          }
        }

        onPaymentSuccess(response.transaction_id);
      } else {
        throw new Error(response.error_message || 'Erreur lors du paiement');
      }

    } catch (error) {
      console.error('Erreur paiement:', error);
      onPaymentError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case 'mobile_money':
        return <Smartphone className="h-5 w-5" />;
      case 'bank_card':
        return <CreditCard className="h-5 w-5" />;
      case 'bank_transfer':
        return <Building2 className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const calculateTotal = () => {
    if (!selectedPaymentMethod) return selectedPlan.price.amount;
    
    const fees = paymentService.calculateFees(selectedPlan.price.amount, selectedPaymentMethod);
    return selectedPlan.price.amount + fees;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Finaliser votre abonnement</h2>
          <p className="text-gray-600">Sécurisé et rapide avec nos partenaires de confiance</p>
        </div>
      </div>

      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
        {/* Formulaire de paiement */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Informations de facturation
                </CardTitle>
                <CardDescription>
                  Ces informations sont nécessaires pour valider votre paiement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nom complet *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Votre nom complet"
                      className={errors.full_name ? 'border-red-500' : ''}
                    />
                    {errors.full_name && (
                      <p className="text-sm text-red-500">{errors.full_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="votre@email.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">
                    Numéro de téléphone *
                    {selectedPaymentMethod?.type === 'mobile_money' && (
                      <span className="text-sm text-gray-500 ml-2">
                        (compte {selectedPaymentMethod.name})
                      </span>
                    )}
                  </Label>
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    placeholder="+242 06 123 45 67"
                    className={errors.phone_number ? 'border-red-500' : ''}
                  />
                  {errors.phone_number && (
                    <p className="text-sm text-red-500">{errors.phone_number}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Méthodes de paiement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  Méthode de paiement
                </CardTitle>
                <CardDescription>
                  Choisissez votre mode de paiement préféré
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedPaymentMethod?.id || ''}
                  onValueChange={handlePaymentMethodChange}
                  className="space-y-3"
                >
                  {paymentMethods.map((method) => (
                    <motion.div
                      key={method.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="flex items-center gap-3 flex-1">
                        {getPaymentMethodIcon(method)}
                        <img
                          src={method.icon}
                          alt={method.name}
                          className="h-8 w-12 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="flex-1">
                          <Label htmlFor={method.id} className="font-medium cursor-pointer">
                            {method.name}
                          </Label>
                          <p className="text-sm text-gray-500">
                            Frais: {method.fees.percentage}%
                            {method.fees.fixed_amount && ` + ${formatAmount(method.fees.fixed_amount)} XAF`}
                          </p>
                        </div>
                        {method.provider === 'mtn_momo' && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                            <Star className="h-3 w-3 mr-1" />
                            Populaire
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </RadioGroup>

                {errors.payment_method && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.payment_method}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Instructions spécifiques */}
            {selectedPaymentMethod?.type === 'mobile_money' && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Instructions {selectedPaymentMethod.name} :</strong>
                  <br />
                  1. Vous recevrez un SMS avec le code de paiement
                  <br />
                  2. Composez le code sur votre téléphone
                  <br />
                  3. Confirmez le paiement avec votre PIN
                </AlertDescription>
              </Alert>
            )}
          </form>
        </div>

        {/* Résumé de commande */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Résumé de commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Plan sélectionné */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{selectedPlan.name}</span>
                  <span>{formatAmount(selectedPlan.price.amount)} XAF</span>
                </div>
                <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                {selectedPlan.price.billing_cycle === 'yearly' && (
                  <Badge variant="outline" className="text-green-600">
                    2 mois offerts
                  </Badge>
                )}
              </div>

              <Separator />

              {/* Frais */}
              {selectedPaymentMethod && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{formatAmount(selectedPlan.price.amount)} XAF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Frais {selectedPaymentMethod.name}</span>
                    <span>
                      {formatAmount(
                        paymentService.calculateFees(selectedPlan.price.amount, selectedPaymentMethod)
                      )} XAF
                    </span>
                  </div>
                </div>
              )}

              <Separator />

              {/* Total */}
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatAmount(calculateTotal())} XAF</span>
              </div>

              {/* Bouton de paiement */}
              <Button
                onClick={handleSubmit}
                disabled={isProcessing || !selectedPaymentMethod}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Payer {formatAmount(calculateTotal())} XAF
                  </>
                )}
              </Button>

              {/* Sécurité */}
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  <span>Paiement 100% sécurisé</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>Activation immédiate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  <span>Garantie satisfait ou remboursé 30j</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardContent className="pt-6 text-center">
              <h3 className="font-semibold mb-2">Besoin d'aide ?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Notre équipe est là pour vous accompagner
              </p>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Téléphone :</strong>{' '}
                  <a href="tel:+24206123456" className="text-blue-600 hover:underline">
                    +242 06 123 45 67
                  </a>
                </p>
                <p>
                  <strong>Email :</strong>{' '}
                  <a href="mailto:support@orientationpro.cg" className="text-blue-600 hover:underline">
                    support@orientationpro.cg
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
