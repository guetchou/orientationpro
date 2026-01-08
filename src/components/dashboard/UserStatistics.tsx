
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CalendarDays, 
  FileBarChart, 
  GraduationCap, 
  TrendingUp, 
  Award,
  Clock 
} from "lucide-react";
import { ConseillerStats } from "@/types/dashboard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface UserStatisticsProps {
  stats: ConseillerStats;
}

const statCardVariants = {
  initial: { y: 20, opacity: 0 },
  animate: (index: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: index * 0.1,
      duration: 0.4
    }
  })
};

export const UserStatistics = ({ stats }: UserStatisticsProps) => {
  const statsData = [
    {
      title: "Tests complétés",
      value: stats.tests_completed,
      icon: FileBarChart,
      color: "blue",
      link: "/dashboard/results",
      linkText: "Voir les résultats →",
      growthPercent: stats.tests_growth || 5,
      period: "ce mois"
    },
    {
      title: "Rendez-vous",
      value: stats.appointments_scheduled,
      icon: CalendarDays,
      color: "green",
      link: "/conseillers",
      linkText: "Prendre rendez-vous →",
      growthPercent: stats.appointment_growth || 0,
      period: "ce mois"
    },
    {
      title: "Orientation",
      value: `${stats.average_progress}%`,
      icon: GraduationCap,
      color: "purple",
      link: "/tests",
      linkText: "Passer un test →",
      progress: stats.average_progress,
      period: "complété"
    },
    {
      title: "Points de compétence",
      value: stats.skill_points || 420,
      icon: Award,
      color: "amber",
      link: "/profile/skills",
      linkText: "Vos compétences →",
      growthPercent: 12,
      period: "total"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.title}
          custom={index}
          initial="initial"
          animate="animate"
          variants={statCardVariants}
        >
          <Card className={cn(
            "h-full overflow-hidden transition-all duration-200 hover:shadow-md",
            `hover:border-${stat.color}-200 dark:hover:border-${stat.color}-800`
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold">{stat.value}</p>
                    {stat.growthPercent !== undefined && (
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full flex items-center",
                        stat.growthPercent > 0 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : stat.growthPercent < 0
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      )}>
                        <TrendingUp className={cn(
                          "h-3 w-3 mr-0.5",
                          stat.growthPercent < 0 && "rotate-180"
                        )} />
                        {Math.abs(stat.growthPercent)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {stat.period}
                  </p>
                </div>
                <div className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center",
                  `bg-${stat.color}-100 dark:bg-${stat.color}-900/20`
                )}>
                  <stat.icon className={cn(
                    "h-6 w-6",
                    `text-${stat.color}-600 dark:text-${stat.color}-400`
                  )} />
                </div>
              </div>
              
              {stat.progress !== undefined && (
                <div className="mt-4">
                  <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        `bg-${stat.color}-500 dark:bg-${stat.color}-600`
                      )}
                      style={{ width: `${stat.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <Button variant="link" className="p-0 h-auto" asChild>
                  <Link to={stat.link}>
                    {stat.linkText}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
