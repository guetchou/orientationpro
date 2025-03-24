
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LightbulbIcon } from "lucide-react";
import { motion } from "framer-motion";

interface AdviceItem {
  title: string;
  content: string;
}

interface PersonalizedAdviceProps {
  testType: string;
  adviceItems: AdviceItem[];
  userName?: string;
  color?: string;
}

const PersonalizedAdvice = ({ 
  testType, 
  adviceItems, 
  userName = "utilisateur",
  color = "blue"
}: PersonalizedAdviceProps) => {
  const getThemeColor = () => {
    switch (color) {
      case "green": return {
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-800",
        title: "text-green-800 dark:text-green-300",
        icon: "text-green-600 dark:text-green-400",
        bullet: "text-green-600 dark:text-green-400"
      };
      case "purple": return {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "border-purple-200 dark:border-purple-800",
        title: "text-purple-800 dark:text-purple-300",
        icon: "text-purple-600 dark:text-purple-400",
        bullet: "text-purple-600 dark:text-purple-400"
      };
      case "pink": return {
        bg: "bg-pink-50 dark:bg-pink-900/20",
        border: "border-pink-200 dark:border-pink-800",
        title: "text-pink-800 dark:text-pink-300",
        icon: "text-pink-600 dark:text-pink-400",
        bullet: "text-pink-600 dark:text-pink-400"
      };
      default: return {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        title: "text-blue-800 dark:text-blue-300",
        icon: "text-blue-600 dark:text-blue-400",
        bullet: "text-blue-600 dark:text-blue-400"
      };
    }
  };

  const theme = getThemeColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className={`${theme.bg} ${theme.border} shadow-sm`}>
        <CardHeader className="pb-2 flex flex-row items-center gap-3">
          <LightbulbIcon className={`h-6 w-6 ${theme.icon}`} />
          <CardTitle className={`text-xl ${theme.title}`}>
            Conseils personnalisés pour {userName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Basé sur vos résultats au test {testType}, voici quelques conseils qui pourraient vous être utiles:
          </p>
          <ul className="space-y-3">
            {adviceItems.map((item, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
                className="flex gap-2"
              >
                <span className={`inline-block h-5 w-5 rounded-full flex-shrink-0 ${theme.bullet} font-bold text-center text-sm`}>
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">{item.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{item.content}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PersonalizedAdvice;
