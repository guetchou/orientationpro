import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface RoleDashboardScaffoldProps {
  /** Libellé du rôle affiché dans le badge (ex. "Recruteur"). */
  roleLabel: string;
  /** Titre principal de l'espace. */
  title: string;
  /** Sous-titre décrivant l'objectif de l'espace. */
  subtitle: string;
  children: React.ReactNode;
}

/**
 * Coquille commune aux tableaux de bord par rôle : en-tête d'accueil
 * personnalisé + zone de contenu. Garantit une présentation cohérente
 * entre les rôles (conseiller, recruteur, coach, RH, super admin).
 */
export function RoleDashboardScaffold({
  roleLabel,
  title,
  subtitle,
  children,
}: RoleDashboardScaffoldProps) {
  const { user, profile } = useAuth();
  const firstName =
    profile?.first_name ||
    user?.displayName ||
    user?.email?.split('@')[0] ||
    '';

  return (
    <main className="min-h-[60vh] bg-stone-50">
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="mb-2 flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              {firstName ? `Bonjour ${firstName}` : title}
            </h1>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
              {roleLabel}
            </Badge>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
            {subtitle}
          </p>
        </motion.header>

        {children}
      </div>
    </main>
  );
}

interface DashboardActionCardProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Carte d'action cliquable menant vers un outil réel du rôle. */
export function DashboardActionCard({
  to,
  icon: Icon,
  title,
  description,
}: DashboardActionCardProps) {
  return (
    <Link to={to} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-2xl">
      <Card className="h-full border-stone-200 shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-emerald-300 group-hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-3 p-5">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-100">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-stone-900">{title}</p>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

/** Grille responsive pour les cartes d'action. */
export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {children}
    </div>
  );
}

interface DashboardEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * État honnête pour un rôle dont les outils dédiés ne sont pas encore
 * disponibles. N'affiche aucune donnée fictive.
 */
export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
}: DashboardEmptyStateProps) {
  return (
    <Card className="mb-6 border-dashed border-stone-300 bg-white">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Icon className="h-6 w-6" />
        </span>
        <p className="text-lg font-semibold text-stone-900">{title}</p>
        <p className="max-w-md text-sm leading-relaxed text-stone-600">{description}</p>
      </CardContent>
    </Card>
  );
}
