import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Briefcase, Globe, Users, Info, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function GuideEtudesCongo2024() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-blue-50 via-white to-green-50">
        <section className="py-16 bg-gradient-to-br from-blue-100 via-white to-green-100">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Guide des Études Supérieures au Congo 2024</h1>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
              Toutes les informations essentielles pour réussir votre parcours dans l'enseignement supérieur congolais : filières, établissements, démarches, conseils et nouveautés 2024.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <a href="#systeme-lmd" className="btn btn-outline-primary">Système LMD</a>
              <a href="#etablissements" className="btn btn-outline-primary">Établissements</a>
              <a href="#filieres" className="btn btn-outline-primary">Filières & Débouchés</a>
              <a href="#procedures" className="btn btn-outline-primary">Procédures</a>
              <a href="#conseils" className="btn btn-outline-primary">Conseils</a>
              <a href="#ressources" className="btn btn-outline-primary">Ressources</a>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-12 bg-white" id="introduction">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center"><Info className="w-6 h-6 mr-2 text-blue-600" /> Introduction</h2>
            <p className="mb-4 text-gray-700">
              L’enseignement supérieur au Congo évolue rapidement pour répondre aux besoins d’une jeunesse ambitieuse et d’un marché du travail en mutation. Ce guide 2024 vous accompagne à chaque étape : choix d’une filière, inscription, vie étudiante, financement, et insertion professionnelle.
            </p>
            <ul className="list-disc ml-6 text-gray-700 mb-4">
              <li>Plus de 50 établissements publics et privés accrédités</li>
              <li>Des filières classiques et émergentes (numérique, santé, environnement, etc.)</li>
              <li>Réformes récentes du système LMD</li>
              <li>Opportunités de bourses et de mobilité</li>
            </ul>
            <p className="text-gray-700">Découvrez tout ce qu’il faut savoir pour réussir vos études supérieures au Congo en 2024 !</p>
          </div>
        </section>

        {/* Système LMD */}
        <section className="py-12 bg-gray-50" id="systeme-lmd">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center"><GraduationCap className="w-6 h-6 mr-2 text-green-600" /> Le système LMD au Congo</h2>
            <p className="mb-4 text-gray-700">
              Le système LMD (Licence-Master-Doctorat) structure l’enseignement supérieur congolais depuis plusieurs années. Il favorise la mobilité, la professionnalisation et l’harmonisation avec les standards internationaux.
            </p>
            <ul className="list-disc ml-6 text-gray-700 mb-4">
              <li><b>Licence</b> : 3 ans après le bac (180 crédits ECTS)</li>
              <li><b>Master</b> : 2 ans après la licence (120 crédits ECTS)</li>
              <li><b>Doctorat</b> : 3 ans après le master (recherche, innovation)</li>
            </ul>
            <p className="text-gray-700 mb-2">Le LMD facilite les passerelles entre filières et l’insertion professionnelle grâce à des stages et projets intégrés.</p>
            <p className="text-gray-700">Nouveautés 2024 : renforcement des filières numériques, création de licences professionnelles, et ouverture de nouveaux masters spécialisés.</p>
          </div>
        </section>

        {/* Établissements */}
        <section className="py-12 bg-white" id="etablissements">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center"><Globe className="w-6 h-6 mr-2 text-blue-600" /> Établissements d’enseignement supérieur</h2>
            <p className="mb-4 text-gray-700">Le Congo compte de nombreux établissements publics et privés : universités, instituts, écoles spécialisées…</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Université Marien Ngouabi (UMNG)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-gray-700 text-sm list-disc ml-4">
                    <li>Facultés : Sciences, Lettres, Droit, Médecine, etc.</li>
                    <li>Campus principal à Brazzaville</li>
                    <li>www.umng.cg</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Université Denis Sassou Nguesso</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-gray-700 text-sm list-disc ml-4">
                    <li>Filières scientifiques, technologiques et de gestion</li>
                    <li>Pointe-Noire</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Institut Supérieur de Gestion (ISG)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-gray-700 text-sm list-disc ml-4">
                    <li>Commerce, gestion, finance, marketing</li>
                    <li>Brazzaville</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Écoles privées accréditées</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-gray-700 text-sm list-disc ml-4">
                    <li>ESGAE, ESG, ISTA, etc.</li>
                    <li>Formations professionnalisantes</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <p className="mt-6 text-gray-700">Retrouvez la liste complète et les contacts sur <Link to="/establishments" className="text-blue-600 underline">l’annuaire des établissements</Link>.</p>
          </div>
        </section>

        {/* Filières et débouchés */}
        <section className="py-12 bg-gray-50" id="filieres">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center"><BookOpen className="w-6 h-6 mr-2 text-green-600" /> Filières & débouchés</h2>
            <p className="mb-4 text-gray-700">Le choix d’une filière doit tenir compte de vos intérêts, du marché de l’emploi et des perspectives d’évolution.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Sciences & Technologies</CardTitle></CardHeader>
                <CardContent>
                  <ul className="text-gray-700 text-sm list-disc ml-4">
                    <li>Informatique, génie civil, électronique, mathématiques</li>
                    <li>Débouchés : ingénieur, développeur, technicien, enseignant</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Santé & Social</CardTitle></CardHeader>
                <CardContent>
                  <ul className="text-gray-700 text-sm list-disc ml-4">
                    <li>Médecine, pharmacie, infirmier, travail social</li>
                    <li>Débouchés : médecin, pharmacien, infirmier, assistant social</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Économie & Gestion</CardTitle></CardHeader>
                <CardContent>
                  <ul className="text-gray-700 text-sm list-disc ml-4">
                    <li>Comptabilité, finance, management, marketing</li>
                    <li>Débouchés : comptable, gestionnaire, chef de projet</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Sciences humaines & Lettres</CardTitle></CardHeader>
                <CardContent>
                  <ul className="text-gray-700 text-sm list-disc ml-4">
                    <li>Droit, histoire, langues, communication</li>
                    <li>Débouchés : juriste, enseignant, journaliste</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Filières émergentes</CardTitle></CardHeader>
                <CardContent>
                  <ul className="text-gray-700 text-sm list-disc ml-4">
                    <li>Numérique, environnement, énergies renouvelables</li>
                    <li>Débouchés : data analyst, expert environnement, etc.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <p className="mt-6 text-gray-700">Pour vous aider à choisir, <Link to="/tests" className="text-green-600 underline">passez un test d’orientation</Link> ou consultez un <Link to="/conseillers" className="text-green-600 underline">conseiller</Link>.</p>
          </div>
        </section>

        {/* Procédures d’inscription, bourses, financements */}
        <section className="py-12 bg-white" id="procedures">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center"><Users className="w-6 h-6 mr-2 text-blue-600" /> Procédures, bourses & financements</h2>
            <ul className="list-disc ml-6 text-gray-700 mb-4">
              <li><b>Inscription</b> : Dossier, calendrier, frais, équivalences</li>
              <li><b>Bourses</b> : Critères, démarches, bourses nationales et internationales</li>
              <li><b>Financement</b> : Prêts étudiants, aides, jobs étudiants</li>
              <li><b>Mobilité</b> : Programmes d’échange, partenariats Afrique/Europe</li>
            </ul>
            <p className="text-gray-700">Renseignez-vous auprès des établissements et du ministère pour les dernières modalités 2024.</p>
          </div>
        </section>

        {/* Conseils pratiques */}
        <section className="py-12 bg-gray-50" id="conseils">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center"><Briefcase className="w-6 h-6 mr-2 text-green-600" /> Conseils pratiques</h2>
            <ul className="list-disc ml-6 text-gray-700 mb-4">
              <li>Bien choisir sa filière selon ses intérêts et le marché</li>
              <li>Préparer son dossier à l’avance</li>
              <li>Se renseigner sur les logements étudiants</li>
              <li>Participer aux forums, salons, journées portes ouvertes</li>
              <li>Développer son réseau (stages, associations, alumni)</li>
              <li>Prendre soin de sa santé mentale et physique</li>
            </ul>
            <p className="text-gray-700">N’hésitez pas à demander conseil à des étudiants, enseignants ou professionnels du secteur.</p>
          </div>
        </section>

        {/* Ressources utiles */}
        <section className="py-12 bg-white" id="ressources">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center"><ArrowRight className="w-6 h-6 mr-2 text-blue-600" /> Ressources utiles</h2>
            <ul className="list-disc ml-6 text-gray-700 mb-4">
              <li><a href="https://www.mesrs.gouv.cg/" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Ministère de l’Enseignement Supérieur (MESRS)</a></li>
              <li><a href="https://www.umng.cg/" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Université Marien Ngouabi</a></li>
              <li><a href="https://www.campusfrance.org/fr" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Campus France</a></li>
              <li><a href="https://www.auf.org/" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Agence Universitaire de la Francophonie</a></li>
              <li><Link to="/establishments" className="text-blue-600 underline">Annuaire des établissements</Link></li>
              <li><Link to="/conseillers" className="text-blue-600 underline">Contacter un conseiller</Link></li>
            </ul>
            <p className="text-gray-700">Ce guide est mis à jour régulièrement pour refléter les évolutions du système congolais.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 