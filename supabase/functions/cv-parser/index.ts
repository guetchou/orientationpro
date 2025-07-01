
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

interface CVParsingRequest {
  fileContent: string;
  fileName: string;
  fileType: string;
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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fileContent, fileName, fileType }: CVParsingRequest = await req.json();

    console.log(`Processing CV: ${fileName} (${fileType})`);

    // Simuler l'extraction de texte basée sur le type de fichier
    let extractedText = '';
    
    if (fileType === 'application/pdf') {
      // En production, utiliser une vraie bibliothèque PDF comme pdf-parse
      extractedText = await extractTextFromPDF(fileContent);
    } else if (fileType.includes('word')) {
      // En production, utiliser mammoth.js pour les fichiers Word
      extractedText = await extractTextFromWord(fileContent);
    } else {
      extractedText = fileContent; // Assumé être du texte brut
    }

    // Parsing NLP avancé
    const parsedData = await parseWithNLP(extractedText);

    // Enrichissement des données
    const enrichedData = await enrichParsedData(parsedData);

    console.log('CV parsing completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: enrichedData,
        metadata: {
          fileName,
          fileType,
          processedAt: new Date().toISOString(),
          confidence: calculateConfidence(enrichedData)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error parsing CV:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to parse CV content'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function extractTextFromPDF(base64Content: string): Promise<string> {
  // Simulation d'extraction PDF
  // En production, utiliser une vraie bibliothèque comme pdf-parse
  console.log('Extracting text from PDF...');
  
  return `
    Jean Dupont
    Développeur Full Stack Senior
    Email: jean.dupont@email.com
    Téléphone: +33 6 12 34 56 78
    LinkedIn: linkedin.com/in/jeandupont
    
    EXPÉRIENCE PROFESSIONNELLE
    
    Développeur Full Stack Senior - Tech Corp (2020-2024)
    • Développement d'applications web avec React, Node.js, PostgreSQL
    • Encadrement d'une équipe de 5 développeurs
    • Mise en place d'architectures microservices
    • Implémentation de tests automatisés et CI/CD
    
    Développeur Frontend - StartupXYZ (2018-2020)
    • Création d'interfaces utilisateur modernes avec React et TypeScript
    • Intégration d'APIs REST et GraphQL
    • Optimisation des performances frontend
    
    FORMATION
    
    Master Informatique - Université de Paris (2016-2018)
    Licence Informatique - Université de Lyon (2013-2016)
    
    COMPÉTENCES TECHNIQUES
    
    • Langages: JavaScript, TypeScript, Python, Java
    • Frontend: React, Vue.js, Angular, HTML5, CSS3, Sass
    • Backend: Node.js, Express, Django, Spring Boot
    • Bases de données: PostgreSQL, MongoDB, Redis
    • DevOps: Docker, Kubernetes, AWS, CI/CD
    • Outils: Git, Jest, Webpack, Vite
    
    LANGUES
    
    • Français: Natif
    • Anglais: Courant (C1)
    • Espagnol: Intermédiaire (B2)
  `;
}

async function extractTextFromWord(base64Content: string): Promise<string> {
  // Simulation d'extraction Word
  // En production, utiliser mammoth.js ou une bibliothèque similaire
  console.log('Extracting text from Word document...');
  
  return `
    Marie Martin
    Chef de Projet Digital
    marie.martin@email.com | +33 7 89 12 34 56
    
    PROFIL PROFESSIONNEL
    
    Chef de projet digital expérimentée avec 8 ans d'expérience dans la gestion
    de projets web et mobiles. Expertise en méthodologies agiles et gestion d'équipes
    pluridisciplinaires.
    
    EXPÉRIENCE
    
    Chef de Projet Senior - Digital Agency (2019-2024)
    • Gestion de projets clients de 50K€ à 500K€
    • Coordination d'équipes de 10 à 15 personnes
    • Mise en place de processus Scrum et Kanban
    • Suivi budgétaire et reporting client
    
    Chef de Projet Junior - WebCorp (2016-2019)
    • Assistance à la gestion de projets web
    • Rédaction de cahiers des charges
    • Coordination avec les équipes techniques
    
    FORMATION
    
    Master Management de Projets Digitaux - ESCP (2014-2016)
    
    COMPÉTENCES
    
    • Gestion de projet: Scrum, Kanban, PMI
    • Outils: Jira, Trello, Slack, Figma
    • Budgétaire: Suivi ROI, analyse financière
    • Leadership: Encadrement d'équipes, formation
  `;
}

async function parseWithNLP(text: string): Promise<ParsedCVData> {
  console.log('Parsing text with NLP...');
  
  // Extraction des informations personnelles
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(?:\+33|0)[1-9](?:[0-9]{8})/g;
  const linkedInRegex = /linkedin\.com\/in\/[a-zA-Z0-9-]+/g;
  
  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];
  const linkedInProfiles = text.match(linkedInRegex) || [];
  
  // Extraction du nom (première ligne non vide généralement)
  const lines = text.split('\n').filter(line => line.trim());
  const name = lines[0]?.trim() || 'Nom non détecté';
  
  // Extraction des compétences
  const skillsKeywords = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Vue.js', 'Angular',
    'Node.js', 'Express', 'Django', 'Spring', 'PostgreSQL', 'MongoDB', 'Redis',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'Jenkins', 'CI/CD',
    'HTML5', 'CSS3', 'Sass', 'Webpack', 'Vite', 'Jest', 'Cypress',
    'Scrum', 'Agile', 'Kanban', 'Jira', 'Trello', 'Figma', 'Photoshop',
    'Leadership', 'Management', 'Communication', 'Teamwork'
  ];
  
  const detectedSkills = skillsKeywords.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  // Extraction de l'expérience (patterns simples)
  const experiencePattern = /(.+?)\s*[-–]\s*(.+?)\s*\((\d{4}[-–]\d{4}|\d{4}[-–]present|\d{4}[-–]aujourd'hui)\)/gi;
  const experienceMatches = Array.from(text.matchAll(experiencePattern));
  
  const experience = experienceMatches.map(match => ({
    position: match[1]?.trim() || '',
    company: match[2]?.trim() || '',
    duration: match[3]?.trim() || '',
    description: 'Description extraite automatiquement du CV'
  }));
  
  // Extraction de la formation
  const educationKeywords = ['Master', 'Licence', 'Bachelor', 'Doctorat', 'BTS', 'DUT', 'Université', 'École'];
  const educationLines = lines.filter(line => 
    educationKeywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase()))
  );
  
  const education = educationLines.map(line => ({
    degree: line.split('-')[0]?.trim() || line,
    institution: line.split('-')[1]?.trim() || 'Institution non spécifiée',
    year: extractYear(line) || 'Année non spécifiée'
  }));
  
  // Extraction des langues
  const languageKeywords = ['Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien', 'Chinois', 'Arabe'];
  const detectedLanguages = languageKeywords.filter(lang => 
    text.toLowerCase().includes(lang.toLowerCase())
  );
  
  return {
    personalInfo: {
      name,
      email: emails[0] || '',
      phone: phones[0] || '',
      linkedIn: linkedInProfiles[0] || ''
    },
    skills: detectedSkills,
    experience,
    education,
    languages: detectedLanguages,
    summary: extractSummary(text)
  };
}

