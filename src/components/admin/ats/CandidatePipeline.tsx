
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, ArrowRight, Clock, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface PipelineCandidate {
  id: string;
  name: string;
  email: string;
  position: string;
  rating: number;
  daysInStage: number;
  avatar?: string;
}

interface PipelineStage {
  id: string;
  name: string;
  candidates: PipelineCandidate[];
  color: string;
  limit?: number;
}

interface CandidatePipelineProps {
  stages: PipelineStage[];
  onCandidateMove: (candidateId: string, fromStage: string, toStage: string) => void;
  onCandidateClick: (candidateId: string) => void;
}

const stageVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 }
};

const candidateVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.8 }
};

export const CandidatePipeline: React.FC<CandidatePipelineProps> = ({
  stages,
  onCandidateMove,
  onCandidateClick
}) => {
  const [draggedCandidate, setDraggedCandidate] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragStart = (candidateId: string) => {
    setDraggedCandidate(candidateId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDrop = (e: React.DragEvent, toStageId: string) => {
    e.preventDefault();
    if (draggedCandidate) {
      const fromStage = stages.find(stage => 
        stage.candidates.some(c => c.id === draggedCandidate)
      );
      if (fromStage && fromStage.id !== toStageId) {
        onCandidateMove(draggedCandidate, fromStage.id, toStageId);
      }
    }
    setDraggedCandidate(null);
    setDragOverStage(null);
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6">
      {stages.map((stage, stageIndex) => (
        <motion.div
          key={stage.id}
          variants={stageVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: stageIndex * 0.1 }}
          className="flex-shrink-0 w-80"
        >
          <Card 
            className={`h-full transition-all duration-300 ${
              dragOverStage === stage.id ? 'ring-2 ring-primary shadow-lg' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-3 h-3 rounded-full ${stage.color}`}
                  />
                  <span className="text-sm font-medium">{stage.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {stage.candidates.length}
                    {stage.limit && `/${stage.limit}`}
                  </Badge>
                  {stage.limit && stage.candidates.length >= stage.limit && (
                    <Badge variant="destructive" className="text-xs">
                      Plein
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {stage.candidates.map((candidate, candidateIndex) => (
                  <motion.div
                    key={candidate.id}
                    variants={candidateVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ delay: candidateIndex * 0.05 }}
                    layout
                    draggable
                    onDragStart={() => handleDragStart(candidate.id)}
                    className={`p-3 rounded-lg border cursor-move transition-all duration-200 hover:shadow-md ${
                      draggedCandidate === candidate.id ? 'opacity-50 transform rotate-2' : ''
                    } bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700`}
                    onClick={() => onCandidateClick(candidate.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-sm font-medium truncate max-w-32">
                            {candidate.name}
                          </h4>
                          <p className="text-xs text-gray-500 truncate max-w-32">
                            {candidate.email}
                          </p>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => onCandidateClick(candidate.id)}>
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Programmer entretien
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Envoyer email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">
                        {candidate.position}
                      </Badge>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {renderStars(candidate.rating)}
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {candidate.daysInStage}j
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="mt-2 flex gap-1">
                      {stages.map((s, i) => (
                        <div
                          key={s.id}
                          className={`h-1 flex-1 rounded ${
                            i <= stageIndex ? stage.color : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {stage.candidates.length === 0 && (
                <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-600">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📋</div>
                    <p className="text-sm">Aucun candidat</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
