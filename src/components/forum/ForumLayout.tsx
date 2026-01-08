
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { supabase } from "@/lib/supabaseClient";
import { ForumSidebar } from './ForumSidebar';
import { ForumHeader } from './ForumHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ForumDomain } from '@/types/supabase';

export const ForumLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [domains, setDomains] = useState<ForumDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('forum_domains')
          .select('*')
          .order('name');

        if (error) {
          throw new Error(error.message);
        }

        // Ensure data has the correct shape with string IDs
        const formattedDomains: ForumDomain[] = data?.map(domain => ({
          ...domain,
          id: String(domain.id)
        })) || [];

        setDomains(formattedDomains);
      } catch (err: any) {
        console.error('Error fetching forum domains:', err);
        setError(err.message);
        toast.error('Erreur lors du chargement des domaines du forum');
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, []);

  const handleCreatePost = () => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer un post');
      navigate('/login');
      return;
    }
    navigate('/forum/create');
  };

  const handleDomainSelect = (domainId: string) => {
    setSelectedDomain(domainId);
    navigate(`/forum/domain/${domainId}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ForumSidebar 
        domains={domains} 
        loading={loading} 
        selectedDomain={selectedDomain}
        onDomainSelect={handleDomainSelect}
      />
      
      <div className="flex-1">
        <ForumHeader />
        
        <main className="container mx-auto px-4 py-6">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Forum de discussion</h1>
                <Button onClick={handleCreatePost}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Créer un post
                </Button>
              </div>
              
              {children || <Outlet />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
