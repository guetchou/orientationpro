
export interface WordPressPost {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  slug: string;
  link: string;
  modified: string;
  status?: string;
  _embedded?: {
    author?: {
      id: number;
      name: string;
      avatar_urls?: {
        [key: string]: string;
      };
    }[];
    "wp:featuredmedia"?: {
      id: number;
      source_url: string;
      media_details?: {
        sizes: {
          thumbnail?: {
            source_url: string;
          };
          medium?: {
            source_url: string;
          };
          large?: {
            source_url: string;
          };
          full?: {
            source_url: string;
          };
        };
      };
    }[];
    "wp:term"?: any[][];
  };
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WordPressMedia {
  id: number;
  source_url: string;
  media_details: {
    sizes: {
      thumbnail?: {
        source_url: string;
      };
      medium?: {
        source_url: string;
      };
      large?: {
        source_url: string;
      };
      full?: {
        source_url: string;
      };
    };
  };
}

export interface WordPressAuthor {
  id: number;
  name: string;
  avatar_urls: {
    [key: string]: string;
  };
}
