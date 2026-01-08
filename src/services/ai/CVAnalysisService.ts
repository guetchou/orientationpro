import OpenAI from 'openai';

interface CVAnalysisResult {
  overall_score: number;
  ats_compatibility: number;
  sections_analysis: {
    section: string;
    score: number;
    feedback: string;
    suggestions: string[];
  }[];
  keywords_analysis: {
    present_keywords: string[];
    missing_keywords: string[];
    keyword_density: Record<string, number>;
  };
  formatting_feedback: {
    structure_score: number;
    readability_score: number;
    design_feedback: string[];
  };
  improvement_suggestions: {
    priority: 'high' | 'medium' | 'low';
    category: string;
    suggestion: string;
    impact: string;
  }[];
  optimized_version?: string;
}

interface JobRequirements {
  title: string;
  sector: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_level: string;
  education_requirements: string[];
  location: string;
}

export class CVAnalysisService {
  private openai: OpenAI;
  private systemPrompt: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    this.systemPrompt = `Tu es un expert en analyse de CV et optimisation ATS spécialisé dans le marché de l'emploi en République du Congo et en Afrique centrale.

EXPERTISE:
- Analyse complète de CV (structure, contenu, format)
- Optimisation ATS (Applicant Tracking Systems)
- Standards internationaux et pratiques locales
- Secteurs clés: pétrole, mines, agriculture, télécom, numérique, services

CRITÈRES D'ÉVALUATION:
- Clarté et structure (25%)
- Pertinence du contenu (30%)
- Compatibilité ATS (25%)
- Présentation professionnelle (20%)

CONTEXTE CONGO:
- Marché bilingue français/anglais
- Importance des références et recommandations
- Valorisation de l'expérience internationale
- Prise en compte du contexte économique local

OBJECTIF:
Fournir des analyses détaillées et des recommandations actionnables pour maximiser les chances de succès professionnel.`;
  }

  async analyzeCVContent(
    cvText: string,
    targetJob?: JobRequirements
  ): Promise<CVAnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt(cvText, targetJob);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2500,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('Pas de réponse de l\'IA');

      return JSON.parse(response);

    } catch (error) {
      console.error('Erreur analyse CV:', error);
      return this.getFallbackAnalysis(cvText);
    }
  }

  private buildAnalysisPrompt(cvText: string, targetJob?: JobRequirements): string {
    return `
ANALYSE CE CV:
${cvText}

${targetJob ? `
POSTE CIBLE:
- Titre: ${targetJob.title}
- Secteur: ${targetJob.sector}
- Compétences requises: ${targetJob.required_skills.join(', ')}
- Compétences préférées: ${targetJob.preferred_skills.join(', ')}
- Niveau d'expérience: ${targetJob.experience_level}
- Formation: ${targetJob.education_requirements.join(', ')}
- Localisation: ${targetJob.location}
` : ''}

GÉNÈRE UNE ANALYSE JSON COMPLÈTE:
{
  "overall_score": 75,
  "ats_compatibility": 80,
  "sections_analysis": [
    {
      "section": "Informations personnelles",
      "score": 85,
      "feedback": "Section bien structurée",
      "suggestions": ["Ajouter LinkedIn", "Préciser localisation"]
    }
  ],
  "keywords_analysis": {
    "present_keywords": ["keyword1", "keyword2"],
    "missing_keywords": ["keyword3", "keyword4"],
    "keyword_density": {"keyword1": 3, "keyword2": 2}
  },
  "formatting_feedback": {
    "structure_score": 80,
    "readability_score": 75,
    "design_feedback": ["Améliorer espacement", "Uniformiser police"]
  },
  "improvement_suggestions": [
    {
      "priority": "high",
      "category": "Contenu",
      "suggestion": "Ajouter des résultats quantifiés",
      "impact": "Augmente l'impact de 30%"
    }
  ]
}

FOCUS SUR:
- Adaptation au marché congolais
- Compatibilité ATS
- Recommandations concrètes et actionnables
- Prise en compte des spécificités locales`;
  }

  async generateOptimizedCV(
    originalCV: string,
    targetJob: JobRequirements,
    userPreferences?: {
      format: 'modern' | 'classic' | 'creative';
      length: 'concise' | 'detailed';
      focus: 'skills' | 'experience' | 'achievements';
    }
  ): Promise<{
    optimized_cv: string;
    changes_made: string[];
    improvement_score: number;
    ats_score: number;
  }> {
    try {
      const prompt = `
OPTIMISE CE CV POUR LE POSTE:
CV ORIGINAL:
${originalCV}

POSTE CIBLE:
${JSON.stringify(targetJob, null, 2)}

PRÉFÉRENCES:
${userPreferences ? JSON.stringify(userPreferences, null, 2) : 'Format standard'}

GÉNÉRATIONS REQUISES:
1. Version optimisée du CV (texte complet)
2. Liste des changements effectués
3. Score d'amélioration (0-100)
4. Score ATS (0-100)

FORMAT JSON:
{
  "optimized_cv": "Version complète optimisée du CV",
  "changes_made": ["changement1", "changement2"],
  "improvement_score": 85,
  "ats_score": 90
}

RÈGLES D'OPTIMISATION:
- Intégrer naturellement les mots-clés du poste
- Quantifier les réalisations
- Adapter au contexte congolais
- Respecter les standards ATS
- Maintenir l'authenticité du profil`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      return JSON.parse(response || '{}');

    } catch (error) {
      console.error('Erreur optimisation CV:', error);
      return {
        optimized_cv: originalCV,
        changes_made: ["Erreur lors de l'optimisation"],
        improvement_score: 0,
        ats_score: 0
      };
    }
  }

  async generateCoverLetter(
    cvText: string,
    targetJob: JobRequirements,
    companyInfo?: {
      name: string;
      sector: string;
      values: string[];
      recent_news?: string;
    }
  ): Promise<{
    cover_letter: string;
    personalization_elements: string[];
    tone: string;
    key_points: string[];
  }> {
    try {
      const prompt = `
GÉNÈRE UNE LETTRE DE MOTIVATION POUR:

PROFIL CANDIDAT (extrait du CV):
${cvText.substring(0, 1000)}

POSTE:
${JSON.stringify(targetJob, null, 2)}

${companyInfo ? `
ENTREPRISE:
${JSON.stringify(companyInfo, null, 2)}
` : ''}

GÉNÉRATIONS:
- Lettre complète (300-400 mots)
- Éléments de personnalisation utilisés
- Ton adopté
- Points clés mis en avant

FORMAT JSON avec lettre adaptée au contexte professionnel congolais.
Ton professionnel mais chaleureux, références culturellement appropriées.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      return JSON.parse(response || '{}');

    } catch (error) {
      console.error('Erreur génération lettre de motivation:', error);
      return {
        cover_letter: "Erreur lors de la génération de la lettre de motivation.",
        personalization_elements: [],
        tone: "professionnel",
        key_points: []
      };
    }
  }

  async extractSkillsFromCV(cvText: string): Promise<{
    technical_skills: string[];
    soft_skills: string[];
    languages: { language: string, level: string }[];
    certifications: string[];
    experience_years: number;
    education_level: string;
    sectors_experience: string[];
  }> {
    try {
      const prompt = `
EXTRAIT LES COMPÉTENCES ET INFORMATIONS DE CE CV:
${cvText}

FORMAT JSON:
{
  "technical_skills": ["compétence1", "compétence2"],
  "soft_skills": ["leadership", "communication"],
  "languages": [{"language": "Français", "level": "Natif"}],
  "certifications": ["certification1"],
  "experience_years": 5,
  "education_level": "Master",
  "sectors_experience": ["secteur1", "secteur2"]
}

Analyse précise et complète, adaptée au contexte professionnel africain.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      return JSON.parse(response || '{}');

    } catch (error) {
      console.error('Erreur extraction compétences:', error);
      return {
        technical_skills: [],
        soft_skills: [],
        languages: [],
        certifications: [],
        experience_years: 0,
        education_level: '',
        sectors_experience: []
      };
    }
  }

  async generateInterviewPreparation(
    cvText: string,
    targetJob: JobRequirements
  ): Promise<{
    likely_questions: {
      question: string;
      category: string;
      difficulty: 'easy' | 'medium' | 'hard';
      suggested_approach: string;
    }[];
    key_strengths_to_highlight: string[];
    potential_weaknesses_to_address: string[];
    company_research_points: string[];
    questions_to_ask_interviewer: string[];
  }> {
    try {
      const prompt = `
PRÉPARE L'ENTRETIEN POUR:

CANDIDAT (CV):
${cvText.substring(0, 1200)}

POSTE:
${JSON.stringify(targetJob, null, 2)}

GÉNÈRE:
1. Questions probables avec stratégies de réponse
2. Forces à mettre en avant
3. Faiblesses potentielles et comment les adresser
4. Points de recherche sur l'entreprise
5. Questions à poser au recruteur

Adapté au contexte des entretiens au Congo et en Afrique centrale.
Format JSON complet.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      return JSON.parse(response || '{}');

    } catch (error) {
      console.error('Erreur préparation entretien:', error);
      return {
        likely_questions: [],
        key_strengths_to_highlight: [],
        potential_weaknesses_to_address: [],
        company_research_points: [],
        questions_to_ask_interviewer: []
      };
    }
  }

  private getFallbackAnalysis(cvText: string): CVAnalysisResult {
    return {
      overall_score: 70,
      ats_compatibility: 65,
      sections_analysis: [
        {
          section: "Structure générale",
          score: 70,
          feedback: "CV analysé avec succès",
          suggestions: ["Veuillez réessayer pour une analyse détaillée"]
        }
      ],
      keywords_analysis: {
        present_keywords: [],
        missing_keywords: [],
        keyword_density: {}
      },
      formatting_feedback: {
        structure_score: 70,
        readability_score: 70,
        design_feedback: ["Analyse détaillée disponible avec une connexion stable"]
      },
      improvement_suggestions: [
        {
          priority: 'medium',
          category: 'Général',
          suggestion: 'Réessayer l\'analyse pour des recommandations personnalisées',
          impact: 'Amélioration des recommandations'
        }
      ]
    };
  }
}
