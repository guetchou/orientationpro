import { usePageMeta } from '@/hooks/usePageMeta';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Mail, MapPin, Phone, Search, Users } from 'lucide-react';
import { CounselorCard } from '@/components/counselors/CounselorCard';
import { CounselorFilter } from '@/components/counselors/CounselorFilter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Counselor = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  department?: string | null;
  [key: string]: unknown;
};

const specialties = [
  'Orientation scolaire',
  'Reconversion',
  'Insertion professionnelle',
  'Bilan de compétences',
  'Coaching carrière',
];

export default function Conseillers() {
  usePageMeta({
    title: 'Accompagnement',
    description: 'Contactez MAKOKI pour demander un accompagnement adapté à votre projet.',
    path: '/conseiller',
  });
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    const fetchCounselors = async () => {
      setIsLoading(true);
      try {
        // Aucun annuaire de conseillers n'existe encore côté backend (voir
        // le retrait de Supabase) : la liste reste vide plutôt que de
        // simuler des données qui n'existent pas.
        throw new Error('counselor directory backend not implemented');
      } catch {
        if (active) setCounselors([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void fetchCounselors();
    return () => { active = false; };
  }, []);

  const filteredCounselors = useMemo(() => counselors.filter((counselor) => {
    const fullName = `${counselor.first_name || ''} ${counselor.last_name || ''}`.toLowerCase();
    const specialty = String(counselor.department || '');
    if (searchTerm && !fullName.includes(searchTerm.toLowerCase()) && !specialty.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedSpecialties.length > 0 && !selectedSpecialties.includes(specialty)) return false;
    return true;
  }), [counselors, searchTerm, selectedSpecialties]);

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((current) => current.includes(specialty)
      ? current.filter((entry) => entry !== specialty)
      : [...current, specialty]);
  };

  return (
    <main className="min-h-screen bg-stone-50 pb-20 pt-24">
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-3xl">
          <p className="font-semibold text-emerald-700">Accompagnement</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">Parler de ton projet avec une personne</h1>
          <p className="mt-6 text-lg leading-8 text-stone-700">
            Tu peux demander de l’aide pour clarifier tes études, une formation, une recherche d’emploi ou une réorientation. MAKOKI te répond d’abord par téléphone, WhatsApp ou e-mail, puis précise la forme d’accompagnement possible.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild><Link to="/book-appointment"><Calendar className="mr-2 h-5 w-5" />Demander un rendez-vous</Link></Button>
            <Button size="lg" variant="outline" asChild><a href="tel:+242055344253"><Phone className="mr-2 h-5 w-5" />Appeler</a></Button>
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-5 md:grid-cols-3">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-emerald-700" />Clarifier ta demande</CardTitle></CardHeader>
              <CardContent className="text-sm leading-7 text-stone-700">Explique ta situation, ce qui te bloque et la décision que tu dois prendre.</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-emerald-700" />Choisir un échange</CardTitle></CardHeader>
              <CardContent className="text-sm leading-7 text-stone-700">Le format, la disponibilité et le tarif éventuel sont confirmés avant le rendez-vous.</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-emerald-700" />Préparer la suite</CardTitle></CardHeader>
              <CardContent className="text-sm leading-7 text-stone-700">Repars avec des pistes à vérifier et une prochaine action claire.</CardContent>
            </Card>
          </div>
        </div>
      </section>

      {(isLoading || counselors.length > 0) && (
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 max-w-3xl">
            <h2 className="text-3xl font-bold text-stone-950">Profils actuellement publiés</h2>
            <p className="mt-3 text-stone-600">Seuls les profils présents dans l’annuaire sont affichés. Vérifie les qualifications, conditions et disponibilités avant de confirmer un accompagnement.</p>
          </div>

          {counselors.length > 0 && (
            <CounselorFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedSpecialties={selectedSpecialties}
              onSpecialtyToggle={toggleSpecialty}
              availableSpecialties={specialties}
              onFilterChange={() => undefined}
              currentFilters={{ specialty: 'all', availability: 'all' }}
            />
          )}

          {isLoading ? (
            <p className="mt-8 text-sm text-stone-600" role="status">Chargement des profils…</p>
          ) : filteredCounselors.length > 0 ? (
            <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredCounselors.map((counselor) => <CounselorCard key={counselor.id} counselor={counselor} />)}
            </div>
          ) : counselors.length > 0 ? (
            <div className="mt-8 rounded-xl border bg-white p-8 text-center">
              <h3 className="font-semibold text-stone-950">Aucun profil ne correspond aux filtres</h3>
              <Button className="mt-4" variant="outline" onClick={() => { setSearchTerm(''); setSelectedSpecialties([]); }}>Effacer les filtres</Button>
            </div>
          ) : null}
        </section>
      )}

      <section className="mx-auto max-w-5xl px-6 py-14">
        <Card className="border-emerald-200 bg-emerald-50/60">
          <CardHeader>
            <CardTitle>Contacter MAKOKI</CardTitle>
            <CardDescription>Présente brièvement ta situation et indique comment tu souhaites être recontacté.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <a className="rounded-lg border bg-white p-4 text-sm" href="mailto:contact@makoki.org"><Mail className="mb-2 h-5 w-5 text-emerald-700" /><strong>E-mail</strong><span className="mt-1 block text-stone-600">contact@makoki.org</span></a>
            <a className="rounded-lg border bg-white p-4 text-sm" href="tel:+242055344253"><Phone className="mb-2 h-5 w-5 text-emerald-700" /><strong>Téléphone</strong><span className="mt-1 block text-stone-600">+242 05 534 42 53</span></a>
            <div className="rounded-lg border bg-white p-4 text-sm"><MapPin className="mb-2 h-5 w-5 text-emerald-700" /><strong>Localisation</strong><span className="mt-1 block text-stone-600">Brazzaville, République du Congo</span></div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
