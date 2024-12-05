import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-heading text-5xl font-bold text-gray-900 mb-6">
                Construisez votre avenir professionnel
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Découvrez votre voie grâce à nos tests d'orientation et conseils personnalisés
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg">Commencer gratuitement</Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg">En savoir plus</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-center mb-12">
              Nos Services
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service) => (
                <div key={service.title} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    {service.icon}
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-heading text-lg font-semibold mb-4">Orientation Pro Congo</h3>
              <p className="text-gray-400">
                Votre partenaire pour l'orientation scolaire et professionnelle au Congo Brazzaville
              </p>
            </div>
            <div>
              <h4 className="font-heading text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tests d'orientation</li>
                <li>Bilan de compétences</li>
                <li>Conseils carrière</li>
                <li>Reconversion professionnelle</li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-lg font-semibold mb-4">Liens utiles</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about">À propos</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/privacy">Confidentialité</Link></li>
                <li><Link to="/terms">Conditions d'utilisation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Brazzaville, Congo</li>
                <li>contact@orientationprocongo.com</li>
                <li>+242 XX XXX XXX</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const services = [
  {
    title: "Tests d'orientation",
    description: "Découvrez vos talents et aspirations grâce à nos tests psychométriques",
    icon: <span className="text-2xl">🎯</span>,
  },
  {
    title: "Bilan de compétences",
    description: "Évaluez vos compétences et identifiez vos points forts",
    icon: <span className="text-2xl">📊</span>,
  },
  {
    title: "Conseils personnalisés",
    description: "Recevez des recommandations adaptées à votre profil",
    icon: <span className="text-2xl">💡</span>,
  },
];

export default Index;