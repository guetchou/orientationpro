import { Navigate } from 'react-router-dom';
import { isPostBacEnabled } from '@/features/postbac/config';
import PostBacLanding from '@/features/postbac/PostBacLanding';

// Route publique /post-bac auto-gatee par le feature flag. Lorsque le flag est
// desactive, la page redirige vers l'accueil (redirection controlee) et reste
// donc inaccessible.
export default function PostBac() {
  if (!isPostBacEnabled()) {
    return <Navigate to="/" replace />;
  }
  return <PostBacLanding />;
}
