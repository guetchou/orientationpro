import { AlertTriangle, Building2, Globe2, Mail, Phone, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const contacts = [
  { label: 'Contact général', value: 'contact@makoki.org', href: 'mailto:contact@makoki.org', icon: Mail },
  { label: 'Support', value: 'support@makoki.org', href: 'mailto:support@makoki.org', icon: Mail },
  { label: 'Données personnelles', value: 'rgpd@makoki.org', href: 'mailto:rgpd@makoki.org', icon: Mail },
  { label: 'Téléphone et WhatsApp', value: '+242 05 534 42 53', href: 'tel:+242055344253', icon: Phone },
];

export default function LegalNotice() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-20 pt-28">
      <article className="mx-auto max-w-5xl">
        <p className="font-semibold text-emerald-700">Informations légales</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Mentions légales</h1>
        <p className="mt-5 text-lg leading-8 text-slate-700">
          Le site <strong>makoki.org</strong> et le service MAKOKI sont édités par Nexora.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-emerald-700" />Éditeur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-slate-700">
              <p><strong>Raison sociale :</strong> Nexora</p>
              <p><strong>Nom commercial :</strong> MAKOKI</p>
              <p><strong>Forme déclarée :</strong> établissement individuel, sous réserve de confirmation par les documents d’immatriculation</p>
              <p><strong>Capital social :</strong> sans objet si la forme « établissement individuel » est confirmée</p>
              <p><strong>Ville et pays :</strong> Brazzaville, République du Congo</p>
              <p><strong>Représentant légal et directeur de publication :</strong> NGUIE Gess</p>
              <p><strong>Support :</strong> 08h00 à 20h00 ; jours d’ouverture à préciser</p>
            </CardContent>
          </Card>

          <Card className="border-amber-300 bg-amber-50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-950"><AlertTriangle className="h-5 w-5" />Informations obligatoires manquantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-amber-950">
              <p>Les éléments suivants doivent être renseignés avant la publication générale de ces mentions :</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>adresse complète du siège ou de l’établissement ;</li>
                <li>numéro RCCM ;</li>
                <li>numéro NIU ;</li>
                <li>intitulé juridique exact de la fonction exercée par NGUIE Gess ;</li>
                <li>jours d’ouverture du support.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

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
            <CardHeader><CardTitle className="flex items-center gap-2"><Server className="h-5 w-5 text-emerald-700" />Hébergement de l’application</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-slate-700">
              <p><strong>Prestataire d’infrastructure :</strong> OVH SAS</p>
              <p><strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France</p>
              <p><strong>Administration du serveur :</strong> assurée directement par Nexora</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Globe2 className="h-5 w-5 text-emerald-700" />Nom de domaine</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-slate-700">
              <p><strong>Registraire :</strong> Spaceship, Inc.</p>
              <p><strong>Adresse :</strong> 4600 East Washington Street, Suite 300, Phoenix, Arizona 85034, États-Unis</p>
              <p><strong>Site :</strong> spaceship.com</p>
              <p>Le registraire du domaine ne doit pas être confondu avec l’hébergeur du serveur applicatif.</p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-700 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Droit applicable</h2>
          <p className="mt-3">
            Le site est soumis au droit de la République du Congo et, lorsqu’ils sont applicables, aux Actes uniformes de l’OHADA. Toute réclamation doit d’abord être adressée à <a className="font-medium text-emerald-700 underline" href="mailto:support@makoki.org">support@makoki.org</a>. À défaut de règlement amiable, les juridictions compétentes de Brazzaville peuvent être saisies, sous réserve des règles impératives de compétence.
          </p>
        </section>
      </article>
    </main>
  );
}
