
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Globe, Info } from 'lucide-react';
import { Establishment } from '@/types/establishments';

interface EstablishmentItemProps {
  establishment: Establishment;
  isSelected: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

export function EstablishmentItem({
  establishment,
  isSelected,
  isExpanded,
  onClick
}: EstablishmentItemProps) {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all
        ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{establishment.name}</h3>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span>{establishment.address}, {establishment.city}</span>
          </div>
        </div>
        <Badge>{establishment.type}</Badge>
      </div>
      
      {isExpanded && (
        <div className="mt-4 space-y-3 text-sm border-t pt-3">
          {establishment.description && (
            <div className="flex items-start">
              <Info className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
              <p className="text-gray-700">{establishment.description}</p>
            </div>
          )}
          
          {establishment.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              <a href={`tel:${establishment.phone}`} className="text-primary hover:underline">{establishment.phone}</a>
            </div>
          )}
          
          {establishment.website && (
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2 text-gray-500" />
              <a href={establishment.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Site web
              </a>
            </div>
          )}
          
          {establishment.programs && establishment.programs.length > 0 && (
            <div className="mt-2">
              <p className="text-gray-500 mb-1">Programmes :</p>
              <div className="flex flex-wrap gap-1">
                {establishment.programs.map((program, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">{program}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
