import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Compass, Loader2, RefreshCw, Settings, Sparkles, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/lib/apiClient';
import { listRiasecResults } from '@/services/riasecApi';
import { getAdaptiveProfile } from '@/features/profile/profileApi';
import type { RiasecResult } from '@/types/riasec';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { isLifeProjectFrontendEnabled } from '@/features/life-project/config';

const RESULTS_PREVIEW_COUNT = 5;
const lifeProjectFrontendEnabled = isLifeProjectFrontendEnabled();

const messageForResultsError = (error: unknown) => {
  if (error instanceof ApiError && error.status === 401) return 'Reconnecte-toi pour retrouver tes résultats.';
  return 'Tes résultats ne peuvent pas être chargés pour le moment.';
};

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<RiasecResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [profileCompletionPercent, setProfileCompletionPercent] = useState<number | null>(null);

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await listRiasecResults(50, 0);
      setResults(loaded.filter((result) => result.resultType === 'riasec'));
    } catch (loadError) {
      setError(messageForResultsError(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProfileCompletion = useCallback(async () => {
    try {
      const payload = await getAdaptiveProfile();
      setProfileCompletionPercent(payload.profile?.completion_percent ?? 0);
    } catch {
      setProfileCompletionPercent(null);
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
    void loadProfileCompletion();
  }, [navigate, user, loadResults, loadProfileCompletion, reloadToken]);

  const hasCompletedTest = results.length > 0;
  const profileFullyComplete = profileCompletionPercent === 100;

  const nextStep = useMemo(() => {
    if (!hasCompletedTest) {
      return {
        title: 'Découvre ce qui t’intéresse',
        description: 'Commence le questionnaire pour obtenir tes premières pistes de métiers.',
        cta: 'Commencer mon parcours',
        onClick: () => navigate('/parcours'),
      };
    }
    if (!profileFullyComplete) {
      const percent = profileCompletionPercent ?? 0;
      return {
        title: percent > 0 ? `Continue ton profil (${percent} % renseigné)` : 'Complète ton profil',
        description: 'Ajoute les informations utiles sur ton parcours et tes compétences.',
        cta: 'Compléter mon profil',
        onClick: () => navigate('/profile'),
      };
    }
    if (lifeProjectFrontendEnabled) {
      return {
        title: 'Poursuis ton projet',
        description: 'Compare des pistes et définis ta prochaine action.',
        cta: 'Ouvrir mon parcours',
        onClick: () => navigate('/parcours'),
      };
    }
    return {
      title: 'Explore les métiers',
      description: 'Découvre les activités, compétences et conditions d’exercice des métiers.',
      cta: 'Explorer les métiers',
      onClick: () => navigate('/careers'),
    };
  }, [hasCompletedTest, navigate, profileCompletionPercent, profileFullyComplete]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Utilisateur';
  const avatarInitials = displayName.slice(0, 2).toUpperCase();

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="container mx-auto px-4 pb-8 pt-24 lg:pt-28">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
              <AvatarImage src={profile?.avatar_url || user?.photoURL} alt="" />
              <AvatarFallback className="bg-primary text-white">{avatarInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bienvenue, {displayName}</h1>
              <p className="mt-1 text-gray-600">Retrouve tes résultats et la prochaine étape de ton projet.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="self-center"><User className="mr-1 h-4 w-4" />Mon espace</Badge>
            {lifeProjectFrontendEnabled && <Button onClick={() => navigate('/parcours')}><Compass className="mr-2 h-4 w-4" />Mon parcours</Button>}
            <Button variant="outline" onClick={() => navigate('/profile')}><Settings className="mr-2 h-4 w-4" />Mon profil</Button>
          </div>
        </div>

        <Card className="mb-8 border-emerald-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-emerald-700">Profil renseigné</span>
              <span className="font-semibold text-gray-900">{profileCompletionPercent === null ? 'Non disponible' : `${profileCompletionPercent} %`}</span>
            </div>
            <Progress value={profileCompletionPercent ?? 0} className="mt-2 h-2" />
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
            <Button onClick={nextStep.onClick}>{nextStep.cta}</Button>
          </CardContent>
        </Card>

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card><CardContent className="flex items-center justify-between p-6"><div><p className="text-sm text-gray-600">Questionnaires terminés</p><p className="text-3xl font-bold">{results.length}</p></div><CheckCircle className="h-9 w-9 text-primary" /></CardContent></Card>
          <Card><CardContent className="flex items-center justify-between p-6"><div><p className="text-sm text-gray-600">Projet en cours</p><p className="mt-1 font-semibold">{hasCompletedTest ? 'Des pistes sont disponibles' : 'À commencer'}</p></div><Compass className="h-9 w-9 text-amber-500" /></CardContent></Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Mes résultats</CardTitle>
            <CardDescription>Retrouve ici les questionnaires enregistrés sur ton compte.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <div className="flex items-center justify-center py-12" role="status"><Loader2 className="h-8 w-8 animate-spin" /></div>}
            {!loading && error && (
              <div className="flex flex-col items-center gap-3 rounded-lg bg-red-50 p-6 text-center text-red-700">
                <p>{error}</p>
                <Button variant="outline" onClick={() => setReloadToken((token) => token + 1)}><RefreshCw className="mr-2 h-4 w-4" />Réessayer</Button>
              </div>
            )}
            {!loading && !error && results.length === 0 && (
              <div className="py-12 text-center">
                <p className="mb-4 text-gray-600">Tu n’as pas encore de résultat enregistré.</p>
                <Button onClick={() => navigate('/parcours')}>Commencer mon parcours</Button>
              </div>
            )}
            {!loading && !error && results.length > 0 && (
              <div className="space-y-4">
                {results.slice(0, RESULTS_PREVIEW_COUNT).map((result, index) => (
                  <button key={result.id} type="button" onClick={() => navigate('/parcours')} className="flex w-full items-center justify-between rounded-lg border bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50">
                    <div>
                      <p className="font-medium text-gray-900">Résultat {results.length - index}</p>
                      <p className="text-sm text-gray-500">Enregistré le {new Date(result.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <Badge variant="secondary">Ouvrir mon parcours</Badge>
                  </button>
                ))}
                {results.length > RESULTS_PREVIEW_COUNT && <p className="text-center text-sm text-gray-500">{results.length - RESULTS_PREVIEW_COUNT} autre(s) résultat(s) enregistré(s).</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
