
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { ForumDomain, ForumPost, GetPostsParams } from '@/types/forum';

export const useForumData = () => {
  const queryClient = useQueryClient();

  const { data: domains, isLoading: isLoadingDomains } = useQuery({
    queryKey: ['forumDomains'],
    queryFn: async (): Promise<ForumDomain[]> => {
      const { data, error } = await supabase
        .from('forum_domains')
        .select('*');

      if (error) throw error;
      return data;
    }
  });

  const getPosts = async ({ domain, sortBy, search }: GetPostsParams): Promise<ForumPost[]> => {
    let query = supabase
      .from('forum_posts')
      .select('*, forum_replies(count)');

    if (domain && domain !== 'all') {
      query = query.eq('domain', domain);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    switch (sortBy) {
      case 'popular':
        query = query.order('likes', { ascending: false });
        break;
      case 'unanswered':
        query = query.eq('replies_count', 0);
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  };

  const createPostMutation = useMutation({
    mutationFn: async (newPost: Omit<ForumPost, 'id' | 'created_at' | 'likes' | 'replies_count'>) => {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert([newPost])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    }
  });

  return {
    domains,
    isLoadingDomains,
    getPosts,
    createPostMutation
  };
};
