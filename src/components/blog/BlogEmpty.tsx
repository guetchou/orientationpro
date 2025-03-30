
import { Button } from "@/components/ui/button";

interface BlogEmptyProps {
  searchTerm: string;
  onReset: () => void;
}

export const BlogEmpty = ({ searchTerm, onReset }: BlogEmptyProps) => {
  return (
    <div className="text-center p-12 bg-white/90 backdrop-blur rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-2">Aucun article trouvé</h3>
      <p className="text-muted-foreground mb-4">
        {searchTerm 
          ? `Aucun résultat pour "${searchTerm}"`
          : "Il n'y a pas encore d'articles publiés"}
      </p>
      {searchTerm && (
        <Button variant="outline" onClick={onReset}>
          Réinitialiser la recherche
        </Button>
      )}
    </div>
  );
};
