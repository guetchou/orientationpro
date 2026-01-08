import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageSquare,
  User,
  CheckCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique d'envoi du formulaire
    console.log('Formulaire envoyé:', formData);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-blue-100 text-blue-600 border-blue-200">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contactez-nous
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Nous sommes <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">à votre écoute</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Une question ? Un besoin d'accompagnement ? Notre équipe d'experts est là pour vous aider 
              dans votre parcours d'orientation professionnelle.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contenu Principal */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Formulaire de Contact */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Send className="w-6 h-6 text-blue-600" />
                    Envoyez-nous un message
                  </CardTitle>
                  <p className="text-gray-600">
                    Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                  </p>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Message envoyé !</h3>
                      <p className="text-gray-600">Nous vous répondrons dans les 24 heures.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom complet *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => handleChange('name', e.target.value)}
                              className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                              placeholder="Votre nom complet"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => handleChange('email', e.target.value)}
                              className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                              placeholder="votre@email.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sujet *
                        </label>
                        <Input
                          type="text"
                          required
                          value={formData.subject}
                          onChange={(e) => handleChange('subject', e.target.value)}
                          className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                          placeholder="Objet de votre message"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Catégorie
                        </label>
                        <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                          <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg">
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="orientation">Orientation professionnelle</SelectItem>
                            <SelectItem value="tests">Tests d'orientation</SelectItem>
                            <SelectItem value="emploi">Recherche d'emploi</SelectItem>
                            <SelectItem value="partenariat">Partenariat</SelectItem>
                            <SelectItem value="technique">Support technique</SelectItem>
                            <SelectItem value="autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message *
                        </label>
                        <Textarea
                          required
                          value={formData.message}
                          onChange={(e) => handleChange('message', e.target.value)}
                          className="min-h-[120px] border-2 border-gray-200 focus:border-blue-500 rounded-lg resize-none"
                          placeholder="Décrivez votre demande en détail..."
                        />
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Envoyer le message
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Informations de Contact */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              
              {/* Informations de Base */}
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Nos Coordonnées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Adresse</h4>
                      <p className="text-gray-600">
                        123 Rue de l'Avenir<br />
                        Brazzaville, République du Congo
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Téléphone</h4>
                      <p className="text-gray-600">+242 06 123 4567</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Email</h4>
                      <p className="text-gray-600">contact@orientationpro.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Horaires</h4>
                      <div className="text-gray-600 space-y-1">
                        <p>Lundi - Vendredi: 8h00 - 17h00</p>
                        <p>Samedi: 9h00 - 13h00</p>
                        <p>Dimanche: Fermé</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Réseaux Sociaux */}
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Suivez-nous
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: <Facebook className="w-5 h-5" />, name: 'Facebook', color: 'bg-blue-600' },
                      { icon: <Twitter className="w-5 h-5" />, name: 'Twitter', color: 'bg-sky-500' },
                      { icon: <Instagram className="w-5 h-5" />, name: 'Instagram', color: 'bg-pink-500' },
                      { icon: <Linkedin className="w-5 h-5" />, name: 'LinkedIn', color: 'bg-blue-700' }
                    ].map((social, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className={`${social.color} hover:opacity-90 text-white border-0 h-12`}
                      >
                        {social.icon}
                        <span className="ml-2">{social.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Rapide */}
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Questions Fréquentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Combien de temps pour une réponse ?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Nous répondons généralement dans les 24 heures ouvrées.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Les services sont-ils gratuits ?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Nos tests de base sont gratuits. Des services premium sont disponibles.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Puis-je prendre rendez-vous ?
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Oui, nos conseillers sont disponibles sur rendez-vous.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}