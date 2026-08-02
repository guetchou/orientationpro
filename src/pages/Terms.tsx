import { usePageMeta } from '@/hooks/usePageMeta';

const sections = [
  {
    title: 'Éditeur et objet du service',
    paragraphs: [
      'MAKOKI est un service exploité par Nexora à Brazzaville, République du Congo.',
      'Le service propose des outils d’orientation, d’exploration des métiers, de compétences, d’employabilité, de recrutement et d’accompagnement.',
    ],
  },
  {
    title: 'Utilisation du service',
    paragraphs: [
      'L’utilisateur s’engage à fournir des informations exactes, à utiliser le service de manière licite et à ne pas porter atteinte à la sécurité, aux données ou aux droits d’autrui.',
      'Certaines fonctions nécessitent un compte personnel. Le titulaire du compte doit protéger ses moyens d’accès et signaler rapidement toute utilisation non autorisée.',
    ],
  },
  {
    title: 'Nature des résultats',
    paragraphs: [
      'Les résultats d’orientation organisent des pistes à partir des réponses et des informations fournies. Ils soutiennent la réflexion de l’utilisateur mais ne constituent pas un diagnostic psychologique ou médical.',
      'MAKOKI ne garantit ni admission en formation, ni recrutement, ni rémunération, ni réussite professionnelle. Les choix doivent tenir compte de la situation réelle de l’utilisateur et des conditions applicables au métier ou à la formation envisagée.',
    ],
  },
  {
    title: 'Informations sur les métiers',
    paragraphs: [
      'Les fiches métiers peuvent s’appuyer sur des sources externes reconnues. Elles sont proposées à titre informatif et peuvent ne pas refléter immédiatement toutes les particularités du marché congolais.',
      'Avant toute décision, l’utilisateur doit vérifier les diplômes, autorisations, coûts, conditions physiques, règles professionnelles et débouchés auprès des établissements et organismes compétents.',
    ],
  },
  {
    title: 'Offres, candidatures et recrutement',
    paragraphs: [
      'L’utilisateur doit vérifier les informations d’une annonce et ne jamais communiquer un mot de passe, un code secret Mobile Money ou une information bancaire confidentielle à un recruteur.',
      'Les décisions de recrutement appartiennent aux employeurs concernés. Un résultat d’orientation ne doit pas être utilisé seul pour accepter ou refuser une candidature.',
    ],
  },
  {
    title: 'Contenus transmis',
    paragraphs: [
      'L’utilisateur reste responsable des documents et informations qu’il transmet. Il doit disposer des droits nécessaires et éviter de déposer des contenus illicites, trompeurs, malveillants ou portant atteinte aux droits d’autrui.',
      'MAKOKI peut retirer un contenu manifestement illicite ou dangereux et suspendre l’accès à un compte en cas de fraude, d’atteinte à la sécurité ou de violation grave des présentes conditions.',
    ],
  },
  {
    title: 'Disponibilité et évolution du service',
    paragraphs: [
      'Nexora s’efforce d’assurer la disponibilité et la sécurité du service. Des interruptions peuvent néanmoins intervenir pour maintenance, incident technique, sécurité ou cas de force majeure.',
      'Les fonctions et contenus peuvent évoluer afin d’améliorer le service, respecter la réglementation ou renforcer la sécurité. Les modifications importantes sont portées à la connaissance des utilisateurs lorsque cela est nécessaire.',
    ],
  },
  {
    title: 'Droit applicable et réclamations',
    paragraphs: [
      'Les présentes conditions sont régies par le droit de la République du Congo et, lorsqu’ils sont applicables, par les Actes uniformes de l’OHADA.',
      'Toute réclamation peut être adressée à support@makoki.org ou contact@makoki.org. Nexora privilégie la recherche d’une solution amiable avant toute procédure contentieuse.',
    ],
  },
];

export default function Terms() {
  usePageMeta({
    title: 'Conditions d’utilisation',
    description: 'Les conditions d’utilisation de la plateforme MAKOKI.',
    path: '/terms',
  });

  return (
    <main className="min-h-screen bg-white px-6 pb-20 pt-28">
      <article className="mx-auto max-w-5xl">
        <p className="font-semibold text-emerald-700">Informations légales</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Conditions d’utilisation</h1>
        <p className="mt-5 text-sm text-slate-500">Version du 2 août 2026</p>
        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold text-slate-950">{section.title}</h2>
              <div className="mt-3 space-y-3 text-base leading-8 text-slate-700">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
