const retentionRows = [
  ['Compte utilisateur', 'Pendant l’utilisation du service, puis suppression ou anonymisation après 24 mois d’inactivité. Un avertissement doit être envoyé avant suppression lorsque les coordonnées restent valides.'],
  ['Résultats des tests d’orientation', '24 mois après la dernière activité liée au résultat, sauf suppression anticipée demandée par l’utilisateur ou nécessité de conservation plus courte.'],
  ['Réponses détaillées aux questionnaires', '12 mois après la production du résultat, puis suppression ou anonymisation. Le score agrégé peut être conservé selon la durée applicable au résultat.'],
  ['CV et documents téléversés', '24 mois après la dernière utilisation du document ou la dernière démarche associée, puis suppression.'],
  ['Candidatures', '24 mois après la clôture de la candidature ou le dernier échange, sauf obligation légale ou transfert licite vers l’employeur concerné.'],
  ['Rendez-vous', '24 mois après la date du rendez-vous ou son annulation. Les notes sensibles ne doivent pas être conservées au-delà de ce qui est strictement nécessaire.'],
  ['Journaux techniques et de sécurité', '12 mois, sauf incident de sécurité, fraude, contentieux ou obligation légale justifiant une conservation plus longue et documentée.'],
  ['Demandes de support', '24 mois après la clôture de la demande.'],
  ['Preuves de consentement', '5 ans après le retrait du consentement ou la fin de la relation concernée, afin de documenter la conformité.'],
  ['Données financières et pièces comptables', '10 ans lorsque leur conservation relève des obligations comptables applicables.'],
  ['Fermeture du compte', 'Suppression des données actives dans un délai cible de 30 jours. Les copies de sauvegarde sont purgées au plus tard dans les 90 jours, sauf obligation légale ou gel probatoire.'],
];

const providers = [
  ['OVHcloud', 'Hébergement du serveur applicatif en France. Nexora administre directement le VPS.'],
  ['Spaceship, Inc.', 'Enregistrement du nom de domaine et, si ce service est effectivement utilisé, messagerie professionnelle.'],
  ['Google', 'Authentification Google et Google Analytics lorsque ces fonctions sont activées.'],
  ['Meta', 'Meta Pixel uniquement après consentement valable lorsque ce dispositif est activé.'],
  ['Chatwoot', 'Assistance en ligne et gestion des échanges de support lorsque le widget est activé.'],
  ['Prestataire d’e-mail', 'Envoi des messages de vérification, sécurité et service. Le fournisseur exact doit être documenté dans le registre des traitements.'],
  ['Prestataires de paiement', 'Mobile Money et autres moyens de paiement lorsqu’ils seront activés. MAKOKI ne doit jamais demander ni conserver le code secret Mobile Money de l’utilisateur.'],
];

