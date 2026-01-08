import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Star, 
  Mail, 
  Phone, 
  Calendar, 
  MoreVertical,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PipelineStage, PipelineCandidate } from '@/types/pipeline';

interface CandidatePipelineProps {
  stages: PipelineStage[];
  onCandidateMove: (candidateId: string, fromStage: string, toStage: string) => void;
  onCandidateClick: (candidateId: string) => void;
}

export const CandidatePipeline: React.FC<CandidatePipelineProps> = ({
  stages,
  onCandidateMove,
  onCandidateClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedCandidate, setDraggedCandidate] = useState<PipelineCandidate | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragStart = (candidate: PipelineCandidate) => {
    setDraggedCandidate(candidate);
  };

  const handleDragEnd = () => {
    setDraggedCandidate(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    if (draggedCandidate) {
      const sourceStage = stages.find(stage => 
        stage.candidates.some(c => c.id === draggedCandidate.id)
      );
      if (sourceStage && sourceStage.id !== targetStageId) {
        onCandidateMove(draggedCandidate.id, sourceStage.id, targetStageId);
      }
    }
    setDragOverStage(null);
  };

  const filteredStages = stages.map(stage => ({
    ...stage,
    candidates: stage.candidates.filter(candidate =>
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }));

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pipeline des Candidats</h2>
        <Input
          type="search"
          placeholder="Rechercher un candidat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Pipeline stages */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[600px] overflow-x-auto">
        {filteredStages.map((stage, index) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-200 ${
              dragOverStage === stage.id ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'
            }`}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {stage.name}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {stage.candidates.length}
                </Badge>
              </div>
            </div>

            <div className="p-4 space-y-3 h-[500px] overflow-y-auto">
              <AnimatePresence>
                {stage.candidates.map((candidate, candidateIndex) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: candidateIndex * 0.05 }}
                    draggable
                    onDragStart={() => handleDragStart(candidate)}
                    onDragEnd={handleDragEnd}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 cursor-move hover:shadow-md transition-all duration-200 group"
                    onClick={() => onCandidateClick(candidate.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {candidate.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {candidate.position}
                        </p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onCandidateClick(candidate.id)}>
                            <Users className="h-4 w-4 mr-2" />
                            Voir le profil
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Envoyer un email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="h-4 w-4 mr-2" />
                            Appeler
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {candidate.daysInStage} jours
                      </div>
                      
                      {candidate.rating && (
                        <div className="flex items-center gap-1 text-xs text-yellow-500">
                          <Star className="h-3 w-3" />
                          {candidate.rating}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
