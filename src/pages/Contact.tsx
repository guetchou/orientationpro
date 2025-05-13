
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/Footer'; // Correction de l'import
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Demander une orientation</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Nous contacter</h2>
              <p className="text-gray-600 mb-6">
                Vous avez des questions sur nos services d'orientation professionnelle ? 
                N'hésitez pas à nous contacter en remplissant le formulaire ci-contre ou 
                en utilisant les coordonnées ci-dessous.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="mr-3 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Téléphone</h3>
                    <p className="text-gray-600">+33 (0)1 23 45 67 89</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-3 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-gray-600">contact@orientation-pro.fr</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-3 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Adresse</h3>
                    <p className="text-gray-600">123 Avenue de l'Orientation<br/>75000 Paris, France</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-3">Horaires d'ouverture</h3>
              <p className="text-gray-600 mb-1">Lundi - Vendredi: 9h - 18h</p>
              <p className="text-gray-600">Samedi: 10h - 14h (sur rendez-vous)</p>
            </div>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Formulaire de contact</h2>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                  <Input id="name" placeholder="Votre nom" />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input id="email" type="email" placeholder="votre.email@exemple.com" />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <Input id="phone" placeholder="Votre numéro de téléphone" />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <Input id="subject" placeholder="Objet de votre message" />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <Textarea id="message" placeholder="Détaillez votre demande..." rows={4} />
                </div>
                
                <Button type="submit" className="w-full">Envoyer votre message</Button>
              </form>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
