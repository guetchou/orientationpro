import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, User, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  ...(String(import.meta.env.VITE_POSTBAC_AUTO_V1_ENABLED ?? '').trim() === 'true'
    ? [{ name: 'Après le bac', path: '/post-bac' }]
    : []),
  { name: 'Découvrir mon profil', path: '/tests' },
  { name: 'Explorer les métiers', path: '/careers' },
  { name: 'Offres', path: '/jobs' },
  { name: 'Ressources', path: '/blog' },
];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActivePath = (path: string) => (
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors ${
        isScrolled ? 'border-slate-200 bg-white/95 shadow-sm backdrop-blur' : 'border-transparent bg-white/90 backdrop-blur'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:h-20 lg:px-6">
        <Link to="/" className="flex items-center gap-3" aria-label="Accueil MAKOKI">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-xl font-bold text-white shadow-sm">
            M
          </span>
          <span>
            <span className="block text-xl font-bold tracking-tight text-slate-950">MAKOKI</span>
            <span className="block text-xs text-slate-500">Orientation • Compétences • Emploi</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex" aria-label="Navigation principale">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActivePath(item.path)
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-44 truncate">{user.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/profile"><User className="mr-2 h-4 w-4" />Mon profil</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-700">
                  <LogOut className="mr-2 h-4 w-4" />Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild><Link to="/login">Connexion</Link></Button>
              <Button asChild><Link to="/register">Créer un compte</Link></Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-200 bg-white lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block rounded-lg px-3 py-3 font-medium ${
                    isActivePath(item.path) ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="mt-3 border-t border-slate-200 pt-3">
                {user ? (
                  <>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)}>Mon profil</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-red-700" onClick={handleLogout}>
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <div className="grid gap-2">
                    <Button variant="outline" asChild><Link to="/login">Connexion</Link></Button>
                    <Button asChild><Link to="/register">Créer un compte</Link></Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};

export default Header;
