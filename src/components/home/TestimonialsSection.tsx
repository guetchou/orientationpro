import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Jean Makaya",
      role: "Étudiant",
      content: "Grâce à Orientation Pro Congo, j'ai pu identifier ma voie professionnelle et choisir la formation adaptée à mes aspirations."
    },
    {
      name: "Marie Bouanga",
      role: "Professionnelle en reconversion",
      content: "Le test RIASEC m'a permis de mieux comprendre mes compétences et de me réorienter vers un domaine qui me correspond vraiment."
    },
    {
      name: "Paul Moukala",
      role: "Lycéen",
      content: "Les conseils personnalisés m'ont aidé à faire les bons choix pour mon orientation post-bac. Je recommande vivement !"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl font-bold text-center mb-12">
          Témoignages
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-gradient-to-br from-gray-50 to-white">
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary/40 mb-4" />
                <p className="text-gray-600 mb-6">{testimonial.content}</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full mr-4" />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};