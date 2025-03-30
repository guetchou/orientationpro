
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface BlogHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export const BlogHeader = ({ 
  searchTerm, 
  setSearchTerm, 
  onSearchSubmit 
}: BlogHeaderProps) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Notre Blog</h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Découvrez nos derniers articles, conseils et actualités sur l'orientation et le développement professionnel
      </p>
      
      <form onSubmit={onSearchSubmit} className="max-w-md mx-auto mt-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>
    </div>
  );
};
