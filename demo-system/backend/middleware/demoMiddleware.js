const config = require('../../config.js');

/**
 * Middleware DEMO - Gestion du mode démo
 */
class DemoMiddleware {
  constructor() {
    this.isDemoMode = false;
    this.demoSchema = config.demo.schema;
    this.prodSchema = config.database.prod_schema;
  }

  /**
   * Détecte le mode DEMO via headers ou JWT
   */
  detectDemoMode(req) {
    // Vérifier le header X-Demo-Mode
    if (req.headers['x-demo-mode'] === 'true') {
      return true;
    }

    // Vérifier le JWT pour le mode DEMO
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.demo_mode === true;
      } catch (error) {
        // Token invalide, continuer en mode normal
      }
    }

    // Vérifier le cookie demo_mode
    if (req.cookies?.demo_mode === 'true') {
      return true;
    }

    return false;
  }

  /**
   * Applique le mode DEMO à la requête
   */
  apply(req, res, next) {
    const isDemo = this.detectDemoMode(req);
    
    // Ajouter les informations DEMO à la requête
    req.isDemoMode = isDemo;
    req.demoSchema = isDemo ? this.demoSchema : this.prodSchema;
    req.demoPrefix = isDemo ? config.demo.prefix : '';
    
    // Log de l'activité DEMO
    if (isDemo && config.backend.logging) {
      console.log(`🔵 [DEMO] ${req.method} ${req.path} - User: ${req.user?.id || 'anonymous'}`);
    }
    
    next();
  }

  /**
   * Middleware pour les écritures en mode DEMO
   */
  handleWrites(req, res, next) {
    if (req.isDemoMode && config.backend.mock_writes) {
      // En mode DEMO, simuler les écritures
      const originalSend = res.send;
      res.send = function(data) {
        if (req.method !== 'GET') {
          console.log(`🔵 [DEMO] Mocked write operation: ${req.method} ${req.path}`);
          // Retourner une réponse simulée
          return originalSend.call(this, {
            success: true,
            demo_mode: true,
            message: 'Operation simulated in demo mode',
            data: data
          });
        }
        return originalSend.call(this, data);
      };
    }
    next();
  }

  /**
   * Audit des activités DEMO
   */
  auditActivity(req, res, next) {
    if (req.isDemoMode && config.security.audit_activities) {
      const auditData = {
        timestamp: new Date().toISOString(),
        user_id: req.user?.id || 'anonymous',
        method: req.method,
        path: req.path,
        demo_mode: true,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      };
      
      // Log de l'audit
      console.log(`🔵 [DEMO AUDIT] ${JSON.stringify(auditData)}`);
      
      // Stocker en base si nécessaire
      // this.saveAuditLog(auditData);
    }
    next();
  }
}

module.exports = new DemoMiddleware();
