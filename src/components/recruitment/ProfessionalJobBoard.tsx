import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Building2, Clock, Loader2, MapPin, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface JobPosting {
  id: number;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  createdAt: string;
  companyName: string;
  category?: string;
}

interface ProfessionalJobBoardProps {
  className?: string;
}

const backendRoot = String(import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

const contractLabel = (value: string) => {
  const labels: Record<string, string> = {
    full_time: 'Temps plein',
    part_time: 'Temps partiel',
    contract: 'Contrat',
    internship: 'Stage',
    freelance: 'Freelance',
    CDI: 'CDI',
    CDD: 'CDD',
    Stage: 'Stage',
  };
  return labels[value] || value || 'Type non renseigné';
};

const relativeDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date non renseignée';
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
  if (days === 0) return 'Publiée aujourd’hui';
  if (days === 1) return 'Publiée hier';
  if (days < 7) return `Publiée il y a ${days} jours`;
  return `Publiée le ${new Intl.DateTimeFormat('fr-FR').format(date)}`;
};

export const ProfessionalJobBoard = ({ className }: ProfessionalJobBoardProps) => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${backendRoot}/api/jobs?page=1&limit=50`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const payload = await response.json();
        const sourceJobs = payload?.data?.jobs;
        if (!payload?.success || !Array.isArray(sourceJobs)) {
          throw new Error('Format de réponse inattendu');
        }

        const nextJobs = sourceJobs.map((job: any): JobPosting => ({
          id: Number(job.id),
          title: String(job.title || 'Poste sans titre'),
          description: String(job.description || ''),
          location: String(job.location || 'Localisation non renseignée'),
          employmentType: String(job.type || ''),
          createdAt: String(job.publishedDate || job.created_at || ''),
          companyName: String(job.company || 'Organisation non renseignée'),
          category: job.category ? String(job.category) : undefined,
        }));

        if (active) setJobs(nextJobs);
      } catch {
        if (active) {
          setJobs([]);
          setError('Les offres ne peuvent pas être chargées pour le moment. Aucune offre de démonstration n’est affichée à la place.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('fr');
    if (!query) return jobs;
    return jobs.filter((job) => [
      job.title,
      job.companyName,
      job.location,
      job.description,
      job.category || '',
    ].some((value) => value.toLocaleLowerCase('fr').includes(query)));
  }, [jobs, searchTerm]);

  return (
    <div className={`min-h-screen bg-stone-50 px-4 pb-20 pt-14 ${className || ''}`}>
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="font-semibold text-emerald-700">Opportunités</p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">Offres d’emploi disponibles</h2>
          <p className="mt-5 text-lg leading-8 text-slate-700">
            Cette page affiche uniquement les offres retournées par le service MAKOKI. Vérifiez toujours l’identité de l’employeur, les conditions du poste et le canal de candidature avant de transmettre des informations personnelles.
          </p>
        </div>

        <div className="mt-8 max-w-2xl">
          <label htmlFor="job-search" className="mb-2 block text-sm font-medium text-slate-700">Rechercher une offre</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              id="job-search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Poste, entreprise, ville ou secteur"
              className="h-12 pl-12"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center text-slate-600">
            <Loader2 className="mr-3 h-7 w-7 animate-spin text-emerald-700" />Chargement des offres…
          </div>
        ) : error ? (
          <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950" role="status">
            {error}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="mt-10 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            <BriefcaseBusiness className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            Aucune offre ne correspond aux critères actuels.
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="h-full border-slate-200 shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{contractLabel(job.employmentType)}</Badge>
                    {job.category ? <Badge variant="outline">{job.category}</Badge> : null}
                  </div>
                  <CardTitle className="text-xl leading-tight">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4" />{job.companyName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{relativeDate(job.createdAt)}</span>
                  </div>
                  <p className="line-clamp-5 text-sm leading-7 text-slate-700">
                    {job.description || 'Description non renseignée par l’employeur.'}
                  </p>
                  <p className="rounded-lg bg-slate-100 p-3 text-xs leading-5 text-slate-600">
                    Le canal de candidature n’est affiché que lorsqu’il est fourni et vérifié par le service. Aucun bouton fictif de candidature n’est proposé.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
