
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, ChevronRight, GraduationCap, BadgeCheck, Briefcase, ArrowRight } from "lucide-react";

export default function OrientationGuide() {
  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/10 to-background py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Guide d'orientation professionnelle</h1>
              <p className="text-lg text-gray-700 mb-8">
                Découvrez les ressources essentielles pour vous aider à faire les bons choix pour votre avenir professionnel
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg">
                  <Link to="/tests">Passer un test d'orientation</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#sections">Parcourir le guide</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Introduction Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Pourquoi l'orientation est cruciale</h2>
              <p className="text-gray-700 mb-4">
                L'orientation professionnelle est une étape déterminante dans la construction de votre parcours. 
                Elle vous permet de découvrir les métiers et les formations en adéquation avec vos aspirations, 
                vos compétences et votre personnalité.
              </p>
              <p className="text-gray-700 mb-4">
                Ce guide vise à vous accompagner dans cette démarche en vous proposant des ressources, 
                des conseils et des outils adaptés à votre situation.
              </p>
              <div className="mt-8 flex flex-col md:flex-row gap-6">
                <div className="flex-1 p-5 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    Pour les étudiants
                  </h3>
                  <p className="text-sm text-gray-600">
                    Découvrez les formations qui correspondent à vos centres d'intérêt et préparez votre avenir professionnel.
                  </p>
                </div>
                <div className="flex-1 p-5 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    Pour les actifs
                  </h3>
                  <p className="text-sm text-gray-600">
                    Explorez de nouvelles opportunités, réorientez votre carrière ou validez vos acquis d'expérience.
                  </p>
                </div>
                <div className="flex-1 p-5 border rounded-lg">
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    Pour les seniors
                  </h3>
                  <p className="text-sm text-gray-600">
                    Continuez à valoriser votre expérience, préparez votre transition ou découvrez de nouvelles activités.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Guide Sections */}
        <section id="sections" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Sections du guide</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-primary" />
                    Connaître ses aspirations
                  </CardTitle>
                  <CardDescription>Outils pour mieux se comprendre</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <Link to="/test-riasec" className="text-sm hover:underline">Test d'intérêts professionnels (RIASEC)</Link>
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <Link to="/test-multiple" className="text-sm hover:underline">Test des intelligences multiples</Link>
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <Link to="/test-learning" className="text-sm hover:underline">Test de style d'apprentissage</Link>
                    </li>
                  </ul>
                  <Button variant="link" className="mt-4 pl-0" asChild>
                    <Link to="/tests">
                      Voir tous les tests
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-primary" />
                    Explorer les formations
                  </CardTitle>
                  <CardDescription>Trouvez la formation idéale</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <Link to="/establishments" className="text-sm hover:underline">Annuaire des établissements</Link>
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <span className="text-sm">Filières d'études et débouchés</span>
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <span className="text-sm">Financer ses études</span>
                    </li>
                  </ul>
                  <Button variant="link" className="mt-4 pl-0" asChild>
                    <Link to="/establishments">
                      Explorer les établissements
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-primary" />
                    Découvrir les métiers
                  </CardTitle>
                  <CardDescription>Perspectives professionnelles</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <span className="text-sm">Fiches métiers</span>
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <span className="text-sm">Métiers d'avenir</span>
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <Link to="/test-no-diploma" className="text-sm hover:underline">Métiers sans diplôme</Link>
                    </li>
                  </ul>
                  <Button variant="link" className="mt-4 pl-0" asChild>
                    <Link to="/blog">
                      Lire nos articles
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <BadgeCheck className="w-5 h-5 mr-2 text-primary" />
                    Construire son projet
                  </CardTitle>
                  <CardDescription>Méthodes et conseils</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <span className="text-sm">Définir ses objectifs</span>
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <span className="text-sm">CV et lettre de motivation</span>
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <span className="text-sm">Entretiens et candidatures</span>
                    </li>
                  </ul>
                  <Button variant="link" className="mt-4 pl-0" asChild>
                    <Link to="/conseillers">
                      Consulter un conseiller
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-primary" />
                    Reconversion professionnelle
                  </CardTitle>
                  <CardDescription>Changer de voie</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <Link to="/test-career-transition" className="text-sm hover:underline">Test de transition de carrière</Link>
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <span className="text-sm">Validation des acquis (VAE)</span>
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <span className="text-sm">Formation continue</span>
                    </li>
                  </ul>
                  <Button variant="link" className="mt-4 pl-0" asChild>
                    <Link to="/test-career-transition">
                      Évaluer votre reconversion
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-primary" />
                    Seniors et retraite active
                  </CardTitle>
                  <CardDescription>Valoriser son expérience</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <Link to="/test-senior-employment" className="text-sm hover:underline">Test d'emploi senior</Link>
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <span className="text-sm">Mentorat et transmission</span>
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="w-4 h-4 mr-2 text-primary" />
                      <span className="text-sm">Activités post-carrière</span>
                    </li>
                  </ul>
                  <Button variant="link" className="mt-4 pl-0" asChild>
                    <Link to="/test-senior-employment">
                      Explorer les possibilités
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-primary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Besoin d'un accompagnement personnalisé ?</h2>
              <p className="text-lg mb-8">
                Nos conseillers d'orientation sont à votre disposition pour vous aider à définir 
                votre projet professionnel et vous accompagner dans sa réalisation.
              </p>
              <Button size="lg" asChild>
                <Link to="/conseillers">Prendre rendez-vous avec un conseiller</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
    </div>
  );
}
