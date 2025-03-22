
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Info, Clock, Award } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface TestDescriptionProps {
  title: string;
  description: string;
  time: string;
  benefits: string[];
  onStart: () => void;
}

export const TestDescription: React.FC<TestDescriptionProps> = ({
  title,
  description,
  time,
  benefits,
  onStart
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto mb-8"
    >
      <Card className="border-2 border-primary/10 bg-gradient-to-br from-white to-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            <Info className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription className="text-base">
            Découvrez comment ce test peut vous aider dans votre orientation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-700">{description}</p>
          
          <div className="flex items-center mb-4 text-amber-600">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm">{time}</span>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-2 text-primary">
              <Award className="h-4 w-4 mr-2" />
              <span className="font-medium">Bénéfices du test:</span>
            </div>
            <ul className="space-y-1 pl-6 list-disc text-gray-700">
              {benefits.map((benefit, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  {benefit}
                </motion.li>
              ))}
            </ul>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button 
              onClick={onStart} 
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-lg py-6"
            >
              Commencer le test
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
