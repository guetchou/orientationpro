const config = require('../../config.js');

class DemoMonitoringService {
  constructor() {
    this.metrics = {
      activeUsers: 0,
      testCompletions: 0,
      sessionDuration: 0,
      errorRate: 0,
      performanceScore: 0,
      securityBreaches: 0,
      demoSessions: 0
    };
    
    this.alerts = [];
    this.logs = [];
  }

  /**
   * Collecte les métriques en temps réel
   */
  async collectMetrics() {
    try {
      // Métriques utilisateurs
      this.metrics.activeUsers = await this.getActiveDemoUsers();
      this.metrics.demoSessions = await this.getDemoSessions();
      
      // Métriques tests
      this.metrics.testCompletions = await this.getDemoTestCompletions();
      
      // Métriques performance
      this.metrics.sessionDuration = await this.getAverageSessionDuration();
      this.metrics.performanceScore = await this.getPerformanceScore();
      
      // Métriques sécurité
      this.metrics.errorRate = await this.getDemoErrorRate();
      this.metrics.securityBreaches = await this.getSecurityBreaches();
      
      console.log('📊 Métriques DEMO collectées:', this.metrics);
      return this.metrics;
    } catch (error) {
      console.error('❌ Erreur collecte métriques:', error.message);
      throw error;
    }
  }

  /**
   * Vérifie les alertes
   */
  async checkAlerts() {
    const newAlerts = [];
    
    // Alerte utilisation élevée
    if (this.metrics.activeUsers > 100) {
      newAlerts.push({
        type: 'high_usage',
        severity: 'warning',
        message: `Utilisation élevée du mode DEMO: ${this.metrics.activeUsers} utilisateurs actifs`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Alerte sécurité
    if (this.metrics.securityBreaches > 0) {
      newAlerts.push({
        type: 'security_breach',
        severity: 'critical',
        message: `${this.metrics.securityBreaches} tentative(s) d'accès non autorisé`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Alerte performance
    if (this.metrics.performanceScore < 80) {
      newAlerts.push({
        type: 'performance',
        severity: 'warning',
        message: `Performance dégradée: ${this.metrics.performanceScore}%`,
        timestamp: new Date().toISOString()
      });
    }
    
    this.alerts = [...this.alerts, ...newAlerts];
    return newAlerts;
  }

  /**
   * Génère un rapport de monitoring
   */
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      alerts: this.alerts,
      logs: this.logs.slice(-100), // Derniers 100 logs
      summary: {
        totalSessions: this.metrics.demoSessions,
        totalTests: this.metrics.testCompletions,
        averageSessionDuration: this.metrics.sessionDuration,
        errorRate: this.metrics.errorRate,
        securityBreaches: this.metrics.securityBreaches
      }
    };
    
    return report;
  }

  /**
   * Log une activité DEMO
   */
  logActivity(activity) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      user_id: activity.user_id || 'anonymous',
      action: activity.action,
      resource: activity.resource,
      demo_mode: true,
      ip: activity.ip,
      user_agent: activity.user_agent,
      session_id: activity.session_id
    };
    
    this.logs.push(logEntry);
    
    // Limiter la taille des logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-500);
    }
    
    console.log('🔵 [DEMO LOG]', logEntry);
  }

  /**
   * Méthodes privées pour collecter les métriques
   */
  async getActiveDemoUsers() {
    // Simulation - en production, requête à la base de données
    return Math.floor(Math.random() * 50) + 10;
  }

  async getDemoSessions() {
    // Simulation - en production, requête à la base de données
    return Math.floor(Math.random() * 20) + 5;
  }

  async getDemoTestCompletions() {
    // Simulation - en production, requête à la base de données
    return Math.floor(Math.random() * 100) + 20;
  }

  async getAverageSessionDuration() {
    // Simulation - en production, calcul basé sur les logs
    return Math.floor(Math.random() * 30) + 10; // minutes
  }

  async getPerformanceScore() {
    // Simulation - en production, calcul basé sur les métriques
    return Math.floor(Math.random() * 20) + 80; // pourcentage
  }

  async getDemoErrorRate() {
    // Simulation - en production, calcul basé sur les erreurs
    return Math.random() * 5; // pourcentage
  }

  async getSecurityBreaches() {
    // Simulation - en production, comptage des tentatives
    return Math.floor(Math.random() * 3);
  }
}

module.exports = new DemoMonitoringService();
