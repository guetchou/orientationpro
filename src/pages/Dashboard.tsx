import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, CheckCircle, Loader2, Settings, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TestResultRow {
  id: string;
  test_type: string;
  results: Record<string, unknown>;
  score: number | null;
  completed_at: string | null;
  created_at: string;
}

const testLabels: Record<string, string> = {
  riasec: 'Test RIASEC',
  personality: 'Test de personnalité',
  skills: 'Test de compétences',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<TestResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (window.location.pathname === '/dashboard') {
      if (user.role === 'admin') return void navigate('/admin/dashboard', { replace: true });
      if (user.role === 'super_admin') return void navigate('/admin/super-admin', { replace: true });
      if (user.role === 'conseiller') return void navigate('/conseiller/dashboard', { replace: true });
    }

    const loadResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        const authUser = authData.user;
        if (!authUser?.email) throw new Error('Utilisateur non connecté');

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', authUser.email)
          .maybeSingle();
        if (profileError) throw profileError;
        if (!profile) {
          setResults([]);
          return;
        }

        const { data, error: resultsError } = await supabase
          .from('test_results')
          .select('id, test_type, results, score, completed_at, created_at')
          .eq('profile_id', profile.id)
          .order('completed_at', { ascending: false, nullsFirst: false });
        if (resultsError) throw resultsError;
        setResults((data ?? []) as TestResultRow[]);
      } catch (loadError) {
        console.error('Unable to load dashboard results', loadError);
        setError('Vos résultats ne peuvent pas être chargés pour le moment.');
      } finally {
        setLoading(false);
      }
    };

    void loadResults();
  }, [navigate, user]);

  const averageScore = useMemo(() => {
    const scores = results.map((result) => result.score).filter((score): score is number => typeof score === 'number');
    return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  }, [results]);

  const openResult = (result: TestResultRow) => {
    navigate('/test-results', {
      state: {
        results: result.results,
        testType: result.test_type,
        resultId: result.id,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bienvenue, {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'} !</h1>
            <p className="mt-2 text-gray-600">Consultez vos tests réellement enregistrés et votre progression.</p>
          </div>
          <div className="flex gap-3">
            <Badge variant="secondary" className="self-center"><User className="mr-1 h-4 w-4" />{user?.role || 'Utilisateur'}</Badge>
            <Button variant="outline" onClick={() => navigate('/profile')}><Settings className="mr-2 h-4 w-4" />Mon profil</Button>
          </div>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card><CardContent className="flex items-center justify-between p-6"><div><p className="text-sm text-gray-600">Tests complétés</p><p className="text-3xl font-bold">{results.length}</p></div><CheckCircle className="h-9 w-9 text-blue-600" /></CardContent></Card>
          <Card><CardContent className="flex items-center justify-between p-6"><div><p className="text-sm text-gray-600">Score moyen</p><p className="text-3xl font-bold">{averageScore}%</p></div><BarChart3 className="h-9 w-9 text-green-600" /></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Mes résultats</CardTitle>
            <CardDescription>Résultats chargés depuis votre compte, du plus récent au plus ancien.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            {!loading && error && <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}
            {!loading && !error && results.length === 0 && (
              <div className="py-12 text-center">
                <p className="mb-4 text-gray-600">Aucun résultat enregistré sur ce compte.</p>
                <Button onClick={() => navigate('/tests')}>Passer un test</Button>
              </div>
            )}
            {!loading && !error && results.length > 0 && (
              <div className="space-y-4">
                {results.map((result) => (
                  <button key={result.id} type="button" onClick={() => openResult(result)} className="flex w-full items-center justify-between rounded-lg border bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50">
                    <div>
                      <p className="font-medium text-gray-900">{testLabels[result.test_type] ?? result.test_type}</p>
                      <p className="text-sm text-gray-500">{new Date(result.completed_at ?? result.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <Badge variant="secondary">{typeof result.score === 'number' ? `${Math.round(result.score)}%` : 'Voir'}</Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
