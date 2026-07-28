import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Briefcase,
  CalendarCheck,
  Compass,
  FileText,
  GraduationCap,
  Home,
  Info,
  LayoutDashboard,
  LogIn,
  LogOut,
  Sparkles,
  UserCircle,
  Users,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useAuth } from '@/hooks/useAuth';

interface PaletteItem {
  label: string;
  to: string;
  icon: LucideIcon;
  keywords?: string;
}

const EXPLORER: PaletteItem[] = [
  { label: 'Passer le test RIASEC', to: '/tests/riasec', icon: Sparkles, keywords: 'orientation interets holland questionnaire' },
  { label: 'Découvrir mon profil', to: '/tests', icon: Compass, keywords: 'tests connaissance de soi' },
  { label: 'Explorer les métiers', to: '/careers', icon: GraduationCap, keywords: 'catalogue onet professions carriere' },
  { label: "Voir les offres d'emploi", to: '/jobs', icon: Briefcase, keywords: 'travail recrutement emploi' },
  { label: 'Lire le blog et les ressources', to: '/blog', icon: BookOpen, keywords: 'articles guides actualites' },
];

const TESTS: PaletteItem[] = [
  { label: 'Test RIASEC (intérêts)', to: '/tests/riasec', icon: Sparkles, keywords: 'holland interets' },
  { label: 'Intelligence émotionnelle', to: '/tests/emotional', icon: Compass, keywords: 'emotions' },
  { label: "Style d'apprentissage", to: '/tests/learning', icon: Compass, keywords: 'apprendre etudes' },
  { label: 'Intelligences multiples', to: '/tests/multiple', icon: Compass, keywords: 'gardner' },
  { label: 'Reconversion professionnelle', to: '/tests/career-transition', icon: Compass, keywords: 'changer de metier' },
  { label: 'Orientation sans diplôme', to: '/tests/no-diploma', icon: Compass, keywords: 'sans bac formation' },
  { label: 'Emploi des seniors', to: '/tests/senior-employment', icon: Compass, keywords: 'age experience' },
  { label: 'Profil entrepreneurial', to: '/tests/entrepreneurial', icon: Compass, keywords: 'entreprise creer' },
];

const PAGES: PaletteItem[] = [
  { label: 'Accueil', to: '/', icon: Home },
  { label: 'À propos', to: '/about', icon: Info, keywords: 'mission methode' },
  { label: 'Conseillers', to: '/conseiller', icon: Users, keywords: 'coach accompagnement' },
  { label: 'Prendre rendez-vous', to: '/book-appointment', icon: CalendarCheck, keywords: 'rdv' },
  { label: 'Optimiser mon CV', to: '/cv-optimizer', icon: FileText, keywords: 'ats curriculum' },
  { label: 'Guide des études au Congo 2024', to: '/guide-congo-2024', icon: BookOpen, keywords: 'post-bac filieres' },
];

/**
 * Palette de commandes globale (⌘K / Ctrl+K). Recherche instantanée des
 * pages, tests et espaces publics du site. Ouverte au clavier ou via
 * l'événement « makoki:open-search » (boutons du header).
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
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

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  const renderItems = (items: PaletteItem[]) =>
    items.map((item) => {
      const Icon = item.icon;
      return (
        <CommandItem key={item.label} value={`${item.label} ${item.keywords ?? ''}`} onSelect={() => go(item.to)}>
          <Icon className="mr-2 h-4 w-4 text-emerald-600" />
          {item.label}
        </CommandItem>
      );
    });

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher une page, un test, un métier…" />
      <CommandList>
        <CommandEmpty>Aucun résultat. Essaie « test », « métiers » ou « rendez-vous ».</CommandEmpty>

        <CommandGroup heading="Explorer">{renderItems(EXPLORER)}</CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Tests d'orientation">{renderItems(TESTS)}</CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Aller à">{renderItems(PAGES)}</CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Compte">
          {user ? (
            <>
              <CommandItem value="mon profil compte" onSelect={() => go('/profile')}>
                <UserCircle className="mr-2 h-4 w-4 text-emerald-600" />
                Mon profil
              </CommandItem>
              <CommandItem value="tableau de bord dashboard espace" onSelect={() => go('/dashboard')}>
                <LayoutDashboard className="mr-2 h-4 w-4 text-emerald-600" />
                Mon tableau de bord
              </CommandItem>
              <CommandItem
                value="se deconnecter logout quitter"
                onSelect={() => {
                  setOpen(false);
                  void signOut().then(() => navigate('/'));
                }}
              >
                <LogOut className="mr-2 h-4 w-4 text-red-600" />
                Se déconnecter
              </CommandItem>
            </>
          ) : (
            <>
              <CommandItem value="se connecter login connexion" onSelect={() => go('/login')}>
                <LogIn className="mr-2 h-4 w-4 text-emerald-600" />
                Se connecter
              </CommandItem>
              <CommandItem value="creer un compte inscription register" onSelect={() => go('/register')}>
                <UserCircle className="mr-2 h-4 w-4 text-emerald-600" />
                Créer un compte
              </CommandItem>
            </>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
