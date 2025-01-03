import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

        {/* How it Works Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-center mb-12">
              Comment ça marche
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold text-xl">{index + 1}</span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
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

        {/* Statistics Section */}
        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              {statistics.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-lg opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-center mb-12">
              Témoignages
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600">{testimonial.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-heading text-3xl font-bold text-center mb-12">
              Questions fréquentes
            </h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible>
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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

const steps = [
  {
    title: "Inscription",
    description: "Créez votre compte gratuitement en quelques clics",
  },
  {
    title: "Test RIASEC",
    description: "Passez notre test d'orientation professionnelle",
  },
  {
    title: "Résultats",
    description: "Recevez une analyse détaillée de votre profil",
  },
  {
    title: "Accompagnement",
    description: "Bénéficiez de conseils personnalisés",
  },
];

const statistics = [
  {
    value: "5000+",
    label: "Utilisateurs",
  },
  {
    value: "1000+",
    label: "Tests complétés",
  },
  {
    value: "95%",
    label: "Satisfaction",
  },
  {
    value: "50+",
    label: "Partenaires",
  },
];

const testimonials = [
  {
    name: "Jean Makaya",
    role: "Étudiant",
    content: "Grâce à Orientation Pro Congo, j'ai pu identifier ma voie professionnelle et choisir la formation adaptée à mes aspirations.",
  },
  {
    name: "Marie Bouanga",
    role: "Professionnelle en reconversion",
    content: "Le test RIASEC m'a permis de mieux comprendre mes compétences et de me réorienter vers un domaine qui me correspond vraiment.",
  },
  {
    name: "Paul Moukala",
    role: "Lycéen",
    content: "Les conseils personnalisés m'ont aidé à faire les bons choix pour mon orientation post-bac. Je recommande vivement !",
  },
];

const faqs = [
  {
    question: "Comment fonctionne le test d'orientation ?",
    answer: "Notre test RIASEC évalue vos intérêts et aptitudes à travers une série de questions. Les résultats vous aident à identifier les domaines professionnels qui vous correspondent le mieux.",
  },
  {
    question: "Combien de temps dure le test ?",
    answer: "Le test prend environ 15-20 minutes à compléter. Vous pouvez le faire en plusieurs fois si nécessaire.",
  },
  {
    question: "Les résultats sont-ils fiables ?",
    answer: "Oui, notre test est basé sur la méthode RIASEC, une approche scientifique reconnue mondialement pour l'orientation professionnelle.",
  },
  {
    question: "Que faire après avoir reçu mes résultats ?",
    answer: "Vous pouvez consulter nos conseillers pour un accompagnement personnalisé et explorer les formations et métiers recommandés.",
  },
];

export default Index;