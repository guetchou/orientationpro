import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  CONSENT_CHANGED_EVENT,
  CONSENT_OPEN_EVENT,
  ConsentPreferences,
  readConsent,
  saveConsent,
} from '@/lib/privacyConsent';

type EditablePreferences = Pick<ConsentPreferences, 'analytics' | 'marketing' | 'support'>;

const defaultPreferences: EditablePreferences = {
  analytics: false,
  marketing: false,
  support: false,
};

const updateGoogleConsent = (preferences: EditablePreferences) => {
  const globalWindow = window as any;
  globalWindow.dataLayer = globalWindow.dataLayer || [];
  globalWindow.gtag = globalWindow.gtag || function gtag(...args: any[]) {
    globalWindow.dataLayer.push(args);
  };
  globalWindow.gtag('consent', 'update', {
    analytics_storage: preferences.analytics ? 'granted' : 'denied',
    ad_storage: preferences.marketing ? 'granted' : 'denied',
    ad_user_data: preferences.marketing ? 'granted' : 'denied',
    ad_personalization: preferences.marketing ? 'granted' : 'denied',
  });
};

const configureTrackers = (preferences: EditablePreferences) => {
  const googleId = String(import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '').trim();
  const metaPixelId = String(import.meta.env.VITE_META_PIXEL_ID || '').trim();
  const globalWindow = window as any;

  updateGoogleConsent(preferences);

  if (preferences.analytics && googleId && !document.getElementById('makoki-google-analytics')) {
    const script = document.createElement('script');
    script.id = 'makoki-google-analytics';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleId)}`;
    document.head.appendChild(script);
    globalWindow.gtag('js', new Date());
    globalWindow.gtag('config', googleId, {
      anonymize_ip: true,
      allow_google_signals: preferences.marketing,
      allow_ad_personalization_signals: preferences.marketing,
    });
  }

  if (metaPixelId) {
    if (!globalWindow.fbq) {
      const fbq = function (...args: any[]) {
        fbq.queue.push(args);
      } as any;
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = '2.0';
      globalWindow.fbq = fbq;
    }

    globalWindow.fbq('consent', preferences.marketing ? 'grant' : 'revoke');

    if (preferences.marketing && !document.getElementById('makoki-meta-pixel')) {
      const script = document.createElement('script');
      script.id = 'makoki-meta-pixel';
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);
      globalWindow.fbq('init', metaPixelId);
      globalWindow.fbq('track', 'PageView');
    }
  }
};

export const CookieConsentBanner = () => {
  const stored = readConsent();
  const [visible, setVisible] = useState(!stored);
  const [customizing, setCustomizing] = useState(false);
  const [preferences, setPreferences] = useState<EditablePreferences>(stored || defaultPreferences);

  useEffect(() => {
    configureTrackers(stored || defaultPreferences);

    const handleOpen = () => {
      const current = readConsent();
      setPreferences(current || defaultPreferences);
      setCustomizing(true);
      setVisible(true);
    };
    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<ConsentPreferences>).detail;
      configureTrackers(detail);
    };

    window.addEventListener(CONSENT_OPEN_EVENT, handleOpen);
    window.addEventListener(CONSENT_CHANGED_EVENT, handleChange);
    return () => {
      window.removeEventListener(CONSENT_OPEN_EVENT, handleOpen);
      window.removeEventListener(CONSENT_CHANGED_EVENT, handleChange);
    };
  }, []);

  const commit = (next: EditablePreferences) => {
    saveConsent(next);
    setPreferences(next);
    setVisible(false);
    setCustomizing(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-slate-200 bg-white px-4 py-3 shadow-xl" role="dialog" aria-label="Gestion des cookies">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 max-w-3xl">
            <h2 className="text-base font-semibold text-slate-950">Votre choix concernant les cookies</h2>
            <p className="mt-1 text-sm leading-5 text-slate-700">
              Nous utilisons des cookies nécessaires au fonctionnement du site et, avec votre accord, des cookies de mesure d’audience. <Link className="font-medium text-emerald-700 underline" to="/cookies">En savoir plus</Link>.
            </p>
          </div>
          {!customizing ? (
            <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-3">
              <Button variant="outline" size="sm" onClick={() => commit(defaultPreferences)}>Tout refuser</Button>
              <Button variant="outline" size="sm" onClick={() => setCustomizing(true)}>Personnaliser</Button>
              <Button size="sm" onClick={() => commit({ analytics: true, marketing: true, support: true })}>Tout accepter</Button>
            </div>
          ) : null}
        </div>

        {customizing ? (
          <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 md:grid-cols-3">
            {([
              ['analytics', 'Mesure d’audience', 'Autorise Google Analytics et les mesures locales de navigation.'],
              ['marketing', 'Publicité', 'Autorise Meta Pixel et les mesures de campagnes.'],
              ['support', 'Assistance', 'Autorise les outils de conversation et de support lorsqu’ils sont activés.'],
            ] as const).map(([key, label, description]) => (
              <label key={key} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4"
                  checked={preferences[key]}
                  onChange={(event) => setPreferences((current) => ({ ...current, [key]: event.target.checked }))}
                />
                <span><span className="block font-medium text-slate-950">{label}</span><span className="mt-1 block text-sm leading-5 text-slate-600">{description}</span></span>
              </label>
            ))}
            <div className="flex flex-col gap-2 md:col-span-3 sm:flex-row sm:justify-end">
              <Button variant="outline" size="sm" onClick={() => commit(defaultPreferences)}>Tout refuser</Button>
              <Button size="sm" onClick={() => commit(preferences)}>Enregistrer mes choix</Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CookieConsentBanner;
