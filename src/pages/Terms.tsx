const sections = [
  {
    title: 'Objet du service',
    text: 'MAKOKI propose des outils d’orientation, d’exploration des métiers, d’employabilité et d’accompagnement. Certaines fonctions peuvent rester en phase pilote, être modifiées ou être temporairement indisponibles.',
  },
  {
    title: 'Nature des résultats',
    text: 'Les résultats d’orientation servent à organiser des pistes selon les réponses fournies et la méthode affichée. Ils ne constituent pas une décision automatique, une validation psychométrique générale, un diagnostic médical ou psychologique, ni une garantie d’admission, d’emploi, de rémunération ou de réussite.',
  },
  {
    title: 'Compte et sécurité',
    text: 'Le titulaire du compte doit fournir des informations exactes, protéger ses moyens d’accès et signaler toute utilisation non autorisée. Il ne doit pas tenter d’accéder aux données d’un autre compte ni contourner les contrôles de sécurité.',
  },
  {
    title: 'Référentiels et contenus tiers',
    text: 'Les données métiers peuvent provenir de référentiels externes soumis à leurs propres licences et conditions d’attribution. MAKOKI conserve la source lorsque celle-ci est disponible, mais ne garantit pas que chaque description internationale reflète immédiatement la réalité du marché congolais.',
  },
  {
    title: 'Métiers réglementés et décisions importantes',
    text: 'Avant de choisir une formation ou un métier, l’utilisateur doit vérifier les diplômes, autorisations, conditions physiques, règles professionnelles, coûts, débouchés et contraintes applicables auprès des organismes compétents.',
  },
  {
    title: 'Contenus transmis',
    text: 'L’utilisateur reste responsable des documents et informations qu’il transmet. Il doit disposer des droits nécessaires et éviter de déposer des contenus illicites, trompeurs, malveillants ou portant atteinte aux droits d’autrui.',
  },
  {
    title: 'Évolution des conditions',
    text: 'Ces conditions sont une version pilote. L’identité juridique complète de l’éditeur, les modalités de support, la juridiction compétente et les clauses définitives doivent être validées avant l’ouverture générale du service.',
  },
];

export default function Terms() {
  return (
    <main className="min-h-screen bg-white px-6 pb-20 pt-28">
      <article className="mx-auto max-w-4xl">
        <p className="font-semibold text-emerald-700">Informations légales</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Conditions d’utilisation</h1>
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Version pilote à compléter avant l’ouverture générale de MAKOKI.
        </p>
        <div className="mt-10 space-y-9">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold text-slate-950">{section.title}</h2>
              <p className="mt-3 text-base leading-8 text-slate-700">{section.text}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
