import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrientationServices = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded">
          <h3 className="font-bold text-blue-700 mb-1">Nouveau : Guide des Études Supérieures au Congo 2024</h3>
          <p className="text-blue-800 text-sm mb-2">Tout savoir sur les filières, établissements, démarches et conseils pour réussir vos études supérieures au Congo.</p>
          <Link to="/guide-congo-2024" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold">Découvrir le guide</Link>
        </div>
        <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-6">Services d'Orientation</h1>
                <p className="text-xl text-gray-600">
                  Découvrez nos services d'orientation personnalisés pour vous aider à faire les meilleurs choix pour votre avenir professionnel.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Un accompagnement sur mesure</h2>
                  <p className="text-gray-600 mb-6">
                    Nos conseillers d'orientation certifiés vous accompagnent à chaque étape de votre parcours, 
                    de l'exploration de vos intérêts à la définition de votre projet professionnel.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg">
                      <Link to="/contact">Prendre rendez-vous</Link>
                    </Button>
                    <Button variant="outline" size="lg">En savoir plus</Button>
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                    alt="Conseiller d'orientation" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nos services</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 hover:shadow-lg transition-shadow rounded-lg bg-white">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 2v20M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"></path>
                    <path d="M19 17h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Bilans d'orientation</h3>
                <p className="text-gray-600">
                  Faites le point sur vos compétences, vos intérêts et vos valeurs pour définir un projet professionnel qui vous ressemble.
                </p>
              </div>
              
              <div className="p-6 hover:shadow-lg transition-shadow rounded-lg bg-white">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Tests psychométriques</h3>
                <p className="text-gray-600">
                  Évaluez vos aptitudes, votre personnalité et vos motivations grâce à des tests validés scientifiquement.
                </p>
              </div>
              
              <div className="p-6 hover:shadow-lg transition-shadow rounded-lg bg-white">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <line x1="12" y1="2" x2="12" y2="22"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Entretiens individuels</h3>
                <p className="text-gray-600">
                  Bénéficiez de conseils personnalisés lors d'entretiens avec nos conseillers, en présentiel ou à distance.
                </p>
              </div>
              
              <div className="p-6 hover:shadow-lg transition-shadow rounded-lg bg-white">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Ateliers thématiques</h3>
                <p className="text-gray-600">
                  Participez à des ateliers en groupe pour explorer des thématiques spécifiques liées à l'orientation et à l'insertion professionnelle.
                </p>
              </div>
              
              <div className="p-6 hover:shadow-lg transition-shadow rounded-lg bg-white">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <line x1="12" y1="2" x2="12" y2="22"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Accompagnement à la recherche d'emploi</h3>
                <p className="text-gray-600">
                  Bénéficiez d'un accompagnement personnalisé pour optimiser votre CV, rédiger des lettres de motivation percutantes et réussir vos entretiens.
                </p>
              </div>
              
              <div className="p-6 hover:shadow-lg transition-shadow rounded-lg bg-white">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Suivi personnalisé</h3>
                <p className="text-gray-600">
                  Restez en contact avec votre conseiller pour bénéficier d'un suivi régulier et atteindre vos objectifs professionnels.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche</h2>
              
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="md:w-1/2">
                    <div className="bg-white rounded-lg p-6 shadow-md">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mb-4">1</div>
                      <h3 className="text-xl font-bold mb-3">Prenez contact avec un conseiller</h3>
                      <p className="text-gray-600">
                        Choisissez le conseiller qui correspond le mieux à vos besoins et prenez rendez-vous en ligne.
                      </p>
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1543123848-ca984e4454fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" alt="Contact conseiller" className="rounded-lg shadow-md" />
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                  <div className="md:w-1/2">
                    <div className="bg-white rounded-lg p-6 shadow-md">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mb-4">2</div>
                      <h3 className="text-xl font-bold mb-3">Réalisez un bilan d'orientation</h3>
                      <p className="text-gray-600">
                        Répondez à un questionnaire détaillé pour évaluer vos compétences, vos intérêts et vos valeurs.
                      </p>
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" alt="Bilan orientation" className="rounded-lg shadow-md" />
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="md:w-1/2">
                    <div className="bg-white rounded-lg p-6 shadow-md">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mb-4">3</div>
                      <h3 className="text-xl font-bold mb-3">Définissez votre projet professionnel</h3>
                      <p className="text-gray-600">
                        Avec l'aide de votre conseiller, identifiez les métiers et les formations qui correspondent à votre profil.
                      </p>
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" alt="Projet professionnel" className="rounded-lg shadow-md" />
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                  <div className="md:w-1/2">
                    <div className="bg-white rounded-lg p-6 shadow-md">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mb-4">4</div>
                      <h3 className="text-xl font-bold mb-3">Mettez en œuvre votre plan d'action</h3>
                      <p className="text-gray-600">
                        Bénéficiez d'un accompagnement personnalisé pour trouver un emploi, une formation ou créer votre entreprise.
                      </p>
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1542744166-e35c9a306541?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" alt="Plan d'action" className="rounded-lg shadow-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Témoignages</h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <p className="text-gray-600 italic mb-4">
                  "Grâce à l'accompagnement de mon conseiller, j'ai pu trouver ma voie et me lancer dans une formation qui me passionne."
                </p>
                <div className="flex items-center">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b2933e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=64&h=64&q=80" alt="Témoignage 1" className="rounded-full w-12 h-12 mr-4" />
                  <div>
                    <p className="font-bold">Sophie Martin</p>
                    <p className="text-sm text-gray-500">Étudiante</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <p className="text-gray-600 italic mb-4">
                  "Les tests psychométriques m'ont permis de mieux comprendre mes forces et mes faiblesses, et de choisir un métier qui correspond à ma personnalité."
                </p>
                <div className="flex items-center">
                  <img src="https://images.unsplash.com/photo-1570295999680-5e27cac9d2ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=64&h=64&q=80" alt="Témoignage 2" className="rounded-full w-12 h-12 mr-4" />
                  <div>
                    <p className="font-bold">Pierre Dubois</p>
                    <p className="text-sm text-gray-500">Salarié</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Prêt à prendre votre avenir en main ?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Contactez-nous dès aujourd'hui pour bénéficier d'un accompagnement personnalisé et construire le projet professionnel qui vous ressemble.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild variant="secondary" size="lg" className="font-medium">
                <Link to="/contact">Prendre rendez-vous</Link>
              </Button>
              <Button variant="outline" size="lg" className="font-medium bg-transparent border-white text-white hover:bg-white/10">
                En savoir plus
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OrientationServices;
