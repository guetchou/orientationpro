import { DemoProvider } from "./demo-system/frontend/hooks/useDemoMode";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AppRouter } from "@/router/AppRouter";
import { AuthProvider } from "@/hooks/useAuth";
import { OfflineBanner } from "@/components/offline/OfflineBanner";
import { WebVitalsMonitor } from "@/components/monitoring/WebVitalsMonitor";
import { useEffect } from "react";
import { analytics, trackPageView } from "@/services/analytics/FrontendAnalytics";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    },
  },
});

function App() {
  useEffect(() => {
    // Track initial page view
    trackPageView(window.location.pathname, document.title);

    // Track navigation changes
    const handleLocationChange = () => {
      trackPageView(window.location.pathname, document.title);
    };

    // Écouter les changements de route avec History API
    window.addEventListener('popstate', handleLocationChange);

    // Nettoyage
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      // Flush analytics avant de quitter
      analytics.flush();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <DemoProvider>
        <AuthProvider>
          <WebVitalsMonitor />
          <OfflineBanner />
          <AppRouter />
          <Toaster />
        </AuthProvider>
      </DemoProvider>
    </QueryClientProvider>
  );
}

export default App;
