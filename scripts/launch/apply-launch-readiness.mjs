import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const replaceExact = (file, before, after) => {
  const source = read(file);
  if (!source.includes(before)) throw new Error(`Ancre introuvable dans ${file}: ${before.slice(0, 100)}`);
  write(file, source.replace(before, after));
};
const replaceRegex = (file, pattern, after) => {
  const source = read(file);
  if (!pattern.test(source)) throw new Error(`Motif introuvable dans ${file}: ${pattern}`);
  write(file, source.replace(pattern, after));
};

replaceExact(
  'src/pages/Home.tsx',
  "  'Les formations ou les écoles à choisir.',",
  "  'Les formations et les écoles à explorer et comparer.',",
);
replaceExact(
  'src/pages/Home.tsx',
  `              Découvre les métiers qui te correspondent,\n              <span className="block text-amber-200">en 15 minutes.</span>`,
  `              Commence à construire un projet qui te ressemble,\n              <span className="block text-amber-200">étape par étape.</span>`,
);

replaceExact(
  'backend/src/orientation/riasec/instrument.js',
  "  title: 'Exploration des intérêts professionnels RIASEC',",
  "  title: 'Exploration de tes centres d’intérêt professionnels',",
);
replaceExact(
  'backend/src/orientation/riasec/instrument.js',
  `  responseScale: Object.freeze([\n    Object.freeze({ value: 1, label: 'Pas du tout d’accord' }),\n    Object.freeze({ value: 2, label: 'Plutôt pas d’accord' }),\n    Object.freeze({ value: 3, label: 'Ni d’accord ni pas d’accord' }),\n    Object.freeze({ value: 4, label: 'Plutôt d’accord' }),\n    Object.freeze({ value: 5, label: 'Tout à fait d’accord' }),\n  ]),`,
  `  responseScale: Object.freeze([\n    Object.freeze({ value: 1, label: 'Pas du tout' }),\n    Object.freeze({ value: 2, label: 'Un peu' }),\n    Object.freeze({ value: 3, label: 'Moyennement' }),\n    Object.freeze({ value: 4, label: 'Beaucoup' }),\n    Object.freeze({ value: 5, label: 'Tout à fait' }),\n  ]),`,
);

replaceRegex(
  'src/features/life-project/riasec-profile.ts',
  /export const riasecDimensionLabels:[\s\S]*?\n};/,
  `export const riasecDimensionLabels: Record<AdvisorRiasecDimension, string> = {\n  R: 'Pratique et technique',\n  I: 'Analyse et recherche',\n  A: 'Création et expression',\n  S: 'Aide et transmission',\n  E: 'Initiative et leadership',\n  C: 'Organisation et précision',\n};`,
);

replaceExact(
  'src/features/life-project/UnifiedLifeProjectPage.tsx',
  'C’est un premier indice, pas une conclusion. Ton résultat complet tient compte de plusieurs tendances et de ta situation personnelle.',
  'C’est un premier indice, pas une conclusion. La suite tiendra compte de plusieurs tendances, de tes compétences et de ta situation personnelle.',
);
replaceExact(
  'src/features/life-project/UnifiedLifeProjectPage.tsx',
  '<Badge className="w-fit" variant="outline">Ton résultat complet est prêt</Badge>',
  '<Badge className="w-fit" variant="outline">Ton premier résultat est prêt</Badge>',
);
replaceExact(
  'src/features/life-project/UnifiedLifeProjectPage.tsx',
  '<CardTitle>Enregistre ton résultat et découvre la suite</CardTitle>',
  '<CardTitle>Enregistre ce premier résultat et construis la suite</CardTitle>',
);

replaceExact(
  'src/features/life-project/EmbeddedRiasecStep.tsx',
  'Tes réponses sont conservées sur cet appareil pendant le test afin que tu puisses reprendre en cas d’interruption.',
  'Tes réponses sont conservées sur cet appareil pendant le questionnaire afin que tu puisses reprendre en cas d’interruption.',
);
replaceExact(
  'src/features/life-project/EmbeddedRiasecStep.tsx',
  'Commencer le test <ArrowRight className="ml-2 h-5 w-5" />',
  'Commencer le questionnaire <ArrowRight className="ml-2 h-5 w-5" />',
);
replaceExact(
  'src/features/life-project/EmbeddedRiasecStep.tsx',
  'Tes réponses restent disponibles sur cet appareil pendant le test.',
  'Tes réponses restent disponibles sur cet appareil pendant le questionnaire.',
);

