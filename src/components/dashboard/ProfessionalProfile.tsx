
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileBarChart, 
  BookOpen, 
  Briefcase, 
  Brain, 
  ChevronRight,
  Star,
  Download
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProfessionalProfileProps {
  testsCompleted: number;
  onNavigate: (path: string) => void;
}

export const ProfessionalProfile = ({ testsCompleted, onNavigate }: ProfessionalProfileProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const domains = [
    { name: "Informatique", score: 85 },
    { name: "Développement web", score: 78 },
    { name: "Intelligence artificielle", score: 72 },
    { name: "Data science", score: 68 },
    { name: "Cybersécurité", score: 64 }
  ];
  
  const traits = [
    { name: "Analytique", score: 85 },
    { name: "Créatif", score: 70 },
    { name: "Logique", score: 90 },
    { name: "Autonome", score: 75 },
    { name: "Collaboratif", score: 65 }
  ];
  
  const skills = [
    { name: "Résolution de problèmes", score: 88 },
    { name: "Pensée critique", score: 82 },
    { name: "Communication technique", score: 75 },
    { name: "Apprentissage rapide", score: 80 },
    { name: "Adaptation", score: 78 }
  ];
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  const downloadProfile = () => {
    console.log("Téléchargement du profil professionnel");
    // Ici, vous pourriez implémenter la génération d'un PDF
    // Ou rediriger vers une page de génération de PDF
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-primary" />
              Profil professionnel
            </CardTitle>
            <CardDescription>
              D'après vos résultats de tests
            </CardDescription>
          </div>
          
          {testsCompleted > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadProfile}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exporter</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Télécharger votre profil au format PDF</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {testsCompleted > 0 ? (
          <div className="space-y-6">
            <div>
              <button 
                onClick={() => toggleSection('domains')}
                className="w-full flex justify-between items-center text-left mb-2"
              >
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                  Domaines recommandés
                </h4>
                <ChevronRight 
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                    expandedSection === 'domains' ? 'rotate-90' : ''
                  }`} 
                />
              </button>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {domains.slice(0, 3).map((domain) => (
                  <Badge key={domain.name} variant="secondary" className="flex items-center gap-1">
                    {domain.name}
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </Badge>
                ))}
              </div>
              
              <AnimatePresence>
                {expandedSection === 'domains' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-2 mt-3">
                      {domains.map((domain) => (
                        <li key={domain.name} className="flex items-center justify-between">
                          <span className="text-sm">{domain.name}</span>
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">{domain.score}%</span>
                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="bg-blue-500 h-full" 
                                style={{ width: `${domain.score}%` }}
                              ></div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Separator />
            
            <div>
              <button 
                onClick={() => toggleSection('traits')}
                className="w-full flex justify-between items-center text-left mb-2"
              >
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <Brain className="h-4 w-4 mr-2 text-purple-500" />
                  Traits de personnalité
                </h4>
                <ChevronRight 
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                    expandedSection === 'traits' ? 'rotate-90' : ''
                  }`} 
                />
              </button>
              
              <ul className="space-y-1 text-sm">
                {traits.slice(0, 3).map((trait) => (
                  <li key={trait.name} className="flex items-center justify-between">
                    <span>{trait.name}</span>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full" 
                        style={{ width: `${trait.score}%` }}
                      ></div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <AnimatePresence>
                {expandedSection === 'traits' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-1 text-sm mt-3">
                      {traits.slice(3).map((trait) => (
                        <li key={trait.name} className="flex items-center justify-between">
                          <span>{trait.name}</span>
                          <div className="flex items-center">
                            <span className="text-xs font-medium mr-2">{trait.score}%</span>
                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="bg-purple-500 h-full" 
                                style={{ width: `${trait.score}%` }}
                              ></div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Separator />
            
            <div>
              <button 
                onClick={() => toggleSection('skills')}
                className="w-full flex justify-between items-center text-left mb-2"
              >
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <Star className="h-4 w-4 mr-2 text-amber-500" />
                  Compétences clés
                </h4>
                <ChevronRight 
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                    expandedSection === 'skills' ? 'rotate-90' : ''
                  }`} 
                />
              </button>
              
              <ul className="space-y-1 text-sm">
                {skills.slice(0, 3).map((skill) => (
                  <li key={skill.name} className="flex items-center justify-between">
                    <span>{skill.name}</span>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full" 
                        style={{ width: `${skill.score}%` }}
                      ></div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <AnimatePresence>
                {expandedSection === 'skills' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="space-y-1 text-sm mt-3">
                      {skills.slice(3).map((skill) => (
                        <li key={skill.name} className="flex items-center justify-between">
                          <span>{skill.name}</span>
                          <div className="flex items-center">
                            <span className="text-xs font-medium mr-2">{skill.score}%</span>
                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="bg-amber-500 h-full" 
                                style={{ width: `${skill.score}%` }}
                              ></div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4" 
              onClick={() => onNavigate("/dashboard/results")}
            >
              Voir tous les résultats
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <FileBarChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun test complété</h3>
            <p className="text-gray-500 mb-4">Passez un test d'orientation pour connaître votre profil professionnel</p>
            <Button onClick={() => onNavigate("/tests")}>
              Passer un test
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
