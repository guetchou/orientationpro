// Générateur PDF pour les rapports ATS
// Utilise une approche légère sans dépendances externes

export interface ATSReportData {
  score: number;
  confidence: number;
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
  };
  skills: {
    technical: string[];
    soft: string[];
  };
  sections: {
    contact: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    languages: boolean;
    certifications: boolean;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  feedback: string;
  extractedText: string;
}

export const generateATSReportPDF = async (data: ATSReportData): Promise<void> => {
  try {
    // Créer le contenu HTML du rapport
    const htmlContent = generateReportHTML(data);
    
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Impossible d\'ouvrir la fenêtre d\'impression');
    }
    
    // Injecter le contenu HTML
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Attendre le chargement et déclencher l'impression
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
    
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    throw error;
  }
};

const generateReportHTML = (data: ATSReportData): string => {
  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: 'EXCELLENT', color: '#10b981', probability: '85-95%' };
    if (score >= 60) return { level: 'BON POTENTIEL', color: '#3b82f6', probability: '60-75%' };
    if (score >= 40) return { level: 'À AMÉLIORER', color: '#f59e0b', probability: '30-45%' };
    return { level: 'REFONTE NÉCESSAIRE', color: '#ef4444', probability: '10-25%' };
  };

  const scoreLevel = getScoreLevel(data.score);
  const completedSections = Object.values(data.sections).filter(Boolean).length;
  const totalSections = Object.keys(data.sections).length;
  const sectionCompletionRate = Math.round((completedSections / totalSections) * 100);

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport ATS - OrientationPro Congo</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
        }
        
        .header h1 {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 5px;
        }
        
        .header h2 {
            font-size: 16px;
            color: #6b7280;
            font-weight: normal;
        }
        
        .score-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 20px;
        }
        
        .score-card {
            flex: 1;
            text-align: center;
            padding: 20px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            background: #f9fafb;
        }
        
        .score-card.primary {
            border-color: ${scoreLevel.color};
            background: ${scoreLevel.color}15;
        }
        
        .score-value {
            font-size: 36px;
            font-weight: bold;
            color: ${scoreLevel.color};
            margin-bottom: 5px;
        }
        
        .score-label {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
        }
        
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .info-item {
            display: flex;
            align-items: center;
            padding: 8px 0;
        }
        
        .info-label {
            font-weight: 500;
            color: #4b5563;
            margin-right: 10px;
        }
        
        .sections-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .section-item {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            font-size: 11px;
        }
        
        .section-item.present {
            background: #f0fdf4;
            border-color: #10b981;
            color: #047857;
        }
        
        .section-item.missing {
            background: #fef2f2;
            border-color: #ef4444;
            color: #dc2626;
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .skills-list {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 10px;
        }
        
        .skill-tag {
            display: inline-block;
            padding: 4px 8px;
            background: #e0e7ff;
            color: #3730a3;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
        }
        
        .skill-tag.soft {
            background: #f3e8ff;
            color: #6b21a8;
        }
        
        .recommendations-list {
            list-style: none;
            counter-reset: rec-counter;
        }
        
        .recommendations-list li {
            counter-increment: rec-counter;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
            position: relative;
            padding-left: 30px;
        }
        
        .recommendations-list li:before {
            content: counter(rec-counter);
            position: absolute;
            left: 0;
            top: 10px;
            width: 20px;
            height: 20px;
            background: #3b82f6;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
        }
        
        .feedback-section {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            white-space: pre-line;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            line-height: 1.3;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 10px;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Rapport d'Analyse ATS Professionnel</h1>
        <h2>OrientationPro Congo - Système ATS Intelligent</h2>
        <p style="margin-top: 10px; color: #6b7280;">Généré le ${new Date().toLocaleString('fr-FR')}</p>
    </div>
    
    <div class="score-section">
        <div class="score-card primary">
            <div class="score-value">${data.score}</div>
            <div class="score-label">Score ATS / 100</div>
            <div style="margin-top: 8px; font-size: 12px; color: ${scoreLevel.color}; font-weight: 500;">
                ${scoreLevel.level}
            </div>
        </div>
        
        <div class="score-card">
            <div class="score-value" style="color: #10b981;">${data.confidence}%</div>
            <div class="score-label">Confiance</div>
        </div>
        
        <div class="score-card">
            <div class="score-value" style="color: #8b5cf6;">${scoreLevel.probability}</div>
            <div class="score-label">Probabilité d'entretien</div>
        </div>
        
        <div class="score-card">
            <div class="score-value" style="color: #059669;">${completedSections}/${totalSections}</div>
            <div class="score-label">Sections CV (${sectionCompletionRate}%)</div>
        </div>
    </div>
    
    ${data.personalInfo.name ? `
    <div class="section">
        <h3 class="section-title">📋 Informations Détectées</h3>
        <div class="info-grid">
            ${data.personalInfo.name ? `
            <div class="info-item">
                <span class="info-label">👤 Nom:</span>
                <span>${data.personalInfo.name}</span>
            </div>
            ` : ''}
            ${data.personalInfo.email ? `
            <div class="info-item">
                <span class="info-label">📧 Email:</span>
                <span>${data.personalInfo.email}</span>
            </div>
            ` : ''}
            ${data.personalInfo.phone ? `
            <div class="info-item">
                <span class="info-label">📱 Téléphone:</span>
                <span>${data.personalInfo.phone}</span>
            </div>
            ` : ''}
        </div>
    </div>
    ` : ''}
    
    <div class="section">
        <h3 class="section-title">🏗️ Analyse Structurelle ATS</h3>
        <div class="sections-grid">
            <div class="section-item ${data.sections.contact ? 'present' : 'missing'}">
                📞 Contact: ${data.sections.contact ? '✅ Détecté' : '❌ Manquant'}
            </div>
            <div class="section-item ${data.sections.experience ? 'present' : 'missing'}">
                💼 Expérience: ${data.sections.experience ? '✅ Détecté' : '❌ Manquant'}
            </div>
            <div class="section-item ${data.sections.education ? 'present' : 'missing'}">
                🎓 Formation: ${data.sections.education ? '✅ Détecté' : '❌ Manquant'}
            </div>
            <div class="section-item ${data.sections.skills ? 'present' : 'missing'}">
                ⚙️ Compétences: ${data.sections.skills ? '✅ Détecté' : '❌ Manquant'}
            </div>
            <div class="section-item ${data.sections.languages ? 'present' : 'missing'}">
                🌐 Langues: ${data.sections.languages ? '✅ Détecté' : '❌ Manquant'}
            </div>
            <div class="section-item ${data.sections.certifications ? 'present' : 'missing'}">
                🏆 Certifications: ${data.sections.certifications ? '✅ Détecté' : '❌ Manquant'}
            </div>
        </div>
    </div>
    
    <div class="section">
        <h3 class="section-title">🎯 Analyse des Compétences</h3>
        <div class="skills-grid">
            <div>
                <h4 style="font-size: 14px; margin-bottom: 10px; color: #1f2937;">
                    ⚙️ Compétences Techniques (${data.skills.technical.length})
                </h4>
                <div class="skills-list">
                    ${data.skills.technical.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    ${data.skills.technical.length === 0 ? '<span style="color: #6b7280; font-style: italic;">Aucune compétence technique détectée</span>' : ''}
                </div>
            </div>
            
            <div>
                <h4 style="font-size: 14px; margin-bottom: 10px; color: #1f2937;">
                    👥 Soft Skills (${data.skills.soft.length})
                </h4>
                <div class="skills-list">
                    ${data.skills.soft.map(skill => `<span class="skill-tag soft">${skill}</span>`).join('')}
                    ${data.skills.soft.length === 0 ? '<span style="color: #6b7280; font-style: italic;">Aucune soft skill détectée</span>' : ''}
                </div>
            </div>
        </div>
    </div>
    
    ${data.recommendations.length > 0 ? `
    <div class="section">
        <h3 class="section-title">🚀 Plan d'Action Prioritaire</h3>
        <ul class="recommendations-list">
            ${data.recommendations.slice(0, 8).map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
    ` : ''}
    
    <div class="section page-break">
        <h3 class="section-title">📄 Rapport Complet d'Analyse</h3>
        <div class="feedback-section">
${data.feedback || 'Aucun feedback détaillé disponible.'}
        </div>
    </div>
    
    <div class="footer">
        <p><strong>OrientationPro Congo</strong> - Système ATS Intelligent</p>
        <p>📞 Contact: contact@orientationpro.cg | 🌐 www.orientationpro.cg</p>
        <p>Rapport généré automatiquement le ${new Date().toLocaleString('fr-FR')}</p>
    </div>
</body>
</html>
  `;
};

export default generateATSReportPDF;