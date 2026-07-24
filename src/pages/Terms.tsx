const sections = [
  {
    title: 'Éditeur et objet du service',
    paragraphs: [
      'MAKOKI est un service édité par Nexora, établissement déclaré à Brazzaville, République du Congo, sous la responsabilité de NGUIE Gess.',
      'Le service propose des outils d’orientation, d’exploration des métiers, d’employabilité, de recrutement et d’accompagnement. Certaines fonctions peuvent rester en phase pilote, être modifiées ou être temporairement indisponibles.',
    ],
  },
  {
    title: 'Âge minimum et mineurs',
    paragraphs: [
      'L’âge minimum cible pour utiliser MAKOKI est fixé à 14 ans. Toutefois, la loi congolaise permet au mineur de consentir seul à partir de 16 ans seulement.',
      'Entre 14 et 15 ans, le compte ne peut être ouvert qu’avec le consentement conjoint du mineur et du ou des titulaires de l’autorité parentale. Tant que la procédure vérifiable de consentement parental n’est pas disponible, l’inscription reste réservée aux personnes âgées d’au moins 16 ans.',
    ],
  },
  {
    title: 'Nature des résultats',
    paragraphs: [
      'Les résultats d’orientation organisent des pistes selon les réponses fournies et la méthode affichée. Ils ne constituent pas une validation psychométrique générale, un diagnostic médical ou psychologique, ni une garantie d’admission, d’emploi, de rémunération ou de réussite.',
      'Aucune décision produisant un effet juridique ou significatif pour une personne ne doit reposer uniquement sur un profil RIASEC ou sur un traitement automatisé de ses données.',
    ],
  },
  {
    title: 'Compte et sécurité',
    paragraphs: [
      'Le titulaire du compte doit fournir des informations exactes, protéger ses moyens d’accès et signaler toute utilisation non autorisée. Il ne doit pas tenter d’accéder aux données d’un autre compte ni contourner les contrôles de sécurité.',
      'Nexora peut suspendre un compte en cas de fraude, atteinte à la sécurité, usurpation d’identité, usage illicite ou violation grave des présentes conditions, après analyse proportionnée de la situation.',
    ],
  },
  {
    title: 'Référentiels et contenus tiers',
    paragraphs: [
      'Les données métiers peuvent provenir de référentiels externes soumis à leurs propres licences et obligations d’attribution. MAKOKI conserve la source lorsque celle-ci est disponible, mais ne garantit pas que chaque description internationale reflète immédiatement la réalité du marché congolais.',
      'Avant de choisir une formation ou un métier, l’utilisateur doit vérifier les diplômes, autorisations, conditions physiques, règles professionnelles, coûts, débouchés et contraintes applicables auprès des organismes compétents.',
    ],
  },
  {
    title: 'Offres, candidatures et recrutement',
    paragraphs: [
      'MAKOKI ne garantit ni l’identité, ni la solvabilité, ni la décision finale d’un employeur en dehors des contrôles effectivement réalisés et affichés. L’utilisateur doit vérifier l’annonce et ne jamais communiquer un code secret Mobile Money, un mot de passe ou toute information bancaire confidentielle à un recruteur.',
      'Un résultat d’orientation ne doit pas être utilisé seul pour accepter ou refuser une candidature. Les décisions de recrutement relèvent des acteurs concernés et doivent reposer sur des critères professionnels, licites et contrôlables.',
    ],
  },
  {
    title: 'Services gratuits et futurs services payants',
    paragraphs: [
      'Le service est actuellement proposé gratuitement pour les fonctions indiquées comme disponibles. Des abonnements, prestations d’accompagnement, services aux entreprises et paiements Mobile Money pourront être proposés ultérieurement.',
      'Avant tout paiement, le prix en francs CFA, la durée, le contenu, le renouvellement éventuel et les conditions d’annulation doivent être affichés de manière claire. Les entreprises peuvent faire l’objet d’un contrat et d’une facturation distincts.',
    ],
  },
  {
    title: 'Politique commerciale de remboursement',
    paragraphs: [
      'Un paiement débité deux fois, non autorisé, ou correspondant à un service techniquement non délivré donne lieu à vérification et, lorsqu’il est confirmé, à remboursement intégral.',
      'Pour un abonnement ou service numérique non encore activé ou utilisé, une demande peut être présentée dans les 7 jours calendaires suivant le paiement. Après activation ou consommation du service, le remboursement n’est pas automatique, sauf défaut imputable à MAKOKI ou obligation légale.',
      'Lorsqu’un service de rendez-vous payant sera activé, une annulation par MAKOKI entraînera un remboursement intégral. Une annulation par l’utilisateur plus de 24 heures avant le rendez-vous pourra donner lieu à remboursement ou avoir ; à moins de 24 heures, un remboursement restera exceptionnel, notamment en cas de force majeure justifiée.',
      'Tout remboursement approuvé est effectué, dans la mesure du possible, par le moyen de paiement d’origine dans un délai cible de 10 jours ouvrés. Les frais externes non récupérables peuvent être exclus lorsqu’ils ont été clairement annoncés avant le paiement.',
    ],
  },
  {
    title: 'Contenus transmis',
    paragraphs: [
      'L’utilisateur reste responsable des documents et informations qu’il transmet. Il doit disposer des droits nécessaires et éviter de déposer des contenus illicites, trompeurs, malveillants ou portant atteinte aux droits d’autrui.',
      'MAKOKI peut retirer un contenu manifestement illicite ou dangereux et coopérer avec les autorités compétentes dans les conditions prévues par la loi.',
    ],
  },
  {
    title: 'Droit applicable et réclamations',
    paragraphs: [
      'Les présentes conditions sont régies par le droit de la République du Congo et, lorsqu’ils sont applicables, par les Actes uniformes de l’OHADA.',
      'Toute réclamation doit être adressée à support@makoki.org ou contact@makoki.org. Nexora recherche une solution amiable dans un délai cible de 30 jours. À défaut d’accord, les juridictions compétentes de Brazzaville peuvent être saisies, sous réserve des règles impératives de compétence et de protection du consommateur applicables.',
    ],
  },
  {
    title: 'Évolution des conditions',
    paragraphs: [
      'Les conditions peuvent évoluer pour tenir compte des nouvelles fonctions, de la réglementation ou des mesures de sécurité. Toute modification substantielle doit être portée à la connaissance des utilisateurs avant son entrée en vigueur lorsque cela est nécessaire.',
      'L’adresse complète, le RCCM, le NIU et l’intitulé juridique exact de la fonction du représentant légal doivent encore être intégrés avant la publication générale définitive.',
    ],
  },
];

export default function Terms() {
  return (
    <main className="min-h-screen bg-white px-6 pb-20 pt-28">
      <article className="mx-auto max-w-5xl">
        <p className="font-semibold text-emerald-700">Informations légales</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Conditions d’utilisation et de vente</h1>
        <p className="mt-5 text-sm text-slate-500">Version du 24 juillet 2026</p>
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
