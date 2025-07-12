import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Settings, Users, Globe, FileText, MessageSquare, Brain, Trophy, BarChart3, Shield, Palette } from 'lucide-react';

// Import des composants ATS
import { CVUploadZone } from '@/components/admin/ats/CVUploadZone';
import { CandidatesList } from '@/components/admin/ats/CandidatesList';
import { CandidatePipeline } from '@/components/admin/ats/CandidatePipeline';
import { CommunicationCenter } from '@/components/admin/ats/CommunicationCenter';
import { IntegratedCalendar } from '@/components/admin/ats/IntegratedCalendar';
import { AnalyticsDashboard } from '@/components/admin/ats/AnalyticsDashboard';
import { NotificationCenter } from '@/components/admin/ats/NotificationCenter';
import { AIMatchingEngine } from '@/components/admin/ats/AIMatchingEngine';
import { MobileNavigation } from '@/components/admin/ats/MobileNavigation';
import { JobPostingManager } from '@/components/admin/ats/JobPostingManager';
import { CVParsingEngine } from '@/components/admin/ats/CVParsingEngine';
import { AssessmentCenter } from '@/components/admin/ats/AssessmentCenter';
import { WhatsAppIntegration } from '@/components/admin/ats/WhatsAppIntegration';
import { MultilingualSupport } from '@/components/admin/ats/MultilingualSupport';
import { AIAdvancedEngine } from '@/components/admin/ats/AIAdvancedEngine';
import { PredictiveAnalytics } from '@/components/admin/ats/PredictiveAnalytics';
import { MobileCandidateApp } from '@/components/admin/ats/MobileCandidateApp';
import { ExternalIntegrations } from '@/components/admin/ats/ExternalIntegrations';
import GamificationSystem from '@/components/admin/ats/GamificationSystem';
import AdvancedReporting from '@/components/admin/ats/AdvancedReporting';
import SecurityCompliance from '@/components/admin/ats/SecurityCompliance';
import CustomizationThemes from '@/components/admin/ats/CustomizationThemes';

// Import des types
import { PipelineStage } from '@/types/pipeline';

