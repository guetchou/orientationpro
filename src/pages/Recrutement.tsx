
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Recrutement = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-6">Système de Recrutement ATS</h1>
                <p className="text-xl text-gray-600">
                  Une solution complète de gestion des candidatures pour optimiser vos recrutements
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Simplifiez votre processus de recrutement</h2>
                  <p className="text-gray-600 mb-6">
                    Notre système ATS (Applicant Tracking System) vous permet de centraliser toutes vos candidatures, 
                    d'automatiser le tri des CV et de collaborer efficacement avec votre équipe pour sélectionner 
                    les meilleurs talents.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg">Demander une démo</Button>
                    <Button variant="outline" size="lg">Nos tarifs</Button>
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden shadow-xl">
                  <AspectRatio ratio={4/3}>
                    <img 
                      src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                      alt="Plateforme ATS" 
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Fonctionnalités principales</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                    <line x1="6" y1="6" x2="6.01" y2="6"></line>
                    <line x1="6" y1="18" x2="6.01" y2="18"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Gestion des candidatures</h3>
                <p className="text-gray-600">
                  Centralisez toutes vos candidatures dans une seule interface intuitive. 
                  Organisez-les par poste, par statut et suivez leur progression tout au long du processus.
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Analyse de CV automatisée</h3>
                <p className="text-gray-600">
                  Notre technologie IA analyse les CV pour identifier les compétences clés et 
                  évaluer l'adéquation des candidats avec vos offres d'emploi.
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Collaboration d'équipe</h3>
                <p className="text-gray-600">
                  Partagez les profils avec votre équipe, attribuez des évaluations 
                  et commentez les candidatures pour prendre des décisions collectives éclairées.
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Planification d'entretiens</h3>
                <p className="text-gray-600">
                  Programmez facilement des entretiens en synchronisant les disponibilités 
                  des recruteurs et des candidats, avec des rappels automatiques.
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Filtres intelligents</h3>
                <p className="text-gray-600">
                  Utilisez des filtres avancés pour identifier rapidement les candidats 
                  correspondant à vos critères de sélection spécifiques.
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Communication automatisée</h3>
                <p className="text-gray-600">
                  Envoyez des emails personnalisés aux candidats à chaque étape du processus, 
                  depuis l'accusé de réception jusqu'aux réponses finales.
                </p>
              </Card>
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
                      <h3 className="text-xl font-bold mb-3">Publiez vos offres d'emploi</h3>
                      <p className="text-gray-600">
                        Créez vos annonces dans notre système et diffusez-les sur votre site carrière 
                        et les principaux job boards en un clic.
                      </p>
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" alt="Publication d'offre" className="rounded-lg shadow-md" />
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                  <div className="md:w-1/2">
                    <div className="bg-white rounded-lg p-6 shadow-md">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mb-4">2</div>
                      <h3 className="text-xl font-bold mb-3">Recevez et triez les candidatures</h3>
                      <p className="text-gray-600">
                        Les candidatures sont automatiquement importées dans le système. 
                        Notre IA analyse les CV et les classe selon leur pertinence.
                      </p>
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" alt="Tri des candidatures" className="rounded-lg shadow-md" />
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="md:w-1/2">
                    <div className="bg-white rounded-lg p-6 shadow-md">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mb-4">3</div>
                      <h3 className="text-xl font-bold mb-3">Collaborez et prenez des décisions</h3>
                      <p className="text-gray-600">
                        Partagez les profils avec votre équipe, évaluez les candidats ensemble 
                        et avancez dans le processus de sélection de manière collaborative.
                      </p>
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" alt="Collaboration d'équipe" className="rounded-lg shadow-md" />
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                  <div className="md:w-1/2">
                    <div className="bg-white rounded-lg p-6 shadow-md">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold mb-4">4</div>
                      <h3 className="text-xl font-bold mb-3">Suivez les performances</h3>
                      <p className="text-gray-600">
                        Analysez vos métriques de recrutement avec des tableaux de bord détaillés 
                        pour optimiser continuellement votre processus.
                      </p>
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" alt="Analyse des performances" className="rounded-lg shadow-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nos forfaits</h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-6 border-t-4 border-gray-400">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <div className="text-3xl font-bold mb-1">29€<span className="text-lg font-normal text-gray-500">/mois</span></div>
                <p className="text-sm text-gray-500 mb-6">Pour les petites entreprises</p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 mt-1">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Jusqu'à 5 offres d'emploi actives</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 mt-1">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Gestion des candidatures</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 mt-1">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Emails automatisés</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 mt-1">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>1 utilisateur</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full">Essai gratuit</Button>
              </Card>
              
              <Card className="p-6 border-t-4 border-primary scale-105 shadow-lg">
                <div className="absolute -top-4 right-0 left-0 mx-auto w-max bg-primary text-white text-xs font-bold py-1 px-3 rounded">RECOMMANDÉ</div>
                <h3 className="text-xl font-bold mb-2">Professional</h3>
                <div className="text-3xl font-bold mb-1">79€<span className="text-lg font-normal text-gray-500">/mois</span></div>
                <p className="text-sm text-gray-500 mb-6">Pour les entreprises en croissance</p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 mt-1">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Jusqu'à 20 offres d'emploi actives</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 mt-1">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Analyse de CV par IA</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 mt-1">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Planification d'entretiens</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 mt-1">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>5 utilisateurs</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 mt-1">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Tableaux de bord analytics</span>
                  </li>
                </ul>
                
                <Button className="w-full">Essai gratuit</Button>
              </Card>
              
              <Card className="p-6 border-t-4 border-gray-700">
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <div className="text-3xl font-bold mb-1">199€<span className="text-lg font-normal text-gray-500">/mois</span></div>
                <p className="text-sm text-gray-500 mb-6">Pour les grandes entreprises</p>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 mt-1">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Offres d'emploi illimitées</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 mt-1">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>IA avancée et personnalisable</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 mt-1">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Intégration ATS complète</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 mt-1">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Utilisateurs illimités</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2 mt-1">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Support dédié</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full">Nous contacter</Button>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Prêt à optimiser votre recrutement ?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Essayez notre système ATS gratuitement pendant 14 jours et découvrez 
              comment il peut transformer votre processus de recrutement.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="secondary" size="lg" className="font-medium">
                Démarrer l'essai gratuit
              </Button>
              <Button variant="outline" size="lg" className="font-medium bg-transparent border-white text-white hover:bg-white/10">
                Demander une démo
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Recrutement;
