// Types du parcours public d'analyse ATS MAKOKI, alignes sur l'API /api/v1/cv/*
// et le moteur versionne makoki-cv-rules-v1. Le score exprime une compatibilite
// avec les regles ATS analysees, jamais une probabilite d'entretien, un taux de
// recrutement ni une garantie de passage des ATS.

export type CvSeverity = 'critique' | 'important' | 'suggestion';

export interface AtsScores {
  generalReadiness: number;
  structure: number;
  contentClarity: number;
  impact: number;
  technicalUsability: number;
  targetRelevance: number | null;
}

export interface AtsSummaryScores {
  generalReadiness: number;
  targetRelevance: number | null;
}

export interface AtsDocument {
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  pageCount: number | null;
  detectedLanguage: string;
  textLength?: number;
  wordCount?: number;
}

export interface AtsSection {
  key: string;
  present: boolean;
}

export interface AtsSkill {
  canonical: string;
  domain: string;
}

// Un point d'analyse ATS : regle detectee, gravite, preuve observable et
// correction recommandee, avec l'impact sur le score de compatibilite.
export interface AtsIssue {
  code: string;
  severity: CvSeverity;
  title: string;
  observation: string;
  recommendation: string;
  scoreImpact: number;
}

// Une regle ATS reussie.
export interface AtsStrength {
  code: string;
  title: string;
}

export interface AtsTargetMatch {
  targetRelevance: number;
  jobTitle: string | null;
  presentSkills: string[];
  missingSkills: string[];
  requiredSkills: string[];
  keywordOverlapPercent: number;
}

export interface AtsMethodology {
  version: string;
  type: string;
  limitations: string[];
}

// Contenu immuable calcule par le moteur ATS (present dans le detail).
export interface AtsAnalysisSnapshot {
  status: string;
  document: AtsDocument;
  scores: AtsScores;
  contactPresence: { hasEmail: boolean; hasPhone: boolean };
  sections: AtsSection[];
  skills: AtsSkill[];
  strengths: AtsStrength[];
  issues: AtsIssue[];
  targetMatch: AtsTargetMatch | null;
  methodology: AtsMethodology;
}

// Resume renvoye par la liste des analyses ATS.
export interface AtsAnalysisSummary {
  id: string;
  algorithmVersion: string;
  document: AtsDocument;
  scores: AtsSummaryScores;
  targetTitle: string | null;
  createdAt: string;
}

// Analyse ATS complete (creation / detail) : resume + snapshot immuable.
export interface AtsAnalysis extends AtsAnalysisSummary {
  snapshot: AtsAnalysisSnapshot;
}

export interface AtsAnalysisPage {
  analyses: AtsAnalysisSummary[];
  pagination: { limit: number; offset: number; total: number };
}