replaceExact(
  'src/features/life-project/LifeProjectCompletionPanel.tsx',
  '<section className="space-y-4 print:hidden" aria-labelledby="life-project-comparison-title">',
  '<section className="space-y-4 print:block" aria-labelledby="life-project-comparison-title">',
);
replaceExact(
  'src/features/life-project/LifeProjectCompletionPanel.tsx',
  '<CardContent className="overflow-x-auto p-0">',
  '<CardContent className="overflow-x-auto p-0 print:overflow-visible">',
);
replaceExact(
  'src/features/life-project/LifeProjectCompletionPanel.tsx',
  '<table className="w-full min-w-[880px] border-collapse text-left text-sm">',
  '<table className="w-full min-w-[880px] border-collapse text-left text-sm print:min-w-0 print:text-[10px]">',
);
replaceExact(
  'src/features/life-project/LifeProjectCompletionPanel.tsx',
  '<Card className="border-emerald-300 bg-emerald-50/40 print:border-0 print:bg-white print:shadow-none">',
  '<Card className="break-before-page border-emerald-300 bg-emerald-50/40 print:border-0 print:bg-white print:shadow-none">',
);

replaceExact(
  'src/router/AppRouter.tsx',
  '<Route path="/cv-optimizer" element={<UserRoute><CVOptimizer /></UserRoute>} />',
  '<Route path="/cv-optimizer" element={<CVOptimizer />} />',
);

const serviceRequestCard = `import { FormEvent, useMemo, useState } from 'react';
import { Mail, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export type LaunchService = 'emploi' | 'cv' | 'recrutement';

const labels: Record<LaunchService, string> = {
  emploi: 'Recherche d’opportunités',
  cv: 'Accompagnement CV',
  recrutement: 'Besoin de recrutement',
};

interface ServiceRequestCardProps {
  service: LaunchService;
  title: string;
  description: string;
  submitLabel?: string;
}

export function ServiceRequestCard({ service, title, description, submitLabel = 'Envoyer par WhatsApp' }: ServiceRequestCardProps) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [need, setNeed] = useState('');

  const message = useMemo(() => [
    'Bonjour MAKOKI,',
    '',
    'Service : ' + labels[service],
    'Nom : ' + (name.trim() || 'Non renseigné'),
    'Contact : ' + (contact.trim() || 'Non renseigné'),
    'Besoin : ' + (need.trim() || 'Non renseigné'),
    '',
    'Je souhaite être recontacté pour préciser les conditions, le délai et le tarif éventuel avant toute prestation.',
  ].join('\\n'), [contact, name, need, service]);

  const emailHref = 'mailto:contact@makoki.org?subject=' + encodeURIComponent(labels[service] + ' — demande depuis makoki.org') + '&body=' + encodeURIComponent(message);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const url = 'https://wa.me/242055344253?text=' + encodeURIComponent(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="border-emerald-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-base leading-7">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={service + '-name'} className="mb-2 block text-sm font-medium">Nom ou organisation</label>
              <Input id={service + '-name'} value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required />
            </div>
            <div>
              <label htmlFor={service + '-contact'} className="mb-2 block text-sm font-medium">Téléphone ou e-mail</label>
              <Input id={service + '-contact'} value={contact} onChange={(event) => setContact(event.target.value)} maxLength={160} required />
            </div>
          </div>
          <div>
            <label htmlFor={service + '-need'} className="mb-2 block text-sm font-medium">Décris brièvement ton besoin</label>
            <textarea
              id={service + '-need'}
              value={need}
              onChange={(event) => setNeed(event.target.value)}
              className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              maxLength={1500}
              required
            />
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Aucun document n’est téléversé sur cette page. Le message est envoyé uniquement lorsque tu choisis WhatsApp ou e-mail.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit"><MessageCircle className="mr-2 h-4 w-4" />{submitLabel}</Button>
            <Button type="button" variant="outline" asChild><a href={emailHref}><Mail className="mr-2 h-4 w-4" />Envoyer par e-mail</a></Button>
          </div>
          <p className="flex items-start gap-2 text-xs text-slate-500"><Send className="mt-0.5 h-3.5 w-3.5 shrink-0" />MAKOKI confirme ensuite le périmètre, la disponibilité et le tarif éventuel avant tout engagement.</p>
        </form>
      </CardContent>
    </Card>
  );
}

export default ServiceRequestCard;
`;
write('src/components/services/ServiceRequestCard.tsx', serviceRequestCard);

