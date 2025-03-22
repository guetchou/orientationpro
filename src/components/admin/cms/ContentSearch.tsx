
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";

interface ContentSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onNewClick: () => void;
}

export const ContentSearch = ({ searchTerm, onSearchChange, onNewClick }: ContentSearchProps) => {
  return (
    <div className="flex justify-between items-center my-6">
      <div className="relative w-1/3">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Rechercher..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button onClick={onNewClick}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Nouveau
      </Button>
    </div>
  );
};