export default function Privacy() {
  return (
    <main className="min-h-screen bg-white px-6 pb-20 pt-28">
      <article className="mx-auto max-w-5xl">
        <p className="font-semibold text-emerald-700">Informations légales</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Politique de confidentialité</h1>
        <p className="mt-5 text-sm text-slate-500">Version du 24 juillet 2026</p>

        <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
          <h2 className="text-xl font-semibold">Responsable du traitement</h2>
          <p className="mt-3 leading-7">
            Nexora, exploitant la marque MAKOKI, Brazzaville, République du Congo. Représentant légal : NGUIE Gess. Pour toute question relative aux données personnelles : <a className="font-semibold underline" href="mailto:rgpd@makoki.org">rgpd@makoki.org</a>. Contact général : <a className="font-semibold underline" href="mailto:contact@makoki.org">contact@makoki.org</a>.
          </p>
        </section>

        <div className="mt-10 space-y-10 text-base leading-8 text-slate-700">
          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Cadre applicable</h2>
            <p className="mt-3">
              MAKOKI applique la loi congolaise n° 29-2019 du 10 octobre 2019 portant protection des données à caractère personnel. Les traitements doivent être licites, loyaux, transparents, limités à une finalité déterminée et conservés uniquement pendant la durée nécessaire.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Données traitées</h2>
            <p className="mt-3">
              Selon les fonctions utilisées, MAKOKI peut traiter l’adresse e-mail, les informations du compte et du profil, la date de naissance lorsque le contrôle d’âge sera activé, les réponses aux questionnaires, les résultats d’orientation, les CV, les candidatures, les demandes de rendez-vous, les échanges de support, les références de paiement et les journaux techniques nécessaires à la sécurité.
            </p>
            <p className="mt-3">
              Les résultats RIASEC et les réponses associées décrivent des intérêts déclarés. Ils ne doivent pas être utilisés seuls pour prendre une décision d’embauche, d’admission, d’assurance, de crédit ou d’accès à un métier.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Finalités et bases du traitement</h2>
            <p className="mt-3">
              Les données sont utilisées pour créer et sécuriser le compte, exécuter le service demandé, restituer les résultats, permettre l’accès aux outils d’employabilité, assurer le support, prévenir la fraude, respecter les obligations légales et améliorer la fiabilité technique. Selon le cas, le traitement repose sur le consentement, l’exécution du service demandé, une obligation légale ou la sauvegarde des droits et intérêts légitimes des personnes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Mineurs</h2>
            <p className="mt-3">
              En République du Congo, un mineur peut consentir seul à un service de la société de l’information à partir de 16 ans. Entre 14 et 15 ans, l’ouverture d’un compte MAKOKI ne peut être autorisée qu’avec le consentement conjoint du mineur et du ou des titulaires de l’autorité parentale. Tant que le mécanisme vérifiable de consentement parental n’est pas disponible, l’inscription doit rester réservée aux personnes âgées d’au moins 16 ans.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Prestataires et transferts internationaux</h2>
            <p className="mt-3">
              Certains prestataires peuvent traiter des données en dehors du Congo et de l’espace CEMAC/CEEAC. Ces transferts doivent être documentés, limités, sécurisés et accomplis après les formalités requises auprès de la Commission nationale pour la protection des données à caractère personnel. Les outils non essentiels de mesure ou de publicité doivent rester désactivés tant qu’un consentement valable et les garanties de transfert nécessaires ne sont pas en place.
            </p>
            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-slate-950"><tr><th className="p-3">Prestataire ou catégorie</th><th className="p-3">Rôle envisagé</th></tr></thead>
                <tbody>
                  {providers.map(([name, role]) => <tr key={name} className="border-t border-slate-200"><td className="p-3 font-medium text-slate-950">{name}</td><td className="p-3">{role}</td></tr>)}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Durées de conservation proposées</h2>
            <p className="mt-3">Ces durées constituent la politique opérationnelle retenue pour MAKOKI. Une durée plus longue n’est admise que lorsqu’une obligation légale, un contentieux ou un besoin de sécurité dûment documenté l’impose.</p>
            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-slate-100 text-slate-950"><tr><th className="p-3">Catégorie</th><th className="p-3">Durée</th></tr></thead>
                <tbody>
                  {retentionRows.map(([category, duration]) => <tr key={category} className="border-t border-slate-200"><td className="p-3 font-medium text-slate-950">{category}</td><td className="p-3">{duration}</td></tr>)}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Vos droits</h2>
            <p className="mt-3">
              Vous pouvez demander l’accès à vos données, leur copie, leur rectification, leur portabilité lorsque les conditions sont réunies, vous opposer à certains traitements et demander la suppression de données inexactes, périmées ou conservées illicitement. Les demandes sont adressées à <a className="font-semibold text-emerald-700 underline" href="mailto:rgpd@makoki.org">rgpd@makoki.org</a>. Une réponse ou justification doit être apportée dans le délai légal applicable, sous réserve de la vérification de l’identité du demandeur.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-950">Sécurité et violations</h2>
            <p className="mt-3">
              Nexora met en œuvre des mesures d’accès limité, de journalisation, de sauvegarde, de chiffrement lorsque cela est adapté et de séparation des environnements. Toute violation de données doit être analysée, documentée et notifiée à l’autorité ou aux personnes concernées lorsque la réglementation l’exige.
            </p>
          </section>

          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
            <h2 className="text-xl font-semibold">Éléments encore à confirmer</h2>
            <p className="mt-3">
              L’adresse complète de Nexora, le RCCM, le NIU, le fournisseur exact de messagerie, les prestataires Mobile Money et les éventuels autres destinataires de données doivent être ajoutés avant l’ouverture générale des fonctions concernées.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
