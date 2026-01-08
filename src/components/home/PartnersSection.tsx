
import { Button } from "@/components/ui/button";
import { Building2, GraduationCap, School2, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export const PartnersSection = () => {
  const partners = [
    {
      name: "Universités",
      icon: <GraduationCap className="w-12 h-12 text-primary" />,
      count: "10+",
      examples: ["Université Marien Ngouabi", "Institut Supérieur de Gestion", "ESGAE"]
    },
    {
      name: "Écoles",
      icon: <School2 className="w-12 h-12 text-primary" />,
      count: "25+",
      examples: ["Lycée Savorgnan", "Lycée Chaminade", "École Normale Supérieure"]
    },
    {
      name: "Entreprises",
      icon: <Building2 className="w-12 h-12 text-primary" />,
      count: "50+",
      examples: ["Total E&P Congo", "Airtel Congo", "Bolloré Africa Logistics"]
    },
    {
      name: "Associations",
      icon: <Users className="w-12 h-12 text-primary" />,
      count: "15+",
      examples: ["AJEC", "Forum des Jeunes Entreprises", "Association des Étudiants"]
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Nos Partenaires
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Un réseau solide d'institutions et d'organisations qui nous font confiance pour accompagner les talents de demain
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="text-center p-6 bg-white rounded-lg hover:shadow-lg transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    {partner.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{partner.name}</h3>
                <p className="text-3xl font-bold text-primary mb-4">{partner.count}</p>
                <div className="space-y-2">
                  {partner.examples.map((example) => (
                    <p key={example} className="text-sm text-gray-600">{example}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center space-y-6">
          <p className="text-gray-600">
            Vous souhaitez devenir partenaire et contribuer à l'orientation des jeunes ?
          </p>
          <Button variant="outline" size="lg" className="gap-2">
            Devenir partenaire
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};
