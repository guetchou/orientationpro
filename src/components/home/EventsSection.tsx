import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

export const EventsSection = () => {
  const events = [
    {
      id: 1,
      title: "Atelier Orientation Post-Bac",
      description: "Découvrez les meilleures filières universitaires et les débouchés professionnels",
      date: "15 Janvier 2025",
      time: "14h00 - 17h00",
      location: "Centre Culturel Français, Brazzaville",
      participants: 45,
      image: "/images/carousel/orientation-1.png",
      status: "upcoming",
      category: "Atelier"
    },
    {
      id: 2,
      title: "Salon des Métiers du Numérique",
      description: "Rencontrez des professionnels du secteur tech et découvrez les opportunités",
      date: "22 Janvier 2025",
      time: "09h00 - 18h00",
      location: "Palais des Congrès, Pointe-Noire",
      participants: 120,
      image: "/images/carousel/orientation-2.png",
      status: "upcoming",
      category: "Salon"
    },
    {
      id: 3,
      title: "Conférence : L'Avenir du Travail",
      description: "Les métiers de demain et les compétences nécessaires pour réussir",
      date: "28 Janvier 2025",
      time: "19h00 - 21h00",
      location: "Université Marien Ngouabi",
      participants: 80,
      image: "/images/carousel/orientation-3.png",
      status: "upcoming",
      category: "Conférence"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-white to-blue-50 relative overflow-hidden">
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Événements & Ateliers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Participez à nos événements en direct et rencontrez des experts pour enrichir votre parcours d'orientation
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {events.map((event, index) => (
            <motion.div key={event.id} variants={cardVariants}>
              <Card className="group bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Image de l'événement */}
                <div className="relative h-48 overflow-hidden">
                  <div 
                    className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                    style={{
                      backgroundImage: `url('${event.image}')`
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Badge de catégorie */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                      {event.category}
                    </span>
                  </div>
                  
                  {/* Statut */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                      En direct
                    </span>
                  </div>
                  
                  {/* Overlay au hover */}
                  <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="rounded-full">
                      <Play className="w-4 h-4 mr-2" />
                      Voir détails
                    </Button>
                  </div>
                </div>

                <CardHeader className="pb-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {event.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Informations de l'événement */}
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-3 text-blue-600" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-3 text-blue-600" />
                      {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-3 text-blue-600" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-3 text-blue-600" />
                      {event.participants} participants
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                      S'inscrire
                    </Button>
                    <Button variant="outline" size="icon" className="group-hover:border-blue-300 group-hover:text-blue-600">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Restez informé de nos événements
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Recevez des notifications pour nos prochains ateliers, conférences et salons d'orientation
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="secondary" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                S'abonner à la newsletter
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                Voir tous les événements
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
