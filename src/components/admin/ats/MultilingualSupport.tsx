import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Globe, 
  Languages, 
  Translate, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  isActive: boolean;
  isDefault: boolean;
  completion: number;
}

interface TranslationKey {
  key: string;
  category: string;
  translations: Record<string, string>;
  isRequired: boolean;
}

export const MultilingualSupport = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [detectLanguage, setDetectLanguage] = useState(true);

  const languages: Language[] = [
    { code: 'fr', name: 'French', nativeName: 'Français', isActive: true, isDefault: true, completion: 100 },
    { code: 'en', name: 'English', nativeName: 'English', isActive: true, isDefault: false, completion: 85 },
    { code: 'es', name: 'Spanish', nativeName: 'Español', isActive: true, isDefault: false, completion: 70 },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', isActive: false, isDefault: false, completion: 45 },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', isActive: false, isDefault: false, completion: 30 },
    { code: 'zh', name: 'Chinese', nativeName: '中文', isActive: false, isDefault: false, completion: 20 }
  ];

  const translationKeys: TranslationKey[] = [
    {
      key: 'job_posting',
      category: 'Job Postings',
      translations: {
        fr: 'Publication d\'offre',
        en: 'Job Posting',
        es: 'Publicación de empleo',
        pt: 'Publicação de vaga',
        ar: 'نشر وظيفة',
        zh: '职位发布'
      },
      isRequired: true
    },
    {
      key: 'candidate_profile',
      category: 'Candidate Management',
      translations: {
        fr: 'Profil candidat',
        en: 'Candidate Profile',
        es: 'Perfil del candidato',
        pt: 'Perfil do candidato',
        ar: 'ملف المرشح',
        zh: '候选人档案'
      },
      isRequired: true
    },
    {
      key: 'interview_scheduled',
      category: 'Communication',
      translations: {
        fr: 'Entretien programmé',
        en: 'Interview Scheduled',
        es: 'Entrevista programada',
        pt: 'Entrevista agendada',
        ar: 'مقابلة مجدولة',
        zh: '面试已安排'
      },
      isRequired: true
    }
  ];

  const handleLanguageToggle = (languageCode: string) => {
    toast.success(`Langue ${languageCode} ${languages.find(l => l.code === languageCode)?.isActive ? 'désactivée' : 'activée'}`);
  };

  const handleSetDefault = (languageCode: string) => {
    toast.success(`${languages.find(l => l.code === languageCode)?.nativeName} défini comme langue par défaut`);
  };

  const handleExportTranslations = (languageCode: string) => {
    toast.success(`Traductions exportées pour ${languages.find(l => l.code === languageCode)?.nativeName}`);
  };

  const handleImportTranslations = () => {
    toast.success('Traductions importées avec succès');
  };

  const getCompletionColor = (completion: number) => {
    if (completion >= 80) return 'text-green-600';
    if (completion >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support Multilingue</h2>
          <p className="text-gray-600">Gestion des traductions et localisation de l'ATS</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {languages.filter(l => l.isActive).length} langues actives
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
        </div>
      </div>

      {/* Configuration générale */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration générale</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Langue par défaut</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.filter(l => l.isActive).map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Langue de détection automatique</Label>
              <Select defaultValue="auto">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Détection automatique</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch 
                id="autoTranslate" 
                checked={autoTranslate} 
                onCheckedChange={setAutoTranslate}
              />
              <Label htmlFor="autoTranslate">Traduction automatique</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="detectLanguage" 
                checked={detectLanguage} 
                onCheckedChange={setDetectLanguage}
              />
              <Label htmlFor="detectLanguage">Détection automatique de langue</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestion des langues */}
      <Card>
        <CardHeader>
          <CardTitle>Langues supportées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {languages.map((language) => (
              <div key={language.code} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getFlagEmoji(language.code)}</span>
                    <div>
                      <div className="font-semibold">{language.nativeName}</div>
                      <div className="text-sm text-gray-500">{language.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {language.isDefault && (
                      <Badge variant="default" className="text-xs">
                        Par défaut
                      </Badge>
                    )}
                    <Badge variant={language.isActive ? "default" : "secondary"} className="text-xs">
                      {language.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                    <span className={`text-sm ${getCompletionColor(language.completion)}`}>
                      {language.completion}% complet
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLanguageToggle(language.code)}
                  >
                    {language.isActive ? 'Désactiver' : 'Activer'}
                  </Button>
                  {!language.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSetDefault(language.code)}
                    >
                      Définir par défaut
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportTranslations(language.code)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gestion des traductions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestion des traductions</CardTitle>
            <Button onClick={handleImportTranslations}>
              <Upload className="h-4 w-4 mr-2" />
              Importer traductions
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {translationKeys.map((key) => (
              <div key={key.key} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{key.key}</h4>
                    <p className="text-sm text-gray-500">{key.category}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {key.isRequired && (
                      <Badge variant="destructive" className="text-xs">
                        Requis
                      </Badge>
                    )}
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {languages.filter(l => l.isActive).map(lang => (
                    <div key={lang.code} className="text-sm">
                      <div className="font-medium text-gray-600">{lang.nativeName}:</div>
                      <div className="text-gray-900">{key.translations[lang.code] || 'Non traduit'}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aperçu multilingue */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu multilingue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Interface utilisateur</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>Français</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>English</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>Español</span>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Emails automatiques</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>Français</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>English</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>Español</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Fonction utilitaire pour obtenir l'emoji du drapeau
const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}; 