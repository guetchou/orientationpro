
import React from 'react';
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">À Propos de Nous</h1>
              <p className="text-xl text-gray-600 mb-8">
                Nous sommes un service d'orientation professionnelle dédié à aider les individus 
                à trouver leur voie et à réaliser leur potentiel.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Notre Mission</h2>
                <p className="text-lg text-gray-600 mb-4">
                  Notre mission est de fournir une orientation professionnelle personnalisée et de qualité, 
                  accessible à tous. Nous croyons que chaque personne mérite de trouver un parcours professionnel 
                  épanouissant qui correspond à ses compétences, ses intérêts et ses valeurs.
                </p>
                <p className="text-lg text-gray-600">
                  Grâce à nos outils d'évaluation scientifiques et à nos conseillers experts, 
                  nous guidons nos clients vers des choix de carrière éclairés et des opportunités 
                  professionnelles enrichissantes.
                </p>
              </div>
              <div className="rounded-lg overflow-hidden shadow-xl">
                <AspectRatio ratio={16/9}>
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                    alt="Notre équipe en réunion" 
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nos Valeurs</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-primary text-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-3">Excellence</h3>
                <p className="text-gray-600 text-center">
                  Nous nous engageons à fournir les services d'orientation professionnelle 
                  les plus précis, actuels et efficaces, basés sur des méthodes scientifiquement validées.
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-primary text-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-3">Inclusion</h3>
                <p className="text-gray-600 text-center">
                  Nous accueillons et valorisons la diversité sous toutes ses formes, 
                  et adaptons nos services pour répondre aux besoins uniques de chaque personne.
                </p>
              </Card>
              
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-primary text-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-center mb-3">Confidentialité</h3>
                <p className="text-gray-600 text-center">
                  Nous respectons la vie privée de nos clients et assurons la protection 
                  des informations personnelles partagées avec nous.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Notre Histoire</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-gray-600 mb-6">
                Fondée en 2020, notre organisation est née de la conviction que l'orientation 
                professionnelle devrait être accessible à tous, quelle que soit leur situation.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Initialement concentrés sur les services d'orientation pour étudiants, nous avons 
                rapidement élargi notre offre pour inclure des services pour les professionnels en 
                reconversion, les seniors, et les entrepreneurs.
              </p>
              <p className="text-lg text-gray-600">
                Aujourd'hui, nous sommes fiers de soutenir des milliers de personnes chaque année 
                dans leur parcours professionnel, en utilisant une combinaison de tests psychométriques 
                avancés, de conseil personnalisé et de ressources innovantes.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-t from-blue-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Notre Équipe</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Nous sommes une équipe de psychologues, conseillers d'orientation et experts en 
              ressources humaines dédiés à votre réussite professionnelle.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group">
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <AspectRatio ratio={1/1}>
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" 
                      alt="Sophie Martin" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </AspectRatio>
                </div>
                <h3 className="text-xl font-bold">Sophie Martin</h3>
                <p className="text-primary">Directrice</p>
              </div>
              
              <div className="group">
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <AspectRatio ratio={1/1}>
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" 
                      alt="Thomas Dubois" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </AspectRatio>
                </div>
                <h3 className="text-xl font-bold">Thomas Dubois</h3>
                <p className="text-primary">Responsable Psychométrie</p>
              </div>
              
              <div className="group">
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <AspectRatio ratio={1/1}>
                    <img 
                      src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" 
                      alt="Amélie Laurent" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </AspectRatio>
                </div>
                <h3 className="text-xl font-bold">Amélie Laurent</h3>
                <p className="text-primary">Conseillère Principale</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
