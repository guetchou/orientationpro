
export type Database = {
  public: {
    Tables: {
      forum_domains: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          post_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['forum_domains']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['forum_domains']['Insert']>;
      };
      forum_posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string;
          domain: string;
          created_at: string;
          updated_at: string;
          likes: number;
          replies_count: number;
          tags: string[];
        };
        Insert: Omit<Database['public']['Tables']['forum_posts']['Row'], 'id' | 'created_at' | 'updated_at' | 'likes' | 'replies_count'>;
        Update: Partial<Database['public']['Tables']['forum_posts']['Row']>;
      };
      forum_replies: {
        Row: {
          id: string;
          post_id: string;
          content: string;
          author_id: string;
          created_at: string;
          likes: number;
        };
        Insert: Omit<Database['public']['Tables']['forum_replies']['Row'], 'id' | 'created_at' | 'likes'>;
        Update: Partial<Database['public']['Tables']['forum_replies']['Row']>;
      };
      forum_likes: {
        Row: {
          id: string;
          user_id: string;
          post_id?: string;
          reply_id?: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['forum_likes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['forum_likes']['Row']>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Functions: {
      increment_likes: {
        Args: { item_id: string };
        Returns: number;
      };
      decrement_likes: {
        Args: { item_id: string };
        Returns: number;
      };
      increment_replies_count: {
        Args: { post_id: string };
        Returns: number;
      };
    };
  };
};
