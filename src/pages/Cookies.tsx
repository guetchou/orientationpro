const items = [
  {
    title: 'Sessions et authentification',
    text: 'MAKOKI peut utiliser un cookie de session sécurisé et des données locales du navigateur pour maintenir la connexion, renouveler une session et protéger l’accès aux espaces personnels.',
  },
  {
    title: 'Préférences et reprise locale',
    text: 'Certaines préférences et certains brouillons, par exemple la reprise d’un questionnaire sur le même appareil, peuvent être conservés localement dans le navigateur. Cette conservation locale ne garantit pas une reprise sur un autre appareil.',
  },
  {
    title: 'Mesure technique',
    text: 'Des informations techniques minimales peuvent être utilisées pour détecter les erreurs, mesurer les performances et sécuriser le service. Elles ne doivent pas être présentées comme un dispositif publicitaire sans information et consentement adaptés.',
  },
  {
    title: 'Choix de l’utilisateur',
    text: 'Les cookies strictement nécessaires au fonctionnement ne peuvent pas toujours être désactivés sans empêcher la connexion. Les dispositifs non essentiels devront être soumis à un choix explicite avant leur activation.',
  },
];

export default function Cookies() {
  return (
    <main className="min-h-screen bg-white px-6 pb-20 pt-28">
      <article className="mx-auto max-w-4xl">
        <p className="font-semibold text-emerald-700">Informations légales</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Cookies et stockage local</h1>
        <p className="mt-5 text-lg leading-8 text-slate-700">
          Cette page explique les mécanismes techniques nécessaires au fonctionnement de MAKOKI. Aucun cookie publicitaire n’est revendiqué dans cette version pilote.
        </p>
        <div className="mt-10 space-y-9">
          {items.map((item) => (
            <section key={item.title}>
              <h2 className="text-2xl font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-base leading-8 text-slate-700">{item.text}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
