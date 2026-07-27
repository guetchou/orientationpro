import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CounselorCard } from "@/components/counselors/CounselorCard";
import { CounselorFilter } from "@/components/counselors/CounselorFilter";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Search,
  Users,
  MapPin,
  Phone,
  Mail,
  Target,
  ShieldCheck,
  Award,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function Conseillers() {
  const [counselors, setCounselors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialty: "all",
    availability: "all",
  });
  // Add state variables for the filter props
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([
    "Orientation scolaire",
    "Reconversion",
    "Insertion professionnelle",
    "Bilan de compétences",
    "Coaching carrière"
  ]);

  useEffect(() => {
    const fetchCounselors = async () => {
      setIsLoading(true);
      try {
        // Fetch counselors from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('position', 'conseiller')
          .order('first_name', { ascending: true });

        if (error) throw error;
        setCounselors(data || []);
      } catch (error) {
        console.error('Error fetching counselors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounselors();
  }, []);

  // Handle specialty toggle
  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties(prev => {
      if (prev.includes(specialty)) {
        return prev.filter(s => s !== specialty);
      } else {
        return [...prev, specialty];
      }
    });
  };

  // Filter counselors based on selected filters and search term
  const filteredCounselors = counselors.filter((counselor: any) => {
    // Filter by search term
    if (searchTerm && !`${counselor.first_name} ${counselor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !counselor.department?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filter by specialties
    if (selectedSpecialties.length > 0 && !selectedSpecialties.includes(counselor.department)) {
      return false;
    }

    // Apply specialty filter if not "all"
    if (filters.specialty !== "all" && counselor.department !== filters.specialty) {
      return false;
    }

    return true;
  });

  const values = [
    {
      icon: Award,
      title: "Professionnels vérifiés",
      description: "Des conseillers et coachs autorisés, dont le profil est contrôlé.",
    },
    {
      icon: Target,
      title: "Accompagnement personnalisé",
      description: "Un suivi adapté à votre situation : études, reconversion, insertion.",
    },
    {
      icon: ShieldCheck,
      title: "Méthode explicable",
      description: "Des outils dont on assume les sources, les versions et les limites.",
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ============================ HERO ============================ */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="/images/hero/accompagnement-conseiller.webp"
            srcSet="/images/hero/accompagnement-conseiller-sm.webp 768w, /images/hero/accompagnement-conseiller.webp 1600w"
            sizes="100vw"
            alt="Un conseiller d’orientation échange avec un jeune couple autour d’un bureau à Brazzaville."
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/80 to-emerald-900/40" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-2xl text-white"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-white/10 px-4 py-1.5 text-sm font-medium text-amber-100 backdrop-blur-sm">
              <Users className="h-4 w-4" />
              Être accompagné
            </span>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Un conseiller à vos côtés,
              <span className="block text-amber-200">pour décider en confiance</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-emerald-50/90">
              Rencontrez des conseillers et coachs autorisés pour transformer un résultat
              d’orientation en projet concret d’études ou d’emploi.
            </p>
            <Button size="lg" asChild className="mt-8 bg-amber-400 text-emerald-950 hover:bg-amber-300">
              <Link to="/book-appointment">
                <Calendar className="mr-2 h-5 w-5" /> Prendre rendez-vous
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ========================= VALEURS ========================= */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-6 sm:grid-cols-3">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-primary">
                <value.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold text-stone-900">{value.title}</h3>
              <p className="mt-2 text-stone-600">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==================== RECHERCHE ET FILTRES ==================== */}
      <section className="border-y border-stone-200 bg-white py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-8 text-center">
            <h2 className="font-heading text-3xl font-bold text-stone-900">Trouvez votre conseiller</h2>
            <p className="mt-2 text-stone-600">
              Filtrez par spécialité et par nom pour trouver l’accompagnement adapté à vos besoins.
            </p>
          </div>
          <CounselorFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedSpecialties={selectedSpecialties}
            onSpecialtyToggle={handleSpecialtyToggle}
            availableSpecialties={availableSpecialties}
            onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
            currentFilters={filters}
          />
        </div>
      </section>

      {/* ===================== LISTE DES CONSEILLERS ===================== */}
      <section className="bg-stone-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
                  <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-stone-200"></div>
                  <div className="mx-auto mb-2 h-6 w-3/4 rounded bg-stone-200"></div>
                  <div className="mx-auto mb-4 h-4 w-1/2 rounded bg-stone-200"></div>
                  <div className="mb-4 h-20 rounded bg-stone-200"></div>
                  <div className="h-10 rounded bg-stone-200"></div>
                </div>
              ))}
            </div>
          ) : filteredCounselors.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredCounselors.map((counselor, index) => (
                <motion.div
                  key={counselor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                >
                  <CounselorCard counselor={counselor} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-12 shadow-sm">
                <Search className="mx-auto mb-6 h-16 w-16 text-stone-300" />
                <h3 className="mb-3 font-heading text-2xl font-semibold text-stone-900">Aucun conseiller trouvé</h3>
                <p className="mb-8 text-stone-600">
                  Modifiez vos filtres, ou prenez rendez-vous pour être orienté vers le bon interlocuteur.
                </p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button asChild variant="outline">
                    <Link to="/book-appointment">Prendre rendez-vous</Link>
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary-800"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedSpecialties([]);
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================== CTA =========================== */}
      <section className="relative isolate overflow-hidden bg-primary-900">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Besoin d’aide pour choisir un conseiller ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-50/90">
              Prenez rendez-vous : nous vous orientons vers le professionnel adapté à votre projet.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild className="bg-amber-400 text-emerald-950 hover:bg-amber-300">
                <Link to="/book-appointment">
                  <Calendar className="mr-2 h-5 w-5" /> Prendre rendez-vous
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <a href="tel:+242055344253">
                  <Phone className="mr-2 h-5 w-5" /> Nous appeler
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================== INFORMATIONS DE CONTACT ===================== */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold text-stone-900">Informations de contact</h2>
            <p className="mt-2 text-lg text-stone-600">
              Notre équipe est disponible pour répondre à toutes vos questions.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-stone-900">Email</h3>
              <a href="mailto:contact@makoki.org" className="text-stone-600 hover:text-primary">
                contact@makoki.org
              </a>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                <Phone className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-stone-900">Téléphone</h3>
              <a href="tel:+242055344253" className="text-stone-600 hover:text-primary">
                +242 05 534 42 53
              </a>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-stone-900">Adresse</h3>
              <p className="text-stone-600">Brazzaville, République du Congo</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
