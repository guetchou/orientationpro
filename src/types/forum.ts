
export interface ForumDomain {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  post_count?: number;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  domain: string;
  tags: string[];
  likes: number;
  replies_count: number;
}

export interface ForumReply {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  created_at: string;
  likes: number;
}

export interface GetPostsParams {
  domain?: string;
  sortBy?: 'recent' | 'popular' | 'unanswered';
  search?: string;
}

export interface CreateForumPost {
  title: string;
  content: string;
  author_id: string;
  domain: string;
  tags: string[];
}
