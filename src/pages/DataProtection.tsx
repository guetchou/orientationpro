

export default function DataProtection() {
  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto prose">
          <h1 className="text-3xl font-bold mb-6">Protection des données</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold">Politique de confidentialité</h2>
              <p>
                Dernière mise à jour : 6 avril 2025
              </p>
              <p>
                OrientationPro s'engage à protéger vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre site web et nos services.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold">Collecte de données</h2>
              <p>
                Nous collectons les informations suivantes :
              </p>
              <ul className="list-disc pl-6">
                <li>Informations d'identification (nom, prénom, email)</li>
                <li>Données de profil (parcours scolaire, centres d'intérêt)</li>
                <li>Résultats de tests d'orientation</li>
                <li>Données de navigation et d'utilisation du site</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold">Utilisation des données</h2>
              <p>
                Nous utilisons vos données pour :
              </p>
              <ul className="list-disc pl-6">
                <li>Fournir nos services d'orientation professionnelle</li>
                <li>Personnaliser votre expérience utilisateur</li>
                <li>Améliorer nos services et développer de nouvelles fonctionnalités</li>
                <li>Vous contacter concernant votre compte ou nos services</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold">Protection des données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité pour protéger vos données contre tout accès, modification, divulgation ou destruction non autorisés. Nos pratiques incluent :
              </p>
              <ul className="list-disc pl-6">
                <li>Le chiffrement des données sensibles</li>
                <li>Des protocoles de sécurité pour les transferts de données</li>
                <li>Des contrôles d'accès stricts pour notre personnel</li>
                <li>Des audits de sécurité réguliers</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold">Vos droits</h2>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
              </p>
              <ul className="list-disc pl-6">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification de vos données</li>
                <li>Droit à l'effacement ("droit à l'oubli")</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d'opposition au traitement</li>
              </ul>
              <p>
                Pour exercer ces droits, veuillez nous contacter à l'adresse suivante : privacy@orientationpro.com
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold">Cookies</h2>
              <p>
                Notre site utilise des cookies pour améliorer votre expérience de navigation. Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines fonctionnalités du site pourraient ne plus être disponibles.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold">Modifications de la politique</h2>
              <p>
                Nous pouvons mettre à jour cette politique de temps à autre. Nous vous informerons de tout changement important par email ou par une notification sur notre site.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold">Contact</h2>
              <p>
                Pour toute question concernant cette politique ou nos pratiques en matière de protection des données, veuillez nous contacter à privacy@orientationpro.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      
    </div>
  );
}
