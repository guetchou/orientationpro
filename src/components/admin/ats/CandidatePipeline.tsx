
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Star } from 'lucide-react';
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
  const handleDragStart = (e: React.DragEvent, candidate: PipelineCandidate, stageId: string) => {
    e.dataTransfer.setData('candidateId', candidate.id);
    e.dataTransfer.setData('fromStage', stageId);
  };

  const handleDrop = (e: React.DragEvent, toStage: string) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('candidateId');
    const fromStage = e.dataTransfer.getData('fromStage');
    
    if (candidateId && fromStage !== toStage) {
      onCandidateMove(candidateId, fromStage, toStage);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pipeline de Recrutement</h2>
        <Badge variant="outline">
          {stages.reduce((acc, stage) => acc + stage.candidates.length, 0)} candidats actifs
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-[600px]">
        {stages.map((stage) => (
          <Card
            key={stage.id}
            className="border-t-4 hover:shadow-lg transition-shadow duration-300"
            style={{ borderTopColor: stage.color.replace('bg-', '#') }}
            onDrop={(e) => handleDrop(e, stage.id)}
            onDragOver={handleDragOver}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{stage.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {stage.candidates.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {stage.candidates.map((candidate, index) => {
                  const initials = candidate.name.split(' ').map(n => n[0]).join('');
                  
                  return (
                    <motion.div
                      key={candidate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="bg-white dark:bg-gray-800 rounded-lg border p-3 cursor-move hover:shadow-md transition-all duration-200"
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidate, stage.id)}
                      onClick={() => onCandidateClick(candidate.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {candidate.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {candidate.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                            {candidate.position}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {candidate.daysInStage}j
                            </div>
                            
                            {candidate.rating && candidate.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs">{candidate.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {stage.candidates.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl">📭</span>
                  </div>
                  Aucun candidat
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
