import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AtsRecruiterErrorView } from './errors';

export const AtsLoading = ({ label }: { label: string }) => (
  <div
    className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-stone-600"
    role="status"
    aria-live="polite"
  >
    <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
    <p>{label}</p>
  </div>
);

export const AtsEmpty = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
    <h3 className="font-heading text-xl font-semibold text-stone-900">{title}</h3>
    <p className="mt-2 text-stone-600">{description}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);

export const AtsErrorState = ({
  error,
  onRetry,
}: {
  error: AtsRecruiterErrorView;
  onRetry?: () => void;
}) => {
  const Icon = error.kind === 'network' ? WifiOff : AlertCircle;
  return (
    <div
      className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center"
      role="alert"
    >
      <Icon className="h-8 w-8 text-amber-700" />
      <p className="text-amber-900">{error.message}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {error.kind === 'unauthenticated' ? (
          <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
            <Link to="/login">Se reconnecter</Link>
          </Button>
        ) : null}
        {onRetry && error.kind !== 'unauthenticated' ? (
          <Button variant="outline" onClick={onRetry}>
            Réessayer
          </Button>
        ) : null}
      </div>
    </div>
  );
};

// Carte affichée quand la capacité serveur ats.workflow-v1 n'est pas configurée
// ou n'est pas dans un état exploitable (loading/error gérés séparément par la page).
export const AtsCapabilityDisabled = () => (
  <div className="container py-16">
    <Card>
      <CardHeader>
        <CardTitle>Espace recruteur indisponible</CardTitle>
        <CardDescription>
          La capacité serveur n’est pas activée dans cet environnement. Aucune simulation
          locale ne remplace le workflow métier.
        </CardDescription>
      </CardHeader>
    </Card>
  </div>
);
