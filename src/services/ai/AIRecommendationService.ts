import OpenAI from 'openai';

interface UserProfile {
  id: string;
  age: number;
  education_level: string;
  location: string;
  interests: string[];
  skills: string[];
  career_goals: string[];
  personality_type?: string;
  test_results?: {
    riasec?: Record<string, number>;
    emotional_intelligence?: number;
    learning_style?: string[];
  };
  work_experience?: {
    years: number;
    sectors: string[];
    positions: string[];
  };
}

interface CareerRecommendation {
  career_path: string;
  match_score: number;
  reasoning: string;
  required_skills: string[];
  training_recommendations: string[];
  salary_range: {
    min: number;
    max: number;
    currency: string;
  };
  job_market_outlook: string;
  next_steps: string[];
  local_opportunities: {
    companies: string[];
    institutions: string[];
    resources: string[];
  };
}

export class AIRecommendationService {
  private openai: OpenAI;
  private systemPrompt: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    this.systemPrompt = `Tu es un conseiller d'orientation professionnel expert spécialisé dans le marché de l'emploi en République du Congo et en Afrique centrale. 

CONTEXTE CONGO:
- Économie basée sur le pétrole, mines, agriculture, télécommunications
- Secteurs émergents: numérique, services, tourisme
- Institutions: Université Marien Ngouabi, ISEP, ISG
- Défis: diversification économique, formation professionnelle, entrepreneuriat
- Opportunités: coopération CEMAC, diaspora, partenariats internationaux

EXPERTISE:
- Analyse RIASEC et personnalité professionnelle
- Recommandations adaptées au contexte africain
- Prise en compte des réalités socio-économiques locales
- Orientation vers formation et compétences disponibles

STYLE:
- Conseils pratiques et réalisables
- Ton encourageant et professionnel
- Références culturelles appropriées
- Prise en compte des valeurs familiales et communautaires`;
  }

  async generatePersonalizedRecommendations(
    userProfile: UserProfile,
    options?: {
      focus?: 'career_change' | 'first_job' | 'skill_development' | 'entrepreneurship';
      timeframe?: 'immediate' | 'short_term' | 'long_term';
      budget_range?: 'low' | 'medium' | 'high';
    }
  ): Promise<CareerRecommendation[]> {
    try {
      const prompt = this.buildRecommendationPrompt(userProfile, options);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('Pas de réponse de l\'IA');

      const recommendations = JSON.parse(response);
      return this.validateAndEnrichRecommendations(recommendations.recommendations);

    } catch (error) {
      console.error('Erreur génération recommandations IA:', error);
      return this.getFallbackRecommendations(userProfile);
    }
  }

  private buildRecommendationPrompt(userProfile: UserProfile, options?: any): string {
    return `
PROFIL UTILISATEUR:
- Âge: ${userProfile.age} ans
- Niveau d'éducation: ${userProfile.education_level}
- Localisation: ${userProfile.location}
- Centres d'intérêt: ${userProfile.interests.join(', ')}
- Compétences: ${userProfile.skills.join(', ')}
- Objectifs de carrière: ${userProfile.career_goals.join(', ')}
${userProfile.personality_type ? `- Type de personnalité: ${userProfile.personality_type}` : ''}
${userProfile.test_results?.riasec ? `- Résultats RIASEC: ${JSON.stringify(userProfile.test_results.riasec)}` : ''}
${userProfile.work_experience ? `- Expérience: ${userProfile.work_experience.years} ans dans ${userProfile.work_experience.sectors.join(', ')}` : ''}

CONTEXTE:
- Focus: ${options?.focus || 'orientation générale'}
- Horizon temporel: ${options?.timeframe || 'moyen terme'}
- Budget formation: ${options?.budget_range || 'moyen'}

DEMANDE:
Génère 3 recommandations de carrière personnalisées pour ce profil, adaptées au marché congolais. 

FORMAT JSON ATTENDU:
{
  "recommendations": [
    {
      "career_path": "Nom du métier/secteur",
      "match_score": 85,
      "reasoning": "Explication détaillée du match profil-métier",
      "required_skills": ["compétence1", "compétence2"],
      "training_recommendations": ["formation1", "formation2"],
      "salary_range": {"min": 250000, "max": 500000, "currency": "XAF"},
      "job_market_outlook": "Analyse du marché de l'emploi",
      "next_steps": ["étape1", "étape2", "étape3"],
      "local_opportunities": {
        "companies": ["entreprise1", "entreprise2"],
        "institutions": ["institution1"],
        "resources": ["ressource1"]
      }
    }
  ]
}`;
  }

  private async validateAndEnrichRecommendations(
    recommendations: CareerRecommendation[]
  ): Promise<CareerRecommendation[]> {
    return recommendations.map(rec => ({
      ...rec,
      match_score: Math.max(0, Math.min(100, rec.match_score)),
      salary_range: {
        ...rec.salary_range,
        currency: rec.salary_range.currency || 'XAF'
      }
    })).sort((a, b) => b.match_score - a.match_score);
  }

  private getFallbackRecommendations(userProfile: UserProfile): CareerRecommendation[] {
    // Recommandations de base basées sur le profil
    const fallbackRecs: CareerRecommendation[] = [
      {
        career_path: "Développement Numérique",
        match_score: 75,
        reasoning: "Secteur en croissance au Congo avec de nombreuses opportunités",
        required_skills: ["Programmation", "Gestion de projet", "Communication"],
        training_recommendations: ["Formation développement web", "Certification gestion projet"],
        salary_range: { min: 300000, max: 800000, currency: "XAF" },
        job_market_outlook: "Très favorable avec la digitalisation",
        next_steps: ["Évaluer compétences actuelles", "Choisir une spécialisation", "Commencer une formation"],
        local_opportunities: {
          companies: ["Orange Congo", "MTN Congo", "Startups locales"],
          institutions: ["ISEP", "Centres de formation IT"],
          resources: ["Hub technologiques", "Communautés de développeurs"]
        }
      }
    ];

    return fallbackRecs;
  }

  async generateSkillGapAnalysis(
    userProfile: UserProfile,
    targetCareer: string
  ): Promise<{
    current_skills: string[];
    required_skills: string[];
    skill_gaps: string[];
    priority_skills: string[];
    learning_path: {
      skill: string;
      resources: string[];
      timeframe: string;
      cost_estimate: string;
    }[];
  }> {
    try {
      const prompt = `
Analyse les écarts de compétences pour:
PROFIL: ${JSON.stringify(userProfile, null, 2)}
CARRIÈRE CIBLE: ${targetCareer}

Génère une analyse JSON avec:
- Compétences actuelles
- Compétences requises  
- Écarts à combler
- Compétences prioritaires
- Parcours d'apprentissage détaillé

Adapte au contexte congolais et ressources locales disponibles.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      return JSON.parse(response || '{}');

    } catch (error) {
      console.error('Erreur analyse écarts compétences:', error);
      return {
        current_skills: userProfile.skills,
        required_skills: ["Compétences techniques", "Soft skills"],
        skill_gaps: ["Voir recommandations détaillées"],
        priority_skills: ["Communication", "Leadership"],
        learning_path: []
      };
    }
  }

  async generateMotivationalContent(
    userProfile: UserProfile,
    context: 'career_change' | 'job_search' | 'skill_building' | 'entrepreneurship'
  ): Promise<{
    title: string;
    message: string;
    actionable_tips: string[];
    success_stories: string[];
    next_milestone: string;
  }> {
    try {
      const prompt = `
Génère du contenu motivationnel personnalisé pour:
PROFIL: ${userProfile.age} ans, ${userProfile.education_level}, ${userProfile.location}
CONTEXTE: ${context}
OBJECTIFS: ${userProfile.career_goals.join(', ')}

Crée un message encourageant et pratique, avec:
- Titre inspirant
- Message motivationnel personnalisé
- 3-5 conseils actionnables
- 2-3 success stories du Congo/Afrique
- Prochain objectif à atteindre

Ton: positif, culturellement approprié, orienté action.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      return JSON.parse(response || '{}');

    } catch (error) {
      console.error('Erreur génération contenu motivationnel:', error);
      return {
        title: "Votre Avenir Commence Aujourd'hui",
        message: "Chaque étape compte dans votre parcours professionnel. Continuez à avancer !",
        actionable_tips: ["Définissez vos objectifs", "Acquérez de nouvelles compétences", "Résautez activement"],
        success_stories: ["Parcours inspirants de professionnels congolais"],
        next_milestone: "Définir votre prochain objectif professionnel"
      };
    }
  }

  async analyzePersonalityFromText(
    freeformText: string
  ): Promise<{
    personality_traits: Record<string, number>;
    career_preferences: string[];
    work_style: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `
Analyse ce texte libre pour identifier:
"${freeformText}"

Détermine:
1. Traits de personnalité (Big Five: 0-100)
2. Préférences de carrière
3. Style de travail
4. Recommandations

Format JSON. Analyse en français, adaptée au contexte africain.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      return JSON.parse(response || '{}');

    } catch (error) {
      console.error('Erreur analyse personnalité:', error);
      return {
        personality_traits: {},
        career_preferences: [],
        work_style: [],
        recommendations: []
      };
    }
  }
}
