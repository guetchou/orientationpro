
import React, { useState } from 'react';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChatBot } from "@/components/chat/ChatBot";
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AlertCircle, Mail, MapPin, Phone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Simuler l'envoi d'un message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Votre message a été envoyé avec succès !");
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      setError("Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.");
      toast.error("Échec de l'envoi du message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <motion.h1 
              className="text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Contactez-nous
            </motion.h1>
            <motion.p 
              className="text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Notre équipe est à votre écoute pour répondre à toutes vos questions concernant votre orientation professionnelle et académique.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Informations de contact */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <h2 className="text-2xl font-semibold mb-6">Nos coordonnées</h2>
                <ul className="space-y-6">
                  <li className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Adresse</h3>
                      <p className="text-muted-foreground">123 Avenue de l'Orientation, Brazzaville, Congo</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Téléphone</h3>
                      <p className="text-muted-foreground">+242 06 123 45 67</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-muted-foreground">contact@orientationcongo.com</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-6">Horaires d'ouverture</h2>
                <div className="bg-card p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between mb-2">
                    <span>Lundi - Vendredi</span>
                    <span>8h00 - 17h00</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Samedi</span>
                    <span>9h00 - 13h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span>Fermé</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Formulaire de contact */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-card p-8 rounded-xl shadow-sm">
                <h2 className="text-2xl font-semibold mb-6">Envoyez-nous un message</h2>
                
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">Nom complet</label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name}
                      onChange={handleChange}
                      required 
                      placeholder="Votre nom" 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={formData.email}
                      onChange={handleChange}
                      required 
                      placeholder="votre.email@exemple.com" 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">Sujet</label>
                    <Input 
                      id="subject" 
                      name="subject"
                      value={formData.subject} 
                      onChange={handleChange}
                      required 
                      placeholder="Sujet de votre message" 
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                    <Textarea 
                      id="message" 
                      name="message"
                      value={formData.message}
                      onChange={handleChange} 
                      rows={5} 
                      required 
                      placeholder="Votre message..." 
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <ChatBot />
      <Footer />
    </div>
  );
}
