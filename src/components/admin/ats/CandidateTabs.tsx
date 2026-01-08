
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CandidateTabsProps {
  candidate: {
    position: string;
    status: string;
    experience?: string;
    motivation?: string;
  };
  createdDate: string;
  notes: string;
  setNotes: (notes: string) => void;
  onSave: () => void;
  saving: boolean;
}

const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

export const CandidateTabs: React.FC<CandidateTabsProps> = ({
  candidate,
  createdDate,
  notes,
  setNotes,
  onSave,
  saving
}) => {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-4 w-full overflow-x-auto">
        <TabsTrigger value="profile" className="transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Profil</TabsTrigger>
        <TabsTrigger value="experience" className="transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Expérience</TabsTrigger>
        <TabsTrigger value="motivation" className="transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Motivation</TabsTrigger>
        <TabsTrigger value="notes" className="transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Notes</TabsTrigger>
      </TabsList>
      
      <AnimatePresence mode="wait">
        <TabsContent value="profile" asChild>
          <motion.div 
            className="space-y-4"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="transition-all duration-300 hover:shadow-md dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">À propos du candidat</CardTitle>
                <CardDescription className="dark:text-gray-400">Résumé du profil du candidat</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p>Candidature pour le poste de : <strong>{candidate.position}</strong></p>
                  <p>Candidat depuis : <strong>{createdDate}</strong></p>
                  <p>Statut actuel : <strong>{candidate.status}</strong></p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="experience" asChild>
          <motion.div 
            className="space-y-4"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="transition-all duration-300 hover:shadow-md dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Expérience professionnelle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p>{candidate.experience || "Aucune expérience mentionnée."}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="motivation" asChild>
          <motion.div 
            className="space-y-4"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="transition-all duration-300 hover:shadow-md dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Lettre de motivation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p>{candidate.motivation || "Aucune lettre de motivation fournie."}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="notes" asChild>
          <motion.div 
            className="space-y-4"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="transition-all duration-300 hover:shadow-md dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Notes internes</CardTitle>
                <CardDescription className="dark:text-gray-400">Notes privées concernant ce candidat</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajouter des notes concernant ce candidat..."
                  rows={8}
                  className="resize-none transition-all focus:ring-2 focus:ring-primary/30 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={onSave}
                  disabled={saving}
                  className="transition-all duration-300 hover:bg-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer les notes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </AnimatePresence>
    </Tabs>
  );
};