replaceExact(
  'src/pages/ProfessionalJobsPage.tsx',
  "import { ProfessionalJobBoard } from '@/components/recruitment/ProfessionalJobBoard';",
  "import { ProfessionalJobBoard } from '@/components/recruitment/ProfessionalJobBoard';\nimport { ServiceRequestCard } from '@/components/services/ServiceRequestCard';",
);
replaceExact(
  'src/pages/ProfessionalJobsPage.tsx',
  '      <ProfessionalJobBoard />\n    </div>',
  `      <ProfessionalJobBoard />\n      <section className="mx-auto max-w-6xl px-6 pb-20">\n        <ServiceRequestCard\n          service="emploi"\n          title="Demander une recherche d’opportunités ciblée"\n          description="Indique le métier, la ville, ton niveau d’expérience et le type de contrat recherché. MAKOKI vérifie les pistes disponibles et te répond sans afficher de fausses offres."\n          submitLabel="Demander la recherche"\n        />\n      </section>\n    </div>`,
);

replaceExact(
  'src/pages/RecruitmentPage.tsx',
  "import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';",
  "import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';\nimport { ServiceRequestCard } from '@/components/services/ServiceRequestCard';",
);
replaceExact(
  'src/pages/RecruitmentPage.tsx',
  '        <div className="mt-12 grid gap-6 lg:grid-cols-2">',
  `        <section className="mt-12">\n          <ServiceRequestCard\n            service="recrutement"\n            title="Déposer un besoin de recrutement"\n            description="Présente le poste, le lieu, le contrat, les compétences indispensables et la date souhaitée. L’équipe MAKOKI te recontacte pour valider le besoin et proposer un accompagnement réaliste."\n            submitLabel="Déposer le besoin"\n          />\n        </section>\n\n        <div className="mt-12 grid gap-6 lg:grid-cols-2">`,
);

const cvOptimizerPage = `import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import CvOptimizerPage from '@/features/cv-optimizer/CvOptimizerPage';
import { ServiceRequestCard } from '@/components/services/ServiceRequestCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const checks = [
  'Le poste recherché est clairement indiqué.',
  'Les coordonnées sont faciles à trouver.',
  'Les expériences décrivent des résultats concrets.',
  'Les compétences correspondent au poste ciblé.',
  'Le document utilise des titres simples et lisibles.',
  'Aucune information fausse ou impossible à vérifier n’est ajoutée.',
];

export default function CVOptimizer() {
  usePageMeta({ title: 'Optimiser mon CV', description: 'Vérifie ton CV et demande un accompagnement personnalisé avec MAKOKI.', path: '/cv-optimizer' });
  const automatedAnalysisEnabled = String(import.meta.env.VITE_CV_ANALYSIS_ENABLED ?? import.meta.env.VITE_CV_OPTIMIZER_ENABLED ?? '').trim().toLowerCase() === 'true';
  const [selected, setSelected] = useState<string[]>([]);
  const completed = useMemo(() => selected.length, [selected]);

  if (automatedAnalysisEnabled) return <CvOptimizerPage />;

  return (
    <main className="min-h-screen bg-stone-50 px-6 pb-20 pt-28">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="max-w-3xl">
          <p className="font-semibold text-emerald-700">CV et candidature</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">Améliore ton CV avec une méthode simple</h1>
          <p className="mt-5 text-lg leading-8 text-stone-700">Commence par cette vérification gratuite. Pour une analyse détaillée, tu peux ensuite demander une revue humaine adaptée au poste recherché.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-emerald-700" />Auto-vérification du CV — {completed}/{checks.length}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checks.map((item) => {
              const checked = selected.includes(item);
              return (
                <label key={item} className="flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-4">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={checked}
                    onChange={() => setSelected((current) => checked ? current.filter((entry) => entry !== item) : [...current, item])}
                  />
                  <span className="flex-1 text-sm leading-6">{item}</span>
                  {checked ? <CheckCircle2 className="h-5 w-5 text-emerald-700" /> : null}
                </label>
              );
            })}
          </CardContent>
        </Card>

        <ServiceRequestCard
          service="cv"
          title="Demander une analyse personnalisée de ton CV"
          description="Indique le poste ciblé, ton niveau d’expérience et les difficultés rencontrées. MAKOKI confirme le format de la revue, le délai et le tarif éventuel avant que tu transmettes ton document."
          submitLabel="Demander une analyse"
        />
      </div>
    </main>
  );
}
`;
write('src/pages/CVOptimizer.tsx', cvOptimizerPage);

