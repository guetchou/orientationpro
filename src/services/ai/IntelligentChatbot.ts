import OpenAI from 'openai';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    actions?: string[];
    quick_replies?: string[];
  };
}

interface UserContext {
  profile?: {
    name?: string;
    age?: number;
    education?: string;
    location?: string;
    career_goals?: string[];
    current_situation?: string;
  };
  conversation_history: ChatMessage[];
  session_intent?: 'career_advice' | 'cv_help' | 'test_interpretation' | 'job_search' | 'general_inquiry';
  preferences?: {
    language: 'fr' | 'en';
    communication_style: 'formal' | 'casual';
    detail_level: 'brief' | 'detailed';
  };
}

interface ChatResponse {
  message: string;
  intent_detected: string;
  confidence: number;
  suggested_actions: {
    action: string;
    label: string;
    type: 'navigation' | 'action' | 'external';
    url?: string;
  }[];
  quick_replies: string[];
  context_updated?: Partial<UserContext>;
}

export class IntelligentChatbot {
  private openai: OpenAI;
  private systemPrompt: string;
  private conversationContext: Map<string, UserContext> = new Map();

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    this.systemPrompt = `Tu es Oriana, l'assistante IA d'Orientation Pro Congo. Tu es une conseillère d'orientation professionnelle experte, chaleureuse et encourageante.

PERSONNALITÉ:
- Professionnelle mais accessible
- Empathique et encourageante
- Culturellement consciente du contexte africain
- Proactive dans les suggestions d'aide

EXPERTISE:
- Orientation professionnelle et de carrière
- Marché de l'emploi en République du Congo et Afrique centrale
- Tests psychométriques (RIASEC, intelligence émotionnelle)
- Optimisation de CV et préparation d'entretiens
- Développement de compétences et formation
- Entrepreneuriat et création d'entreprise

CONTEXTE CONGO:
- Économie: pétrole, mines, agriculture, télécommunications, numérique
- Institutions: Université Marien Ngouabi, ISEP, ISG, CENAME
- Défis: diversification économique, formation, emploi des jeunes
- Opportunités: CEMAC, diaspora, coopération internationale

FONCTIONNALITÉS PLATEFORME:
- Tests d'orientation (RIASEC, intelligence émotionnelle, etc.)
- Optimisation de CV avec analyse ATS
- Mise en relation avec des conseillers professionnels
- Ressources de formation et développement
- Accompagnement personnalisé

STYLE DE COMMUNICATION:
- Adapte ton ton selon l'utilisateur (formel/décontracté)
- Utilise des exemples concrets et locaux
- Propose des actions concrètes
- Pose des questions pertinentes pour mieux aider
- Valorise les atouts de l'utilisateur

OBJECTIFS:
- Comprendre les besoins spécifiques de l'utilisateur
- Fournir des conseils personnalisés et actionnables
- Orienter vers les bonnes ressources de la plateforme
- Maintenir la motivation et l'espoir
- Créer un parcours d'accompagnement personnalisé`;
  }

  async processMessage(
    userId: string,
    message: string,
    context?: Partial<UserContext>
  ): Promise<ChatResponse> {
    try {
      // Récupérer ou créer le contexte utilisateur
      let userContext = this.conversationContext.get(userId) || {
        conversation_history: [],
        preferences: { language: 'fr', communication_style: 'casual', detail_level: 'detailed' }
      };

      // Mettre à jour le contexte si fourni
      if (context) {
        userContext = { ...userContext, ...context };
      }

      // Ajouter le message utilisateur à l'historique
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content: message,
        timestamp: new Date()
      };
      userContext.conversation_history.push(userMessage);

      // Détecter l'intention
      const intent = await this.detectIntent(message, userContext);
      
      // Générer la réponse
      const response = await this.generateResponse(message, userContext, intent);

      // Ajouter la réponse à l'historique
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          intent: response.intent_detected,
          confidence: response.confidence,
          actions: response.suggested_actions.map(a => a.action),
          quick_replies: response.quick_replies
        }
      };
      userContext.conversation_history.push(assistantMessage);

      // Sauvegarder le contexte mis à jour
      this.conversationContext.set(userId, userContext);

      return response;

    } catch (error) {
      console.error('Erreur traitement message chatbot:', error);
      return this.getFallbackResponse(message);
    }
  }

  private async detectIntent(
    message: string,
    context: UserContext
  ): Promise<{
    intent: string;
    entities: Record<string, any>;
    confidence: number;
  }> {
    try {
      const prompt = `
DÉTECTE L'INTENTION DE CE MESSAGE:
"${message}"

CONTEXTE CONVERSATION:
- Historique: ${context.conversation_history.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}
- Situation actuelle: ${context.profile?.current_situation || 'Non spécifiée'}
- Objectifs: ${context.profile?.career_goals?.join(', ') || 'Non spécifiés'}

INTENTIONS POSSIBLES:
- career_advice: Demande de conseil de carrière
- cv_help: Aide pour CV ou candidature
- test_request: Veut passer un test d'orientation
- test_interpretation: Aide pour interpréter des résultats
- job_search: Recherche d'emploi
- skill_development: Développement de compétences
- education_info: Information sur formations
- entrepreneurship: Création d'entreprise
- general_inquiry: Question générale
- personal_sharing: Partage personnel/situation
- appointment_booking: Prise de rendez-vous
- platform_navigation: Navigation sur la plateforme

FORMAT JSON:
{
  "intent": "career_advice",
  "entities": {"career_field": "informatique", "experience_level": "junior"},
  "confidence": 85
}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Tu es un expert en analyse d'intentions de conversations professionnelles." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      return JSON.parse(response || '{"intent": "general_inquiry", "entities": {}, "confidence": 50}');

    } catch (error) {
      console.error('Erreur détection intention:', error);
      return { intent: 'general_inquiry', entities: {}, confidence: 50 };
    }
  }

  private async generateResponse(
    message: string,
    context: UserContext,
    intentResult: { intent: string; entities: Record<string, any>; confidence: number }
  ): Promise<ChatResponse> {
    try {
      const prompt = this.buildResponsePrompt(message, context, intentResult);

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      const parsed = JSON.parse(response || '{}');

      return {
        message: parsed.message || "Je suis là pour vous aider ! Pouvez-vous m'en dire plus sur votre situation ?",
        intent_detected: intentResult.intent,
        confidence: intentResult.confidence,
        suggested_actions: parsed.suggested_actions || [],
        quick_replies: parsed.quick_replies || [],
        context_updated: parsed.context_updated
      };

    } catch (error) {
      console.error('Erreur génération réponse:', error);
      return this.getFallbackResponse(message);
    }
  }

  private buildResponsePrompt(
    message: string,
    context: UserContext,
    intentResult: { intent: string; entities: Record<string, any>; confidence: number }
  ): string {
    const recentHistory = context.conversation_history.slice(-4).map(m => 
      `${m.role}: ${m.content}`
    ).join('\n');

    return `
MESSAGE UTILISATEUR: "${message}"

INTENTION DÉTECTÉE: ${intentResult.intent} (confiance: ${intentResult.confidence}%)
ENTITÉS EXTRAITES: ${JSON.stringify(intentResult.entities)}

CONTEXTE UTILISATEUR:
${context.profile ? `
Profil:
- Nom: ${context.profile.name || 'Non spécifié'}
- Âge: ${context.profile.age || 'Non spécifié'}
- Éducation: ${context.profile.education || 'Non spécifiée'}
- Localisation: ${context.profile.location || 'Non spécifiée'}
- Objectifs: ${context.profile.career_goals?.join(', ') || 'Non spécifiés'}
- Situation: ${context.profile.current_situation || 'Non spécifiée'}
` : 'Profil non renseigné'}

HISTORIQUE RÉCENT:
${recentHistory}

PRÉFÉRENCES:
- Langue: ${context.preferences?.language || 'fr'}
- Style: ${context.preferences?.communication_style || 'casual'}
- Détail: ${context.preferences?.detail_level || 'detailed'}

GÉNÈRE UNE RÉPONSE JSON:
{
  "message": "Réponse personnalisée et encourageante",
  "suggested_actions": [
    {
      "action": "take_riasec_test",
      "label": "Passer le test RIASEC",
      "type": "navigation",
      "url": "/tests/riasec"
    }
  ],
  "quick_replies": ["Oui, ça m'intéresse", "J'ai déjà fait un test", "Dites-moi en plus"],
  "context_updated": {
    "session_intent": "career_advice"
  }
}

RÈGLES:
- Réponds avec empathie et encouragement
- Propose 2-3 actions concrètes maximum
- Utilise des exemples du Congo quand pertinent
- Pose une question pour maintenir l'engagement
- Adapte le niveau de détail selon les préférences
- Valorise toujours les atouts de l'utilisateur`;
  }

  private getFallbackResponse(message: string): ChatResponse {
    return {
      message: "Je suis Oriana, votre assistante d'orientation professionnelle ! Je suis là pour vous accompagner dans votre parcours de carrière. Comment puis-je vous aider aujourd'hui ?",
      intent_detected: 'general_inquiry',
      confidence: 50,
      suggested_actions: [
        {
          action: 'explore_tests',
          label: 'Découvrir les tests d\'orientation',
          type: 'navigation',
          url: '/tests'
        },
        {
          action: 'cv_optimization',
          label: 'Optimiser mon CV',
          type: 'navigation',
          url: '/cv-optimizer'
        },
        {
          action: 'find_counselor',
          label: 'Parler à un conseiller',
          type: 'navigation',
          url: '/conseillers'
        }
      ],
      quick_replies: [
        "Je cherche ma voie professionnelle",
        "J'ai besoin d'aide pour mon CV",
        "Je veux passer un test d'orientation",
        "Je cherche du travail"
      ]
    };
  }

  async getConversationSummary(userId: string): Promise<{
    total_messages: number;
    main_topics: string[];
    user_goals: string[];
    recommended_next_steps: string[];
    session_duration: number;
  }> {
    const context = this.conversationContext.get(userId);
    if (!context) {
      return {
        total_messages: 0,
        main_topics: [],
        user_goals: [],
        recommended_next_steps: [],
        session_duration: 0
      };
    }

    try {
      const prompt = `
ANALYSE CETTE CONVERSATION:
${context.conversation_history.map(m => `${m.role}: ${m.content}`).join('\n')}

GÉNÈRE UN RÉSUMÉ JSON:
{
  "total_messages": ${context.conversation_history.length},
  "main_topics": ["sujet1", "sujet2"],
  "user_goals": ["objectif1", "objectif2"],
  "recommended_next_steps": ["étape1", "étape2"],
  "session_duration": ${Date.now() - (context.conversation_history[0]?.timestamp.getTime() || Date.now())}
}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Tu analyses les conversations pour fournir des résumés utiles." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      return JSON.parse(response || '{}');

    } catch (error) {
      console.error('Erreur génération résumé:', error);
      return {
        total_messages: context.conversation_history.length,
        main_topics: ['Orientation professionnelle'],
        user_goals: ['Développement de carrière'],
        recommended_next_steps: ['Passer un test d\'orientation'],
        session_duration: Date.now() - (context.conversation_history[0]?.timestamp.getTime() || Date.now())
      };
    }
  }

  clearUserContext(userId: string): void {
    this.conversationContext.delete(userId);
  }

  getUserContext(userId: string): UserContext | undefined {
    return this.conversationContext.get(userId);
  }

  updateUserProfile(userId: string, profileUpdate: Partial<UserContext['profile']>): void {
    const context = this.conversationContext.get(userId);
    if (context) {
      context.profile = { ...context.profile, ...profileUpdate };
      this.conversationContext.set(userId, context);
    }
  }
}
