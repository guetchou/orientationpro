
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { StarIcon } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  avatar?: string;
  testimonial: string;
  rating: number;
  testType: string;
}

const TestimonialCard = ({ name, avatar, testimonial, rating, testType }: TestimonialCardProps) => {
  return (
    <Card className="overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar>
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium">{name}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{testType}</p>
          </div>
        </div>
        
        <div className="flex mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              className={`h-4 w-4 ${
                i < rating 
                  ? "text-yellow-500 fill-yellow-500" 
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          ))}
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial}"</p>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
