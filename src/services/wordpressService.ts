
import axios from 'axios';
import { WordPressPost, WordPressCategory, WordPressTag, WordPressMedia, WordPressAuthor } from '@/types/wordpress';
import { config } from './config';

// WordPress API configuration
const WP_API_URL = config.wordpressApi.baseUrl;

// Create a service for WordPress API requests
export const wordpressService = {
  // Fetch posts with pagination and search
  getPosts: async (page: number = 1, perPage: number = 10, search: string = ''): Promise<WordPressPost[]> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        _embed: 'true', // Include embedded data like featured images
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await axios.get(`${WP_API_URL}/posts?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching WordPress posts:', error);
      return [];
    }
  },
  
  // Fetch a single post by slug
  getPostBySlug: async (slug: string): Promise<WordPressPost | null> => {
    try {
      const response = await axios.get(`${WP_API_URL}/posts?slug=${slug}&_embed=true`);
      return response.data[0] || null;
    } catch (error) {
      console.error('Error fetching WordPress post by slug:', error);
      return null;
    }
  },
  
  // Fetch categories
  getCategories: async (): Promise<WordPressCategory[]> => {
    try {
      const response = await axios.get(`${WP_API_URL}/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching WordPress categories:', error);
      return [];
    }
  },
  
  // Fetch tags
  getTags: async (): Promise<WordPressTag[]> => {
    try {
      const response = await axios.get(`${WP_API_URL}/tags`);
      return response.data;
    } catch (error) {
      console.error('Error fetching WordPress tags:', error);
      return [];
    }
  },
  
  // Fetch media (images)
  getMedia: async (mediaId: number): Promise<WordPressMedia | null> => {
    try {
      const response = await axios.get(`${WP_API_URL}/media/${mediaId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching WordPress media:', error);
      return null;
    }
  },
  
  // Fetch author details
  getAuthor: async (authorId: number): Promise<WordPressAuthor | null> => {
    try {
      const response = await axios.get(`${WP_API_URL}/users/${authorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching WordPress author:', error);
      return null;
    }
  }
};
