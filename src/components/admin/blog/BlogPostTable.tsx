
import { useState } from "react";
import { WordPressPost } from "@/types/wordpress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Plus, Search, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface BlogPostTableProps {
  posts: WordPressPost[];
  loading: boolean;
  searchTerm: string;
  currentPage: number;
  totalPages: number;
  onEdit: (post: WordPressPost) => void;
  onDelete: (id: number) => void;
  onNew: () => void;
  onSearch: (term: string) => void;
  onPageChange: (page: number) => void;
}

export const BlogPostTable = ({
  posts,
  loading,
  searchTerm,
  currentPage,
  totalPages,
  onEdit,
  onDelete,
  onNew,
  onSearch,
  onPageChange
}: BlogPostTableProps) => {
  // Pour le terme de recherche avec un délai
  const [inputValue, setInputValue] = useState(searchTerm);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue);
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "d MMMM yyyy", { locale: fr });
    } catch (error) {
      return dateString;
    }
  };
  
  // Nettoyer le HTML
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearchSubmit} className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article..."
            value={inputValue}
            onChange={handleInputChange}
            className="pl-10"
          />
        </form>
        <Button onClick={onNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel Article
        </Button>
      </div>

      {loading ? (
        <div className="text-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des articles...</p>
        </div>
      ) : posts.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Extrait</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <div dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {stripHtml(post.excerpt.rendered).substring(0, 100)}...
                  </TableCell>
                  <TableCell>{formatDate(post.date)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/blog/${post.slug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(post)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(post.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <span className="text-sm">
                Page {currentPage} sur {totalPages}
              </span>
              <Button 
                variant="outline" 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center p-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">Aucun article trouvé</p>
          <Button onClick={onNew}>Créer un article</Button>
        </div>
      )}
    </div>
  );
};
