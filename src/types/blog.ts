
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: string;
  featured_image: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPostEditorProps {
  post?: BlogPost;
  isEditing?: boolean;
  onSubmit: (data: BlogPost) => Promise<void>;
  onCancel: () => void;
}

export interface WordPressPost {
  id: number;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  author: number;
  categories: number[];
  slug: string;
  status: string;
}
