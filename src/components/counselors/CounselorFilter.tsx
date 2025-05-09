
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

interface CounselorFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSpecialties: string[];
  onSpecialtyToggle: (specialty: string) => void;
  availableSpecialties: string[];
  onFilterChange?: (newFilters: any) => void;
  currentFilters?: { specialty: string; availability: string };
}

export const CounselorFilter = ({
  searchTerm,
  onSearchChange,
  selectedSpecialties,
  onSpecialtyToggle,
  availableSpecialties,
  onFilterChange,
  currentFilters
}: CounselorFilterProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="search">Rechercher un conseiller</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            id="search"
            type="search"
            placeholder="Nom ou spécialité..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Spécialités</Label>
        <div className="flex flex-wrap gap-2">
          {availableSpecialties.map((specialty) => (
            <Badge
              key={specialty}
              variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onSpecialtyToggle(specialty)}
            >
              {specialty}
              {selectedSpecialties.includes(specialty) && (
                <X className="w-3 h-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {(searchTerm || selectedSpecialties.length > 0) && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            onSearchChange("");
            selectedSpecialties.forEach(s => onSpecialtyToggle(s));
          }}
        >
          Réinitialiser les filtres
        </Button>
      )}
    </div>
  );
};
