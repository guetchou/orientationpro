const natural = require('natural');
const { WordTokenizer, SentimentAnalyzer, PorterStemmer } = natural;

/**
 * Service NLP avancé pour l'analyse de CV
 * Utilise des algorithmes de traitement du langage naturel
 */
class NLPService {
  constructor() {
    this.tokenizer = new WordTokenizer();
    // Skip sentiment analysis for now to avoid language issues
    // this.sentimentAnalyzer = new SentimentAnalyzer('English', PorterStemmer, []);
    
    // Dictionnaires de compétences par catégorie
    this.skillCategories = {
      'programming': [
        'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'php', 'ruby', 'go', 'rust',
        'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css', 'sass', 'less'
      ],
      'frameworks': [
        'react', 'vue', 'angular', 'svelte', 'ember', 'backbone', 'jquery',
        'node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'symfony',
        'rails', 'asp.net', 'fastapi', 'gin', 'echo', 'fiber'
      ],
      'databases': [
        'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
        'oracle', 'sqlite', 'mariadb', 'neo4j', 'dynamodb', 'couchdb'
      ],
      'cloud': [
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ansible',
        'jenkins', 'gitlab', 'github', 'bitbucket', 'circleci', 'travis'
      ],
      'mobile': [
        'react native', 'flutter', 'ionic', 'xamarin', 'cordova', 'phonegap',
        'android', 'ios', 'swift', 'kotlin', 'objective-c'
      ],
      'ai_ml': [
        'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy',
        'opencv', 'nltk', 'spacy', 'hugging face', 'transformers', 'bert'
      ],
      'soft_skills': [
        'leadership', 'communication', 'teamwork', 'problem solving', 'creativity',
        'adaptability', 'time management', 'project management', 'negotiation',
        'mentoring', 'coaching', 'presentation', 'public speaking'
      ]
    };

    // Mots-clés pour détecter les sections
    this.sectionKeywords = {
      'experience': ['expérience', 'experience', 'carrière', 'career', 'emploi', 'job', 'poste', 'position'],
      'education': ['formation', 'education', 'diplôme', 'degree', 'université', 'university', 'école', 'school'],
      'skills': ['compétences', 'skills', 'aptitudes', 'abilities', 'technologies', 'technologies'],
      'projects': ['projets', 'projects', 'réalisations', 'achievements', 'portfolio'],
      'certifications': ['certification', 'certificat', 'certificate', 'licence', 'license'],
      'languages': ['langues', 'languages', 'langage', 'language', 'bilingue', 'bilingual']
    };

    // Patterns pour extraire les informations
    this.patterns = {
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      phone: /(?:\+33|0)[1-9](?:[0-9]{8})|(?:\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}/g,
      linkedin: /linkedin\.com\/in\/[a-zA-Z0-9-]+/g,
      github: /github\.com\/[a-zA-Z0-9-]+/g,
      website: /https?:\/\/[^\s]+/g,
      date: /\b(19|20)\d{2}\b/g,
      duration: /\b(\d+)\s*(ans?|years?|mois|months?)\b/gi,
      percentage: /\b(\d+)%\b/g,
      money: /\b(\d+[.,]?\d*)\s*(€|euros?|dollars?|USD|EUR)\b/gi
    };
  }

  /**
   * Analyse complète d'un CV avec NLP
   */
  async analyzeCV(text, fileName = '') {
    try {
      console.log('🔍 Starting advanced CV analysis...');
      
      const analysis = {
        metadata: {
          fileName,
          processedAt: new Date().toISOString(),
          textLength: text.length,
          wordCount: this.tokenizer.tokenize(text).length
        },
        
        // Extraction des informations de base
        personalInfo: this.extractPersonalInfo(text),
        
        // Analyse des sections
        sections: this.detectSections(text),
        
        // Extraction des compétences
        skills: this.extractSkills(text),
        
        // Analyse de l'expérience
        experience: this.extractExperience(text),
        
        // Analyse de la formation
        education: this.extractEducation(text),
        
        // Analyse sémantique
        semantic: this.performSemanticAnalysis(text),
        
        // Scores de qualité
        qualityScores: this.calculateQualityScores(text),
        
        // Recommandations
        recommendations: this.generateRecommendations(text)
      };

      console.log('✅ CV analysis completed successfully');
      return analysis;
      
    } catch (error) {
      console.error('❌ Error in CV analysis:', error);
      throw error;
    }
  }

