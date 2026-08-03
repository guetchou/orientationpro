import { usePageMeta } from '@/hooks/usePageMeta';

const rows = [
  ['Session et sécurité', 'Strictement nécessaire', 'Maintien de la connexion et protection du compte.', 'Durée de la session.', 'Actif lorsque vous vous connectez'],
  ['Brouillon local du questionnaire', 'Fonctionnel', 'Reprendre le questionnaire sur le même appareil.', 'Jusqu’à la soumission ou à la suppression du stockage local.', 'Actif pendant le parcours'],
  ['Préférences de consentement', 'Strictement nécessaire', 'Mémoriser accepter, refuser ou personnaliser.', '6 mois avant une nouvelle demande.', 'Actif'],
  ['Google Sign-In', 'Authentification à la demande', 'Permettre la connexion choisie avec Google.', 'Selon la session et les règles du fournisseur.', 'Déclenché uniquement par votre action'],
  ['Google Analytics', 'Mesure d’audience non essentielle', 'Comprendre l’utilisation du site.', 'Durée configurée lors de l’activation.', 'Désactivé sans consentement'],
  ['Meta Pixel', 'Publicité et mesure non essentielles', 'Mesurer des campagnes lorsqu’elles sont réellement lancées.', 'Selon la configuration et les règles de Meta.', 'Désactivé sans consentement'],
  ['Chatwoot ou outil de support', 'Support', 'Ouvrir une conversation d’assistance lorsque ce canal est activé.', 'Selon la politique de support affichée.', 'Chargé seulement si le service est activé'],
];

export default function Cookies() {
  usePageMeta({
    title: 'Gestion des cookies',
    description: 'Informations et préférences sur l’utilisation des cookies sur MAKOKI.',
    path: '/cookies',
  });

  return (
    <main className="min-h-screen bg-white px-6 pb-20 pt-28">
      <article className="mx-auto max-w-5xl">
        <p className="font-semibold text-emerald-700">Informations légales</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Cookies, traceurs et stockage local</h1>
        <p className="mt-5 text-sm text-slate-500">Version du 3 août 2026</p>

        <div className="mt-8 space-y-5 text-base leading-8 text-slate-700">
          <p>
            MAKOKI distingue les mécanismes indispensables au fonctionnement du service des outils de mesure, de publicité et d’assistance. Les traceurs non essentiels ne sont pas chargés avant un consentement libre, spécifique et éclairé.
          </p>
          <p>
            Refuser les traceurs non essentiels est aussi simple que les accepter. Le refus ne bloque pas l’accès aux fonctions essentielles du site.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-950">
              <tr>
                <th className="p-3">Mécanisme</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3">Finalité</th>
                <th className="p-3">Durée ou règle</th>
                <th className="p-3">État</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([name, category, purpose, duration, status]) => (
                <tr key={name} className="border-t border-slate-200 align-top">
                  <td className="p-3 font-medium text-slate-950">{name}</td>
                  <td className="p-3">{category}</td>
                  <td className="p-3">{purpose}</td>
                  <td className="p-3">{duration}</td>
                  <td className="p-3 font-medium text-slate-700">{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-xl font-semibold">Condition d’activation</h2>
          <p className="mt-3 leading-7">
            Google Analytics, Meta Pixel et tout traceur publicitaire restent désactivés tant qu’ils ne sont pas activés dans la configuration du site et acceptés par l’utilisateur. Une simple mention dans cette page ne vaut jamais consentement.
          </p>
        </section>

        <section className="mt-10 text-base leading-8 text-slate-700">
          <h2 className="text-2xl font-semibold text-slate-950">Modifier votre choix</h2>
          <p className="mt-3">
            La commande « Gérer mes cookies » est disponible depuis le pied de page. Vous pouvez modifier ou retirer votre choix à tout moment, sans remettre en cause la licéité des traitements réalisés avant le retrait.
          </p>
        </section>
      </article>
    </main>
  );
}
