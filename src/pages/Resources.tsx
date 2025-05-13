
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/Footer'; // Correction de l'import
import { Download, FileText, Video, BookOpen, Search } from 'lucide-react';

const Resources = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">Ressources d'Orientation</h1>
              <p className="text-xl text-gray-600 mb-8">
                Une sélection d'outils, guides et ressources pour vous aider dans votre
                parcours d'orientation professionnelle.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Guides et Tutoriels</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="overflow-hidden">
                <div className="h-48 bg-blue-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Guide de rédaction de CV</h3>
                  <p className="text-gray-600 mb-4">
                    Apprenez à rédiger un CV percutant qui mettra en valeur vos compétences
                    et expériences pour maximiser vos chances de décrocher un entretien.
                  </p>
                  <Button variant="outline" className="w-full">Télécharger le guide</Button>
                </div>
              </Card>
              
              <Card className="overflow-hidden">
                <div className="h-48 bg-green-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Se préparer à un entretien</h3>
                  <p className="text-gray-600 mb-4">
                    Techniques et conseils pour aborder sereinement vos entretiens d'embauche
                    et mettre toutes les chances de votre côté.
                  </p>
                  <Button variant="outline" className="w-full">Consulter le guide</Button>
                </div>
              </Card>
              
              <Card className="overflow-hidden">
                <div className="h-48 bg-purple-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Financer sa formation</h3>
                  <p className="text-gray-600 mb-4">
                    Un guide complet sur les différents dispositifs de financement pour votre
                    formation ou reconversion (CPF, Transition Pro, Pôle Emploi...).
                  </p>
                  <Button variant="outline" className="w-full">Consulter le guide</Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Outils d'Auto-Évaluation</h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-6 border-l-4 border-primary">
                <h3 className="text-xl font-bold mb-3">Tests de personnalité</h3>
                <p className="text-gray-600 mb-4">
                  Nos tests psychométriques vous aident à mieux vous connaître et à identifier
                  vos forces, valeurs et préférences professionnelles.
                </p>
                <Link to="/tests">
                  <Button variant="default" className="w-full">Découvrir nos tests</Button>
                </Link>
              </Card>
              
              <Card className="p-6 border-l-4 border-secondary">
                <h3 className="text-xl font-bold mb-3">Questionnaires d'intérêts</h3>
                <p className="text-gray-600 mb-4">
                  Ces questionnaires vous permettent d'explorer vos centres d'intérêt et de les
                  relier à des domaines professionnels correspondants.
                </p>
                <Button variant="default" className="w-full">Accéder aux questionnaires</Button>
              </Card>
              
              <Card className="p-6 border-l-4 border-green-500">
                <h3 className="text-xl font-bold mb-3">Fiches métiers interactives</h3>
                <p className="text-gray-600 mb-4">
                  Explorez notre base de données de métiers avec des descriptions détaillées,
                  les qualifications requises et les perspectives d'emploi.
                </p>
                <Button variant="default" className="w-full">Explorer les métiers</Button>
              </Card>
              
              <Card className="p-6 border-l-4 border-amber-500">
                <h3 className="text-xl font-bold mb-3">Auto-évaluation des compétences</h3>
                <p className="text-gray-600 mb-4">
                  Cet outil vous aide à identifier et évaluer vos compétences techniques et
                  transversales pour mieux les valoriser.
                </p>
                <Button variant="default" className="w-full">Évaluer mes compétences</Button>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Ressources par Profil</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Lycéens & Étudiants</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Guide Parcoursup</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Choisir sa filière d'études</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Réussir son premier stage</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">Voir toutes les ressources</Button>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">En Reconversion</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Bilan de compétences</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Dispositifs de financement</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Métiers qui recrutent</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">Voir toutes les ressources</Button>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Demandeurs d'Emploi</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Techniques de recherche d'emploi</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Aides à la formation</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Préparation aux entretiens</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">Voir toutes les ressources</Button>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Jeunes Diplômés</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Premier emploi</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Réseaux professionnels</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Négocier son salaire</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">Voir toutes les ressources</Button>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-pink-100 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-600">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Entrepreneurs</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Création d'entreprise</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Business plan</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Aides et financement</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">Voir toutes les ressources</Button>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Seniors</h3>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Emploi après 50 ans</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Préparation à la retraite</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    <span>Valoriser son expérience</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">Voir toutes les ressources</Button>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Liens Utiles</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <Card className="p-4 hover:shadow-md transition-shadow">
                <h3 className="font-bold mb-2">Orientation</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-primary hover:underline">ONISEP</a></li>
                  <li><a href="#" className="text-primary hover:underline">France Travail</a></li>
                  <li><a href="#" className="text-primary hover:underline">Mon Compte Formation</a></li>
                  <li><a href="#" className="text-primary hover:underline">CIDJ</a></li>
                </ul>
              </Card>
              
              <Card className="p-4 hover:shadow-md transition-shadow">
                <h3 className="font-bold mb-2">Formation</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-primary hover:underline">AFPA</a></li>
                  <li><a href="#" className="text-primary hover:underline">CNAM</a></li>
                  <li><a href="#" className="text-primary hover:underline">Transition Pro</a></li>
                  <li><a href="#" className="text-primary hover:underline">Certificat CléA</a></li>
                </ul>
              </Card>
              
              <Card className="p-4 hover:shadow-md transition-shadow">
                <h3 className="font-bold mb-2">Emploi</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-primary hover:underline">France Travail</a></li>
                  <li><a href="#" className="text-primary hover:underline">APEC</a></li>
                  <li><a href="#" className="text-primary hover:underline">Indeed</a></li>
                  <li><a href="#" className="text-primary hover:underline">LinkedIn</a></li>
                </ul>
              </Card>
              
              <Card className="p-4 hover:shadow-md transition-shadow">
                <h3 className="font-bold mb-2">Entrepreneuriat</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-primary hover:underline">BPI France</a></li>
                  <li><a href="#" className="text-primary hover:underline">CCI</a></li>
                  <li><a href="#" className="text-primary hover:underline">Auto-entrepreneur</a></li>
                  <li><a href="#" className="text-primary hover:underline">ADIE</a></li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-t from-blue-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Besoin d'un accompagnement personnalisé ?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Nos conseillers sont à votre disposition pour vous guider dans votre orientation
              professionnelle et vous aider à trouver les ressources les plus adaptées à votre situation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/conseillers">
                <Button size="lg">Consulter un conseiller</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">Nous contacter</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Resources;
