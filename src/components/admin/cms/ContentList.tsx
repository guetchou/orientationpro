
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
}

interface ContentListProps {
  contents: ContentItem[];
  loading: boolean;
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
}

export const ContentList = ({ contents, loading, onEdit, onDelete }: ContentListProps) => {
  return (
    <div className="col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>Liste des contenus</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Chargement...</p>
          ) : contents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contents.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.description.substring(0, 50)}...</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-4">Aucun contenu trouvé</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