export default function ATSAdmin() {
  const [activeTab, setActiveTab] = useState('upload');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Données simulées pour les candidats - corrigées pour correspondre au type Candidate
  const mockCandidates = [
    {
      id: '1',
      full_name: 'Marie Dubois',
      email: 'marie.dubois@email.com',
      phone: '+33 6 12 34 56 78',
      position: 'Développeur React',
      experience: '5 ans',
      motivation: 'Passionnée par le développement frontend',
      rating: 4.5,
      status: 'new',
      resume_url: null,
      notes: null,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      full_name: 'Pierre Martin',
      email: 'pierre.martin@email.com',
      phone: '+33 6 98 76 54 32',
      position: 'Designer UX',
      experience: '3 ans',
      motivation: 'Expert en expérience utilisateur',
      rating: 4.2,
      status: 'screening',
      resume_url: null,
      notes: null,
      created_at: new Date().toISOString()
    }
  ];

  const statusColors = {
    new: '#3B82F6',
    screening: '#EAB308',
    interview: '#8B5CF6',
    offer: '#10B981',
    hired: '#059669'
  };

  // Données simulées pour le pipeline
  const pipelineStages: PipelineStage[] = [
    {
      id: 'new',
      name: 'Nouveaux',
      color: '#3B82F6',
      candidates: [
        {
          id: '1',
          name: 'Marie Dubois',
          email: 'marie.dubois@email.com',
          position: 'Développeur React',
          rating: 4.5,
          daysInStage: 2
        },
        {
          id: '2',
          name: 'Pierre Martin',
          email: 'pierre.martin@email.com',
          position: 'Designer UX',
          rating: 4.2,
          daysInStage: 1
        }
      ]
    },
    {
      id: 'screening',
      name: 'Présélection',
      color: '#EAB308',
      candidates: [
        {
          id: '3',
          name: 'Sophie Laurent',
          email: 'sophie.laurent@email.com',
          position: 'Chef de Projet',
          rating: 4.8,
          daysInStage: 5
        }
      ]
    },
    {
      id: 'interview',
      name: 'Entretien',
      color: '#8B5CF6',
      candidates: [
        {
          id: '4',
          name: 'Thomas Moreau',
          email: 'thomas.moreau@email.com',
          position: 'Développeur Python',
          rating: 4.3,
          daysInStage: 3
        }
      ]
    },
    {
      id: 'offer',
      name: 'Offre',
      color: '#10B981',
      candidates: []
    },
    {
      id: 'hired',
      name: 'Embauché',
      color: '#059669',
      candidates: []
    }
  ];

  const handleCandidateMove = (candidateId: string, fromStage: string, toStage: string) => {
    console.log(`Moving candidate ${candidateId} from ${fromStage} to ${toStage}`);
  };

  const handleCandidateClick = (candidateId: string) => {
    console.log(`Viewing candidate ${candidateId}`);
  };

  const handleCandidateCreated = (candidate: any) => {
    console.log('New candidate created:', candidate);
  };

  const handleStatusChange = (candidateId: string, newStatus: string) => {
    console.log(`Changing status for candidate ${candidateId} to ${newStatus}`);
  };

  const handleViewDetails = (candidateId: string) => {
    console.log(`Viewing details for candidate ${candidateId}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'jobs':
        return <JobPostingManager />;
      case 'parsing':
        return <CVParsingEngine />;
      case 'upload':
        return <CVUploadZone onCandidateCreated={handleCandidateCreated} />;
      case 'candidates':
        return (
          <CandidatesList 
            candidates={mockCandidates}
            loading={false}
            statusColors={statusColors}
            onStatusChange={handleStatusChange}
            onViewDetails={handleViewDetails}
          />
        );
      case 'pipeline':
        return (
          <CandidatePipeline 
            stages={pipelineStages}
            onCandidateMove={handleCandidateMove}
            onCandidateClick={handleCandidateClick}
          />
        );
      case 'matching':
        return <AIMatchingEngine />;
      case 'assessments':
        return <AssessmentCenter />;
      case 'communication':
        return <CommunicationCenter />;
      case 'calendar':
        return <IntegratedCalendar />;
      case 'analytics':
        return (
          <AnalyticsDashboard 
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        );
      case 'notifications':
        return <NotificationCenter />;
      case 'whatsapp':
        return <WhatsAppIntegration />;
      case 'multilingual':
        return <MultilingualSupport />;
      case 'aiAdvanced':
        return <AIAdvancedEngine />;
      case 'predictiveAnalytics':
        return <PredictiveAnalytics />;
      case 'mobileCandidateApp':
        return <MobileCandidateApp />;
      case 'externalIntegrations':
        return <ExternalIntegrations />;
      case 'gamification':
        return <GamificationSystem />;
      case 'advancedReporting':
        return <AdvancedReporting />;
      case 'securityCompliance':
        return <SecurityCompliance />;
      case 'customizationThemes':
        return <CustomizationThemes />;
      default:
        return <CVUploadZone onCandidateCreated={handleCandidateCreated} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto p-6">
        {/* Navigation mobile */}
        <div className="block md:hidden mb-6">
          <MobileNavigation 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </div>

        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Système ATS Intelligent
            </h1>
            <p className="text-gray-600 mt-1">
              Gestion avancée des candidatures avec IA
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              42 candidats actifs
            </Badge>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
          </div>
        </div>

        {/* Navigation desktop */}
        <div className="hidden md:block">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-14 w-full">
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Offres
              </TabsTrigger>
              <TabsTrigger value="parsing" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Parsing CV
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Upload CV
              </TabsTrigger>
              <TabsTrigger value="candidates">Candidats</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="matching">Matching IA</TabsTrigger>
              <TabsTrigger value="assessments">Tests</TabsTrigger>
              <TabsTrigger value="communication">Messages</TabsTrigger>
              <TabsTrigger value="calendar">Calendrier</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="notifications">Alertes</TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="multilingual" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Multilingue
              </TabsTrigger>
              <TabsTrigger value="aiAdvanced" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                IA Avancée
              </TabsTrigger>
              <TabsTrigger value="predictiveAnalytics" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Analyse Prédictive
              </TabsTrigger>
              <TabsTrigger value="mobileCandidateApp" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Mobile Candidate App
              </TabsTrigger>
              <TabsTrigger value="externalIntegrations" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Intégrations Externes
              </TabsTrigger>
              <TabsTrigger value="gamification" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Gamification
              </TabsTrigger>
              <TabsTrigger value="advancedReporting" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Rapport Avancé
              </TabsTrigger>
              <TabsTrigger value="securityCompliance" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sécurité
              </TabsTrigger>
              <TabsTrigger value="customizationThemes" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Personnalisation
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {renderTabContent()}
            </div>
          </Tabs>
        </div>

        {/* Contenu mobile */}
        <div className="block md:hidden">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
