
export type ForumTables = {
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
    Insert: {
      id?: string;
      title: string;
      content: string;
      author_id: string;
      domain: string;
      created_at?: string;
      updated_at?: string;
      likes?: number;
      replies_count?: number;
      tags?: string[];
    };
    Update: {
      title?: string;
      content?: string;
      likes?: number;
      replies_count?: number;
      tags?: string[];
      updated_at?: string;
    };
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
    Insert: {
      id?: string;
      post_id: string;
      content: string;
      author_id: string;
      created_at?: string;
      likes?: number;
    };
    Update: {
      content?: string;
      likes?: number;
    };
  };
  forum_domains: {
    Row: {
      id: string;
      name: string;
      description: string;
      icon: string;
      post_count: number;
    };
    Insert: {
      id?: string;
      name: string;
      description: string;
      icon: string;
      post_count?: number;
    };
    Update: {
      name?: string;
      description?: string;
      icon?: string;
      post_count?: number;
    };
  };
};
