import { Book, FileText, Video, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ResourcesSection = () => {
  const resources = [
    {
      title: "Guides d'orientation",
      icon: <Book className="w-6 h-6" />,
      description: "Découvrez nos guides pratiques pour choisir votre voie"
    },
    {
      title: "Fiches métiers",
      icon: <FileText className="w-6 h-6" />,
      description: "Explorez les différents métiers et leurs perspectives"
    },
    {
      title: "Vidéos témoignages",
      icon: <Video className="w-6 h-6" />,
      description: "Regardez les témoignages de professionnels"
    },
    {
      title: "Actualités",
      icon: <Newspaper className="w-6 h-6" />,
      description: "Restez informé des dernières tendances"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl font-bold text-center mb-12">
          Ressources Pédagogiques
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {resources.map((resource) => (
            <div key={resource.title} className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {resource.icon}
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">{resource.title}</h3>
              <p className="text-gray-600 mb-4">{resource.description}</p>
              <Button variant="outline" size="sm">En savoir plus</Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};