
import React from 'react';
import { Button } from '@/components/ui/button';
import { List, Map } from 'lucide-react';

export interface MobileToggleListProps {
  showList?: boolean;
  toggleView?: () => void;
}

export const MobileToggleList: React.FC<MobileToggleListProps> = ({ 
  showList = true, 
  toggleView = () => {} 
}) => {
  return (
    <div className="flex justify-center lg:hidden mb-4">
      <div className="bg-white rounded-full shadow-md p-1 inline-flex">
        <Button
          variant={showList ? "default" : "ghost"}
          size="sm"
          onClick={toggleView}
          className={`rounded-full flex items-center gap-2 ${
            showList ? "bg-primary text-white" : "text-gray-600"
          }`}
        >
          <List className="h-4 w-4" />
          Liste
        </Button>
        <Button
          variant={!showList ? "default" : "ghost"}
          size="sm"
          onClick={toggleView}
          className={`rounded-full flex items-center gap-2 ${
            !showList ? "bg-primary text-white" : "text-gray-600"
          }`}
        >
          <Map className="h-4 w-4" />
          Carte
        </Button>
      </div>
    </div>
  );
};

export default MobileToggleList;
