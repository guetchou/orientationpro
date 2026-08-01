import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Briefcase,
  CalendarCheck,
  FileText,
  GraduationCap,
  Home,
  Info,
  LayoutDashboard,
  LogIn,
  LogOut,
  Route,
  Search,
  UserCircle,
  Users,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface Item {
  group: string;
  label: string;
  to: string;
  icon: LucideIcon;
  keywords?: string;
}

const EXPLORER: Item[] = [
  {
    group: 'Orientation',
    label: 'Construire mon Projet de vie',
    to: '/parcours',
    icon: Route,
    keywords: 'orientation riasec interets holland questionnaire test profil scenarios rapport action',
  },
  { group: 'Explorer', label: 'Explorer les métiers', to: '/careers', icon: GraduationCap, keywords: 'catalogue onet professions carriere' },
  { group: 'Explorer', label: "Voir les offres d'emploi", to: '/jobs', icon: Briefcase, keywords: 'travail recrutement emploi' },
  { group: 'Explorer', label: 'Lire le blog et les ressources', to: '/blog', icon: BookOpen, keywords: 'articles guides actualites' },
];

const PAGES: Item[] = [
  { group: 'Aller à', label: 'Accueil', to: '/', icon: Home },
  { group: 'Aller à', label: 'À propos', to: '/about', icon: Info, keywords: 'mission methode' },
  { group: 'Aller à', label: 'Accompagnement facultatif', to: '/conseiller', icon: Users, keywords: 'conseiller coach accompagnement' },
  { group: 'Aller à', label: 'Prendre rendez-vous', to: '/book-appointment', icon: CalendarCheck, keywords: 'rdv' },
  { group: 'Aller à', label: 'Optimiser mon CV', to: '/cv-optimizer', icon: FileText, keywords: 'ats curriculum' },
  { group: 'Aller à', label: 'Guide des études au Congo 2024', to: '/guide-congo-2024', icon: BookOpen, keywords: 'post-bac filieres' },
];

const LOGOUT = '__logout';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Palette de commandes globale (⌘K / Ctrl+K). Les recherches liées aux tests,
 * au RIASEC, au profil ou au rapport convergent toutes vers le Projet de vie.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener('keydown', onKey);
    window.addEventListener('makoki:open-search', onOpen);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('makoki:open-search', onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);

  const account: Item[] = user
    ? [
        { group: 'Compte', label: 'Mon profil', to: '/profile', icon: UserCircle, keywords: 'compte' },
        { group: 'Compte', label: 'Mon tableau de bord', to: '/dashboard', icon: LayoutDashboard, keywords: 'espace' },
        { group: 'Compte', label: 'Se déconnecter', to: LOGOUT, icon: LogOut, keywords: 'quitter logout' },
      ]
    : [
        { group: 'Compte', label: 'Se connecter', to: '/login', icon: LogIn, keywords: 'connexion' },
        { group: 'Compte', label: 'Créer un compte', to: '/register', icon: UserCircle, keywords: 'inscription register' },
      ];

  const filtered = useMemo(() => {
    const all = [...EXPLORER, ...PAGES, ...account];
    const q = norm(query.trim());
    if (!q) return all;
    return all.filter((item) => norm(`${item.label} ${item.keywords ?? ''}`).includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, user]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const select = (item: Item) => {
    setOpen(false);
    if (item.to === LOGOUT) {
      void signOut().then(() => navigate('/'));
    } else {
      navigate(item.to);
    }
  };

  const onInputKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = filtered[active];
      if (item) select(item);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Recherche</DialogTitle>

        <div className="flex items-center gap-2 border-b border-slate-200 px-4">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKey}
            placeholder="Rechercher un parcours, un métier, une ressource…"
            aria-label="Rechercher"
            className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-500">
              Aucun résultat. Essaie « Projet de vie », « métiers » ou « rendez-vous ».
            </p>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const showHeader = index === 0 || filtered[index - 1].group !== item.group;
              return (
                <div key={`${item.group}-${item.label}`}>
                  {showHeader && (
                    <p className="px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                      {item.group}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => select(item)}
                    onMouseMove={() => setActive(index)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      index === active ? 'bg-emerald-50 text-emerald-900' : 'text-slate-700 hover:bg-slate-50',
                    )}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0', item.to === LOGOUT ? 'text-red-600' : 'text-emerald-600')} />
                    {item.label}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="hidden items-center justify-between border-t border-slate-200 px-4 py-2 text-xs text-slate-400 sm:flex">
          <span>↑↓ pour naviguer · Entrée pour ouvrir</span>
          <span>Échap pour fermer</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
