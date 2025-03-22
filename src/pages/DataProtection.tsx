
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DataProtection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Protection des données</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">1. Données collectées</h3>
              <p>Nous collectons les données suivantes :</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Informations personnelles : nom, prénom, adresse email, numéro de téléphone</li>
                <li>Données d'utilisation : résultats des tests, historique de navigation, préférences</li>
                <li>Données techniques : adresse IP, type de navigateur, appareil utilisé</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">2. Utilisation des données</h3>
              <p>Vos données sont utilisées pour :</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Vous fournir nos services d'orientation professionnelle</li>
                <li>Améliorer et personnaliser votre expérience utilisateur</li>
                <li>Vous contacter concernant votre compte ou nos services</li>
                <li>Analyser l'utilisation de notre plateforme</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">3. Partage des données</h3>
              <p>Nous ne partageons vos données qu'avec :</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Nos prestataires de services (hébergement, paiement, analyses)</li>
                <li>Les autorités compétentes en cas d'obligation légale</li>
              </ul>
              <p className="mt-2">Nous ne vendons jamais vos données personnelles à des tiers.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">4. Conservation des données</h3>
              <p>Vos données sont conservées pendant la durée de votre utilisation de nos services, et jusqu'à 2 ans après votre dernière connexion, sauf obligation légale de conservation plus longue.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">5. Sécurité des données</h3>
              <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données personnelles contre la perte, l'accès non autorisé ou toute forme de traitement illicite.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">6. Vos droits</h3>
              <p>Vous disposez des droits suivants concernant vos données personnelles :</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Accès et copie de vos données</li>
                <li>Rectification et mise à jour</li>
                <li>Effacement (droit à l'oubli)</li>
                <li>Limitation du traitement</li>
                <li>Opposition au traitement</li>
                <li>Portabilité de vos données</li>
              </ul>
              <p className="mt-2">Pour exercer ces droits, contactez-nous à privacy@orientme.cg</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataProtection;
