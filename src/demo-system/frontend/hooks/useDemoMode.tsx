import { useState, useEffect, createContext, useContext } from 'react';
import { Database } from 'lucide-react';

interface DemoData {
  userCount: number;
  testCount: number;
  lastActivity: string;
  demoSessionId: string;
}

interface DemoContextType {
  isDemoMode: boolean;
  demoData: DemoData | null;
  toggleDemoMode: () => void;
  setDemoMode: (enabled: boolean) => void;
  getDemoIndicator: () => React.ReactNode;
}

const DemoContext = createContext<DemoContextType | null>(null);

export const useDemoMode = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoProvider');
  }
  return context;
};

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoData, setDemoData] = useState<DemoData | null>(null);

  // Détecter le mode DEMO au chargement
  useEffect(() => {
    const detectDemoMode = () => {
      // Vérifier le localStorage
      const storedDemoMode = localStorage.getItem('demo_mode');
      if (storedDemoMode === 'true') {
        setIsDemoMode(true);
        return;
      }

      // Vérifier les cookies
      const demoCookie = document.cookie.includes('demo_mode=true');
      if (demoCookie) {
        setIsDemoMode(true);
        return;
      }

      // Vérifier les headers (pour les requêtes API)
      const demoHeader = document.querySelector('meta[name="demo-mode"]');
      if (demoHeader?.getAttribute('content') === 'true') {
        setIsDemoMode(true);
      }
    };

    detectDemoMode();
  }, []);

  // Charger les données de démonstration
  useEffect(() => {
    if (isDemoMode) {
      loadDemoData();
    }
  }, [isDemoMode]);

  const loadDemoData = async () => {
    try {
      const response = await fetch('/api/demo/data', {
        headers: {
          'X-Demo-Mode': 'true'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDemoData(data);
      }
    } catch (error) {
      console.log('Mode démo: données simulées');
      setDemoData({
        userCount: 15,
        testCount: 42,
        lastActivity: new Date().toISOString(),
        demoSessionId: `demo_${Date.now()}`
      });
    }
  };

  const toggleDemoMode = () => {
    const newMode = !isDemoMode;
    setIsDemoMode(newMode);
    
    if (newMode) {
      localStorage.setItem('demo_mode', 'true');
      document.cookie = 'demo_mode=true; path=/; max-age=3600';
    } else {
      localStorage.removeItem('demo_mode');
      document.cookie = 'demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    
    if (enabled) {
      localStorage.setItem('demo_mode', 'true');
      document.cookie = 'demo_mode=true; path=/; max-age=3600';
    } else {
      localStorage.removeItem('demo_mode');
      document.cookie = 'demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

  const getDemoIndicator = () => {
    if (!isDemoMode) return null;
    
    return (
      <div className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
        <Database className="h-3 w-3" />
        <span>DEMO</span>
      </div>
    );
  };

  const value: DemoContextType = {
    isDemoMode,
    demoData,
    toggleDemoMode,
    setDemoMode,
    getDemoIndicator
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
};
