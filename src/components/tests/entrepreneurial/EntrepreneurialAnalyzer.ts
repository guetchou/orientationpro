
interface EntrepreneurialResults {
  entrepreneur: number;
  salarie: number;
  commercant: number;
  artisan: number;
  expatriation: number;
  inactif: number;
  profilDominant: string;
  profilSecondaire: string;
  confidenceScore: number;
  recommendations: string[];
}

export const analyzeEntrepreneurialResults = (answers: number[]): EntrepreneurialResults => {
  // Initialiser les scores pour chaque profil
  let entrepreneur = 0;
  let salarie = 0;
  let commercant = 0;
  let artisan = 0;
  let expatriation = 0;
  let inactif = 0;

  // Analyse des réponses pour déterminer les scores
  answers.forEach((answer, index) => {
    const questionId = index + 1;
    const value = answer;

    switch (questionId) {
      // Prise de risque
      case 1:
        entrepreneur += value >= 3 ? 3 : 0;
        salarie += value <= 2 ? 2 : 0;
        commercant += value >= 3 ? 2 : 0;
        artisan += value === 2 || value === 3 ? 2 : 0;
        expatriation += value >= 3 ? 2 : 0;
        inactif += value === 1 ? 1 : 0;
        break;

      // Autonomie
      case 2:
        entrepreneur += value >= 3 ? 3 : 0;
        salarie += value <= 2 ? 3 : 0;
        commercant += value >= 3 ? 2 : 0;
        artisan += value >= 3 ? 3 : 0;
        expatriation += value >= 3 ? 2 : 0;
        inactif += value === 1 ? 1 : 0;
        break;

      // Innovation
      case 3:
        entrepreneur += value >= 3 ? 3 : 0;
        salarie += value <= 2 ? 2 : 0;
        commercant += value >= 2 ? 1 : 0;
        artisan += value === 3 ? 2 : 0;
        expatriation += value >= 3 ? 1 : 0;
        inactif += value === 1 ? 1 : 0;
        break;

      // Persévérance
      case 4:
        entrepreneur += value >= 3 ? 3 : 0;
        salarie += value === 2 || value === 3 ? 1 : 0;
        commercant += value >= 3 ? 2 : 0;
        artisan += value >= 3 ? 3 : 0;
        expatriation += value >= 3 ? 2 : 0;
        inactif += value === 1 ? 3 : 0;
        break;

      // Leadership
      case 5:
        entrepreneur += value >= 3 ? 3 : 0;
        salarie += value <= 2 ? 3 : 0;
        commercant += value >= 3 ? 2 : 0;
        artisan += value === 2 || value === 3 ? 1 : 0;
        expatriation += value >= 3 ? 1 : 0;
        inactif += value === 1 ? 1 : 0;
        break;

      // Indépendance
      case 6:
        entrepreneur += value === 4 ? 3 : 0;
        salarie += value <= 2 ? 3 : 0;
        commercant += value >= 3 ? 2 : 0;
        artisan += value >= 3 ? 3 : 0;
        expatriation += value >= 3 ? 1 : 0;
        inactif += value === 1 ? 1 : 0;
        break;

      // Vision commerciale
      case 7:
        entrepreneur += value >= 3 ? 3 : 0;
        salarie += value <= 2 ? 2 : 0;
        commercant += value >= 3 ? 3 : 0;
        artisan += value === 2 || value === 3 ? 1 : 0;
        expatriation += value >= 3 ? 1 : 0;
        inactif += value === 1 ? 1 : 0;
        break;

      // Mobilité
      case 8:
        entrepreneur += value >= 3 ? 1 : 0;
        salarie += value === 2 || value === 3 ? 1 : 0;
        commercant += value === 2 ? 1 : 0;
        artisan += value <= 2 ? 1 : 0;
        expatriation += value >= 3 ? 3 : 0;
        inactif += value === 1 ? 1 : 0;
        break;

      // Ambition
      case 9:
        entrepreneur += value >= 3 ? 3 : 0;
        salarie += value === 2 ? 2 : 0;
        commercant += value >= 3 ? 2 : 0;
        artisan += value === 2 || value === 3 ? 2 : 0;
        expatriation += value >= 3 ? 2 : 0;
        inactif += value === 1 ? 3 : 0;
        break;

      // Expertise technique
      case 10:
        entrepreneur += value >= 3 ? 2 : 0;
        salarie += value === 2 || value === 3 ? 2 : 0;
        commercant += value >= 2 ? 1 : 0;
        artisan += value >= 3 ? 3 : 0;
        expatriation += value >= 3 ? 1 : 0;
        inactif += value === 1 ? 1 : 0;
        break;

      // Gestion du stress
      case 11:
        entrepreneur += value >= 3 ? 3 : 0;
        salarie += value === 2 || value === 3 ? 1 : 0;
        commercant += value >= 3 ? 2 : 0;
        artisan += value >= 2 ? 1 : 0;
        expatriation += value >= 3 ? 2 : 0;
        inactif += value === 1 ? 2 : 0;
        break;

      // Attitude
      case 12:
        entrepreneur += value === 4 ? 3 : 0;
        salarie += value === 2 ? 3 : 0;
        commercant += value >= 3 ? 2 : 0;
        artisan += value >= 2 ? 2 : 0;
        expatriation += value >= 3 ? 1 : 0;
        inactif += value === 1 ? 3 : 0;
        break;

      // Créativité
      case 13:
        entrepreneur += value >= 3 ? 2 : 0;
        salarie += value <= 2 ? 2 : 0;
        commercant += value === 3 ? 1 : 0;
        artisan += value >= 3 ? 3 : 0;
        expatriation += value >= 3 ? 1 : 0;
        inactif += value === 1 ? 1 : 0;
        break;

      // Gestion financière
      case 14:
        entrepreneur += value >= 3 ? 3 : 0;
        salarie += value <= 2 ? 2 : 0;
        commercant += value >= 3 ? 3 : 0;
        artisan += value === 2 || value === 3 ? 2 : 0;
        expatriation += value >= 3 ? 2 : 0;
        inactif += value === 1 ? 1 : 0;
        break;

      // Relationnel
      case 15:
        entrepreneur += value >= 3 ? 3 : 0;
        salarie += value === 2 ? 2 : 0;
        commercant += value >= 3 ? 3 : 0;
        artisan += value === 2 ? 1 : 0;
        expatriation += value >= 3 ? 2 : 0;
        inactif += value === 1 ? 1 : 0;
        break;

      default:
        break;
    }
  });

  // Normaliser les scores sur 100
  const maxPossibleScore = 45; // Score maximal possible pour chaque profil
  entrepreneur = Math.round((entrepreneur / maxPossibleScore) * 100);
  salarie = Math.round((salarie / maxPossibleScore) * 100);
  commercant = Math.round((commercant / maxPossibleScore) * 100);
  artisan = Math.round((artisan / maxPossibleScore) * 100);
  expatriation = Math.round((expatriation / maxPossibleScore) * 100);
  inactif = Math.round((inactif / maxPossibleScore) * 100);

  // Identifier les profils dominants
  const scores = [
    { type: 'entrepreneur', score: entrepreneur },
    { type: 'salarie', score: salarie },
    { type: 'commercant', score: commercant },
    { type: 'artisan', score: artisan },
    { type: 'expatriation', score: expatriation },
    { type: 'inactif', score: inactif }
  ];

  // Trier par score décroissant
  scores.sort((a, b) => b.score - a.score);

  const profilDominant = scores[0].type;
  const profilSecondaire = scores[1].type;

  // Générer des recommandations en fonction du profil dominant
  const recommendations: string[] = [];

  switch (profilDominant) {
    case 'entrepreneur':
      recommendations.push("Envisagez de créer votre propre entreprise dans un domaine qui vous passionne");
      recommendations.push("Développez votre réseau professionnel et recherchez des mentors entrepreneurs");
      recommendations.push("Explorez les programmes d'accompagnement et d'incubation pour entrepreneurs");
      break;
    case 'salarie':
      recommendations.push("Recherchez des entreprises offrant stabilité et perspectives d'évolution");
      recommendations.push("Investissez dans des formations qualifiantes pour progresser dans votre secteur");
      recommendations.push("Développez vos compétences en gestion de projet et travail d'équipe");
      break;
    case 'commercant':
      recommendations.push("Explorez les opportunités de franchise ou de reprise de commerce");
      recommendations.push("Développez vos compétences en vente, négociation et relation client");
      recommendations.push("Formez-vous aux fondamentaux de la gestion commerciale");
      break;
    case 'artisan':
      recommendations.push("Perfectionnez vos compétences techniques dans votre domaine d'expertise");
      recommendations.push("Envisagez l'obtention de certifications ou diplômes professionnels");
      recommendations.push("Explorez les possibilités d'apprentissage auprès de maîtres artisans");
      break;
    case 'expatriation':
      recommendations.push("Renseignez-vous sur les opportunités professionnelles à l'international");
      recommendations.push("Développez vos compétences linguistiques et interculturelles");
      recommendations.push("Intégrez des réseaux d'expatriés et des programmes de mobilité internationale");
      break;
    case 'inactif':
      recommendations.push("Explorez des activités bénévoles pour découvrir de nouveaux centres d'intérêt");
      recommendations.push("Envisagez des formations courtes pour tester différents domaines");
      recommendations.push("Consultez un conseiller d'orientation pour explorer vos motivations profondes");
      break;
    default:
      recommendations.push("Prenez le temps d'explorer différentes options professionnelles");
      recommendations.push("Consultez un conseiller en orientation pour affiner votre projet professionnel");
      break;
  }

  // Calcul du score de confiance basé sur l'écart entre les deux scores principaux
  // Plus l'écart est grand, plus la confiance est élevée
  const confidenceScore = Math.min(85 + Math.round((scores[0].score - scores[1].score) / 2), 98);

  return {
    entrepreneur,
    salarie,
    commercant,
    artisan,
    expatriation,
    inactif,
    profilDominant,
    profilSecondaire,
    confidenceScore,
    recommendations
  };
};
