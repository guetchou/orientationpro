
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const ResultsActions = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-between mt-6">
      <Button variant="outline" onClick={() => navigate('/dashboard')}>
        Retour au tableau de bord
      </Button>
      <Button onClick={() => window.print()}>
        <ExternalLink className="h-4 w-4 mr-2" />
        Exporter en PDF
      </Button>
    </div>
  );
};

export default ResultsActions;