  /**
   * Extraction des informations personnelles
   */
  extractPersonalInfo(text) {
    const emails = text.match(this.patterns.email) || [];
    const phones = text.match(this.patterns.phone) || [];
    const linkedin = text.match(this.patterns.linkedin) || [];
    const github = text.match(this.patterns.github) || [];
    const websites = text.match(this.patterns.website) || [];

    // Extraction du nom (première ligne significative)
    const lines = text.split('\n').filter(line => line.trim().length > 2);
    const name = lines[0]?.trim() || 'Nom non détecté';

    // Extraction de la localisation
    const locationKeywords = ['paris', 'lyon', 'marseille', 'toulouse', 'nice', 'nantes', 'strasbourg', 'montpellier', 'bordeaux', 'lille'];
    const location = lines.find(line => 
      locationKeywords.some(keyword => line.toLowerCase().includes(keyword))
    )?.trim() || '';

    return {
      name,
      email: emails[0] || '',
      phone: phones[0] || '',
      linkedin: linkedin[0] || '',
      github: github[0] || '',
      website: websites[0] || '',
      location,
      confidence: this.calculateConfidence({ emails, phones, name })
    };
  }

  /**
   * Détection des sections du CV
   */
  detectSections(text) {
    const sections = {};
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase().trim();
      
      for (const [sectionName, keywords] of Object.entries(this.sectionKeywords)) {
        if (keywords.some(keyword => line.includes(keyword))) {
          sections[sectionName] = {
            detected: true,
            lineNumber: i,
            confidence: this.calculateSectionConfidence(line, keywords)
          };
        }
      }
    }
    
