import { WordPressPost } from '@/types/wordpress';

// Articles de blog locaux pour le Congo Brazzaville
const localBlogPosts: WordPressPost[] = [
  {
    id: 1,
    date: '2024-01-15T10:00:00',
    title: {
      rendered: 'Baccalauréat 2025 : Les nouvelles réformes au Congo Brazzaville'
    },
    excerpt: {
      rendered: 'Le ministère de l\'Education annonce des réformes majeures pour le baccalauréat 2025, incluant de nouveaux coefficients, des épreuves pratiques et de nouvelles spécialités qui vont transformer l\'orientation post-bac.'
    },
    content: {
      rendered: `
        <h2>Les changements majeurs pour l'examen 2025</h2>
        <p>Le ministère de l'Enseignement primaire, secondaire et de l'Alphabétisation a annoncé de nouvelles réformes pour le baccalauréat 2025 au Congo Brazzaville. Ces modifications visent à moderniser le système éducatif et à mieux préparer les étudiants aux défis du monde contemporain.</p>
        
        <h3>Principales nouveautés :</h3>
        <ul>
          <li><strong>Nouveaux coefficients :</strong> Les mathématiques et les sciences voient leur poids augmenter dans l'évaluation finale</li>
          <li><strong>Épreuves pratiques :</strong> Introduction d'épreuves pratiques en sciences expérimentales</li>
          <li><strong>Évaluation continue :</strong> 30% de la note finale basée sur le contrôle continu</li>
          <li><strong>Nouvelles spécialités :</strong> Ajout de spécialités en informatique et en sciences économiques</li>
        </ul>
        
        <h3>Impact sur l'orientation post-bac</h3>
        <p>Ces réformes vont nécessairement influencer les choix d'orientation des bacheliers. Les nouvelles spécialités ouvrent des perspectives intéressantes pour les études supérieures, notamment dans les domaines technologiques et économiques.</p>
        
        <p>Les établissements d'enseignement supérieur devront adapter leurs programmes d'admission pour tenir compte de ces nouvelles spécialités et des compétences développées par les étudiants.</p>
      `
    },
    author: 1,
    featured_media: 0,
    categories: [1],
    tags: [1, 2],
    slug: 'baccalaureat-2025-nouvelles-reformes-congo',
    link: '/blog/baccalaureat-2025-nouvelles-reformes-congo',
    modified: '2024-01-15T10:00:00',
    _embedded: {
      author: [{
        id: 1,
        name: 'Ministère de l\'Éducation',
        avatar_urls: {
          '96': '/images/education-ministere.jpg'
        }
      }],
      'wp:featuredmedia': [{
        id: 1,
        source_url: '/images/blog/baccalaureat-2025-thumb.png',
        media_details: {
          sizes: {
            thumbnail: { source_url: '/images/blog/baccalaureat-2025-thumb.jpg' },
            medium: { source_url: '/images/blog/baccalaureat-2025-medium.jpg' },
            large: { source_url: '/images/blog/baccalaureat-2025-large.jpg' },
            full: { source_url: '/images/blog/baccalaureat-2025.jpg' }
          }
        }
      }],
      'wp:term': [[
        { id: 1, name: 'Education', slug: 'education' },
        { id: 2, name: 'Baccalauréat', slug: 'baccalaureat' }
      ]]
    }
  },
  {
    id: 2,
    date: '2024-01-10T14:30:00',
    title: {
      rendered: 'Orientation scolaire : Comment choisir sa filière au Congo Brazzaville'
    },
    excerpt: {
      rendered: 'Guide complet pour choisir sa filière au Congo Brazzaville. Découvrez les différentes séries disponibles, les facteurs à considérer et les conseils pratiques pour une orientation réussie.'
    },
    content: {
      rendered: `
        <h2>Guide complet pour une orientation réussie</h2>
        <p>L'orientation scolaire est un moment crucial dans la vie d'un étudiant. Au Congo Brazzaville, le choix de la filière détermine souvent le parcours professionnel futur. Voici un guide complet pour faire les bons choix.</p>
        
        <h3>Les filières disponibles</h3>
        <ul>
          <li><strong>Série A (Littéraire) :</strong> Français, Latin, Grec, Philosophie</li>
          <li><strong>Série B (Économique) :</strong> Mathématiques, Sciences économiques et sociales</li>
          <li><strong>Série C (Scientifique) :</strong> Mathématiques, Physique-Chimie, Sciences de la vie et de la terre</li>
          <li><strong>Série D (Sciences expérimentales) :</strong> Biologie, Physique-Chimie, Mathématiques</li>
          <li><strong>Série E (Mathématiques et technologie) :</strong> Mathématiques, Sciences physiques, Technologie</li>
        </ul>
        
        <h3>Facteurs à considérer</h3>
        <p>Pour choisir sa filière, il faut prendre en compte :</p>
        <ul>
          <li>Les résultats scolaires dans chaque matière</li>
          <li>Les centres d'intérêt personnels</li>
          <li>Les débouchés professionnels</li>
          <li>Les perspectives d'études supérieures</li>
        </ul>
        
        <h3>Conseils pratiques</h3>
        <p>Il est recommandé de :</p>
        <ul>
          <li>Rencontrer un conseiller d'orientation</li>
          <li>Participer aux salons de l'orientation</li>
          <li>Échanger avec des étudiants et professionnels</li>
          <li>Faire des stages de découverte</li>
        </ul>
      `
    },
    author: 2,
    featured_media: 0,
    categories: [2],
    tags: [3, 4],
    slug: 'orientation-scolaire-choisir-filiere-congo',
    link: '/blog/orientation-scolaire-choisir-filiere-congo',
    modified: '2024-01-10T14:30:00',
    _embedded: {
      author: [{
        id: 2,
        name: 'Conseiller d\'Orientation',
        avatar_urls: {
          '96': '/images/conseiller-orientation.jpg'
        }
      }],
      'wp:featuredmedia': [{
        id: 2,
        source_url: '/images/blog/orientation-scolaire.png',
        media_details: {
          sizes: {
            thumbnail: { source_url: '/images/blog/orientation-scolaire-thumb.jpg' },
            medium: { source_url: '/images/blog/orientation-scolaire-medium.jpg' },
            large: { source_url: '/images/blog/orientation-scolaire-large.jpg' },
            full: { source_url: '/images/blog/orientation-scolaire.jpg' }
          }
        }
      }],
      'wp:term': [[
        { id: 2, name: 'Orientation', slug: 'orientation' },
        { id: 3, name: 'Filières', slug: 'filieres' }
      ]]
    }
  },
  {
    id: 3,
    date: '2024-01-05T09:15:00',
    title: {
      rendered: 'Emploi au Congo : Les secteurs qui recrutent en 2025'
    },
    excerpt: {
      rendered: 'Découvrez les secteurs qui recrutent au Congo Brazzaville en 2025. Technologies, énergie, finance, santé et éducation offrent de nombreuses opportunités d\'emploi.'
    },
    content: {
      rendered: `
        <h2>Panorama du marché de l'emploi</h2>
        <p>Le marché de l'emploi au Congo Brazzaville évolue rapidement. En 2025, certains secteurs connaissent une forte croissance et recrutent activement. Voici un aperçu des opportunités disponibles.</p>
        
        <h3>Secteurs en forte croissance</h3>
        <ul>
          <li><strong>Technologies de l'information :</strong> Développeurs, analystes, chefs de projet IT</li>
          <li><strong>Énergie et pétrole :</strong> Ingénieurs, techniciens, géologues</li>
          <li><strong>Finance et banque :</strong> Analystes financiers, conseillers, gestionnaires de risques</li>
          <li><strong>Santé :</strong> Médecins, infirmiers, pharmaciens</li>
          <li><strong>Éducation :</strong> Enseignants, formateurs, conseillers pédagogiques</li>
        </ul>
        
        <h3>Compétences recherchées</h3>
        <p>Les employeurs privilégient les candidats ayant :</p>
        <ul>
          <li>Une formation solide dans leur domaine</li>
          <li>Des compétences en langues étrangères (anglais, français)</li>
          <li>Une expérience pratique (stages, projets)</li>
          <li>Des compétences numériques</li>
          <li>Une capacité d'adaptation et d'innovation</li>
        </ul>
        
        <h3>Conseils pour les candidats</h3>
        <p>Pour maximiser ses chances d'emploi :</p>
        <ul>
          <li>Développer un réseau professionnel</li>
          <li>Se former continuellement</li>
          <li>Préparer un CV et une lettre de motivation percutants</li>
          <li>Participer aux salons de l'emploi</li>
          <li>Utiliser les plateformes de recrutement en ligne</li>
        </ul>
      `
    },
    author: 3,
    featured_media: 0,
    categories: [3],
    tags: [5, 6],
    slug: 'emploi-congo-secteurs-recrutent-2025',
    link: '/blog/emploi-congo-secteurs-recrutent-2025',
    modified: '2024-01-05T09:15:00',
    _embedded: {
      author: [{
        id: 3,
        name: 'Expert en Recrutement',
        avatar_urls: {
          '96': '/images/expert-recrutement.jpg'
        }
      }],
      'wp:featuredmedia': [{
        id: 3,
        source_url: '/images/blog/emploi-congo-2025.png',
        media_details: {
          sizes: {
            thumbnail: { source_url: '/images/blog/emploi-congo-2025-thumb.jpg' },
            medium: { source_url: '/images/blog/emploi-congo-2025-medium.jpg' },
            large: { source_url: '/images/blog/emploi-congo-2025-large.jpg' },
            full: { source_url: '/images/blog/emploi-congo-2025.jpg' }
          }
        }
      }],
      'wp:term': [[
        { id: 3, name: 'Emploi', slug: 'emploi' },
        { id: 4, name: 'Recrutement', slug: 'recrutement' }
      ]]
    }
  },
  {
    id: 4,
    date: '2024-01-03T16:20:00',
    title: {
      rendered: 'Recrutement : Les nouvelles tendances en 2025'
    },
    excerpt: {
      rendered: 'Découvrez les nouvelles tendances du recrutement en 2025 : IA, entretiens vidéo, tests de compétences et l\'importance croissante des soft skills.'
    },
    content: {
      rendered: `
        <h2>Évolution des pratiques de recrutement</h2>
        <p>Le recrutement évolue rapidement avec l'arrivée de nouvelles technologies et l'évolution des attentes des candidats. En 2025, les entreprises adoptent des approches plus modernes et inclusives.</p>
        
        <h3>Nouvelles méthodes de recrutement</h3>
        <ul>
          <li><strong>Recrutement par IA :</strong> Utilisation d'algorithmes pour analyser les CV et prédire la performance</li>
          <li><strong>Entretiens vidéo :</strong> Développement des plateformes d'entretien à distance</li>
          <li><strong>Tests de compétences :</strong> Évaluation pratique des compétences techniques</li>
          <li><strong>Recrutement par réseaux sociaux :</strong> Utilisation de LinkedIn et autres plateformes</li>
          <li><strong>Recrutement par recommandation :</strong> Programmes de parrainage employés</li>
        </ul>
        
        <h3>Compétences recherchées</h3>
        <p>Les entreprises privilégient désormais :</p>
        <ul>
          <li><strong>Soft skills :</strong> Communication, travail d'équipe, adaptabilité</li>
          <li><strong>Compétences numériques :</strong> Maîtrise des outils digitaux</li>
          <li><strong>Intelligence émotionnelle :</strong> Capacité à gérer les relations</li>
          <li><strong>Apprentissage continu :</strong> Capacité d'adaptation et de formation</li>
          <li><strong>Innovation :</strong> Créativité et pensée critique</li>
        </ul>
        
        <h3>Conseils pour les candidats</h3>
        <p>Pour se démarquer dans le processus de recrutement :</p>
        <ul>
          <li>Optimiser son profil LinkedIn</li>
          <li>Préparer des exemples concrets de réalisations</li>
          <li>Développer sa présence en ligne</li>
          <li>Se former aux nouvelles technologies</li>
          <li>Construire un réseau professionnel actif</li>
        </ul>
      `
    },
    author: 4,
    featured_media: 0,
    categories: [4],
    tags: [7, 8],
    slug: 'recrutement-nouvelles-tendances-2025',
    link: '/blog/recrutement-nouvelles-tendances-2025',
    modified: '2024-01-03T16:20:00',
    _embedded: {
      author: [{
        id: 4,
        name: 'Expert en RH',
        avatar_urls: {
          '96': '/images/expert-rh.jpg'
        }
      }],
      'wp:featuredmedia': [{
        id: 4,
        source_url: '/images/blog/recrutement-tendances-2025.jpg',
        media_details: {
          sizes: {
            thumbnail: { source_url: '/images/blog/recrutement-tendances-2025-thumb.jpg' },
            medium: { source_url: '/images/blog/recrutement-tendances-2025-medium.jpg' },
            large: { source_url: '/images/blog/recrutement-tendances-2025-large.jpg' },
            full: { source_url: '/images/blog/recrutement-tendances-2025.jpg' }
          }
        }
      }],
      'wp:term': [[
        { id: 4, name: 'Recrutement', slug: 'recrutement' },
        { id: 5, name: 'Tendances', slug: 'tendances' }
      ]]
    }
  },
  {
    id: 5,
    date: '2024-01-01T12:00:00',
    title: {
      rendered: 'Formation continue : Se former tout au long de sa carrière'
    },
    excerpt: {
      rendered: 'Découvrez l\'importance de la formation continue dans votre carrière. Guide complet sur les types de formation, les institutions et les financements disponibles au Congo.'
    },
    content: {
      rendered: `
        <h2>L'importance de la formation continue</h2>
        <p>Dans un monde professionnel en constante évolution, la formation continue est devenue indispensable pour maintenir sa compétitivité sur le marché de l'emploi au Congo Brazzaville.</p>
        
        <h3>Pourquoi se former continuellement ?</h3>
        <ul>
          <li><strong>Évolution technologique :</strong> S'adapter aux nouvelles technologies</li>
          <li><strong>Compétitivité :</strong> Rester attractif sur le marché de l'emploi</li>
          <li><strong>Évolution de carrière :</strong> Accéder à des postes plus qualifiés</li>
          <li><strong>Reconversion :</strong> Changer de secteur d'activité</li>
          <li><strong>Développement personnel :</strong> Acquérir de nouvelles compétences</li>
        </ul>
        
        <h3>Types de formation disponibles</h3>
        <ul>
          <li><strong>Formations diplômantes :</strong> Masters, certifications spécialisées</li>
          <li><strong>Formations courtes :</strong> Formations techniques, langues, management</li>
          <li><strong>Formations en ligne :</strong> MOOCs, webinaires, tutoriels</li>
          <li><strong>Formations en alternance :</strong> Combiner travail et formation</li>
        </ul>
        
        <h3>Institutions de formation au Congo</h3>
        <ul>
          <li><strong>Universités :</strong> Université Marien Ngouabi, Université Denis Sassou Nguesso</li>
          <li><strong>Écoles spécialisées :</strong> École nationale d'administration</li>
          <li><strong>Centres de formation :</strong> Centres de formation professionnelle</li>
          <li><strong>Organismes privés :</strong> Instituts de formation spécialisés</li>
        </ul>
        
        <h3>Financement de la formation</h3>
        <ul>
          <li><strong>CPF :</strong> Compte Personnel de Formation</li>
          <li><strong>Financement employeur :</strong> Plan de formation de l'entreprise</li>
          <li><strong>Bourses d'État :</strong> Aides gouvernementales</li>
          <li><strong>Prêts étudiants :</strong> Prêts bancaires spécialisés</li>
        </ul>
      `
    },
    author: 5,
    featured_media: 0,
    categories: [5],
    tags: [9, 10],
    slug: 'formation-continue-carriere-congo',
    link: '/blog/formation-continue-carriere-congo',
    modified: '2024-01-01T12:00:00',
    _embedded: {
      author: [{
        id: 5,
        name: 'Conseiller en Formation',
        avatar_urls: {
          '96': '/images/conseiller-formation.jpg'
        }
      }],
      'wp:featuredmedia': [{
        id: 5,
        source_url: '/images/blog/formation-continue.jpg',
        media_details: {
          sizes: {
            thumbnail: { source_url: '/images/blog/formation-continue-thumb.jpg' },
            medium: { source_url: '/images/blog/formation-continue-medium.jpg' },
            large: { source_url: '/images/blog/formation-continue-large.jpg' },
            full: { source_url: '/images/blog/formation-continue.jpg' }
          }
        }
      }],
      'wp:term': [[
        { id: 5, name: 'Formation', slug: 'formation' },
        { id: 6, name: 'Développement professionnel', slug: 'developpement-professionnel' }
      ]]
    }
  },
  {
    id: 6,
    date: '2024-01-20T08:30:00',
    title: {
      rendered: 'Entrepreneuriat au Congo : Créer son entreprise en 2025'
    },
    excerpt: {
      rendered: 'Guide complet pour créer son entreprise au Congo Brazzaville en 2025. Découvrez les secteurs porteurs, les démarches administratives et les sources de financement.'
    },
    content: {
      rendered: `
        <h2>L'aventure de créer son entreprise</h2>
        <p>L'entrepreneuriat connaît un essor important au Congo Brazzaville. De plus en plus de jeunes se lancent dans l'aventure de créer leur propre entreprise.</p>
        
        <h3>Pourquoi se lancer dans l'entrepreneuriat ?</h3>
        <ul>
          <li><strong>Autonomie :</strong> Être son propre patron</li>
          <li><strong>Créativité :</strong> Réaliser ses idées</li>
          <li><strong>Impact :</strong> Contribuer au développement du pays</li>
          <li><strong>Réussite financière :</strong> Potentiel de revenus élevés</li>
          <li><strong>Flexibilité :</strong> Gérer son temps librement</li>
        </ul>
        
        <h3>Secteurs porteurs pour l'entrepreneuriat</h3>
        <ul>
          <li><strong>Numérique et Technologies :</strong> Développement d'applications, services informatiques, e-commerce</li>
          <li><strong>Agriculture et Agroalimentaire :</strong> Production agricole, transformation alimentaire</li>
          <li><strong>Services aux entreprises :</strong> Conseil, formation, logistique</li>
          <li><strong>Commerce et Distribution :</strong> Boutiques spécialisées, import-export</li>
        </ul>
        
        <h3>Démarches administratives</h3>
        <ol>
          <li>Réserver le nom de l'entreprise au Centre de formalités des entreprises (CFE)</li>
          <li>Rédiger les statuts avec un avocat ou un expert-comptable</li>
          <li>Déposer le dossier au CFE avec les pièces requises</li>
          <li>Obtenir l'immatriculation au registre du commerce</li>
          <li>Ouvrir un compte bancaire professionnel</li>
          <li>Déclarer l'activité aux services fiscaux</li>
        </ol>
        
        <h3>Financement de l'entreprise</h3>
        <ul>
          <li><strong>Apport personnel :</strong> Épargne, vente de biens</li>
          <li><strong>Prêts bancaires :</strong> Crédits aux PME</li>
          <li><strong>Microcrédits :</strong> Institutions de microfinance</li>
          <li><strong>Subventions :</strong> Aides gouvernementales</li>
          <li><strong>Investisseurs :</strong> Business angels, fonds d'investissement</li>
        </ul>
      `
    },
    author: 6,
    featured_media: 0,
    categories: [6],
    tags: [11, 12],
    slug: 'entrepreneuriat-congo-creer-entreprise-2025',
    link: '/blog/entrepreneuriat-congo-creer-entreprise-2025',
    modified: '2024-01-20T08:30:00',
    _embedded: {
      author: [{
        id: 6,
        name: 'Expert en Entrepreneuriat',
        avatar_urls: {
          '96': '/images/expert-entrepreneuriat.jpg'
        }
      }],
      'wp:featuredmedia': [{
        id: 6,
        source_url: '/images/blog/entrepreneuriat-congo.jpg',
        media_details: {
          sizes: {
            thumbnail: { source_url: '/images/blog/entrepreneuriat-congo-thumb.jpg' },
            medium: { source_url: '/images/blog/entrepreneuriat-congo-medium.jpg' },
            large: { source_url: '/images/blog/entrepreneuriat-congo-large.jpg' },
            full: { source_url: '/images/blog/entrepreneuriat-congo.jpg' }
          }
        }
      }],
      'wp:term': [[
        { id: 6, name: 'Entrepreneuriat', slug: 'entrepreneuriat' },
        { id: 7, name: 'Création d\'entreprise', slug: 'creation-entreprise' }
      ]]
    }
  }
];

