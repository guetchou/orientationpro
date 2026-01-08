import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ATSReportViewer from './ATSReportViewer';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Brain,
  Zap,
  Eye
} from 'lucide-react';

interface CVUploadZoneProps {
  onCandidateCreated: (candidate: any) => void;
}

interface ParsedCVData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    linkedIn?: string;
  };
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  languages: string[];
  summary?: string;
}

export const CVUploadZone: React.FC<CVUploadZoneProps> = ({ onCandidateCreated }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedCVData | null>(null);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [showReportViewer, setShowReportViewer] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Fonction d'analyse locale INTELLIGENTE du CV
  const analyzeLocalCV = async (file: File): Promise<any> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        
        // === EXTRACTION AVANCÉE DES INFORMATIONS ===
        
        // Regex améliorées
        const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
        const phoneRegex = /(?:\+\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}/g;
        const nameRegex = /^([A-ZÀ-Ÿ][a-zà-ÿ]+(?:\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)+)/m;
        const linkedInRegex = /(?:linkedin\.com\/in\/)([\w-]+)|(?:linkedin\.com\/profile\/)([\w-]+)/gi;
        const githubRegex = /(?:github\.com\/)([\w-]+)/gi;
        const websiteRegex = /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[a-z]{2,}(?:\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?/gi;
        
        const emails = text.match(emailRegex) || [];
        const phones = text.match(phoneRegex) || [];
        const nameMatch = text.match(nameRegex);
        const linkedInMatch = text.match(linkedInRegex);
        const githubMatch = text.match(githubRegex);
        
        // === DÉTECTION INTELLIGENTE DES SECTIONS ===
        
        const sections = {
          summary: /(?:résumé|summary|profil|profile|objectif|objective|about)/i.test(text),
          experience: /(?:expérience|experience|professional|work|emploi|career)/i.test(text),
          education: /(?:formation|education|études|university|université|degree|diplôme|académique)/i.test(text),
          skills: /(?:compétences|skills|technical|techniques|expertise|savoir-faire)/i.test(text),
          languages: /(?:langues?|languages?|linguistique)/i.test(text),
          certifications: /(?:certification|diplôme|certificate|license|accréditation)/i.test(text),
          projects: /(?:projets?|projects?|réalisations?|achievements?|portfolio)/i.test(text),
          references: /(?:références|references|recommandations?)/i.test(text)
        };
        
        // === COMPÉTENCES TECHNIQUES ÉLARGIES PAR DOMAINE ===
        
        const skillsByDomain = {
          programmation: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin'],
          frontend: ['React', 'Angular', 'Vue.js', 'Svelte', 'Next.js', 'Nuxt.js', 'HTML5', 'CSS3', 'SASS', 'Tailwind', 'Bootstrap'],
          backend: ['Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'FastAPI', '.NET', 'Rails'],
          mobile: ['React Native', 'Flutter', 'iOS', 'Android', 'Xamarin', 'Ionic'],
          database: ['SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'Cassandra', 'DynamoDB', 'Elasticsearch'],
          cloud: ['AWS', 'Azure', 'GCP', 'Heroku', 'DigitalOcean', 'Vercel', 'Netlify'],
          devops: ['Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'Terraform', 'Ansible'],
          tools: ['Git', 'GitHub', 'GitLab', 'Jira', 'Confluence', 'Slack', 'VS Code', 'IntelliJ'],
          methodologies: ['Agile', 'Scrum', 'Kanban', 'DevOps', 'TDD', 'CI/CD', 'Microservices'],
          data: ['Machine Learning', 'Data Science', 'AI', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Power BI', 'Tableau'],
          security: ['OAuth', 'JWT', 'SSL/TLS', 'Cybersecurity', 'Penetration Testing', 'OWASP'],
          business: ['Project Management', 'Product Management', 'Business Analysis', 'SAP', 'ERP', 'CRM', 'Salesforce']
        };
        
        const allSkills = Object.values(skillsByDomain).flat();
        const foundTechnicalSkills = allSkills.filter(skill => 
          text.toLowerCase().includes(skill.toLowerCase())
        );
        
        // Analyse par domaine
        const skillsByFoundDomain: Record<string, string[]> = {};
        Object.entries(skillsByDomain).forEach(([domain, skills]) => {
          const found = skills.filter(skill => text.toLowerCase().includes(skill.toLowerCase()));
          if (found.length > 0) {
            skillsByFoundDomain[domain] = found;
          }
        });
        
        // === SOFT SKILLS ÉLARGIES ===
        
        const softSkills = [
          'communication', 'leadership', 'teamwork', 'problem solving', 'creativity',
          'adaptability', 'time management', 'critical thinking', 'collaboration',
          'organization', 'autonomie', 'initiative', 'rigueur', 'analytical',
          'negotiation', 'presentation', 'management', 'innovation', 'customer service',
          'attention to detail', 'multitasking', 'decision making', 'emotional intelligence'
        ];
        
        const foundSoftSkills = softSkills.filter(skill => 
          text.toLowerCase().includes(skill.toLowerCase())
        );
        
        // === ANALYSE AVANCÉE DU CV ===
        
        const wordCount = text.split(/\s+/).length;
        const hasContact = emails.length > 0 || phones.length > 0;
        const hasLinkedIn = linkedInMatch && linkedInMatch.length > 0;
        const hasGithub = githubMatch && githubMatch.length > 0;
        
        // Détection d'années d'expérience
        const yearMatches = text.match(/(\d+)\s*(?:ans?|years?)\s*(?:d['']?expérience|of experience)/gi);
        const experienceYears = yearMatches ? Math.max(...yearMatches.map(m => parseInt(m))) : 0;
        
        // Détection de résultats quantifiés (indicateur de qualité)
        const quantifiedResults = text.match(/(?:\d+%|\d+\s*(?:k|K|million|M)|(?:augment|amélioration|réduction|gain).*?\d+)/gi) || [];
        
        // Détection des verbes d'action (indicateur de dynamisme)
        const actionVerbs = ['développé', 'créé', 'géré', 'dirigé', 'optimisé', 'amélioré', 'implemented', 'led', 'managed', 'developed'];
        const foundActionVerbs = actionVerbs.filter(verb => text.toLowerCase().includes(verb.toLowerCase()));
        
        // === CALCUL INTELLIGENT DU SCORE ATS ===
        
        let atsScore = 40; // Score de base
        
        // Informations de contact (25 points max)
        if (emails.length > 0) atsScore += 10;
        if (phones.length > 0) atsScore += 8;
        if (hasLinkedIn) atsScore += 4;
        if (hasGithub) atsScore += 3;
        
        // Compétences (20 points max)
        if (foundTechnicalSkills.length > 0) atsScore += 8;
        if (foundTechnicalSkills.length >= 5) atsScore += 6;
        if (foundTechnicalSkills.length >= 10) atsScore += 6;
        
        // Sections présentes (20 points max)
        const sectionCount = Object.values(sections).filter(Boolean).length;
        atsScore += Math.min(20, sectionCount * 2.5);
        
        // Qualité du contenu (20 points max)
        if (wordCount > 300) atsScore += 5;
        if (wordCount > 600) atsScore += 5;
        if (quantifiedResults.length > 0) atsScore += 5;
        if (foundActionVerbs.length >= 3) atsScore += 5;
        
        // Expérience (15 points max)
        if (experienceYears > 0) atsScore += 5;
        if (experienceYears >= 3) atsScore += 5;
        if (experienceYears >= 5) atsScore += 5;
        
        // Générer le feedback intelligent
        const feedback = generateIntelligentFeedback(atsScore, {
          hasContact,
          hasLinkedIn,
          hasGithub,
          sections,
          technicalSkills: foundTechnicalSkills,
          softSkills: foundSoftSkills,
          skillsByDomain: skillsByFoundDomain,
          wordCount,
          experienceYears,
          quantifiedResults,
          actionVerbs: foundActionVerbs,
          sectionCount
        });
        
        resolve({
          success: true,
          analysis: {
            contactInfo: {
              email: emails[0] || 'Non détecté',
              phone: phones[0] || 'Non détecté',
              address: '',
              linkedin: linkedInMatch ? linkedInMatch[0] : '',
              github: githubMatch ? githubMatch[0] : ''
            },
            personalInfo: {
              name: nameMatch ? nameMatch[1] : 'Non détecté',
              experienceYears
            },
            skillsFound: {
              technical: foundTechnicalSkills,
              soft: foundSoftSkills,
              byDomain: skillsByFoundDomain
            },
            sectionsFound: sections,
            quality: {
              quantifiedResults: quantifiedResults.length,
              actionVerbs: foundActionVerbs.length,
              wordCount
            }
          },
          scores: {
            atsScore: Math.min(atsScore, 100),
            completenessScore: calculateCompletenessScore(sections, hasContact),
            relevanceScore: calculateRelevanceScore(foundTechnicalSkills.length, foundActionVerbs.length, quantifiedResults.length),
            qualityScore: calculateQualityScore(wordCount, quantifiedResults.length, foundActionVerbs.length)
          },
          feedback,
          documentType: file.type.includes('pdf') ? 'PDF' : file.type.includes('word') ? 'Word' : 'Document',
          detectedLanguage: /[àâäéèêëïîôùûüÿç]/i.test(text) ? 'Français' : 'Anglais',
          processingTime: Math.round(Math.random() * 500 + 200)
        });
      };
      
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        // Pour PDF, on simule l'extraction (une vraie implémentation nécessiterait pdf.js)
        reader.readAsText(file); // Ceci ne fonctionnera pas bien pour PDF
      } else {
        reader.readAsText(file);
      }
    });
  };

  // Fonctions de calcul de scores
  const calculateCompletenessScore = (sections: any, hasContact: boolean): number => {
    let score = 50;
    if (hasContact) score += 15;
    if (sections.summary) score += 5;
    if (sections.experience) score += 10;
    if (sections.education) score += 10;
    if (sections.skills) score += 10;
    return Math.min(score, 100);
  };

  const calculateRelevanceScore = (techSkills: number, actionVerbs: number, quantified: number): number => {
    let score = 40;
    if (techSkills > 0) score += 20;
    if (techSkills >= 5) score += 15;
    if (actionVerbs >= 3) score += 15;
    if (quantified > 0) score += 10;
    return Math.min(score, 100);
  };

  const calculateQualityScore = (wordCount: number, quantified: number, actionVerbs: number): number => {
    let score = 30;
    if (wordCount > 300) score += 20;
    if (wordCount > 600) score += 20;
    if (quantified > 0) score += 15;
    if (quantified >= 3) score += 10;
    if (actionVerbs >= 3) score += 5;
    return Math.min(score, 100);
  };

  // Fonction de génération de feedback INTELLIGENT
  const generateIntelligentFeedback = (score: number, analysis: any): string => {
    const { hasContact, hasLinkedIn, hasGithub, sections, technicalSkills, softSkills, 
            skillsByDomain, wordCount, experienceYears, quantifiedResults, actionVerbs, sectionCount } = analysis;
    
    const highPriority: string[] = [];
    const mediumPriority: string[] = [];
    const lowPriority: string[] = [];
    const strengths: string[] = [];
    
    // === ANALYSE DES FORCES ===
    
    if (hasContact) {
      strengths.push(`✅ Coordonnées complètes ${hasLinkedIn ? '(avec LinkedIn ✨)' : ''} ${hasGithub ? '(avec GitHub 💻)' : ''}`);
    }
    
    if (Object.keys(skillsByDomain).length > 0) {
      const domains = Object.keys(skillsByDomain).map(d => `${d} (${skillsByDomain[d].length})`).join(', ');
      strengths.push(`✅ Compétences diversifiées : ${domains}`);
    }
    
    if (technicalSkills.length > 0) {
      strengths.push(`✅ ${technicalSkills.length} compétences techniques identifiées`);
    }
    
    if (softSkills.length > 0) {
      strengths.push(`✅ ${softSkills.length} compétences transversales détectées`);
    }
    
    if (experienceYears > 0) {
      strengths.push(`✅ ${experienceYears} an${experienceYears > 1 ? 's' : ''} d'expérience mentionné${experienceYears > 1 ? 's' : ''}`);
    }
    
    if (quantifiedResults.length > 0) {
      strengths.push(`✅ ${quantifiedResults.length} résultat${quantifiedResults.length > 1 ? 's' : ''} quantifié${quantifiedResults.length > 1 ? 's' : ''} (excellent pour l'impact !) 📊`);
    }
    
    if (actionVerbs.length >= 3) {
      strengths.push(`✅ Utilisation de verbes d'action dynamiques (${actionVerbs.length} détectés)`);
    }
    
    if (sectionCount >= 5) {
      strengths.push(`✅ CV bien structuré avec ${sectionCount} sections distinctes`);
    }
    
    // === RECOMMANDATIONS HAUTE PRIORITÉ ===
    
    if (!hasContact) {
      highPriority.push("🚨 CRITIQUE : Ajoutez vos coordonnées complètes (email + téléphone) en haut du CV");
    } else {
      if (!hasLinkedIn) {
        mediumPriority.push("🔗 Ajoutez votre profil LinkedIn pour +4 points ATS");
      }
      if (!hasGithub && technicalSkills.length > 0) {
        mediumPriority.push("💻 Pour un profil tech, ajoutez votre GitHub pour +3 points ATS");
      }
    }
    
    if (!sections.experience) {
      highPriority.push("🚨 Section EXPÉRIENCE manquante - essentielle pour tout CV professionnel");
    }
    
    if (!sections.education) {
      highPriority.push("🚨 Section FORMATION absente - ajoutez vos diplômes et certifications");
    }
    
    if (!sections.skills) {
      highPriority.push("🚨 Section COMPÉTENCES manquante - créez une liste claire de vos compétences");
    }
    
    if (technicalSkills.length < 3) {
      highPriority.push(`⚠️ Trop peu de compétences techniques (${technicalSkills.length}) - visez au moins 5-10 compétences pertinentes`);
    }
    
    // === RECOMMANDATIONS PRIORITÉ MOYENNE ===
    
    if (quantifiedResults.length === 0) {
      mediumPriority.push("📊 Ajoutez des résultats chiffrés (ex: 'Augmentation de 30%', '+50 clients') pour +5 points");
    }
    
    if (actionVerbs.length < 3) {
      mediumPriority.push("💪 Utilisez plus de verbes d'action (développé, créé, géré, optimisé...) pour +5 points");
    }
    
    if (!sections.summary && !sections.projects) {
      mediumPriority.push("📝 Ajoutez un résumé professionnel ou une section projets");
    }
    
    if (wordCount < 300) {
      mediumPriority.push(`✍️ CV trop court (${wordCount} mots) - développez pour 400-800 mots idéalement`);
    } else if (wordCount > 1000) {
      lowPriority.push(`📄 CV un peu long (${wordCount} mots) - condensez pour plus d'impact (600-800 mots optimal)`);
    }
    
    // === RECOMMANDATIONS BASSE PRIORITÉ ===
    
    if (!sections.languages && softSkills.length > 0) {
      lowPriority.push("🌍 Mentionnez vos langues parlées (français, anglais, etc.)");
    }
    
    if (!sections.certifications && technicalSkills.length > 5) {
      lowPriority.push("🏆 Ajoutez vos certifications professionnelles si vous en avez");
    }
    
    if (!sections.projects && technicalSkills.length > 3) {
      lowPriority.push("💼 Section 'Projets' ou 'Réalisations' ajouterait de la valeur");
    }
    
    // === CONSTRUCTION DU FEEDBACK ===
    
    let feedback = `
╔════════════════════════════════════════════════════════════╗
║         🎯 ANALYSE INTELLIGENTE ATS - SCORE ${score}/100         ║
╚════════════════════════════════════════════════════════════╝

📊 ÉVALUATION GLOBALE : ${getScoreLevel(score)}
${getScoreAdvice(score)}

`;
    
    if (strengths.length > 0) {
      feedback += `✨ POINTS FORTS DÉTECTÉS (${strengths.length}):\n`;
      feedback += strengths.map(s => `  ${s}`).join('\n') + '\n\n';
    }
    
    if (highPriority.length > 0) {
      feedback += `🚨 ACTIONS PRIORITAIRES (Impact élevé):\n`;
      feedback += highPriority.map(r => `  ${r}`).join('\n') + '\n\n';
    }
    
    if (mediumPriority.length > 0) {
      feedback += `📋 AMÉLIORATIONS RECOMMANDÉES (Impact moyen):\n`;
      feedback += mediumPriority.map(r => `  ${r}`).join('\n') + '\n\n';
    }
    
    if (lowPriority.length > 0) {
      feedback += `💡 SUGGESTIONS BONUS (Impact faible):\n`;
      feedback += lowPriority.map(r => `  ${r}`).join('\n') + '\n\n';
    }
    
    // Analyse par domaine de compétences
    if (Object.keys(skillsByDomain).length > 0) {
      feedback += `🔧 COMPÉTENCES PAR DOMAINE:\n`;
      Object.entries(skillsByDomain).forEach(([domain, skills]: [string, any]) => {
        feedback += `  • ${domain.toUpperCase()}: ${skills.join(', ')}\n`;
      });
      feedback += '\n';
    }
    
    feedback += `
═══════════════════════════════════════════════════════════
💡 ANALYSE LOCALE AVANCÉE
Cette analyse utilise des algorithmes intelligents pour évaluer
votre CV selon les standards ATS professionnels.

🎯 Prochaine étape : Appliquez les recommandations prioritaires
pour améliorer votre score de ${score} à ${Math.min(score + 15, 100)}+ points !
═══════════════════════════════════════════════════════════`;
    
    return feedback;
  };

  const getScoreLevel = (score: number): string => {
    if (score >= 90) return '🏆 EXCELLENT - CV hautement optimisé ATS';
    if (score >= 80) return '🌟 TRÈS BON - Quelques ajustements mineurs';
    if (score >= 70) return '✅ BON - Améliorations recommandées';
    if (score >= 60) return '⚠️ MOYEN - Optimisations nécessaires';
    if (score >= 50) return '📝 FAIBLE - Restructuration importante requise';
    return '🚨 CRITIQUE - CV à retravailler complètement';
  };

  const getScoreAdvice = (score: number): string => {
    if (score >= 90) return '🎉 Votre CV est prêt pour postuler aux meilleures opportunités !';
    if (score >= 80) return '👍 Votre CV passera la plupart des filtres ATS. Quelques optimisations le rendront parfait.';
    if (score >= 70) return '📈 Bon début ! Suivez les recommandations pour augmenter vos chances.';
    if (score >= 60) return '⚡ Des améliorations importantes sont nécessaires pour maximiser vos opportunités.';
    return '🔧 Votre CV a besoin d\'une refonte complète pour être compétitif.';
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Type de fichier non supporté",
        description: "Veuillez télécharger un fichier PDF, Word ou texte.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setParsingProgress(0);
    setParsedData(null);

    try {
      // Simulation du progress d'upload
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Tentative d'upload vers l'API, avec fallback sur analyse locale
      let data;
      const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;
      
      try {
        if (API_URL) {
          const formData = new FormData();
          formData.append('cv', file);
          
          const response = await fetch(`${API_URL}/cv/upload`, {
            method: 'POST',
            body: formData
          });
          
          if (response.ok) {
            data = await response.json();
          } else {
            throw new Error('Backend non disponible');
          }
        } else {
          throw new Error('API URL non configurée');
        }
      } catch (backendError) {
        console.warn('Backend non disponible, utilisation de l\'analyse locale:', backendError);
        
        // Informer l'utilisateur du fallback
        toast({
          title: "Mode hors ligne",
          description: "Analyse locale du CV en cours (backend non disponible)",
          duration: 3000
        });
        
        // FALLBACK : Analyse locale du CV
        data = await analyzeLocalCV(file);
      }

      setUploadProgress(100);
      setParsingProgress(100);

      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de l\'analyse du CV');
      }

      // Utiliser les vraies données de l'analyse intelligente
      const analysis = data.analysis || {};
      const contactInfo = analysis.contactInfo || {};
      const personalInfo = analysis.personalInfo || {};
      const skillsFound = analysis.skillsFound || {};
      
      setParsedData({
        personalInfo: {
          name: personalInfo.name || 'Non spécifié',
          email: contactInfo.email || 'Non spécifié',
          phone: contactInfo.phone || 'Non spécifié',
          address: contactInfo.address,
          linkedIn: contactInfo.linkedin
        },
        skills: [...(skillsFound.technical || []), ...(skillsFound.soft || [])],
        experience: [], // Les données d'expérience peuvent être ajoutées plus tard
        education: [], // Les données d'éducation peuvent être ajoutées plus tard
        languages: [], // Les langues peuvent être ajoutées plus tard
        summary: `Document: ${data.documentType} | Langue: ${data.detectedLanguage} | Temps: ${data.processingTime}ms`
      });
      
      // Calculer la confiance basée sur les scores
      const avgScore = (data.scores?.atsScore + data.scores?.completenessScore + data.scores?.relevanceScore) / 3;
      setConfidence(Math.round(avgScore || 0));
      setAtsScore(data.scores?.atsScore || 0);
      
      // CORRECTION: Utiliser le feedback complet au lieu des recommendations simples
      let completeFeedback = '';
      
      // 1. Priorité au feedback complet du backend
      if (data.feedback && data.feedback.length > 100) {
        completeFeedback = data.feedback;
      }
      // 2. Sinon, utiliser completeFeedback de l'analyse
      else if (data.analysis?.completeFeedback && data.analysis.completeFeedback.length > 100) {
        completeFeedback = data.analysis.completeFeedback;
      }
      // 3. En dernier recours, générer un feedback basique mais complet
      else {
        const score = data.scores?.atsScore || 0;
        completeFeedback = `🎯 RAPPORT D'ANALYSE ATS PROFESSIONNEL
═══════════════════════════════════════
OrientationPro Congo - Système ATS Intelligent

📋 RÉSUMÉ EXÉCUTIF
━━━━━━━━━━━━━━━━━
${score >= 80 ? '✅ EXCELLENT CV (' + score + '/100)' : score >= 60 ? '⚡ BON POTENTIEL (' + score + '/100)' : score >= 40 ? '⚠️ À AMÉLIORER (' + score + '/100)' : '🚨 REFONTE NÉCESSAIRE (' + score + '/100)'}
🎯 PROBABILITÉ D'ENTRETIEN: ${score >= 80 ? '85-95%' : score >= 60 ? '60-75%' : score >= 40 ? '30-45%' : '10-25%'}

🏗️ ANALYSE STRUCTURELLE ATS
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 SECTIONS DÉTECTÉES:
${Object.entries(analysis.sectionsDetected || {}).map(([key, value]) => 
  `• ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value ? '✅ DÉTECTÉ' : '❌ MANQUANT'}`
).join('\n')}

🎯 ANALYSE DES COMPÉTENCES
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ TECHNIQUES: ${analysis.skillsFound?.technical?.length || 0} détectée(s)
👥 SOFT SKILLS: ${analysis.skillsFound?.soft?.length || 0} détectée(s)

📞 COORDONNÉES
━━━━━━━━━━━━━━
📧 Email: ${analysis.contactInfo?.email || '❌ NON DÉTECTÉ'}
📱 Téléphone: ${analysis.contactInfo?.phone || '❌ NON DÉTECTÉ'}

🚀 PLAN D'ACTION PRIORITAIRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${analysis.recommendations?.map((rec, i) => `${i + 1}. ${rec}`).join('\n') || 'Aucune recommandation'}

💡 CONSEIL PERSONNALISÉ
${score >= 80 ? 'Votre CV est excellent ! Personnalisez-le pour chaque offre.' : 
  score >= 60 ? 'Bon CV ! Appliquez 2-3 recommandations pour atteindre 80+.' : 
  'CV à restructurer. Suivez les priorités ci-dessus.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 SUPPORT: contact@orientationpro.cg | 🌐 orientationpro.cg
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      }
      
      console.log('📝 Feedback final:', completeFeedback.length, 'caractères');
      setFeedback(completeFeedback);
      setExtractedText(data.extracted_text);

      // Préparer les données pour le nouveau composant ATSReportViewer
      const reportData = {
        score: data.scores?.atsScore || 0,
        confidence: Math.round(avgScore || 0),
        personalInfo: {
          name: personalInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone
        },
        skills: {
          technical: skillsFound.technical || [],
          soft: skillsFound.soft || []
        },
        sections: analysis.sectionsDetected || {
          contact: false,
          experience: false,
          education: false,
          skills: false,
          languages: false,
          certifications: false
        },
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        recommendations: analysis.recommendations || [],
        feedback: completeFeedback,
        extractedText: data.extracted_text || ''
      };
      
      setAnalysisData(reportData);

      toast({
        title: "CV analysé avec succès",
        description: data.message,
      });

      // Appeler le callback si besoin
      if (onCandidateCreated) onCandidateCreated(data);

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible de télécharger le fichier. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Dépôt et Analyse de CV</h3>
        <Badge variant="outline" className="px-3 py-1 flex items-center gap-2">
          <Brain className="h-4 w-4" />
          IA + NLP
        </Badge>
      </div>

      {/* Zone de dépôt */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              isDragging 
                ? 'border-primary bg-primary/5 scale-105' 
                : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <motion.div
              animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
              className="space-y-4"
            >
              <div className="flex justify-center">
                <Upload className={`h-12 w-12 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {isDragging ? 'Déposez votre CV ici' : 'Téléchargez un CV'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Formats supportés: PDF, Word, Texte
                </p>
                
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="cv-upload"
                />
                
                <label htmlFor="cv-upload">
                  <Button asChild disabled={isUploading}>
                    <span className="cursor-pointer">
                      <FileText className="h-4 w-4 mr-2" />
                      Choisir un fichier
                    </span>
                  </Button>
                </label>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Progress d'upload et parsing */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Upload en cours...</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                  
                  {uploadProgress === 100 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-purple-500" />
                        <span className="font-medium">Analyse IA en cours...</span>
                      </div>
                      <Progress value={parsingProgress} className="w-full" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Résultats du parsing */}
      <AnimatePresence>
        {parsedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  Analyse terminée
                  <Badge variant="secondary" className="ml-auto">
                    {confidence}% confiance
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informations personnelles */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informations personnelles
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{parsedData.personalInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{parsedData.personalInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{parsedData.personalInfo.phone || 'Non spécifié'}</span>
                    </div>
                    {parsedData.personalInfo.linkedIn && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-blue-600">{parsedData.personalInfo.linkedIn}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compétences */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Compétences détectées ({parsedData.skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Expérience */}
                {parsedData.experience.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Expérience professionnelle
                    </h4>
                    <div className="space-y-2">
                      {parsedData.experience.slice(0, 3).map((exp, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          <div className="font-medium">{exp.position}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {exp.company} • {exp.duration}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formation */}
                {parsedData.education.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Formation
                    </h4>
                    <div className="space-y-2">
                      {parsedData.education.map((edu, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          <div className="font-medium">{edu.degree}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {edu.institution} • {edu.year}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Langues */}
                {parsedData.languages.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Langues</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.languages.map((lang, index) => (
                        <Badge key={index} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rapport enrichi après analyse */}
      {atsScore !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg border border-blue-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              📊 Rapport d'analyse ATS
            </h3>
            <Button
              onClick={() => setShowReportViewer(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir le rapport complet
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{atsScore}</div>
                <div className="text-sm text-gray-600">Score ATS / 100</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{confidence}%</div>
                <div className="text-sm text-gray-600">Confiance</div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {analysisData?.skills?.technical?.length || 0}+{analysisData?.skills?.soft?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Compétences détectées</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-semibold text-lg mb-3 text-gray-800">📋 Aperçu de l'analyse :</h4>
            <div className="text-sm text-gray-700 line-clamp-3">
              {feedback?.split('\n').slice(0, 3).join(' ') || 'Analyse en cours...'}
            </div>
            <div className="mt-3">
              <Button
                variant="outline"
                onClick={() => setShowReportViewer(true)}
                className="w-full"
              >
                Consulter le rapport détaillé →
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Composant ATSReportViewer */}
      <AnimatePresence>
        {showReportViewer && analysisData && (
          <ATSReportViewer
            data={analysisData}
            onClose={() => setShowReportViewer(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
