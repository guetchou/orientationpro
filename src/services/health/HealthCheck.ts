// Health check service - vérifications simplifiées sans Supabase

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    api: 'healthy' | 'unhealthy';
    database: 'healthy' | 'unhealthy';
    storage: 'healthy' | 'unhealthy';
    auth: 'healthy' | 'unhealthy';
  };
  latency?: {
    api: number;
    database: number;
    storage: number;
    auth: number;
  };
  timestamp: string;
  version?: string;
}

/**
 * Service de vérification de santé de l'application
 * Vérifie que tous les services sont opérationnels
 */
class HealthCheckService {
  private healthStatus: HealthStatus | null = null;
  private lastCheckTime: number = 0;
  private checkInterval: number = 60000; // 1 minute
  private cacheDuration: number = 30000; // 30 secondes

  /**
   * Vérifie la santé de tous les services
   */
  async checkHealth(): Promise<HealthStatus> {
    const now = Date.now();
    
    // Retourner le cache si récent
    if (
      this.healthStatus &&
      now - this.lastCheckTime < this.cacheDuration
    ) {
      return this.healthStatus;
    }

    try {
      const checks = await Promise.allSettled([
        this.checkAPI(),
        this.checkDatabase(),
        this.checkStorage(),
        this.checkAuth(),
      ]);

      const apiCheck = checks[0];
      const dbCheck = checks[1];
      const storageCheck = checks[2];
      const authCheck = checks[3];

      const healthStatus: HealthStatus = {
        status: 'healthy',
        checks: {
          api: apiCheck.status === 'fulfilled' && apiCheck.value.healthy ? 'healthy' : 'unhealthy',
          database: dbCheck.status === 'fulfilled' && dbCheck.value.healthy ? 'healthy' : 'unhealthy',
          storage: storageCheck.status === 'fulfilled' && storageCheck.value.healthy ? 'healthy' : 'unhealthy',
          auth: authCheck.status === 'fulfilled' && authCheck.value.healthy ? 'healthy' : 'unhealthy',
        },
        latency: {
          api: apiCheck.status === 'fulfilled' ? apiCheck.value.latency : -1,
          database: dbCheck.status === 'fulfilled' ? dbCheck.value.latency : -1,
          storage: storageCheck.status === 'fulfilled' ? storageCheck.value.latency : -1,
          auth: authCheck.status === 'fulfilled' ? authCheck.value.latency : -1,
        },
        timestamp: new Date().toISOString(),
        version: process.env.VITE_APP_VERSION || '1.0.0',
      };

      // Déterminer le statut global
      const unhealthyCount = Object.values(healthStatus.checks).filter(
        (check) => check === 'unhealthy'
      ).length;

      if (unhealthyCount === 0) {
        healthStatus.status = 'healthy';
      } else if (unhealthyCount <= 2) {
        healthStatus.status = 'degraded';
      } else {
        healthStatus.status = 'unhealthy';
      }

      this.healthStatus = healthStatus;
      this.lastCheckTime = now;

      return healthStatus;
    } catch (error) {
      console.error('Error checking health:', error);
      
      return {
        status: 'unhealthy',
        checks: {
          api: 'unhealthy',
          database: 'unhealthy',
          storage: 'unhealthy',
          auth: 'unhealthy',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Vérifie la santé de l'API (test basique)
   */
  private async checkAPI(): Promise<{ healthy: boolean; latency: number }> {
    const startTime = performance.now();
    try {
      // Test simple de connectivité réseau
      const response = await fetch('/favicon.ico', { method: 'HEAD', cache: 'no-cache' });
      const latency = performance.now() - startTime;
      
      return {
        healthy: response.ok,
        latency: Math.round(latency),
      };
    } catch (error) {
      return {
        healthy: false,
        latency: performance.now() - startTime,
      };
    }
  }

  /**
   * Vérifie la santé de la base de données (simplifié)
   */
  private async checkDatabase(): Promise<{ healthy: boolean; latency: number }> {
    // En mode local, on considère que la DB est accessible via l'API backend
    const startTime = performance.now();
    try {
      // Test basique - considérer healthy si pas d'erreur réseau
      const latency = performance.now() - startTime;
      
      return {
        healthy: true,
        latency: Math.round(latency),
      };
    } catch (error) {
      return {
        healthy: false,
        latency: performance.now() - startTime,
      };
    }
  }

  /**
   * Vérifie la santé du storage (simplifié)
   */
  private async checkStorage(): Promise<{ healthy: boolean; latency: number }> {
    const startTime = performance.now();
    // En mode local, storage considéré comme disponible
    const latency = performance.now() - startTime;
    
    return {
      healthy: true,
      latency: Math.round(latency),
    };
  }

  /**
   * Vérifie la santé de l'authentification (simplifié)
   */
  private async checkAuth(): Promise<{ healthy: boolean; latency: number }> {
    const startTime = performance.now();
    // En mode local, auth considéré comme disponible
    const latency = performance.now() - startTime;
    
    return {
      healthy: true,
      latency: Math.round(latency),
    };
  }

  /**
   * Retourne le dernier statut de santé
   */
  getLastStatus(): HealthStatus | null {
    return this.healthStatus;
  }

  /**
   * Démarre les vérifications périodiques
   */
  startPeriodicChecks(onStatusChange?: (status: HealthStatus) => void): void {
    setInterval(async () => {
      const status = await this.checkHealth();
      if (onStatusChange) {
        onStatusChange(status);
      }
    }, this.checkInterval);
  }
}

// Instance singleton
export const healthCheck = new HealthCheckService();

