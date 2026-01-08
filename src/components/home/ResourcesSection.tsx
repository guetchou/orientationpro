
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, VideoIcon, FileText, Download, Share2, BookMarked, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const ResourcesSection = () => {
  const resources = [
    {
      title: "Guide des Études Supérieures au Congo 2024",
      type: "guide",
      icon: <BookOpen className="w-6 h-6 text-primary" />,
      description: "Un panorama complet du système éducatif supérieur congolais, avec analyse des filières, universités, et perspectives professionnelles.",
      format: "PDF",
      size: "2.5 MB",
      downloadCount: "1.2k",
      tags: ["Orientation", "Études", "Guide"],
      isNew: true,
      link: "/resources"
    },
    {
      title: "Les Métiers d'Avenir au Congo",
      type: "video",
      icon: <VideoIcon className="w-6 h-6 text-red-500" />,
      description: "Analyse des secteurs économiques en croissance et des compétences recherchées par les employeurs congolais.",
      duration: "15 min",
      views: "3.5k",
      tags: ["Carrière", "Tendances", "Emploi"],
      isPopular: true,
      link: "/resources"
    },
    {
      title: "Kit de Préparation aux Entretiens",
      type: "toolkit",
      icon: <FileText className="w-6 h-6 text-green-500" />,
      description: "Outils pratiques, modèles de CV adaptés au contexte congolais et conseils pour réussir vos entretiens d'embauche.",
      format: "ZIP",
      size: "4.8 MB",
      downloadCount: "850",
      tags: ["Emploi", "Entretien", "Conseils"],
      link: "/resources"
    },
    {
      title: "Parcours de Réussite Académique",
      type: "course",
      icon: <GraduationCap className="w-6 h-6 text-orange-500" />,
      description: "Formation en ligne gratuite pour développer des méthodes d'étude efficaces et réussir dans le système éducatif congolais.",
      duration: "4h",
      modules: "6 modules",
      tags: ["Formation", "Développement", "Études"],
      link: "/resources"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold mb-4">
            Ressources Gratuites
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Des outils et guides pratiques pour vous accompagner dans votre parcours d'orientation et votre développement professionnel, adaptés au contexte congolais
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {resources.map((resource, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {resource.icon}
                    </div>
                    {resource.isNew && (
                      <Badge className="bg-green-500 text-white hover:bg-green-600">Nouveau</Badge>
                    )}
                    {resource.isPopular && (
                      <Badge className="bg-primary text-white hover:bg-primary/90">Populaire</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 group-hover:text-primary transition-colors">
                    {resource.title}
                  </CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {resource.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-600">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    {resource.format && (
                      <div className="flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        <span>{resource.format} • {resource.size}</span>
                      </div>
                    )}
                    {resource.duration && (
                      <div className="flex items-center">
                        <VideoIcon className="w-4 h-4 mr-1" />
                        <span>{resource.duration}</span>
                      </div>
                    )}
                    {resource.modules && (
                      <div className="flex items-center">
                        <BookMarked className="w-4 h-4 mr-1" />
                        <span>{resource.modules}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {resource.downloadCount && (
                      <span className="text-sm text-gray-500">
                        {resource.downloadCount} téléchargements
                      </span>
                    )}
                    {resource.views && (
                      <span className="text-sm text-gray-500">
                        {resource.views} vues
                      </span>
                    )}
                    <Button size="sm" variant="ghost" className="ml-auto group-hover:translate-x-1 transition-transform" asChild>
                      <Link to={resource.link}>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" className="gap-2" asChild>
            <Link to="/resources">
              Explorer toutes les ressources
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
