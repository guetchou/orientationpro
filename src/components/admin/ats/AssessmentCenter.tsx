import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Video, 
  Eye, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Play,
  Pause,
  Stop,
  Camera,
  Mic,
  Monitor,
  Shield,
  Plus,
  Edit,
  Trash2,
  Download,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

interface Assessment {
  id: string;
  title: string;
  type: 'technical' | 'logical' | 'personality' | 'language' | 'custom';
  duration: number; // en minutes
  questions: Question[];
  candidates: CandidateAssessment[];
  settings: AssessmentSettings;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: string;
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'text' | 'code' | 'video';
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  timeLimit?: number;
}

interface CandidateAssessment {
  id: string;
  candidateId: string;
  candidateName: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'flagged';
  startTime?: string;
  endTime?: string;
  score?: number;
  maxScore: number;
  proctoringFlags: ProctoringFlag[];
  videoRecording?: string;
  screenRecording?: string;
}

interface ProctoringFlag {
  type: 'face-not-visible' | 'multiple-faces' | 'screen-switch' | 'tab-switch' | 'noise-detected';
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

interface AssessmentSettings {
  enableVideoRecording: boolean;
  enableScreenRecording: boolean;
  enableProctoring: boolean;
  allowTabSwitch: boolean;
  requireFaceVisible: boolean;
  maxAttempts: number;
  timeLimit: number;
  shuffleQuestions: boolean;
  showResults: boolean;
}

export const AssessmentCenter = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [assessments, setAssessments] = useState<Assessment[]>([
    {
      id: '1',
      title: 'Test Technique Développeur Full-Stack',
      type: 'technical',
      duration: 60,
      questions: [
        {
          id: '1',
          type: 'multiple-choice',
          question: 'Quelle est la différence entre React et Vue.js ?',
          options: [
            'React utilise JSX, Vue utilise des templates',
            'Vue est plus rapide que React',
            'React est plus populaire que Vue',
            'Aucune différence'
          ],
          correctAnswer: 'React utilise JSX, Vue utilise des templates',
          points: 10
        },
        {
          id: '2',
          type: 'code',
          question: 'Écrivez une fonction qui inverse une chaîne de caractères',
          points: 20,
          timeLimit: 300
        }
      ],
      candidates: [
        {
          id: '1',
          candidateId: 'c1',
          candidateName: 'Marie Dubois',
          status: 'completed',
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T11:00:00Z',
          score: 85,
          maxScore: 100,
          proctoringFlags: [
            {
              type: 'tab-switch',
              timestamp: '2024-01-15T10:30:00Z',
              severity: 'medium',
              description: 'Changement d\'onglet détecté'
            }
          ]
        }
      ],
      settings: {
        enableVideoRecording: true,
        enableScreenRecording: true,
        enableProctoring: true,
        allowTabSwitch: false,
        requireFaceVisible: true,
        maxAttempts: 1,
        timeLimit: 3600,
        shuffleQuestions: true,
        showResults: false
      },
      status: 'active',
      createdAt: '2024-01-10T09:00:00Z'
    }
  ]);

  const [newAssessment, setNewAssessment] = useState({
    title: '',
    type: 'technical' as const,
    duration: 30,
    enableVideoRecording: true,
    enableScreenRecording: true,
    enableProctoring: true
  });

  const assessmentTypes = [
    { id: 'technical', name: 'Test Technique', icon: FileText },
    { id: 'logical', name: 'Test Logique', icon: FileText },
    { id: 'personality', name: 'Test de Personnalité', icon: FileText },
    { id: 'language', name: 'Test de Langue', icon: FileText },
    { id: 'custom', name: 'Test Personnalisé', icon: FileText }
  ];

