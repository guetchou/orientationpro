
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Impressum = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Mentions légales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Éditeur du site</h3>
              <p>Nom de l'entreprise : OrientMe</p>
              <p>Forme juridique : SARL</p>
              <p>Adresse : Avenue de la Paix, Brazzaville, République du Congo</p>
              <p>Téléphone : +242 00 00 00 00</p>
              <p>Email : contact@orientme.cg</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Directeur de la publication</h3>
              <p>Nom : Jean Dupont</p>
              <p>Fonction : Directeur Général</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Hébergement</h3>
              <p>Nom : Supabase</p>
              <p>Adresse : 123 Market Street, San Francisco, CA 94103, USA</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Propriété intellectuelle</h3>
              <p>L'ensemble du contenu du site web, incluant textes, images, vidéos, et éléments graphiques est la propriété exclusive d'OrientMe, sauf mention contraire. Toute reproduction ou diffusion non autorisée est strictement interdite.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Protection des données personnelles</h3>
              <p>Conformément à la loi sur la protection des données personnelles, les utilisateurs disposent d'un droit d'accès, de rectification et de suppression des données les concernant. Pour exercer ce droit, contactez-nous à l'adresse suivante : privacy@orientme.cg</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Cookies</h3>
              <p>Ce site utilise des cookies à des fins d'analyse de trafic et d'amélioration de l'expérience utilisateur. En naviguant sur ce site, vous acceptez l'utilisation de ces cookies.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Impressum;
