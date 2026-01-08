
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const FaqSection = () => {
  const faqs = [
    {
      question: "Comment fonctionnent les tests d'orientation ?",
      answer: "Nos tests d'orientation sont basés sur des méthodologies scientifiques éprouvées. Chaque test comprend une série de questions adaptées qui permettent d'analyser vos intérêts, compétences et traits de personnalité. Les résultats sont générés instantanément et accompagnés de recommandations personnalisées."
    },
    {
      question: "Les tests sont-ils vraiment gratuits ?",
      answer: "Oui, tous nos tests d'orientation de base sont entièrement gratuits. Nous proposons également des services premium pour un accompagnement plus personnalisé, mais l'accès aux tests principaux reste gratuit pour tous les utilisateurs."
    },
    {
      question: "Combien de temps faut-il pour passer un test ?",
      answer: "La durée varie selon le test choisi : le test RIASEC prend environ 20-25 minutes, le test d'intelligence émotionnelle 15-20 minutes, et le test des intelligences multiples 25-30 minutes. Vous pouvez sauvegarder votre progression et reprendre plus tard."
    },
    {
      question: "Les résultats sont-ils fiables ?",
      answer: "Nos tests sont développés en collaboration avec des experts en orientation et psychologie. Ils sont régulièrement mis à jour et validés scientifiquement. Les résultats sont basés sur vos réponses et fournissent des indications précieuses pour votre orientation."
    },
    {
      question: "Puis-je modifier mes réponses après avoir soumis un test ?",
      answer: "Une fois le test soumis, les réponses ne peuvent pas être modifiées pour garantir l'authenticité des résultats. Cependant, vous pouvez repasser le test après un délai de 3 mois pour observer votre évolution."
    },
    {
      question: "Comment sont protégées mes données personnelles ?",
      answer: "La protection de vos données est notre priorité. Toutes les informations sont cryptées et stockées de manière sécurisée. Nous respectons strictement les normes de confidentialité et ne partageons jamais vos données personnelles avec des tiers sans votre consentement."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-gray-600">
              Trouvez les réponses à vos questions sur nos services d'orientation
            </p>
          </div>

          <Accordion type="single" collapsible className="mb-8">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Vous ne trouvez pas la réponse à votre question ?
            </p>
            <Button variant="outline" size="lg" className="gap-2">
              Contactez-nous
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