replaceRegex(
  'src/pages/Cookies.tsx',
  /const rows = \[[\s\S]*?\n\];/,
  `const rows = [\n  ['Session et sécurité', 'Strictement nécessaire', 'Maintien de la connexion et protection du compte.', 'Durée de la session.', 'Actif lorsque vous vous connectez'],\n  ['Brouillon local du questionnaire', 'Fonctionnel', 'Reprendre le questionnaire sur le même appareil.', 'Jusqu’à la soumission ou la suppression du stockage local.', 'Actif pendant le parcours'],\n  ['Préférences de consentement', 'Strictement nécessaire', 'Mémoriser accepter, refuser ou personnaliser.', '6 mois avant une nouvelle demande.', 'Actif'],\n  ['Google Sign-In', 'Authentification à la demande', 'Permettre la connexion choisie avec Google.', 'Selon la session et les règles du fournisseur.', 'Déclenché uniquement par votre action'],\n  ['Google Analytics', 'Mesure d’audience non essentielle', 'Comprendre l’utilisation du site.', 'Durée configurée lors de l’activation.', 'Désactivé sans consentement'],\n  ['Meta Pixel', 'Publicité et mesure non essentielles', 'Mesurer des campagnes lorsqu’elles sont réellement lancées.', 'Selon la configuration et les règles de Meta.', 'Désactivé sans consentement'],\n  ['Chatwoot ou outil de support', 'Support', 'Ouvrir une conversation d’assistance lorsque ce canal est activé.', 'Selon la politique de support affichée.', 'Chargé seulement si le service est activé'],\n];`,
);
replaceExact(
  'src/pages/Cookies.tsx',
  '<tr><th className="p-3">Mécanisme</th><th className="p-3">Catégorie</th><th className="p-3">Finalité</th><th className="p-3">Durée ou règle</th></tr>',
  '<tr><th className="p-3">Mécanisme</th><th className="p-3">Catégorie</th><th className="p-3">Finalité</th><th className="p-3">Durée ou règle</th><th className="p-3">État</th></tr>',
);
replaceExact(
  'src/pages/Cookies.tsx',
  '{rows.map(([name, category, purpose, duration]) => (',
  '{rows.map(([name, category, purpose, duration, status]) => (',
);
replaceExact(
  'src/pages/Cookies.tsx',
  '<td className="p-3">{duration}</td>\n                </tr>',
  '<td className="p-3">{duration}</td>\n                  <td className="p-3 font-medium text-slate-700">{status}</td>\n                </tr>',
);
replaceExact(
  'src/pages/Cookies.tsx',
  'Une commande « Gérer mes cookies » devra être disponible depuis le pied de page dès l’activation des traceurs non essentiels. L’utilisateur pourra retirer son consentement à tout moment, sans remettre en cause la licéité des traitements réalisés avant le retrait.',
  'La commande « Gérer mes cookies » est disponible depuis le pied de page. Vous pouvez modifier ou retirer votre choix à tout moment, sans remettre en cause la licéité des traitements réalisés avant le retrait.',
);

