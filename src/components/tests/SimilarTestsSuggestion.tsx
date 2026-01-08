
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface TestInfo {
  id: string;
  name: string;
  description: string;
  path: string;
  color: string;
  icon: React.ReactNode;
}

interface SimilarTestsSuggestionProps {
  currentTestId: string;
  recommendations: TestInfo[];
}

const SimilarTestsSuggestion = ({ currentTestId, recommendations }: SimilarTestsSuggestionProps) => {
  const filteredRecommendations = recommendations
    .filter(test => test.id !== currentTestId)
    .slice(0, 3);

  if (filteredRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Tests similaires qui pourraient vous intéresser</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredRecommendations.map((test, index) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={test.path} className="block h-full">
              <Card className={`h-full border border-${test.color}-200 dark:border-${test.color}-900 hover:border-${test.color}-400 dark:hover:border-${test.color}-700 hover:shadow-md transition-all duration-300`}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`mt-1 p-2 rounded-full bg-${test.color}-100 dark:bg-${test.color}-900/30 text-${test.color}-600 dark:text-${test.color}-400`}>
                    {test.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">{test.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {test.description}
                    </p>
                    <div className={`flex items-center text-${test.color}-600 dark:text-${test.color}-400 text-sm font-medium mt-2`}>
                      Commencer <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SimilarTestsSuggestion;
