// Types du parcours public d'analyse de CV, alignes sur l'API /api/v1/cv/*
// et le moteur deterministe makoki-cv-rules-v1 (aucune notion de probabilite
// d'entretien, aucun score arbitraire).

export type CvSeverity = 'critique' | 'important' | 'suggestion';

export interface CvScores {
  generalReadiness: number;
  structure: number;
  contentClarity: number;
  impact: number;
  technicalUsability: number;
  targetRelevance: number | null;
}

export interface CvSummaryScores {
  generalReadiness: number;
  targetRelevance: number | null;
}

export interface CvDocument {
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  pageCount: number | null;
  detectedLanguage: string;
  textLength?: number;
  wordCount?: number;
}

export interface CvSection {
  key: string;
  present: boolean;
}

export interface CvSkill {
  canonical: string;
  domain: string;
}

export interface CvIssue {
  code: string;
  severity: CvSeverity;
  title: string;
  observation: string;
  recommendation: string;
  scoreImpact: number;
}

export interface CvStrength {
  code: string;
  title: string;
}

export interface CvTargetMatch {
  targetRelevance: number;
  jobTitle: string | null;
  presentSkills: string[];
  missingSkills: string[];
  requiredSkills: string[];
  keywordOverlapPercent: number;
}

export interface CvMethodology {
  version: string;
  type: string;
  limitations: string[];
}

// Contenu immuable calcule par le serveur (present dans le detail).
export interface CvAnalysisSnapshot {
  status: string;
  document: CvDocument;
  scores: CvScores;
  contactPresence: { hasEmail: boolean; hasPhone: boolean };
  sections: CvSection[];
  skills: CvSkill[];
  strengths: CvStrength[];
  issues: CvIssue[];
  targetMatch: CvTargetMatch | null;
  methodology: CvMethodology;
}

// Resume renvoye par la liste.
export interface CvAnalysisSummary {
  id: string;
  algorithmVersion: string;
  document: CvDocument;
  scores: CvSummaryScores;
  targetTitle: string | null;
  createdAt: string;
}

// Analyse complete (creation / detail) : resume + snapshot immuable.
export interface CvAnalysis extends CvAnalysisSummary {
  snapshot: CvAnalysisSnapshot;
}

export interface CvAnalysisPage {
  analyses: CvAnalysisSummary[];
  pagination: { limit: number; offset: number; total: number };
}