const legalNotice = `import { usePageMeta } from '@/hooks/usePageMeta';
import { Building2, Globe2, Mail, Phone, Server, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const contacts = [
  { label: 'Contact général', value: 'contact@makoki.org', href: 'mailto:contact@makoki.org', icon: Mail },
  { label: 'Support', value: 'support@makoki.org', href: 'mailto:support@makoki.org', icon: Mail },
  { label: 'Données personnelles', value: 'rgpd@makoki.org', href: 'mailto:rgpd@makoki.org', icon: Mail },
  { label: 'Téléphone et WhatsApp', value: '+242 05 534 42 53', href: 'tel:+242055344253', icon: Phone },
];

export default function LegalNotice() {
  usePageMeta({ title: 'Mentions légales', description: 'Mentions légales de la plateforme MAKOKI.', path: '/legal' });

  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-20 pt-28">
      <article className="mx-auto max-w-5xl">
        <p className="font-semibold text-emerald-700">Informations légales</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Mentions légales</h1>
        <p className="mt-5 text-lg leading-8 text-slate-700">
          Le site <strong>makoki.org</strong> et le service MAKOKI sont édités sous le nom d’exploitation <strong>Nexora</strong>, sous la responsabilité de <strong>NGUIE Gess</strong>, à Brazzaville, République du Congo.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-emerald-700" />Éditeur du service</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-slate-700">
              <p><strong>Nom d’exploitation :</strong> Nexora</p>
              <p><strong>Service et marque :</strong> MAKOKI</p>
              <p><strong>Responsable de publication :</strong> NGUIE Gess</p>
              <p><strong>Localisation :</strong> Brazzaville, République du Congo</p>
              <p><strong>Contact contractuel :</strong> contact@makoki.org</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle>Objet du service</CardTitle></CardHeader>
            <CardContent className="text-sm leading-7 text-slate-700">
              MAKOKI propose des services d’orientation, d’exploration des métiers, d’accompagnement CV, de recherche d’opportunités et d’appui au recrutement. Le périmètre, la disponibilité et le tarif éventuel d’une prestation humaine sont confirmés avant tout engagement.
            </CardContent>
          </Card>
        </div>

        <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-950">
          <h2 className="flex items-center gap-2 text-xl font-semibold"><ShieldCheck className="h-5 w-5" />Identification contractuelle</h2>
          <p className="mt-3">
            Les sources vérifiées du projet ne contiennent pas encore de référence RCCM, NIU, forme juridique ni adresse postale complète publiable pour Nexora. Aucune de ces informations n’est inventée sur ce site. Avant toute prestation payante, l’identité contractuelle complète de l’émetteur doit figurer sur le devis, le contrat ou la facture remis au client.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-950">Contacts officiels</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {contacts.map((contact) => (
              <a key={contact.label} href={contact.href} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300">
                <span className="flex items-center gap-2 font-medium text-slate-950"><contact.icon className="h-4 w-4 text-emerald-700" />{contact.label}</span>
                <span className="mt-2 block text-sm text-slate-600">{contact.value}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Server className="h-5 w-5 text-emerald-700" />Hébergement</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-slate-700">
              <p><strong>Prestataire d’infrastructure :</strong> OVH SAS</p>
              <p><strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France</p>
              <p><strong>Administration du serveur :</strong> Nexora</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Globe2 className="h-5 w-5 text-emerald-700" />Nom de domaine</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-slate-700">
              <p><strong>Registraire :</strong> Spaceship, Inc.</p>
              <p><strong>Adresse :</strong> 4600 East Washington Street, Suite 300, Phoenix, Arizona 85034, États-Unis</p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-700 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Droit applicable</h2>
          <p className="mt-3">Le site est soumis au droit de la République du Congo et, lorsqu’ils sont applicables, aux Actes uniformes de l’OHADA. Toute réclamation peut être adressée à <a className="font-medium text-emerald-700 underline" href="mailto:support@makoki.org">support@makoki.org</a>.</p>
        </section>
      </article>
    </main>
  );
}
`;
write('src/pages/LegalNotice.tsx', legalNotice);

write('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://makoki.org/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://makoki.org/parcours</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://makoki.org/careers</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://makoki.org/jobs</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>https://makoki.org/cv-optimizer</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://makoki.org/recruitment</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://makoki.org/conseiller</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://makoki.org/book-appointment</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://makoki.org/about</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://makoki.org/blog</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>
  <url><loc>https://makoki.org/legal</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>https://makoki.org/privacy</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>https://makoki.org/terms</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>https://makoki.org/cookies</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
</urlset>
`);

replaceExact(
  'vite.config.ts',
  `        name: 'Orientation Pro Congo',\n        short_name: 'OrientationPro',\n        description: 'Plateforme leader d\\'orientation professionnelle au Congo',\n        theme_color: '#3b82f6',`,
  `        name: 'MAKOKI — Orientation, compétences et emploi',\n        short_name: 'MAKOKI',\n        description: 'Comprendre ses centres d’intérêt, explorer les métiers et construire ses prochaines étapes.',\n        theme_color: '#047857',`,
);

if (fs.existsSync('scripts/release/v6h-authenticated-browser.cjs')) {
  replaceExact(
    'scripts/release/v6h-authenticated-browser.cjs',
    "await page.getByRole('button', { name: 'Commencer le test' }).click();",
    "await page.getByRole('button', { name: 'Commencer le questionnaire' }).click();",
  );
}

console.log('Correctifs de préparation au lancement appliqués.');
