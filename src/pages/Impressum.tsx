

export default function Impressum() {
  return (
    <div className="min-h-screen flex flex-col">
      
      <main className="flex-1 container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto prose">
          <h1 className="text-3xl font-bold mb-6">Impressum</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold">Informations légales</h2>
              <p>
                Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'économie numérique, nous portons à la connaissance des utilisateurs du site OrientationPro les informations suivantes.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold">Éditeur</h2>
              <p>
                Le site OrientationPro est édité par :
              </p>
              <div className="pl-4">
                <p>OrientationPro SAS</p>
                <p>12 Avenue de l'Innovation</p>
                <p>75008 Paris</p>
                <p>France</p>
                <p>SIRET : 123 456 789 00010</p>
                <p>Capital social : 50 000 €</p>
                <p>TVA Intracommunautaire : FR 12 345678910</p>
                <p>Email : contact@orientationpro.com</p>
                <p>Téléphone : +33 1 23 45 67 89</p>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold">Directeur de la publication</h2>
              <p>
                Le Directeur de la publication est Marie Dubois, en sa qualité de Présidente de OrientationPro SAS.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold">Hébergeur</h2>
              <p>
                Le site OrientationPro est hébergé par :
              </p>
              <div className="pl-4">
                <p>Lovable.ai</p>
                <p>123 AI Avenue</p>
                <p>San Francisco, CA 94107</p>
                <p>États-Unis</p>
                <p>contact@lovable.ai</p>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold">Propriété intellectuelle</h2>
              <p>
                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              </p>
              <p>
                La reproduction de tout ou partie de ce site sur un support électronique ou autre est formellement interdite sauf autorisation expresse du directeur de la publication.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold">Limitation de responsabilité</h2>
              <p>
                OrientationPro s'efforce d'assurer au mieux de ses possibilités l'exactitude et la mise à jour des informations diffusées sur ce site, dont elle se réserve le droit de corriger, à tout moment et sans préavis, le contenu. Toutefois, OrientationPro ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à la disposition sur ce site.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold">Données personnelles</h2>
              <p>
                Les informations concernant la collecte et le traitement de vos données personnelles sont détaillées dans notre <a href="/data-protection" className="text-primary hover:underline">Politique de protection des données</a>.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold">Droit applicable et juridiction compétente</h2>
              <p>
                Tout litige en relation avec l'utilisation du site OrientationPro est soumis au droit français. Il est fait attribution exclusive de juridiction aux tribunaux compétents de Paris.
              </p>
            </section>
          </div>
        </div>
      </main>
      
    </div>
  );
}
