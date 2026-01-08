
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CandidateHeaderProps {
  name: string;
  status: string;
  statusColors: Record<string, string>;
  createdDate: string;
}

export const CandidateHeader: React.FC<CandidateHeaderProps> = ({
  name,
  status,
  statusColors,
  createdDate
}) => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button 
        variant="ghost" 
        onClick={() => navigate('/admin/ats')} 
        className="mb-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
      </Button>
      <h1 className="text-3xl font-bold dark:text-white">{name}</h1>
      <div className="flex items-center mt-2">
        <Badge variant="secondary" className={statusColors[status]}>
          {status}
        </Badge>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-4">Candidature reçue le {createdDate}</span>
      </div>
    </motion.div>
  );
};
