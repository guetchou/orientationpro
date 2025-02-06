import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, BookOpen, Target, Trophy } from "lucide-react";

export const DashboardStats = () => {
  const stats = [
    {
      title: "Tests complétés",
      value: "4",
      icon: <Trophy className="h-6 w-6 text-primary" />,
    },
    {
      title: "Ressources consultées",
      value: "12",
      icon: <BookOpen className="h-6 w-6 text-primary" />,
    },
    {
      title: "Objectifs fixés",
      value: "3",
      icon: <Target className="h-6 w-6 text-primary" />,
    },
    {
      title: "Score moyen",
      value: "85%",
      icon: <BarChart className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};