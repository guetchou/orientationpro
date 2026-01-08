
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Establishment } from '@/types/establishments';
import { EstablishmentItem } from './EstablishmentItem';

interface EstablishmentListProps {
  establishments: Establishment[];
  selectedEstablishment: Establishment | null;
  setSelectedEstablishment: (establishment: Establishment | null) => void;
}

export function EstablishmentList({
  establishments,
  selectedEstablishment,
  setSelectedEstablishment
}: EstablishmentListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleEstablishmentClick = (establishment: Establishment) => {
    setSelectedEstablishment(establishment);
    setExpandedId(establishment.id === expandedId ? null : establishment.id);
  };

  return (
    <Card className="h-[600px] overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Établissements ({establishments.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-y-auto h-[530px]">
          {establishments.length > 0 ? (
            <div className="space-y-2 p-4">
              {establishments.map((establishment) => (
                <EstablishmentItem
                  key={establishment.id}
                  establishment={establishment}
                  isSelected={selectedEstablishment?.id === establishment.id}
                  isExpanded={expandedId === establishment.id}
                  onClick={() => handleEstablishmentClick(establishment)}
                />
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Aucun établissement trouvé</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
