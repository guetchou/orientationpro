import { CheckCircle2 } from "lucide-react";

export const StepsSection = () => {
  const steps = [
    {
      title: "Inscription",
      description: "Créez votre compte gratuitement en quelques clics"
    },
    {
      title: "Test RIASEC",
      description: "Passez notre test d'orientation professionnelle"
    },
    {
      title: "Résultats",
      description: "Recevez une analyse détaillée de votre profil"
    },
    {
      title: "Accompagnement",
      description: "Bénéficiez de conseils personnalisés"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl font-bold text-center mb-12">
          Comment ça marche
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-xl">{index + 1}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-primary/20" />
                )}
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};