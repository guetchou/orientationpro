
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block p-6 bg-white rounded-full mb-6 shadow-md">
          <FileQuestion className="h-16 w-16 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold mb-2 text-gray-900">Page non trouvée</h1>
        <p className="text-xl text-gray-600 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="space-y-4">
          <Button asChild size="lg" className="px-8">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
          
          <div>
            <Link to="/contact" className="text-primary hover:underline">
              Contactez-nous si vous avez besoin d'aide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
