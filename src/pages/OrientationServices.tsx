
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OrientationServices = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-blue-50 to-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">Nos Services d'Orientation</h1>
              <p className="text-xl text-gray-600 mb-8">
                Découvrez nos services personnalisés pour vous accompagner dans votre parcours professionnel
                et vous aider à prendre les meilleures décisions pour votre avenir.
              </p>
              <Link to="/appointment">
                <Button size="lg" className="font-medium">
                  Prendre rendez-vous
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nos Programmes d'Orientation</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c0 2 1 3 3 3h6c2 0 3-1 3-3v-5"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Orientation Scolaire</h3>
                <p className="text-gray-600 mb-4">
                  Accompagnement personnalisé pour les collégiens et lycéens dans leurs choix d'orientation, 
                  de filières et d'études supérieures.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Bilan d'orientation complet
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Tests d'aptitudes et d'intérêts
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Conseil pour Parcoursup
                  </li>
                </ul>
                <Button variant="outline" className="w-full">En savoir plus</Button>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Reconversion Professionnelle</h3>
                <p className="text-gray-600 mb-4">
                  Accompagnement sur-mesure pour les adultes souhaitant changer de métier 
                  ou de secteur d'activité.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Bilan de compétences
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Analyse de transférabilité
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Plan d'action personnalisé
                  </li>
                </ul>
                <Button variant="outline" className="w-full">En savoir plus</Button>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <polyline points="17 11 19 13 23 9"></polyline>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Coaching Professionnel</h3>
                <p className="text-gray-600 mb-4">
                  Accompagnement individuel pour développer votre potentiel, 
                  surmonter les obstacles et atteindre vos objectifs de carrière.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Définition d'objectifs SMART
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Développement du leadership
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Suivi personnalisé
                  </li>
                </ul>
                <Button variant="outline" className="w-full">En savoir plus</Button>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Orientation pour Jeunes Diplômés</h3>
                <p className="text-gray-600 mb-4">
                  Aide à l'insertion professionnelle pour les étudiants et jeunes diplômés 
                  entrant sur le marché du travail.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Optimisation du CV
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Préparation aux entretiens
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Stratégie de recherche d'emploi
                  </li>
                </ul>
                <Button variant="outline" className="w-full">En savoir plus</Button>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 4V2c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="12" y1="11" x2="12" y2="17"></line>
                    <line x1="9" y1="14" x2="15" y2="14"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Bilan de Compétences</h3>
                <p className="text-gray-600 mb-4">
                  Analyse approfondie de vos compétences, motivations et aspirations 
                  pour définir un projet professionnel réaliste et réalisable.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Tests psychométriques
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Synthèse écrite détaillée
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Éligible CPF
                  </li>
                </ul>
                <Button variant="outline" className="w-full">En savoir plus</Button>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Conseil en Évolution Professionnelle</h3>
                <p className="text-gray-600 mb-4">
                  Service gratuit d'accompagnement personnalisé pour tous les actifs, 
                  pour faire le point sur votre situation et vos perspectives d'évolution.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Information sur les dispositifs
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Définition de projet
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mr-2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Service 100% gratuit
                  </li>
                </ul>
                <Button variant="outline" className="w-full">En savoir plus</Button>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-b from-white to-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Nos Outils d'Évaluation</h2>
              <p className="text-lg text-gray-600 mb-8">
                Découvrez nos tests psychométriques validés scientifiquement pour vous aider 
                à mieux vous connaître et faire les bons choix d'orientation.
              </p>
              <Link to="/tests">
                <Button variant="secondary" size="lg">
                  Découvrir nos tests
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Témoignages</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                    <div>
                      <h4 className="font-bold">Marie L.</h4>
                      <p className="text-gray-500 text-sm">Étudiante, 19 ans</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "Grâce à l'orientation scolaire, j'ai pu trouver ma voie. Les conseillers 
                    ont su m'écouter et m'aider à identifier mes forces. Je suis maintenant 
                    dans une formation qui me passionne !"
                  </p>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                    <div>
                      <h4 className="font-bold">François D.</h4>
                      <p className="text-gray-500 text-sm">Cadre en reconversion, 42 ans</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    "Le bilan de compétences a été une révélation pour moi. J'étais perdu 
                    après 15 ans dans le même secteur. Aujourd'hui, j'ai retrouvé la motivation 
                    et je me suis lancé dans un domaine qui correspond vraiment à mes valeurs."
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Prêt à démarrer votre parcours d'orientation ?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Nos conseillers sont disponibles pour vous accompagner dans votre démarche d'orientation 
              ou de reconversion professionnelle.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/appointment">
                <Button variant="secondary" size="lg" className="font-medium">
                  Prendre rendez-vous
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="font-medium bg-transparent border-white text-white hover:bg-white/10">
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OrientationServices;
