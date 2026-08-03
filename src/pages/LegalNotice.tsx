import { usePageMeta } from '@/hooks/usePageMeta';
import { Building2, Globe2, Mail, Phone, Server, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const contacts = [
  { label: 'Contact général', value: 'contact@makoki.org', href: 'mailto:contact@makoki.org', icon: Mail },
  { label: 'Support', value: 'support@makoki.org', href: 'mailto:support@makoki.org', icon: Mail },
  { label: 'Données personnelles', value: 'rgpd@makoki.org', href: 'mailto:rgpd@makoki.org', icon: Mail },
  { label: 'Téléphone et WhatsApp', value: '+242 05 534 42 53', href: 'tel:+242055344253', icon: Phone },
];

export default function LegalNotice() {
  usePageMeta({
    title: 'Mentions légales',
    description: 'Mentions légales de la plateforme MAKOKI.',
    path: '/legal',
  });

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
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-emerald-700" />Éditeur du service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-slate-700">
              <p><strong>Nom d’exploitation :</strong> Nexora</p>
              <p><strong>Service et marque :</strong> MAKOKI</p>
              <p><strong>Responsable de publication :</strong> NGUIE Gess</p>
              <p><strong>Localisation :</strong> Brazzaville, République du Congo</p>
              <p><strong>Contact officiel :</strong> contact@makoki.org</p>
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
            Les seules informations publiées ici sont celles vérifiées dans les sources du projet. Avant toute prestation payante, le devis, le contrat ou la facture doit préciser l’identité juridique complète de l’émetteur, son adresse, ainsi que ses références d’immatriculation et fiscales applicables. Aucun paiement ne doit être demandé sans ce document.
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
          <p className="mt-3">
            Le site est soumis au droit de la République du Congo et, lorsqu’ils sont applicables, aux Actes uniformes de l’OHADA. Toute réclamation peut être adressée à <a className="font-medium text-emerald-700 underline" href="mailto:support@makoki.org">support@makoki.org</a>.
          </p>
        </section>
      </article>
    </main>
  );
}
