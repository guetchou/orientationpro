
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface CounselorCardProps {
  counselor: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    avatar_url?: string;
    phone?: string;
    department?: string;
    specialties?: string[];
    bio?: string;
  };
}

export const CounselorCard: React.FC<CounselorCardProps> = ({ counselor }) => {
  const fullName = `${counselor.first_name} ${counselor.last_name}`;
  const initials = `${counselor.first_name?.[0] || ''}${counselor.last_name?.[0] || ''}`;
  
  return (
    <Card className="overflow-hidden transition-all bg-white hover:shadow-lg">
      <div className="p-6">
        <div className="flex flex-col items-center mb-4">
          <Avatar className="h-24 w-24 mb-3">
            {counselor.avatar_url ? (
              <AvatarImage 
                src={counselor.avatar_url} 
                alt={fullName}
                className="object-cover"
              />
            ) : (
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          
          <h3 className="text-xl font-semibold text-center">{fullName}</h3>
          
          {counselor.department && (
            <Badge variant="outline" className="mt-2">
              {counselor.department}
            </Badge>
          )}
        </div>
        
        <div className="space-y-3 mb-6">
          {counselor.bio && (
            <p className="text-gray-600 text-sm">
              {counselor.bio}
            </p>
          )}
          
          <div className="flex flex-wrap gap-1">
            {counselor.specialties?.map((specialty, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            asChild 
            size="sm" 
            className="w-full"
          >
            <Link 
              to={`/appointment?counselorId=${counselor.id}&counselorName=${encodeURIComponent(fullName)}`}
              className="flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Prendre rendez-vous
            </Link>
          </Button>
          
          <div className="flex gap-2">
            {counselor.email && (
              <Button 
                asChild
                size="sm" 
                variant="outline" 
                className="flex-1"
              >
                <a 
                  href={`mailto:${counselor.email}`}
                  className="flex items-center justify-center gap-1"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </Button>
            )}
            
            {counselor.phone && (
              <Button 
                asChild
                size="sm" 
                variant="outline" 
                className="flex-1"
              >
                <a 
                  href={`tel:${counselor.phone}`}
                  className="flex items-center justify-center gap-1"
                >
                  <Phone className="h-4 w-4" />
                  Appeler
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
