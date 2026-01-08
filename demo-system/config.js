module.exports = {
  // Configuration générale
  demo: {
    schema: 'demo',
    prefix: 'demo_',
    enabled: process.env.DEMO_MODE === 'true',
    audit: true,
    isolation: true
  },
  
  // Configuration base de données
  database: {
    prod_schema: 'public',
    demo_schema: 'demo',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'orientationpro',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    }
  },
  
  // Configuration backend
  backend: {
    demo_middleware: true,
    mock_writes: true,
    logging: true,
    audit_trail: true
  },
  
  // Configuration frontend
  frontend: {
    demo_overlay: true,
    visual_indicators: true,
    adaptive_behavior: true,
    demo_badge: true
  },
  
  // Configuration sécurité
  security: {
    strict_isolation: true,
    no_prod_writes: true,
    audit_activities: true,
    rls_enabled: true
  },
  
  // Configuration monitoring
  monitoring: {
    demo_metrics: true,
    performance_tracking: true,
    activity_logging: true
  }
};
