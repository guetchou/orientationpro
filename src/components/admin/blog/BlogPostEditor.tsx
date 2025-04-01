
import { useState, useEffect } from "react";
import { WordPressPost, WordPressCategory } from "@/types/wordpress";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface BlogPostEditorProps {
  post: WordPressPost | null;
  isNew: boolean;
  categories: WordPressCategory[];
  onSave: (postData: Partial<WordPressPost>) => void;
  onCancel: () => void;
}

interface FormData {
  title: string;
  content: string;
  excerpt: string;
  status: string;
  categories: string[];
  featured_media: number;
}

export const BlogPostEditor = ({
  post,
  isNew,
  categories,
  onSave,
  onCancel
}: BlogPostEditorProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    excerpt: "",
    status: "draft",
    categories: [],
    featured_media: 0
  });
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (post && !isNew) {
      setFormData({
        title: post.title.rendered || "",
        content: post.content.rendered || "",
        excerpt: post.excerpt.rendered || "",
        status: "publish", // Assume published
        categories: post.categories.map(id => id.toString()) || [],
        featured_media: post.featured_media || 0
      });

      // Set media preview if available
      if (post._embedded && post._embedded["wp:featuredmedia"] && post._embedded["wp:featuredmedia"][0]) {
        setMediaPreview(post._embedded["wp:featuredmedia"][0].source_url);
      }
    }
  }, [post, isNew]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => {
      const newCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId];
      
      return {
        ...prev,
        categories: newCategories
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setMediaPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      toast.error("Vous devez être connecté pour effectuer cette action");
      return;
    }

    // Prepare post data
    const postData: Partial<WordPressPost> = {
      title: { rendered: formData.title },
      content: { rendered: formData.content },
      excerpt: { rendered: formData.excerpt },
      status: formData.status as any,
      categories: formData.categories.map(id => parseInt(id))
    };

    if (formData.featured_media > 0) {
      postData.featured_media = formData.featured_media;
    }

    // Call onSave with prepared data
    onSave(postData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Contenu</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          rows={15}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Extrait</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          value={formData.excerpt}
          onChange={handleInputChange}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Statut</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleSelectChange("status", value)}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Choisir un statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="publish">Publié</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="pending">En attente de relecture</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Catégories</Label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <div className="flex items-center space-x-2" key={category.id}>
              <input
                type="checkbox"
                id={`category-${category.id}`}
                checked={formData.categories.includes(category.id.toString())}
                onChange={() => handleCategoryChange(category.id.toString())}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="featured_media">Image à la une</Label>
        <Input
          id="featured_media"
          name="featured_media"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        
        {mediaPreview && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mb-2">Aperçu de l'image:</p>
            <img 
              src={mediaPreview} 
              alt="Preview" 
              className="max-w-xs h-auto rounded-md" 
            />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {isNew ? "Créer l'article" : "Mettre à jour l'article"}
        </Button>
      </div>
    </form>
  );
};
