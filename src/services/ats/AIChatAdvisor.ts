/**
 * Service d'IA conversationnelle pour conseils personnalisés sur CV et carrière
 * Utilise des prompts intelligents pour donner des conseils contextuels
 */

import { CandidateProfile } from './PredictiveScoringService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    cvScore?: number;
    suggestions?: string[];
    category?: string;
  };
}

export interface AdviceCategory {
  category: 'cv_optimization' | 'career_path' | 'skill_development' | 'job_matching' | 'interview_prep';
  title: string;
  description: string;
  suggestions: string[];
  priority: 'high' | 'medium' | 'low';
}

export class AIChatAdvisor {
  private conversationHistory: ChatMessage[] = [];

  /**
   * Génère des conseils personnalisés basés sur le profil candidat
   */
  generatePersonalizedAdvice(candidate: CandidateProfile): AdviceCategory[] {
    const adviceCategories: AdviceCategory[] = [];

    // 1. Optimisation CV
    const cvAdvice = this.generateCVOptimizationAdvice(candidate);
    if (cvAdvice.suggestions.length > 0) {
      adviceCategories.push(cvAdvice);
    }

    // 2. Développement de carrière
    const careerAdvice = this.generateCareerPathAdvice(candidate);
    if (careerAdvice.suggestions.length > 0) {
      adviceCategories.push(careerAdvice);
    }

    // 3. Développement de compétences
    const skillAdvice = this.generateSkillDevelopmentAdvice(candidate);
    if (skillAdvice.suggestions.length > 0) {
      adviceCategories.push(skillAdvice);
    }

    // 4. Matching d'emploi
    const matchingAdvice = this.generateJobMatchingAdvice(candidate);
    if (matchingAdvice.suggestions.length > 0) {
      adviceCategories.push(matchingAdvice);
    }

    // 5. Préparation entretien
    const interviewAdvice = this.generateInterviewPrepAdvice(candidate);
    if (interviewAdvice.suggestions.length > 0) {
      adviceCategories.push(interviewAdvice);
    }

    return adviceCategories.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Répond à une question de l'utilisateur avec contexte
   */
  async respondToQuestion(
    question: string,
    context?: {
      candidate?: CandidateProfile;
      cvScore?: number;
      analysisData?: any;
    }
  ): Promise<ChatMessage> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Analyser la question pour comprendre l'intention
    const intent = this.detectIntent(question);
    
    // Générer une réponse basée sur l'intention et le contexte
    const response = this.generateResponse(intent, question, context);

    const assistantMessage: ChatMessage = {
      id: messageId,
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      metadata: {
        cvScore: context?.cvScore,
        suggestions: response.suggestions,
        category: intent.category,
      },
    };

    // Ajouter à l'historique
    this.conversationHistory.push({
      id: `msg_${Date.now() - 1}_user`,
      role: 'user',
      content: question,
      timestamp: new Date(),
    });
    this.conversationHistory.push(assistantMessage);

    return assistantMessage;
  }

  /**
   * Génère des conseils d'optimisation CV
   */
  private generateCVOptimizationAdvice(candidate: CandidateProfile): AdviceCategory {
    const suggestions: string[] = [];
    const cvScore = candidate.cvScore || 0;
    let priority: 'high' | 'medium' | 'low' = 'medium';

    // Analyse des points faibles
    if (cvScore < 60) {
      priority = 'high';
      suggestions.push('Votre CV nécessite une refonte complète pour être compétitif');
      suggestions.push('Considérez un service professionnel de rédaction de CV');
    } else if (cvScore < 80) {
      suggestions.push('Quelques améliorations stratégiques peuvent booster votre score de manière significative');
    }

    if (candidate.technicalSkills.length < 5) {
      suggestions.push(`Ajoutez ${5 - candidate.technicalSkills.length} compétences techniques pertinentes`);
    }

    if (candidate.quantifiableResults < 2) {
      suggestions.push('Ajoutez des résultats chiffrés pour montrer votre impact concret');
    }

    if (candidate.actionVerbs < 3) {
      suggestions.push('Utilisez plus de verbes d\'action pour décrire vos réalisations');
    }

    if (!candidate.linkedIn) {
      suggestions.push('Ajoutez votre profil LinkedIn pour améliorer votre crédibilité');
    }

    // Suggestions positives
    if (cvScore >= 80) {
      suggestions.push('Votre CV est déjà bien optimisé ! Continuez à le mettre à jour régulièrement');
    }

    return {
      category: 'cv_optimization',
      title: 'Optimisation CV',
      description: `Score actuel : ${cvScore}/100. ${suggestions.length} conseils personnalisés`,
      suggestions,
      priority,
    };
  }

