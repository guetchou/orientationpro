import { usePageMeta } from '@/hooks/usePageMeta';

const dataCategories = [
  'informations de compte et de profil ;',
  'réponses aux questionnaires et résultats d’orientation ;',
  'CV, candidatures et documents transmis ;',
  'demandes de rendez-vous et échanges avec le support ;',
  'informations techniques nécessaires à la sécurité et au fonctionnement du service.',
];

const purposes = [
  'fournir les services demandés et permettre la reprise du parcours ;',
  'sécuriser les comptes et prévenir les usages frauduleux ;',
  'présenter des métiers, des pistes d’orientation et des outils d’employabilité ;',
  'répondre aux demandes de support et de rendez-vous ;',
  'respecter les obligations légales applicables et améliorer le service.',
];

export default function Privacy() {
  usePageMeta({
    title: 'Politique de confidentialité',
    description: 'Comment MAKOKI protège et traite vos données personnelles.',
    path: '/privacy',
  });

  return (
    <main className="min-h-screen bg-white px-6 pb-20 pt-28">
      <article className="mx-auto max-w-5xl">
        <p className="font-semibold text-emerald-700">Informations légales</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Politique de confidentialité</h1>
        <p className="mt-5 text-sm text-slate-500">Version du 2 août 2026</p>

        <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
          <h2 className="text-xl font-semibold">Responsable du traitement</h2>
          <p className="mt-3 leading-7">
            Nexora, exploitant de MAKOKI à Brazzaville, République du Congo. Pour toute question relative aux données personnelles : <a className="font-semibold underline" href="mailto:rgpd@makoki.org">rgpd@makoki.org</a>.
          </p>
        </section>

        <div className="mt-10 space-y-10 text-base leading-8 text-slate-700">
          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Cadre applicable</h2>
            <p className="mt-3">
              MAKOKI traite les données personnelles conformément au droit applicable en République du Congo, notamment aux principes de licéité, de transparence, de sécurité, de finalité déterminée et de conservation limitée.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Données traitées</h2>
            <p className="mt-3">Selon les services utilisés, MAKOKI peut traiter les catégories de données suivantes :</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              {dataCategories.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p className="mt-3">
              Le parcours d’orientation peut commencer avant la création d’un espace personnel. Les réponses et le résultat provisoire sont alors conservés temporairement afin de permettre la continuité du parcours. Ils peuvent être rattachés à l’espace de l’utilisateur lorsqu’il choisit de se connecter ou de créer un compte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Finalités du traitement</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              {purposes.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Partage des données</h2>
            <p className="mt-3">
              MAKOKI peut faire appel à des prestataires techniques pour l’hébergement, l’envoi d’e-mails, l’authentification, l’assistance et la mesure d’audience. Seules les données nécessaires à leur mission leur sont transmises, dans le respect des obligations de confidentialité et de sécurité applicables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Durée de conservation</h2>
            <p className="mt-3">
              Les données sont conservées pendant la durée nécessaire à la fourniture du service, à la sécurité, au traitement des demandes et au respect des obligations légales. Elles sont ensuite supprimées ou anonymisées, sauf lorsqu’une conservation plus longue est requise par la loi, un contentieux ou un impératif de sécurité documenté.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Vos droits</h2>
            <p className="mt-3">
              Vous pouvez demander l’accès à vos données, leur rectification, leur suppression ou vous opposer à certains traitements dans les conditions prévues par la réglementation applicable. Les demandes sont adressées à <a className="font-semibold text-emerald-700 underline" href="mailto:rgpd@makoki.org">rgpd@makoki.org</a>. Une vérification d’identité peut être demandée afin de protéger vos données.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Sécurité</h2>
            <p className="mt-3">
              Nexora met en œuvre des mesures techniques et organisationnelles destinées à limiter les accès non autorisés, protéger les comptes, sécuriser les échanges et assurer la disponibilité du service. Aucun dispositif ne pouvant garantir une sécurité absolue, tout incident identifié fait l’objet d’une analyse et des mesures nécessaires.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Contact</h2>
            <p className="mt-3">
              Pour toute question concernant cette politique ou le traitement de vos données, contactez <a className="font-semibold text-emerald-700 underline" href="mailto:rgpd@makoki.org">rgpd@makoki.org</a> ou <a className="font-semibold text-emerald-700 underline" href="mailto:contact@makoki.org">contact@makoki.org</a>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
