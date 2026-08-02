import { ArrowLeft, Home, LogIn, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Unauthorized() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-20 pt-28">
      <div className="mx-auto max-w-2xl">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <ShieldAlert className="h-7 w-7" />
            </span>
            <CardTitle className="mt-4 text-3xl">Accès non autorisé</CardTitle>
            <CardDescription className="text-base">
              Ton compte ne dispose pas des droits nécessaires pour ouvrir cette page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-center text-sm leading-6 text-slate-600">
              Vérifie que tu utilises le bon compte. Tu peux aussi revenir à ton espace ou te reconnecter.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link to="/dashboard"><Home className="mr-2 h-4 w-4" />Retour à mon espace</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/login"><LogIn className="mr-2 h-4 w-4" />Se reconnecter</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Accueil</Link>
              </Button>
            </div>
            <p className="text-center text-sm text-slate-500">
              Besoin d’aide ? <a className="font-medium text-emerald-700 underline" href="mailto:support@makoki.org">support@makoki.org</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
