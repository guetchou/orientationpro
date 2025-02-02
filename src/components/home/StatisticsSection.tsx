import { Users, BookCheck, Award, Building2 } from "lucide-react";

export const StatisticsSection = () => {
  const statistics = [
    {
      value: "5000+",
      label: "Utilisateurs",
      icon: <Users className="w-6 h-6 text-white" />
    },
    {
      value: "1000+",
      label: "Tests complétés",
      icon: <BookCheck className="w-6 h-6 text-white" />
    },
    {
      value: "95%",
      label: "Satisfaction",
      icon: <Award className="w-6 h-6 text-white" />
    },
    {
      value: "50+",
      label: "Partenaires",
      icon: <Building2 className="w-6 h-6 text-white" />
    }
  ];

  return (
    <section className="py-20 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {statistics.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                {stat.icon}
              </div>
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-lg opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};