  const handleCreateAssessment = () => {
    if (!newAssessment.title) {
      toast.error('Veuillez saisir un titre pour l\'évaluation');
      return;
    }

    const assessment: Assessment = {
      id: Date.now().toString(),
      title: newAssessment.title,
      type: newAssessment.type,
      duration: newAssessment.duration,
      questions: [],
      candidates: [],
      settings: {
        enableVideoRecording: newAssessment.enableVideoRecording,
        enableScreenRecording: newAssessment.enableScreenRecording,
        enableProctoring: newAssessment.enableProctoring,
        allowTabSwitch: false,
        requireFaceVisible: true,
        maxAttempts: 1,
        timeLimit: newAssessment.duration * 60,
        shuffleQuestions: true,
        showResults: false
      },
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    setAssessments([...assessments, assessment]);
    setNewAssessment({
      title: '', type: 'technical', duration: 30,
      enableVideoRecording: true, enableScreenRecording: true, enableProctoring: true
    });
    toast.success('Évaluation créée avec succès');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCandidateStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Centre d'Évaluation</h2>
          <p className="text-gray-600">Tests techniques, logiques et évaluations avec e-proctoring</p>
        </div>
        <Button onClick={() => setActiveTab('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Évaluation
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Créer</TabsTrigger>
          <TabsTrigger value="manage">Gérer</TabsTrigger>
          <TabsTrigger value="monitor">Surveiller</TabsTrigger>
          <TabsTrigger value="results">Résultats</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle Évaluation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Titre de l'évaluation *</label>
                  <Input
                    value={newAssessment.title}
                    onChange={(e) => setNewAssessment({...newAssessment, title: e.target.value})}
                    placeholder="Test Technique Développeur Full-Stack"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type d'évaluation</label>
                  <Select value={newAssessment.type} onValueChange={(value: any) => setNewAssessment({...newAssessment, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {assessmentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Durée (minutes)</label>
                  <Input
                    type="number"
                    value={newAssessment.duration}
                    onChange={(e) => setNewAssessment({...newAssessment, duration: parseInt(e.target.value)})}
                    min="5"
                    max="180"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Paramètres de surveillance</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="videoRecording"
                      checked={newAssessment.enableVideoRecording}
                      onChange={(e) => setNewAssessment({...newAssessment, enableVideoRecording: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="videoRecording" className="text-sm flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Enregistrement vidéo
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="screenRecording"
                      checked={newAssessment.enableScreenRecording}
                      onChange={(e) => setNewAssessment({...newAssessment, enableScreenRecording: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="screenRecording" className="text-sm flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Enregistrement écran
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="proctoring"
                      checked={newAssessment.enableProctoring}
                      onChange={(e) => setNewAssessment({...newAssessment, enableProctoring: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="proctoring" className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      E-proctoring
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleCreateAssessment} className="flex-1">
                  Créer l'évaluation
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('manage')}>
                  Voir toutes les évaluations
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid gap-4">
            {assessments.map((assessment) => (
              <Card key={assessment.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{assessment.title}</h3>
                        <Badge className={getStatusColor(assessment.status)}>
                          {assessment.status === 'active' ? 'Actif' : 
                           assessment.status === 'draft' ? 'Brouillon' :
                           assessment.status === 'paused' ? 'En pause' : 'Terminé'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {assessment.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {assessment.candidates.length} candidats
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {assessment.questions.length} questions
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        Type: {assessmentTypes.find(t => t.id === assessment.type)?.name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      {assessment.status === 'draft' && (
                        <Button size="sm">
                          Activer
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Surveillance en Temps Réel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {assessments
                  .filter(a => a.status === 'active')
                  .flatMap(a => a.candidates.filter(c => c.status === 'in-progress'))
                  .map((candidate) => (
                    <div key={candidate.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{candidate.candidateName}</h4>
                          <p className="text-sm text-gray-600">Test en cours</p>
                        </div>
                        <Badge className={getCandidateStatusColor(candidate.status)}>
                          {candidate.status === 'in-progress' ? 'En cours' : 
                           candidate.status === 'flagged' ? 'Signalé' : 'Terminé'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Camera className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Vidéo active</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Écran enregistré</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">E-proctoring actif</span>
                        </div>
                      </div>

                      {candidate.proctoringFlags.length > 0 && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium text-red-700">
                              {candidate.proctoringFlags.length} alerte(s) détectée(s)
                            </span>
                          </div>
                          {candidate.proctoringFlags.map((flag, index) => (
                            <div key={index} className="text-xs text-red-600">
                              {flag.description} - {new Date(flag.timestamp).toLocaleTimeString()}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Résultats des Évaluations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessments
                  .flatMap(a => a.candidates.filter(c => c.status === 'completed'))
                  .map((candidate) => (
                    <div key={candidate.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{candidate.candidateName}</h4>
                          <p className="text-sm text-gray-600">
                            Score: {candidate.score}/{candidate.maxScore} ({Math.round((candidate.score || 0) / candidate.maxScore * 100)}%)
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {candidate.proctoringFlags.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-700">
                          ⚠️ {candidate.proctoringFlags.length} alerte(s) de surveillance
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 