async function enrichParsedData(data: ParsedCVData): Promise<ParsedCVData> {
  console.log('Enriching parsed data...');
  
  // Normalisation des compétences
  const skillsMapping: Record<string, string[]> = {
    'Frontend': ['React', 'Vue.js', 'Angular', 'HTML5', 'CSS3', 'JavaScript', 'TypeScript'],
    'Backend': ['Node.js', 'Express', 'Django', 'Spring', 'Python', 'Java'],
    'Database': ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL'],
    'DevOps': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'CI/CD', 'Jenkins'],
    'Project Management': ['Scrum', 'Agile', 'Kanban', 'Leadership', 'Management']
  };
  
  // Ajout de compétences suggérées basées sur l'expérience
  const suggestedSkills: string[] = [];
  
  data.experience.forEach(exp => {
    const expText = `${exp.position} ${exp.company} ${exp.description}`.toLowerCase();
    
    Object.entries(skillsMapping).forEach(([category, skills]) => {
      skills.forEach(skill => {
        if (expText.includes(skill.toLowerCase()) && !data.skills.includes(skill)) {
          suggestedSkills.push(skill);
        }
      });
    });
  });
  
  return {
    ...data,
    skills: [...data.skills, ...suggestedSkills].slice(0, 20) // Limiter à 20 compétences
  };
}

function extractYear(text: string): string | null {
  const yearMatch = text.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? yearMatch[0] : null;
}

function extractSummary(text: string): string {
  const lines = text.split('\n').filter(line => line.trim());
  
  // Chercher des sections comme "PROFIL", "RÉSUMÉ", "OBJECTIF"
  const summaryKeywords = ['profil', 'résumé', 'objectif', 'présentation', 'à propos'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (summaryKeywords.some(keyword => line.includes(keyword))) {
      // Prendre les 3 lignes suivantes comme résumé
      const summaryLines = lines.slice(i + 1, i + 4);
      const summary = summaryLines.join(' ').trim();
      if (summary.length > 50) {
        return summary.substring(0, 300) + '...';
      }
    }
  }
  
  return 'Résumé automatiquement généré à partir du CV.';
}

function calculateConfidence(data: ParsedCVData): number {
  let score = 0;
  let maxScore = 0;
  
  // Scoring basé sur la qualité des données extraites
  if (data.personalInfo.name && data.personalInfo.name !== 'Nom non détecté') { score += 20; }
  maxScore += 20;
  
  if (data.personalInfo.email) { score += 15; }
  maxScore += 15;
  
  if (data.personalInfo.phone) { score += 10; }
  maxScore += 10;
  
  if (data.skills.length > 0) { score += Math.min(data.skills.length * 2, 20); }
  maxScore += 20;
  
  if (data.experience.length > 0) { score += Math.min(data.experience.length * 10, 25); }
  maxScore += 25;
  
  if (data.education.length > 0) { score += Math.min(data.education.length * 5, 10); }
  maxScore += 10;
  
  return Math.round((score / maxScore) * 100);
}
