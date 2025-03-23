
import React from 'react';
import { Button } from '@/components/ui/button';
import { List, Map } from 'lucide-react';

export interface MobileToggleListProps {
  showList?: boolean;
  toggleView?: () => void;
  isMobileListOpen?: boolean;
  setIsMobileListOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MobileToggleList: React.FC<MobileToggleListProps> = ({
  showList,
  toggleView,
  isMobileListOpen,
  setIsMobileListOpen
}) => {
  // Utilise soit les anciens, soit les nouveaux props
  const isListShown = showList !== undefined ? showList : isMobileListOpen;
  
  const handleToggle = () => {
    if (toggleView) {
      toggleView();
    } else if (setIsMobileListOpen) {
      setIsMobileListOpen(prev => !prev);
    }
  };

  return (
    <div className="flex justify-center lg:hidden mb-4">
      <div className="bg-white rounded-full shadow-md p-1 inline-flex">
        <Button
          variant={isListShown ? "default" : "ghost"}
          size="sm"
          onClick={handleToggle}
          className={`rounded-full flex items-center gap-2 ${
            isListShown ? "bg-primary text-white" : "text-gray-600"
          }`}
        >
          <List className="h-4 w-4" />
          Liste
        </Button>
        <Button
          variant={!isListShown ? "default" : "ghost"}
          size="sm"
          onClick={handleToggle}
          className={`rounded-full flex items-center gap-2 ${
            !isListShown ? "bg-primary text-white" : "text-gray-600"
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