  /**
   * Génère des conseils de développement de carrière
   */
  private generateCareerPathAdvice(candidate: CandidateProfile): AdviceCategory {
    const suggestions: string[] = [];
    let priority: 'high' | 'medium' | 'low' = 'medium';

    // Analyse de l'expérience
    if (candidate.yearsExperience < 2) {
      priority = 'high';
      suggestions.push('Priorisez l\'accumulation d\'expérience pratique dans votre domaine');
      suggestions.push('Considérez des stages ou projets freelance pour enrichir votre portfolio');
    } else if (candidate.yearsExperience < 5) {
      suggestions.push('Vous êtes en phase de croissance - explorez des rôles avec plus de responsabilités');
      suggestions.push('Développez vos compétences de leadership pour accéder à des postes seniors');
    } else {
      suggestions.push('Avec votre expérience, visez des rôles de leadership ou d\'expertise technique');
      suggestions.push('Considérez le mentorat pour partager vos connaissances');
    }

    // Analyse des compétences
    const skillDiversity = candidate.technicalSkills.length;
    if (skillDiversity < 5) {
      suggestions.push('Élargissez votre palette de compétences techniques');
    } else {
      suggestions.push('Maintenez vos compétences à jour avec les dernières technologies');
    }

    // Suggestions basées sur les certifications
    if (candidate.certifications.length < 1 && candidate.yearsExperience < 3) {
      suggestions.push('Obtenez une certification pertinente pour renforcer votre profil');
    }

    return {
      category: 'career_path',
      title: 'Développement de Carrière',
      description: `Conseils basés sur ${candidate.yearsExperience} ans d'expérience`,
      suggestions,
      priority,
    };
  }

  /**
   * Génère des conseils de développement de compétences
   */
  private generateSkillDevelopmentAdvice(candidate: CandidateProfile): AdviceCategory {
    const suggestions: string[] = [];
    let priority: 'high' | 'medium' | 'low' = 'medium';

    // Identifier les compétences manquantes dans le domaine
    const currentSkills = candidate.technicalSkills;
    const trendingSkills = [
      'TypeScript', 'Next.js', 'Docker', 'Kubernetes',
      'AWS', 'GraphQL', 'Microservices', 'CI/CD',
    ];

    const missingSkills = trendingSkills.filter(
      skill => !currentSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
    );

    if (missingSkills.length > 0) {
      priority = 'high';
      suggestions.push(`Compétences tendance à acquérir : ${missingSkills.slice(0, 3).join(', ')}`);
    }

    // Suggestions générales
    suggestions.push('Participez à des projets open source pour pratiquer et apprendre');
    suggestions.push('Suivez des cours en ligne sur des technologies émergentes');
    suggestions.push('Rejoignez des communautés tech pour échanger avec des pairs');

    if (candidate.certifications.length < 2) {
      suggestions.push('Considérez des certifications reconnues dans votre domaine');
    }

    return {
      category: 'skill_development',
      title: 'Développement de Compétences',
      description: `${currentSkills.length} compétences actuelles - ${missingSkills.length} opportunités identifiées`,
      suggestions,
      priority,
    };
  }

  /**
   * Génère des conseils de matching d'emploi
   */
  private generateJobMatchingAdvice(candidate: CandidateProfile): AdviceCategory {
    const suggestions: string[] = [];
    const priority: 'high' | 'medium' | 'low' = 'medium';

    suggestions.push('Recherchez des postes qui correspondent à votre niveau d\'expérience actuel');
    suggestions.push('Adaptez votre CV pour chaque offre d\'emploi en mettant en avant les compétences pertinentes');
    suggestions.push('Utilisez les mots-clés de l\'offre dans votre CV pour améliorer votre matching ATS');

    if (candidate.yearsExperience < 3) {
      suggestions.push('Ciblez des postes junior/mid-level pour maximiser vos chances');
    } else {
      suggestions.push('Vous pouvez viser des postes senior avec votre niveau d\'expérience');
    }

    return {
      category: 'job_matching',
      title: 'Matching d\'Emploi',
      description: 'Conseils pour trouver le poste idéal',
      suggestions,
      priority,
    };
  }

  /**
   * Génère des conseils de préparation d'entretien
   */
  private generateInterviewPrepAdvice(candidate: CandidateProfile): AdviceCategory {
    const suggestions: string[] = [];
    const priority: 'high' | 'medium' | 'low' = 'medium';

    suggestions.push('Préparez des exemples concrets de vos réalisations (méthode STAR)');
    suggestions.push('Renseignez-vous sur l\'entreprise et son secteur d\'activité');
    suggestions.push('Préparez des questions pertinentes à poser à votre interlocuteur');

    if (candidate.quantifiableResults > 0) {
      suggestions.push('Mettez en avant vos résultats quantifiables lors de l\'entretien');
    }

    if (candidate.technicalSkills.length > 5) {
      suggestions.push('Préparez-vous à des questions techniques sur vos compétences principales');
    }

    return {
      category: 'interview_prep',
      title: 'Préparation Entretien',
      description: 'Conseils pour réussir vos entretiens',
      suggestions,
      priority,
    };
  }

