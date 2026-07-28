import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CvErrorView } from './cvApi';

// Etat de chargement honnete : reflete une operation reelle en cours, jamais
// une fausse progression temporisee.
export const CvLoading = ({ label }: { label: string }) => (
  <div
    className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-stone-600"
    role="status"
    aria-live="polite"
  >
    <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
    <p>{label}</p>
  </div>
);

export const CvEmpty = ({
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

// Affiche une erreur controlee. Pour une session expiree, propose la reconnexion.
export const CvErrorState = ({
  error,
  onRetry,
}: {
  error: CvErrorView;
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
