const MatchingService = require('./matchingService');

// Advanced multi-criteria scoring service
class ScoringService {
  constructor() {
    this.matchingService = new MatchingService();

    // Default weights per criterion for overall scoring
    this.scoringWeights = {
      skills: 0.4,
      experience: 0.25,
      education: 0.15,
      softSkills: 0.1,
      location: 0.05,
      salary: 0.05,
    };
  }

  // Compute overall score with explanations
  async computeScore(cvData, jobData) {
    // Reuse intelligent matching to get detailed scores
    const analysis = await this.matchingService.matchCandidateToJob(cvData, jobData);
    const detailed = analysis.matching.detailedScores;

    const explanations = {};
    const weights = this._deriveWeights(jobData?.type);

    let weightedSum = 0;
    let totalWeight = 0;

    for (const [criterion, scoreObj] of Object.entries(detailed)) {
      const weight = weights[criterion] || 0;
      const score = typeof scoreObj?.score === 'number' ? scoreObj.score : 0;
      weightedSum += score * weight;
      totalWeight += weight;
      explanations[criterion] = this._explainCriterion(criterion, scoreObj);
    }

    const overall = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;

    return {
      overall,
      detailed,
      weights,
      explanations,
      fitLevel: this._fitLevel(overall),
      recommendations: analysis.matching.recommendations,
      strengths: analysis.matching.strengths,
      weaknesses: analysis.matching.weaknesses,
      metadata: {
        computedAt: new Date().toISOString(),
        algorithmVersion: '2.0',
      },
    };
  }

  _deriveWeights(jobType) {
    // Align with MatchingService job type weights if present
    const fromMatching = this.matchingService.getWeightsForJobType(jobType || 'developer');
    // Convert to same keys used in detailedScores
    return {
      skills: fromMatching.skills ?? this.scoringWeights.skills,
      experience: fromMatching.experience ?? this.scoringWeights.experience,
      education: fromMatching.education ?? this.scoringWeights.education,
      softSkills: fromMatching.softSkills ?? this.scoringWeights.softSkills,
      location: fromMatching.location ?? this.scoringWeights.location,
      salary: fromMatching.salary ?? this.scoringWeights.salary,
    };
  }

  _explainCriterion(criterion, scoreObj) {
    const score = typeof scoreObj?.score === 'number' ? scoreObj.score : 0;
    switch (criterion) {
      case 'skills':
        return {
          summary: `Couverture des compétences: ${scoreObj.coverage || '0/0'}`,
          matched: scoreObj.matched?.map(m => m.required) || [],
          missing: scoreObj.missing || [],
          guidance: score < 80 ? 'Renforcer les compétences manquantes prioritaires.' : 'Compétences en adéquation.'
        };
      case 'experience':
        return {
          summary: `Années ${scoreObj.years || 0} vs requis ${scoreObj.required || 0}`,
          seniority: scoreObj.seniority || 'unknown',
          guidance: score < 70 ? 'Valoriser résultats chiffrés et responsabilités.' : 'Expérience satisfaisante.'
        };
      case 'education':
        return {
          summary: `Niveau ${scoreObj.level || 'unknown'} (${scoreObj.field || 'NA'}) vs ${scoreObj.required || 'any'}`,
          guidance: score < 60 ? 'Mettre en avant certifications pertinentes.' : 'Formation adéquate.'
        };
      case 'softSkills':
        return {
          summary: `Soft skills manquants: ${(scoreObj.missing || []).join(', ')}`,
          guidance: score < 60 ? 'Illustrer leadership, communication, collaboration.' : 'Soft skills adéquats.'
        };
      case 'location':
        return {
          summary: scoreObj.match ? 'Localisation compatible.' : 'Mismatch de localisation.',
          guidance: scoreObj.match ? 'OK' : 'Évoquer télétravail ou mobilité.'
        };
      case 'salary':
        return {
          summary: scoreObj.match ? 'Fourchette salaire compatible.' : 'Fourchette partiellement compatible.',
          guidance: scoreObj.match ? 'OK' : 'Aligner les attentes.'
        };
      default:
        return { summary: 'Critère non détaillé', guidance: '' };
    }
  }

  _fitLevel(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'very_good';
    if (score >= 70) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 50) return 'poor';
    return 'very_poor';
  }
}

module.exports = ScoringService;


