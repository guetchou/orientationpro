
// Configuration des services
export const config = {
  // URL de l'API WordPress
  wordpressApi: {
    // Par défaut, on utilise une API WordPress publique pour les tests
    // Remplacez cette URL par celle de votre instance WordPress
    baseUrl: import.meta.env.VITE_WORDPRESS_API_URL || 'https://demo.wp-api.org/wp-json/wp/v2',
  },
  
  // Autres configurations
  supabase: {
    // Configurations Supabase, si nécessaire
  },
  
  // Paramètres généraux
  app: {
    name: "Orientation App",
    version: "1.0.0",
  }
};
