
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Send,
  Clock,
  ArrowRight,
} from "lucide-react";

export const ContactSection = () => {
  const contactInfo = [
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Téléphone",
      value: "+242 06 123 4567",
      text: "Du lundi au vendredi, 8h-17h"
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email",
      value: "contact@orientation-pro.cg",
      text: "Réponse sous 24-48h"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Adresse",
      value: "123 Avenue de l'Indépendance",
      text: "Brazzaville, Congo"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Horaires",
      value: "Lun-Ven: 8h-17h",
      text: "Sam: 9h-13h"
    }
  ];

  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">
              Contactez-nous
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une question ? Besoin d'aide ? Notre équipe est là pour vous accompagner dans votre parcours d'orientation
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulaire de contact */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-heading text-xl font-semibold mb-6">
                    Envoyez-nous un message
                  </h3>
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="name">
                          Nom complet
                        </label>
                        <Input
                          id="name"
                          placeholder="Votre nom"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="email">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="votre@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="subject">
                        Sujet
                      </label>
                      <Input
                        id="subject"
                        placeholder="Sujet de votre message"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="message">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Votre message..."
                        rows={5}
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button size="lg" className="gap-2">
                        Envoyer le message
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Informations de contact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-heading text-xl font-semibold mb-6">
                    Informations de contact
                  </h3>
                  <div className="space-y-6">
                    {contactInfo.map((info, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          {info.icon}
                        </div>
                        <div>
                          <h4 className="font-medium">{info.title}</h4>
                          <p className="text-gray-600">{info.value}</p>
                          <p className="text-sm text-gray-500">{info.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Chat en direct
                    </h4>
                    <p className="text-sm text-gray-600">
                      Besoin d'une réponse rapide ? Discutez avec nos conseillers en orientation.
                    </p>
                    <Button variant="outline" className="w-full gap-2">
                      Démarrer le chat
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
