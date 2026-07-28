import { usePageMeta } from '@/hooks/usePageMeta';
const rows = [
  ['Session et sécurité', 'Strictement nécessaire', 'Maintien de la connexion, renouvellement de session, protection contre les accès non autorisés.', 'Durée de la session ou durée technique strictement nécessaire.'],
  ['Brouillon local RIASEC', 'Fonctionnel', 'Reprise du questionnaire sur le même navigateur et le même appareil.', 'Jusqu’à la soumission, la suppression manuelle ou 30 jours sans activité lorsque le mécanisme d’expiration est activé.'],
  ['Préférences de consentement', 'Strictement nécessaire', 'Mémoriser le choix accepter, refuser ou personnaliser.', '6 mois, puis nouvelle demande de choix.'],
  ['Google Analytics', 'Mesure d’audience non essentielle', 'Comprendre l’utilisation du site et les erreurs de navigation.', 'Activé uniquement après consentement. Durée cible des données de mesure configurées par MAKOKI : 14 mois.'],
  ['Meta Pixel', 'Publicité et mesure non essentielles', 'Mesurer des campagnes et audiences lorsque ce dispositif est réellement utilisé.', 'Activé uniquement après consentement explicite. La durée du traitement chez Meta dépend de ses propres règles et doit être documentée.'],
  ['Chatwoot', 'Support', 'Ouvrir une conversation d’assistance et conserver l’historique utile au traitement de la demande.', 'Jusqu’à 24 mois après la clôture de la demande, selon la politique de confidentialité.'],
  ['Google Sign-In', 'Authentification à la demande', 'Permettre à l’utilisateur de choisir la connexion avec son compte Google.', 'Déclenché uniquement par l’action de l’utilisateur ; les durées du fournisseur s’ajoutent aux durées internes de MAKOKI.'],
];

export default function Cookies() {
  usePageMeta({ title: "Gestion des cookies", description: "Informations et préférences sur l’utilisation des cookies sur MAKOKI.", path: "/cookies" });
  return (
    <main className="min-h-screen bg-white px-6 pb-20 pt-28">
      <article className="mx-auto max-w-5xl">
        <p className="font-semibold text-emerald-700">Informations légales</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Cookies, traceurs et stockage local</h1>
        <p className="mt-5 text-sm text-slate-500">Version du 24 juillet 2026</p>

        <div className="mt-8 space-y-5 text-base leading-8 text-slate-700">
          <p>
            MAKOKI distingue les mécanismes strictement nécessaires au fonctionnement du service des outils de mesure, de publicité et d’assistance. Les traceurs non essentiels, notamment Google Analytics et Meta Pixel, ne doivent pas être chargés avant un consentement libre, spécifique et éclairé.
          </p>
          <p>
            Refuser les traceurs non essentiels doit être aussi simple que les accepter. Le refus ne bloque pas l’accès aux fonctions essentielles du site.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-950">
              <tr><th className="p-3">Mécanisme</th><th className="p-3">Catégorie</th><th className="p-3">Finalité</th><th className="p-3">Durée ou règle</th></tr>
            </thead>
            <tbody>
              {rows.map(([name, category, purpose, duration]) => (
                <tr key={name} className="border-t border-slate-200 align-top">
                  <td className="p-3 font-medium text-slate-950">{name}</td>
                  <td className="p-3">{category}</td>
                  <td className="p-3">{purpose}</td>
                  <td className="p-3">{duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-xl font-semibold">Condition d’activation</h2>
          <p className="mt-3 leading-7">
            Tant qu’un gestionnaire de consentement conforme, une liste exacte des traceurs et les formalités relatives aux transferts internationaux ne sont pas opérationnels, Google Analytics, Meta Pixel et tout traceur publicitaire doivent rester désactivés. La présence d’une simple mention dans cette page ne vaut pas consentement.
          </p>
        </section>

        <section className="mt-10 text-base leading-8 text-slate-700">
          <h2 className="text-2xl font-semibold text-slate-950">Modifier votre choix</h2>
          <p className="mt-3">
            Une commande « Gérer mes cookies » devra être disponible depuis le pied de page dès l’activation des traceurs non essentiels. L’utilisateur pourra retirer son consentement à tout moment, sans remettre en cause la licéité des traitements réalisés avant le retrait.
          </p>
        </section>
      </article>
    </main>
  );
}