  /**
   * Détecte l'intention dans une question
   */
  private detectIntent(question: string): {
    category: string;
    keywords: string[];
  } {
    const lowerQuestion = question.toLowerCase();

    // Catégories d'intentions
    const intents = {
      cv_optimization: ['cv', 'curriculum', 'resume', 'optimiser', 'améliorer', 'score'],
      career_path: ['carrière', 'career', 'évolution', 'évolution', 'progression'],
      skill_development: ['compétence', 'skill', 'apprendre', 'formation', 'certification'],
      job_matching: ['emploi', 'job', 'poste', 'matching', 'recrutement'],
      interview_prep: ['entretien', 'interview', 'préparation', 'conseil'],
    };

    for (const [category, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
        return { category, keywords };
      }
    }

    return { category: 'general', keywords: [] };
  }

  /**
   * Génère une réponse basée sur l'intention
   */
  private generateResponse(
    intent: { category: string; keywords: string[] },
    question: string,
    context?: any
  ): { content: string; suggestions: string[] } {
    const suggestions: string[] = [];

    switch (intent.category) {
      case 'cv_optimization':
        return {
          content: this.generateCVResponse(question, context),
          suggestions: [
            'Ajoutez plus de compétences techniques',
            'Incluez des résultats chiffrés',
            'Optimisez les mots-clés ATS',
          ],
        };

      case 'career_path':
        return {
          content: this.generateCareerResponse(question, context),
          suggestions: [
            'Explorer de nouveaux domaines',
            'Accumuler plus d\'expérience',
            'Développer des compétences de leadership',
          ],
        };

      case 'skill_development':
        return {
          content: this.generateSkillResponse(question, context),
          suggestions: [
            'Apprendre de nouvelles technologies',
            'Obtenir des certifications',
            'Pratiquer sur des projets',
          ],
        };

      default:
        return {
          content: `Merci pour votre question. Basé sur votre profil (score CV : ${context?.cvScore || 'N/A'}/100), je peux vous aider avec :\n\n• Optimisation de CV\n• Développement de carrière\n• Développement de compétences\n• Matching d'emploi\n• Préparation d'entretien\n\nComment puis-je vous aider aujourd'hui ?`,
          suggestions: [],
        };
    }
  }

  /**
   * Génère une réponse sur l'optimisation CV
   */
  private generateCVResponse(question: string, context?: any): string {
    const cvScore = context?.cvScore || 0;
    
    if (cvScore < 60) {
      return `Votre CV actuel a un score de ${cvScore}/100. Pour l'améliorer significativement, je recommande :

1. **Structure** : Assurez-vous d'avoir toutes les sections essentielles (contact, expérience, formation, compétences)
2. **Mots-clés** : Intégrez des mots-clés pertinents pour votre secteur
3. **Résultats chiffrés** : Ajoutez des résultats mesurables (ex: "Augmentation de 30%")
4. **Verbes d'action** : Utilisez des verbes puissants (développé, créé, optimisé, géré)

Voulez-vous que je vous donne des conseils plus spécifiques ?`;
    } else if (cvScore < 80) {
      return `Votre CV est correct (${cvScore}/100) mais peut être amélioré. Voici mes recommandations prioritaires :

1. **Compétences** : Ajoutez 2-3 compétences techniques supplémentaires
2. **Résultats** : Incluez plus de résultats quantifiables
3. **LinkedIn** : Ajoutez votre profil LinkedIn si ce n'est pas déjà fait
4. **Mise en forme** : Optimisez la lisibilité et la structure

Souhaitez-vous des conseils sur un point spécifique ?`;
    } else {
      return `Excellent ! Votre CV est bien optimisé (${cvScore}/100). Voici quelques suggestions pour le maintenir à niveau :

1. **Mise à jour régulière** : Gardez votre CV à jour avec vos dernières réalisations
2. **Adaptation** : Personnalisez-le pour chaque offre d'emploi
3. **Compétences** : Restez à jour avec les technologies émergentes

Votre CV est prêt à faire bonne impression ! 🎉`;
    }
  }

  /**
   * Génère une réponse sur la carrière
   */
  private generateCareerResponse(question: string, context?: any): string {
    return `Pour développer votre carrière, je recommande :

1. **Fixer des objectifs clairs** : Définissez où vous voulez être dans 2-3 ans
2. **Construire un réseau** : Rejoignez des communautés professionnelles
3. **Apprentissage continu** : Investissez dans votre développement professionnel
4. **Expérience diversifiée** : Explorez différents types de projets

Quel aspect de votre carrière souhaitez-vous développer en priorité ?`;
  }

  /**
   * Génère une réponse sur les compétences
   */
  private generateSkillResponse(question: string, context?: any): string {
    return `Pour développer vos compétences techniques, je suggère :

1. **Pratique régulière** : Codez régulièrement sur des projets personnels
2. **Projets open source** : Contribuez à des projets GitHub
3. **Formations certifiantes** : Suivez des cours avec certifications
4. **Communautés** : Rejoignez des forums et groupes tech

Quelles compétences spécifiques souhaitez-vous développer ?`;
  }

  /**
   * Récupère l'historique de conversation
   */
  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  /**
   * Efface l'historique de conversation
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }
}

// Export instance singleton
export const aiChatAdvisor = new AIChatAdvisor();

