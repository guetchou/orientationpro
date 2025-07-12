import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    switch (user.role) {
      case 'admin':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'superadmin':
        navigate('/superadmin/dashboard', { replace: true });
        break;
      case 'conseiller':
        navigate('/conseiller/dashboard', { replace: true });
        break;
      case 'coach':
        navigate('/coach/dashboard', { replace: true });
        break;
      case 'recruteur':
        navigate('/recruteur/dashboard', { replace: true });
        break;
      case 'rh':
        navigate('/rh/dashboard', { replace: true });
        break;
      default:
        // Dashboard user par défaut (candidat)
        // Tu peux personnaliser ici le dashboard user si besoin
        break;
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin w-8 h-8 text-primary mb-4" />
      <p className="text-gray-600">Redirection vers votre espace...</p>
    </div>
  );
} 