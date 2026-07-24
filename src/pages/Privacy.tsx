const sections = [
  {
    title: 'Données concernées',
    paragraphs: [
      'MAKOKI peut traiter les informations de compte, les données de profil, les réponses aux questionnaires, les résultats d’orientation, les documents transmis volontairement et les journaux techniques nécessaires à la sécurité du service.',
      'Les données demandées doivent rester limitées à ce qui est utile pour fournir le service concerné.',
    ],
  },
  {
    title: 'Finalités',
    paragraphs: [
      'Les données sont utilisées pour créer et sécuriser le compte, restituer les résultats demandés, permettre l’accès aux fonctionnalités d’orientation et d’employabilité, assurer le support et améliorer la fiabilité technique du service.',
      'Les réponses RIASEC ne sont pas utilisées pour prendre automatiquement une décision d’embauche, d’admission ou d’accès à un métier.',
    ],
  },
  {
    title: 'Accès et conservation',
    paragraphs: [
      'L’accès aux données personnelles doit être limité au titulaire du compte et aux personnes disposant d’une autorisation explicite. Les durées de conservation doivent être adaptées à la finalité, aux obligations applicables et aux demandes de suppression recevables.',
      'Les documents CV et résultats d’orientation ne doivent pas être rendus publics par défaut.',
    ],
  },
  {
    title: 'Partage et vente de données',
    paragraphs: [
      'MAKOKI ne présente pas les données personnelles comme un produit destiné à être vendu. Un partage avec un prestataire technique ou un acteur d’accompagnement doit rester encadré, limité et justifié par le service demandé.',
    ],
  },
  {
    title: 'Vos demandes',
    paragraphs: [
      'Vous pouvez demander l’accès, la rectification ou la suppression de données vous concernant, sous réserve des contraintes légales et de sécurité applicables. Le canal officiel de contact du responsable du service doit être confirmé et publié avant l’ouverture générale de MAKOKI.',
    ],
  },
];

export default function Privacy() {
  return (
    <main className="min-h-screen bg-white px-6 pb-20 pt-28">
      <article className="mx-auto max-w-4xl">
        <p className="font-semibold text-emerald-700">Informations légales</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Confidentialité</h1>
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Version pilote. L’identité juridique complète du responsable du service, le canal officiel d’exercice des droits et les durées définitives de conservation doivent être validés avant l’ouverture générale au public.
        </p>
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
