import { Button } from "@/components/ui/button";
import { Building2, GraduationCap, School2, Users } from "lucide-react";

export const PartnersSection = () => {
  const partners = [
    {
      name: "Universités",
      icon: <GraduationCap className="w-12 h-12 text-primary" />,
      count: "10+"
    },
    {
      name: "Écoles",
      icon: <School2 className="w-12 h-12 text-primary" />,
      count: "25+"
    },
    {
      name: "Entreprises",
      icon: <Building2 className="w-12 h-12 text-primary" />,
      count: "50+"
    },
    {
      name: "Associations",
      icon: <Users className="w-12 h-12 text-primary" />,
      count: "15+"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl font-bold text-center mb-12">
          Nos Partenaires
        </h2>
        <div className="grid md:grid-cols-4 gap-8">
          {partners.map((partner) => (
            <div key={partner.name} className="text-center">
              <div className="flex justify-center mb-4">
                {partner.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{partner.name}</h3>
              <p className="text-2xl font-bold text-primary">{partner.count}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};