export const localBlogService = {
  // Récupérer tous les articles
  getPosts: async (page: number = 1, perPage: number = 10, search: string = ''): Promise<WordPressPost[]> => {
    try {
      let filteredPosts = localBlogPosts;
      
      // Filtrer par recherche si un terme est fourni
      if (search) {
        const searchLower = search.toLowerCase();
        filteredPosts = localBlogPosts.filter(post => 
          post.title.rendered.toLowerCase().includes(searchLower) ||
          post.excerpt.rendered.toLowerCase().includes(searchLower) ||
          post.content.rendered.toLowerCase().includes(searchLower)
        );
      }
      
      // Pagination
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
      
      return paginatedPosts;
    } catch (error) {
      console.error('Error fetching local blog posts:', error);
      return [];
    }
  },
  
  // Récupérer le nombre total d'articles
  getTotalPosts: async (search: string = ''): Promise<number> => {
    try {
      let filteredPosts = localBlogPosts;
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredPosts = localBlogPosts.filter(post => 
          post.title.rendered.toLowerCase().includes(searchLower) ||
          post.excerpt.rendered.toLowerCase().includes(searchLower) ||
          post.content.rendered.toLowerCase().includes(searchLower)
        );
      }
      
      return filteredPosts.length;
    } catch (error) {
      console.error('Error getting total posts count:', error);
      return 0;
    }
  },
  
  // Récupérer un article par slug
  getPostBySlug: async (slug: string): Promise<WordPressPost | null> => {
    try {
      const post = localBlogPosts.find(post => post.slug === slug);
      return post || null;
    } catch (error) {
      console.error('Error fetching local blog post by slug:', error);
      return null;
    }
  },
  
  // Récupérer un article par ID
  getPostById: async (id: number): Promise<WordPressPost | null> => {
    try {
      const post = localBlogPosts.find(post => post.id === id);
      return post || null;
    } catch (error) {
      console.error('Error fetching local blog post by ID:', error);
      return null;
    }
  }
}; 