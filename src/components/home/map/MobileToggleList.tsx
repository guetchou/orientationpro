
import React from 'react';
import { Button } from '@/components/ui/button';

interface MobileToggleListProps {
  isMobileListOpen: boolean;
  setIsMobileListOpen: (isOpen: boolean) => void;
}

export const MobileToggleList = ({ isMobileListOpen, setIsMobileListOpen }: MobileToggleListProps) => {
  return (
    <div className="block lg:hidden">
      <Button 
        onClick={() => setIsMobileListOpen(!isMobileListOpen)}
        className="w-full"
      >
        {isMobileListOpen ? 'Masquer la liste' : 'Afficher la liste d\'établissements'}
      </Button>
    </div>
  );
};
