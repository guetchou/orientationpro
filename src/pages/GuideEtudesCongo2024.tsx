import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Briefcase, Globe, Users, Info, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Configuration des animations
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Données structurées
const navigationLinks = [
  { id: "systeme-lmd", label: "Système LMD" },
  { id: "etablissements", label: "Établissements" },
  { id: "filieres", label: "Filières" },
  { id: "procedures", label: "Procédures" },
  { id: "conseils", label: "Conseils" },
  { id: "ressources", label: "Ressources" }
];

const sections = [
  {
    id: "introduction",
    icon: Info,
    iconColor: "text-blue-500",
    bgColor: "bg-white",
    title: "Introduction",
    content: (
      <>
        <p className="mb-6 text-gray-700 leading-relaxed">
          L'enseignement supérieur au Congo évolue rapidement pour répondre aux besoins d'une jeunesse ambitieuse et d'un marché du travail en mutation.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            "50+ établissements accrédités",
            "Filières classiques et émergentes",
            "Réformes du système LMD",
            "Opportunités de bourses"
          ].map((item, i) => (
            <motion.li 
              key={i}
              variants={fadeIn}
              className="flex items-center p-4 bg-blue-50 rounded-lg"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              {item}
            </motion.li>
          ))}
        </ul>
      </>
    )
  },
  {
    id: "systeme-lmd",
    icon: GraduationCap,
    iconColor: "text-emerald-500",
    bgColor: "bg-gray-50",
    title: "Système LMD",
    content: (
      <>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { title: "Licence", duration: "3 ans", credits: "180 ECTS", color: "bg-blue-100" },
            { title: "Master", duration: "2 ans", credits: "120 ECTS", color: "bg-emerald-100" },
            { title: "Doctorat", duration: "3 ans", credits: "Recherche", color: "bg-purple-100" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              variants={fadeIn}
              className={`p-6 rounded-xl ${item.color} border border-transparent hover:border-gray-300 transition-all`}
            >
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-700">{item.duration}</p>
              <p className="text-gray-600 text-sm">{item.credits}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-gray-700">
          Nouveautés 2024 : renforcement des filières numériques et création de licences professionnelles.
        </p>
      </>
    )
  }
];

const institutions = [
  {
    title: "Université Marien Ngouabi",
    location: "Brazzaville",
    specialties: ["Sciences", "Lettres", "Droit", "Médecine"],
    url: "www.umng.cg"
  },
  {
    title: "Université Denis Sassou Nguesso",
    location: "Pointe-Noire",
    specialties: ["Sciences", "Technologies", "Gestion"],
    url: ""
  },
  {
    title: "Institut Supérieur de Gestion",
    location: "Brazzaville",
    specialties: ["Commerce", "Finance", "Marketing"],
    url: ""
  },
  {
    title: "Écoles privées accréditées",
    location: "Divers",
    specialties: ["ESGAE", "ESG", "ISTA"],
    url: ""
  }
];

export default function GuideEtudesCongo2024() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-emerald-400/10 -skew-y-3"></div>
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.h1 
                variants={fadeIn}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight"
              >
                Guide des Études Supérieures <span className="text-blue-600">au Congo 2024</span>
              </motion.h1>
              
              <motion.p 
                variants={fadeIn}
                className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
              >
                Tout ce dont vous avez besoin pour réussir votre parcours académique
              </motion.p>
              
              <motion.div 
                variants={fadeIn}
                className="flex flex-wrap justify-center gap-3 mb-8"
              >
                {navigationLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    className="px-5 py-2.5 rounded-full bg-white text-gray-800 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-blue-300 font-medium"
                  >
                    {link.label}
                  </a>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Sections dynamiques */}
        {sections.map((section) => (
          <motion.section 
            key={section.id}
            id={section.id}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className={`py-16 ${section.bgColor}`}
          >
            <div className={`container mx-auto px-4 max-w-6xl`}>
              <motion.div variants={fadeIn} className="flex items-center mb-8">
                <div className={`p-3 rounded-lg ${section.iconColor.replace('text', 'bg')}/10 mr-4`}>
                  <section.icon className={`w-6 h-6 ${section.iconColor}`} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{section.title}</h2>
              </motion.div>
              
              <motion.div variants={fadeIn}>
                {section.content}
              </motion.div>
            </div>
          </motion.section>
        ))}

        {/* Établissements */}
        <motion.section 
          id="etablissements"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="py-16 bg-white"
        >
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div variants={fadeIn} className="flex items-center mb-8">
              <div className="p-3 rounded-lg bg-blue-500/10 mr-4">
                <Globe className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Établissements d'enseignement</h2>
            </motion.div>
            
            <motion.p variants={fadeIn} className="text-xl text-gray-600 mb-12 max-w-3xl">
              Découvrez les principales institutions d'enseignement supérieur au Congo
            </motion.p>
            
            <motion.div 
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {institutions.map((institution, index) => (
                <motion.div 
                  key={index}
                  variants={fadeIn}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card className="h-full transition-all duration-300 group-hover:shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-xl">{institution.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center text-gray-600">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          {institution.location}
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Spécialités :</h4>
                          <ul className="flex flex-wrap gap-2">
                            {institution.specialties.map((spec, i) => (
                              <li key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                                {spec}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {institution.url && (
                          <a 
                            href={`https://${institution.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:underline mt-4"
                          >
                            Visiter le site
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Autres sections... */}
      </main>
      
    </div>
  );
}