// Analytics service - stockage local uniquement

export type AnalyticsEventType =
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'test_started'
  | 'test_completed'
  | 'cv_uploaded'
  | 'cv_optimized'
  | 'appointment_booked'
  | 'user_login'
  | 'user_register'
  | 'search_performed'
  | 'download_started'
  | 'video_played'
  | 'link_clicked'
  | 'custom';

export interface AnalyticsEvent {
  event_type: AnalyticsEventType;
  event_data?: Record<string, any>;
  page_path?: string;
  page_title?: string;
  user_id?: string;
  session_id?: string;
  timestamp?: string;
}

/**
 * Service de tracking analytics frontend
 * Enregistre les événements utilisateur en local (localStorage)
 */
class FrontendAnalytics {
  private sessionId: string;
  private queue: AnalyticsEvent[] = [];
  private isProcessing = false;
  private batchSize = 10;
  private flushInterval = 30000; // 30 secondes
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startAutoFlush();
  }

  /**
   * Génère un ID de session unique
   */
  private generateSessionId(): string {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('analytics_session_id');
      if (stored) return stored;
      
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
      return sessionId;
    }
    return `session_${Date.now()}`;
  }

  /**
   * Enregistre un événement analytics
   */
  track(event: AnalyticsEvent): void {
    const enrichedEvent: AnalyticsEvent = {
      ...event,
      page_path: window.location.pathname,
      page_title: document.title,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    this.queue.push(enrichedEvent);

    // Envoyer immédiatement si le batch est plein
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Track un événement de page view
   */
  trackPageView(pagePath?: string, pageTitle?: string): void {
    this.track({
      event_type: 'page_view',
      page_path: pagePath,
      page_title: pageTitle,
    });
  }

  /**
   * Track un clic sur un bouton
   */
  trackButtonClick(buttonName: string, buttonId?: string, additionalData?: Record<string, any>): void {
    this.track({
      event_type: 'button_click',
      event_data: {
        button_name: buttonName,
        button_id: buttonId,
        ...additionalData,
      },
    });
  }

  /**
   * Track une soumission de formulaire
   */
  trackFormSubmit(formName: string, formId?: string, success: boolean = true, additionalData?: Record<string, any>): void {
    this.track({
      event_type: 'form_submit',
      event_data: {
        form_name: formName,
        form_id: formId,
        success,
        ...additionalData,
      },
    });
  }

  /**
   * Track le démarrage d'un test
   */
  trackTestStarted(testType: string, additionalData?: Record<string, any>): void {
    this.track({
      event_type: 'test_started',
      event_data: {
        test_type: testType,
        ...additionalData,
      },
    });
  }

  /**
   * Track la complétion d'un test
   */
  trackTestCompleted(testType: string, score?: number, duration?: number, additionalData?: Record<string, any>): void {
    this.track({
      event_type: 'test_completed',
      event_data: {
        test_type: testType,
        score,
        duration_seconds: duration,
        ...additionalData,
      },
    });
  }

  /**
   * Track un upload de CV
   */
  trackCVUploaded(success: boolean = true, fileSize?: number, additionalData?: Record<string, any>): void {
    this.track({
      event_type: 'cv_uploaded',
      event_data: {
        success,
        file_size_kb: fileSize,
        ...additionalData,
      },
    });
  }

  /**
   * Track une optimisation de CV
   */
  trackCVOptimized(scoreBefore?: number, scoreAfter?: number, additionalData?: Record<string, any>): void {
    this.track({
      event_type: 'cv_optimized',
      event_data: {
        score_before: scoreBefore,
        score_after: scoreAfter,
        improvement: scoreAfter && scoreBefore ? scoreAfter - scoreBefore : undefined,
        ...additionalData,
      },
    });
  }

  /**
   * Track une réservation de rendez-vous
   */
  trackAppointmentBooked(consultantId?: string, appointmentType?: string, additionalData?: Record<string, any>): void {
    this.track({
      event_type: 'appointment_booked',
      event_data: {
        consultant_id: consultantId,
        appointment_type: appointmentType,
        ...additionalData,
      },
    });
  }

  /**
   * Track une recherche
   */
  trackSearch(query: string, resultsCount?: number, additionalData?: Record<string, any>): void {
    this.track({
      event_type: 'search_performed',
      event_data: {
        query,
        results_count: resultsCount,
        ...additionalData,
      },
    });
  }

  /**
   * Track un événement personnalisé
   */
  trackCustom(eventName: string, eventData?: Record<string, any>): void {
    this.track({
      event_type: 'custom',
      event_data: {
        custom_event_name: eventName,
        ...eventData,
      },
    });
  }

  /**
   * Envoie les événements en queue vers localStorage (mode local)
   */
  async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const eventsToSend = [...this.queue];
      this.queue = [];

      // Stocker dans localStorage
      const storedEvents = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
      const newEvents = eventsToSend.map((event) => ({
        event_type: event.event_type,
        event_data: event.event_data || {},
        user_agent: navigator.userAgent,
        timestamp: event.timestamp || new Date().toISOString(),
        profile_id: event.user_id || null,
      }));
      
      localStorage.setItem('analytics_queue', JSON.stringify([...storedEvents, ...newEvents]));
      
      // Limiter à 1000 événements max dans localStorage
      const allEvents = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
      if (allEvents.length > 1000) {
        localStorage.setItem('analytics_queue', JSON.stringify(allEvents.slice(-1000)));
      }
    } catch (error) {
      console.error('Error flushing analytics:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Démarre l'envoi automatique périodique
   */
  private startAutoFlush(): void {
    if (typeof window === 'undefined') return;

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);

    // Flush avant de quitter la page
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Flush quand la page devient visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.flush();
      }
    });
  }

  /**
   * Arrête le service
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }
}

// Instance singleton
export const analytics = new FrontendAnalytics();

// Export de fonctions helper
export const trackPageView = (pagePath?: string, pageTitle?: string) => 
  analytics.trackPageView(pagePath, pageTitle);

export const trackButtonClick = (buttonName: string, buttonId?: string, data?: Record<string, any>) =>
  analytics.trackButtonClick(buttonName, buttonId, data);

export const trackFormSubmit = (formName: string, formId?: string, success?: boolean, data?: Record<string, any>) =>
  analytics.trackFormSubmit(formName, formId, success, data);

export const trackTestStarted = (testType: string, data?: Record<string, any>) =>
  analytics.trackTestStarted(testType, data);

export const trackTestCompleted = (testType: string, score?: number, duration?: number, data?: Record<string, any>) =>
  analytics.trackTestCompleted(testType, score, duration, data);

export const trackCVUploaded = (success?: boolean, fileSize?: number, data?: Record<string, any>) =>
  analytics.trackCVUploaded(success, fileSize, data);

export const trackCVOptimized = (scoreBefore?: number, scoreAfter?: number, data?: Record<string, any>) =>
  analytics.trackCVOptimized(scoreBefore, scoreAfter, data);

export const trackAppointmentBooked = (consultantId?: string, appointmentType?: string, data?: Record<string, any>) =>
  analytics.trackAppointmentBooked(consultantId, appointmentType, data);

export const trackSearch = (query: string, resultsCount?: number, data?: Record<string, any>) =>
  analytics.trackSearch(query, resultsCount, data);

export const trackCustom = (eventName: string, eventData?: Record<string, any>) =>
  analytics.trackCustom(eventName, eventData);

