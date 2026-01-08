
import { FC } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface TestCardProps {
  test: {
    id: string;
    title: string;
    description: string;
    icon: JSX.Element;
    duration: string;
    questions: number;
    benefits: string[];
    path: string;
    color: string;
  };
  isActive?: boolean;
}

export const TestCard: FC<TestCardProps> = ({ test, isActive = true }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div
      key={test.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -20 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="col-span-1 md:col-span-2"
    >
      <Card className={`h-full overflow-hidden border-0 shadow-lg ${test.color}`}>
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2">
                <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                  {test.duration} • {test.questions} questions
                </Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold">{test.title}</CardTitle>
              <CardDescription className="text-base mt-2">{test.description}</CardDescription>
            </div>
            <div className="p-3 bg-white rounded-full shadow-md">
              {test.icon}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Ce que vous découvrirez :</h4>
            <ul className="space-y-2">
              {test.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="pt-4">
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => navigate(test.path)}
          >
            Commencer le test
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
