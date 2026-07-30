import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, CheckCircle, Circle, Compass, Loader2, MapPin, RefreshCw, Settings, Sparkles, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/apiClient';
import { listRiasecResults } from '@/services/riasecApi';
import type { RiasecResult } from '@/types/riasec';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { isLifeProjectFrontendEnabled } from '@/features/life-project/config';

const RESULTS_PREVIEW_COUNT = 5;

const messageForResultsError = (loadError: unknown) => {
  if (loadError instanceof ApiError) return loadError.message;
  return 'Vos résultats ne peuvent pas être chargés pour le moment.';
};

const lifeProjectFrontendEnabled = isLifeProjectFrontendEnabled();

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<RiasecResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await listRiasecResults(50, 0);
      setResults(loaded.filter((result) => result.resultType === 'riasec'));
    } catch (loadError) {
      console.error('Unable to load dashboard results', loadError);
      setError(messageForResultsError(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

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

    void loadResults();
  }, [navigate, user, loadResults, reloadToken]);

  const latestDisplayCode = results[0]?.displayCode || results[0]?.primaryCode || null;
  const hasCompletedTest = results.length > 0;
  const hasCompletedProfile = Boolean(
    profile?.bio?.trim() || profile?.interests?.trim() || profile?.experience?.trim() || profile?.education?.trim(),
  );

  const milestones = useMemo(
    () => [
      { label: 'Compte créé', done: true },
      { label: 'Profil complété', done: hasCompletedProfile },
      { label: 'Premier test complété', done: hasCompletedTest },
    ],
    [hasCompletedProfile, hasCompletedTest],
  );
  const milestonesDone = milestones.filter((milestone) => milestone.done).length;
  const progressPercent = Math.round((milestonesDone / milestones.length) * 100);

  const nextStep = useMemo(() => {
    if (!hasCompletedTest) {
      return {
        title: 'Passez votre premier test',
        description: 'Découvrez vos intérêts en une dizaine de minutes pour débloquer des pistes de métiers.',
        cta: 'Passer un test',
        onClick: () => navigate('/tests'),
      };
    }
    if (!hasCompletedProfile) {
      return {
        title: 'Complétez votre profil',
        description: 'Ajoutez vos centres d’intérêt et votre parcours pour des recommandations plus précises.',
        cta: 'Compléter mon profil',
        onClick: () => navigate('/profile'),
      };
    }
    if (lifeProjectFrontendEnabled) {
      return {
        title: 'Construisez votre parcours',
        description: 'Reliez vos résultats à des scénarios concrets et à vos prochaines actions.',
        cta: 'Ouvrir mon parcours',
        onClick: () => navigate('/parcours'),
      };
    }
    return {
      title: 'Explorez les métiers qui vous correspondent',
      description: 'Parcourez le catalogue de métiers en lien avec vos résultats.',
      cta: 'Explorer les métiers',
      onClick: () => navigate('/careers'),
    };
  }, [hasCompletedTest, hasCompletedProfile, navigate]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Utilisateur';
  const avatarInitials = displayName.slice(0, 2).toUpperCase();

  const openResult = (result: RiasecResult) => {
    navigate(`/orientation/results/${result.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
              <AvatarImage src={profile?.avatar_url || user?.photoURL} alt="" />
              <AvatarFallback className="bg-primary text-white">{avatarInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bienvenue, {displayName} !</h1>
              <p className="mt-1 text-gray-600">
                {hasCompletedTest
                  ? 'Votre parcours avance, voici où vous en êtes.'
                  : 'Construisons ensemble votre parcours, à votre rythme.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="self-center"><User className="mr-1 h-4 w-4" />{user?.role || 'Utilisateur'}</Badge>
            {lifeProjectFrontendEnabled && (
              <Button onClick={() => navigate('/parcours')}><Compass className="mr-2 h-4 w-4" />Mon parcours</Button>
            )}
            <Button variant="outline" onClick={() => navigate('/profile')}><Settings className="mr-2 h-4 w-4" />Mon profil</Button>
          </div>
        </div>

        <Card className="mb-8 border-emerald-200 bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Votre progression</p>
                <p className="text-2xl font-bold text-gray-900">{progressPercent}% de vos premières étapes</p>
              </div>
              <ul className="flex flex-wrap gap-4">
                {milestones.map((milestone) => (
                  <li key={milestone.label} className="flex items-center gap-2 text-sm">
                    {milestone.done ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300" />
                    )}
                    <span className={milestone.done ? 'text-gray-900' : 'text-gray-400'}>{milestone.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Progress value={progressPercent} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="mb-8 border-amber-200 bg-amber-50/70">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-gray-900">Prochaine étape : {nextStep.title}</p>
                <p className="mt-1 text-sm text-gray-600">{nextStep.description}</p>
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary-800" onClick={nextStep.onClick}>{nextStep.cta}</Button>
          </CardContent>
        </Card>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card><CardContent className="flex items-center justify-between p-6"><div><p className="text-sm text-gray-600">Tests complétés</p><p className="text-3xl font-bold">{results.length}</p></div><CheckCircle className="h-9 w-9 text-primary" /></CardContent></Card>
          <Card><CardContent className="flex items-center justify-between p-6"><div><p className="text-sm text-gray-600">Dernier profil</p><p className="text-3xl font-bold">{latestDisplayCode || '—'}</p></div><BarChart3 className="h-9 w-9 text-amber-500" /></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Mes résultats</CardTitle>
            <CardDescription>Résultats chargés depuis votre compte, du plus récent au plus ancien.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            {!loading && error && (
              <div className="flex flex-col items-center gap-3 rounded-lg bg-red-50 p-6 text-center text-red-700">
                <p>{error}</p>
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" onClick={() => setReloadToken((token) => token + 1)}>
                  <RefreshCw className="mr-2 h-4 w-4" />Réessayer
                </Button>
              </div>
            )}
            {!loading && !error && results.length === 0 && (
              <div className="py-12 text-center">
                <MapPin className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
                <p className="mb-4 text-gray-600">Aucun résultat enregistré sur ce compte. Votre premier test vous ouvrira des pistes concrètes.</p>
                <Button onClick={() => navigate('/tests')}>Passer un test</Button>
              </div>
            )}
            {!loading && !error && results.length > 0 && (
              <div className="space-y-4">
                {results.slice(0, RESULTS_PREVIEW_COUNT).map((result) => (
                  <button key={result.id} type="button" onClick={() => openResult(result)} className="flex w-full items-center justify-between rounded-lg border bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50">
                    <div>
                      <p className="font-medium text-gray-900">Test RIASEC — {result.displayCode || result.primaryCode || 'Profil à égalités'}</p>
                      <p className="text-sm text-gray-500">{new Date(result.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <Badge variant="secondary">Voir</Badge>
                  </button>
                ))}
                {results.length > RESULTS_PREVIEW_COUNT && (
                  <Button variant="outline" className="w-full" onClick={() => navigate('/orientation/results')}>
                    Voir tout l’historique ({results.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