    return sections;
  }

  /**
   * Extraction intelligente des compétences
   */
  extractSkills(text) {
    const textLower = text.toLowerCase();
    const detectedSkills = {};
    
    // Détection par catégorie
    for (const [category, skills] of Object.entries(this.skillCategories)) {
      const foundSkills = skills.filter(skill => 
        textLower.includes(skill.toLowerCase())
      );
      
      if (foundSkills.length > 0) {
        detectedSkills[category] = {
          skills: foundSkills,
          count: foundSkills.length,
          confidence: foundSkills.length / skills.length
        };
      }
    }
    
    // Détection de compétences non catégorisées
    const uncategorizedSkills = this.detectUncategorizedSkills(text);
    
    return {
      categorized: detectedSkills,
      uncategorized: uncategorizedSkills,
      totalCount: Object.values(detectedSkills).reduce((sum, cat) => sum + cat.count, 0) + uncategorizedSkills.length
    };
  }

  /**
   * Extraction de l'expérience professionnelle
   */
  extractExperience(text) {
    const experience = [];
    const lines = text.split('\n');
    
    // Patterns pour détecter les expériences
    const experiencePatterns = [
      /(.+?)\s*[-–]\s*(.+?)\s*\((\d{4}[-–]\d{4}|\d{4}[-–](?:present|aujourd'hui|now))\)/gi,
      /(.+?)\s*at\s*(.+?)\s*\((\d{4}[-–]\d{4}|\d{4}[-–](?:present|aujourd'hui|now))\)/gi,
      /(.+?)\s*chez\s*(.+?)\s*\((\d{4}[-–]\d{4}|\d{4}[-–](?:present|aujourd'hui|now))\)/gi
    ];
    
    for (const pattern of experiencePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        experience.push({
          position: match[1]?.trim() || '',
          company: match[2]?.trim() || '',
          duration: match[3]?.trim() || '',
          description: this.extractExperienceDescription(text, match[0]),
          relevanceScore: this.calculateExperienceRelevance(match[1], match[2])
        });
      }
    }
    
    return experience.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Extraction de la formation
   */
  extractEducation(text) {
    const education = [];
    const lines = text.split('\n');
    
    const educationKeywords = ['master', 'licence', 'bachelor', 'doctorat', 'bts', 'dut', 'université', 'école', 'institut', 'faculté'];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (educationKeywords.some(keyword => line.includes(keyword))) {
        const year = lines[i].match(this.patterns.date)?.[0] || '';
        education.push({
          institution: lines[i].trim(),
          degree: this.extractDegree(lines[i]),
          year: year,
          field: this.extractField(lines[i]),
          relevanceScore: this.calculateEducationRelevance(lines[i])
        });
      }
    }
    
    return education.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Analyse sémantique avancée
   */
  performSemanticAnalysis(text) {
    const tokens = this.tokenizer.tokenize(text);
    // Simple sentiment analysis without external library
    const positiveWords = ['excellent', 'great', 'successful', 'achieved', 'improved', 'developed', 'created'];
    const negativeWords = ['failed', 'problem', 'issue', 'difficult', 'challenging'];
    const positiveCount = tokens.filter(token => positiveWords.includes(token.toLowerCase())).length;
    const negativeCount = tokens.filter(token => negativeWords.includes(token.toLowerCase())).length;
    const sentiment = (positiveCount - negativeCount) / Math.max(tokens.length, 1);
    
    return {
      sentiment: {
        score: sentiment,
        label: sentiment > 0.1 ? 'positive' : sentiment < -0.1 ? 'negative' : 'neutral'
      },
      readability: this.calculateReadability(text),
      complexity: this.calculateComplexity(text),
      keywords: this.extractKeywords(text),
      themes: this.extractThemes(text)
    };
  }

  /**
   * Calcul des scores de qualité
   */
  calculateQualityScores(text) {
    const scores = {
      completeness: this.calculateCompletenessScore(text),
      structure: this.calculateStructureScore(text),
      relevance: this.calculateRelevanceScore(text),
      presentation: this.calculatePresentationScore(text),
      overall: 0
    };
    
    scores.overall = (scores.completeness + scores.structure + scores.relevance + scores.presentation) / 4;
    
    return scores;
  }

  /**
   * Génération de recommandations personnalisées
   */
  generateRecommendations(text) {
    const recommendations = [];
    const qualityScores = this.calculateQualityScores(text);
    const skills = this.extractSkills(text);
    
    // Recommandations basées sur les scores
    if (qualityScores.completeness < 70) {
      recommendations.push({
        type: 'completeness',
        priority: 'high',
        message: 'Ajoutez plus de détails sur vos expériences et compétences',
        action: 'Enrichir les descriptions d\'expérience avec des résultats quantifiés'
      });
    }
    
    if (qualityScores.structure < 60) {
      recommendations.push({
        type: 'structure',
        priority: 'medium',
        message: 'Améliorez la structure de votre CV',
        action: 'Organisez clairement les sections (Expérience, Formation, Compétences)'
      });
    }
    
    if (skills.totalCount < 5) {
      recommendations.push({
        type: 'skills',
        priority: 'high',
        message: 'Ajoutez plus de compétences techniques',
        action: 'Listez vos compétences techniques et soft skills'
      });
    }
    
    return recommendations;
  }

  // Méthodes utilitaires
  calculateConfidence(data) {
    let score = 0;
    if (data.emails?.length > 0) score += 0.3;
    if (data.phones?.length > 0) score += 0.3;
    if (data.name && data.name !== 'Nom non détecté') score += 0.4;
    return Math.min(1, score);
  }

  calculateSectionConfidence(line, keywords) {
    const matches = keywords.filter(keyword => line.includes(keyword)).length;
    return Math.min(1, matches / keywords.length);
  }

  detectUncategorizedSkills(text) {
    // Détection de compétences non listées dans les catégories
    const commonSkills = ['excel', 'powerpoint', 'word', 'photoshop', 'illustrator', 'figma', 'sketch'];
    return commonSkills.filter(skill => text.toLowerCase().includes(skill));
  }

  extractExperienceDescription(text, experienceLine) {
    // Extraction de la description d'expérience
    const lines = text.split('\n');
    const expIndex = lines.findIndex(line => line.includes(experienceLine));
    if (expIndex !== -1 && expIndex + 1 < lines.length) {
      return lines[expIndex + 1].trim();
    }
    return '';
  }

  calculateExperienceRelevance(position, company) {
    // Calcul de la pertinence d'une expérience
    let score = 0;
    if (position && position.length > 3) score += 0.5;
    if (company && company.length > 3) score += 0.5;
    return score;
  }

  extractDegree(line) {
    const degreeKeywords = ['master', 'licence', 'bachelor', 'doctorat', 'bts', 'dut'];
    const found = degreeKeywords.find(keyword => line.toLowerCase().includes(keyword));
    return found ? found.charAt(0).toUpperCase() + found.slice(1) : 'Diplôme';
  }

  extractField(line) {
    const fieldKeywords = ['informatique', 'computer', 'gestion', 'management', 'marketing', 'finance'];
    const found = fieldKeywords.find(keyword => line.toLowerCase().includes(keyword));
    return found || 'Non spécifié';
  }

  calculateEducationRelevance(line) {
    const relevanceKeywords = ['master', 'licence', 'bachelor', 'doctorat'];
    return relevanceKeywords.some(keyword => line.toLowerCase().includes(keyword)) ? 1 : 0.5;
  }

  calculateReadability(text) {
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
    const words = this.tokenizer.tokenize(text);
    const avgWordsPerSentence = words.length / sentences.length;
    
    // Score de lisibilité basé sur la longueur moyenne des phrases
    return Math.max(0, Math.min(1, 1 - (avgWordsPerSentence - 15) / 30));
  }

  calculateComplexity(text) {
    const words = this.tokenizer.tokenize(text);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const complexity = uniqueWords.size / words.length;
    return Math.min(1, complexity);
  }

  extractKeywords(text) {
    const words = this.tokenizer.tokenize(text.toLowerCase());
    const wordFreq = {};
    
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  extractThemes(text) {
    const themes = [];
    const textLower = text.toLowerCase();
    
    if (textLower.includes('développement') || textLower.includes('programming')) themes.push('Développement');
    if (textLower.includes('gestion') || textLower.includes('management')) themes.push('Gestion');
    if (textLower.includes('marketing') || textLower.includes('communication')) themes.push('Marketing');
    if (textLower.includes('finance') || textLower.includes('comptabilité')) themes.push('Finance');
    if (textLower.includes('santé') || textLower.includes('medical')) themes.push('Santé');
    
    return themes;
  }

  calculateCompletenessScore(text) {
    let score = 0;
    if (text.match(this.patterns.email)) score += 0.2;
    if (text.match(this.patterns.phone)) score += 0.2;
    if (text.includes('expérience') || text.includes('experience')) score += 0.2;
    if (text.includes('formation') || text.includes('education')) score += 0.2;
    if (text.includes('compétences') || text.includes('skills')) score += 0.2;
    return score * 100;
  }

  calculateStructureScore(text) {
    const sections = this.detectSections(text);
    const sectionCount = Object.values(sections).filter(s => s.detected).length;
    return Math.min(100, (sectionCount / 4) * 100);
  }

  calculateRelevanceScore(text) {
    const skills = this.extractSkills(text);
    return Math.min(100, (skills.totalCount / 10) * 100);
  }

  calculatePresentationScore(text) {
    const lines = text.split('\n');
    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
    return Math.min(100, Math.max(0, 100 - (avgLineLength - 50) / 2));
  }
}

module.exports = NLPService;
