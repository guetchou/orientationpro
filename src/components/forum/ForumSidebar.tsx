
import React from 'react';
import { Button } from '@/components/ui/button';
import { ForumDomain } from '@/types/supabase';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface ForumSidebarProps {
  domains: ForumDomain[];
  loading: boolean;
  selectedDomain: string | null;
  onDomainSelect: (domainId: string) => void;
}

export const ForumSidebar = ({ 
  domains, 
  loading,
  selectedDomain,
  onDomainSelect 
}: ForumSidebarProps) => {
  return (
    <div className="hidden md:block w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
      <div className="p-4 border-b">
        <h2 className="font-bold text-lg">Domaines de discussion</h2>
      </div>
      
      <ScrollArea className="h-[calc(100vh-60px)]">
        <div className="p-4">
          {loading ? (
            // Afficher des skeletons pendant le chargement
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : domains.length > 0 ? (
            <div className="space-y-1">
              {domains.map((domain) => (
                <Button
                  key={domain.id}
                  variant={selectedDomain === domain.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left font-normal"
                  onClick={() => onDomainSelect(domain.id)}
                >
                  {domain.name}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-2">
              Aucun domaine disponible
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
