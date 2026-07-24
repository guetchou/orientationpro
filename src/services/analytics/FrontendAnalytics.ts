import { CONSENT_CHANGED_EVENT, ConsentPreferences, isConsentGranted } from '@/lib/privacyConsent';

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

const STORAGE_KEY = 'analytics_queue';
const MAX_EVENTS = 1000;
const RETENTION_MS = 14 * 30 * 24 * 60 * 60 * 1000;

class FrontendAnalytics {
  private sessionId = '';
  private queue: AnalyticsEvent[] = [];
  private isProcessing = false;
  private readonly batchSize = 10;
  private readonly flushInterval = 30_000;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window === 'undefined') return;
    this.startAutoFlush();
    window.addEventListener(CONSENT_CHANGED_EVENT, this.handleConsentChange as EventListener);

    if (isConsentGranted('analytics')) {
      this.purgeExpiredEvents();
    } else {
      this.clearAnalyticsStorage();
    }
  }

  private clearAnalyticsStorage(): void {
    this.queue = [];
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem('analytics_session_id');
    this.sessionId = '';
  }

  private handleConsentChange = (event: CustomEvent<ConsentPreferences>) => {
    if (!event.detail.analytics) {
      this.clearAnalyticsStorage();
      return;
    }

    this.purgeExpiredEvents();
  };

  private ensureSessionId(): string {
    if (this.sessionId) return this.sessionId;
    const stored = window.sessionStorage.getItem('analytics_session_id');
    if (stored) {
      this.sessionId = stored;
      return stored;
    }
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    window.sessionStorage.setItem('analytics_session_id', this.sessionId);
    return this.sessionId;
  }

  private purgeExpiredEvents(): void {
    if (typeof window === 'undefined' || !isConsentGranted('analytics')) {
      return;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return;
    }

    try {
      const stored = JSON.parse(raw);
      if (!Array.isArray(stored)) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
      }
      const cutoff = Date.now() - RETENTION_MS;
      const retained = stored.filter((event) => {
        const timestamp = new Date(event?.timestamp || 0).getTime();
        return Number.isFinite(timestamp) && timestamp >= cutoff;
      }).slice(-MAX_EVENTS);

      if (retained.length === 0) {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(retained));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  track(event: AnalyticsEvent): void {
    if (typeof window === 'undefined' || !isConsentGranted('analytics')) return;

    this.queue.push({
      ...event,
      page_path: event.page_path || window.location.pathname,
      page_title: event.page_title || document.title,
      session_id: this.ensureSessionId(),
      timestamp: new Date().toISOString(),
    });

    if (this.queue.length >= this.batchSize) void this.flush();
  }

  trackPageView(pagePath?: string, pageTitle?: string): void {
    this.track({ event_type: 'page_view', page_path: pagePath, page_title: pageTitle });
  }

  trackButtonClick(buttonName: string, buttonId?: string, additionalData?: Record<string, any>): void {
    this.track({ event_type: 'button_click', event_data: { button_name: buttonName, button_id: buttonId, ...additionalData } });
  }

  trackFormSubmit(formName: string, formId?: string, success = true, additionalData?: Record<string, any>): void {
    this.track({ event_type: 'form_submit', event_data: { form_name: formName, form_id: formId, success, ...additionalData } });
  }

  trackTestStarted(testType: string, additionalData?: Record<string, any>): void {
    this.track({ event_type: 'test_started', event_data: { test_type: testType, ...additionalData } });
  }

  trackTestCompleted(testType: string, score?: number, duration?: number, additionalData?: Record<string, any>): void {
    this.track({ event_type: 'test_completed', event_data: { test_type: testType, score, duration_seconds: duration, ...additionalData } });
  }

  trackCVUploaded(success = true, fileSize?: number, additionalData?: Record<string, any>): void {
    this.track({ event_type: 'cv_uploaded', event_data: { success, file_size_kb: fileSize, ...additionalData } });
  }

  trackCVOptimized(scoreBefore?: number, scoreAfter?: number, additionalData?: Record<string, any>): void {
    this.track({
      event_type: 'cv_optimized',
      event_data: {
        score_before: scoreBefore,
        score_after: scoreAfter,
        improvement: scoreAfter !== undefined && scoreBefore !== undefined ? scoreAfter - scoreBefore : undefined,
        ...additionalData,
      },
    });
  }

  trackAppointmentBooked(consultantId?: string, appointmentType?: string, additionalData?: Record<string, any>): void {
    this.track({ event_type: 'appointment_booked', event_data: { consultant_id: consultantId, appointment_type: appointmentType, ...additionalData } });
  }

  trackSearch(query: string, resultsCount?: number, additionalData?: Record<string, any>): void {
    this.track({ event_type: 'search_performed', event_data: { query, results_count: resultsCount, ...additionalData } });
  }

  trackCustom(eventName: string, eventData?: Record<string, any>): void {
    this.track({ event_type: 'custom', event_data: { custom_event_name: eventName, ...eventData } });
  }

  async flush(): Promise<void> {
    if (typeof window === 'undefined' || !isConsentGranted('analytics') || this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    try {
      this.purgeExpiredEvents();
      const eventsToStore = this.queue.splice(0).map((event) => ({
        event_type: event.event_type,
        event_data: event.event_data || {},
        page_path: event.page_path,
        page_title: event.page_title,
        session_id: event.session_id,
        timestamp: event.timestamp || new Date().toISOString(),
      }));
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
      const next = [...(Array.isArray(stored) ? stored : []), ...eventsToStore].slice(-MAX_EVENTS);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Error flushing analytics:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => void this.flush(), this.flushInterval);
    window.addEventListener('beforeunload', () => void this.flush());
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) void this.flush();
    });
  }

  destroy(): void {
    if (this.flushTimer) clearInterval(this.flushTimer);
    window.removeEventListener(CONSENT_CHANGED_EVENT, this.handleConsentChange as EventListener);
    void this.flush();
  }
}

export const analytics = new FrontendAnalytics();

export const trackPageView = (pagePath?: string, pageTitle?: string) => analytics.trackPageView(pagePath, pageTitle);
export const trackButtonClick = (buttonName: string, buttonId?: string, data?: Record<string, any>) => analytics.trackButtonClick(buttonName, buttonId, data);
export const trackFormSubmit = (formName: string, formId?: string, success?: boolean, data?: Record<string, any>) => analytics.trackFormSubmit(formName, formId, success, data);
export const trackTestStarted = (testType: string, data?: Record<string, any>) => analytics.trackTestStarted(testType, data);
export const trackTestCompleted = (testType: string, score?: number, duration?: number, data?: Record<string, any>) => analytics.trackTestCompleted(testType, score, duration, data);
export const trackCVUploaded = (success?: boolean, fileSize?: number, data?: Record<string, any>) => analytics.trackCVUploaded(success, fileSize, data);
export const trackCVOptimized = (scoreBefore?: number, scoreAfter?: number, data?: Record<string, any>) => analytics.trackCVOptimized(scoreBefore, scoreAfter, data);
export const trackAppointmentBooked = (consultantId?: string, appointmentType?: string, data?: Record<string, any>) => analytics.trackAppointmentBooked(consultantId, appointmentType, data);
export const trackSearch = (query: string, resultsCount?: number, data?: Record<string, any>) => analytics.trackSearch(query, resultsCount, data);
export const trackCustom = (eventName: string, eventData?: Record<string, any>) => analytics.trackCustom(eventName, eventData);
