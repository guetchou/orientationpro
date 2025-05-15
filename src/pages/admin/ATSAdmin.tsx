
import React from 'react';
import CandidateTable from '@/components/admin/ats/CandidateTable';
import CandidateDetail from '@/components/admin/ats/CandidateDetail';
import { useCandidates } from '@/hooks/admin/useCandidates';
import { Candidate } from '@/types/candidates';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileCheck, Users, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardNav from '@/components/DashboardNav';

export default function ATSAdmin() {
  const {
    candidates,
    loading,
    selectedCandidate,
    setSelectedCandidate,
    updateCandidateStatus,
    updateCandidateRating,
    updateCandidateNotes,
    deleteCandidate
  } = useCandidates();

  // Compiler les statistiques
  const totalCandidates = candidates?.length || 0;
  const newCandidates = candidates?.filter(c => c.status === 'new').length || 0;
  const interviewCandidates = candidates?.filter(c => c.status === 'interview').length || 0;
  const hiredCandidates = candidates?.filter(c => c.status === 'hired').length || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="outline" size="sm" asChild className="mb-2">
              <Link to="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tableau de bord
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Gestion des Candidatures</h1>
          </div>
          <Button asChild>
            <Link to="/recrutement">
              <FileCheck className="mr-2 h-5 w-5" />
              Voir la page recrutement
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Candidats</p>
                <h3 className="text-2xl font-bold">{totalCandidates}</h3>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-500 dark:text-blue-300" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nouveaux</p>
                <h3 className="text-2xl font-bold">{newCandidates}</h3>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <FileCheck className="h-6 w-6 text-green-500 dark:text-green-300" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">En entretien</p>
                <h3 className="text-2xl font-bold">{interviewCandidates}</h3>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                <Users className="h-6 w-6 text-yellow-500 dark:text-yellow-300" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Embauchés</p>
                <h3 className="text-2xl font-bold">{hiredCandidates}</h3>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-500 dark:text-purple-300" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="hidden md:block md:col-span-2">
            <DashboardNav />
          </div>
          
          <div className="md:col-span-10">
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">Tous ({totalCandidates})</TabsTrigger>
                <TabsTrigger value="new">Nouveaux ({newCandidates})</TabsTrigger>
                <TabsTrigger value="interview">Entretien ({interviewCandidates})</TabsTrigger>
                <TabsTrigger value="hired">Embauchés ({hiredCandidates})</TabsTrigger>
              </TabsList>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2">
                  <TabsContent value="all" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <CandidateTable 
                      candidates={candidates as any}
                      loading={loading}
                      onSelectCandidate={setSelectedCandidate}
                      onUpdateStatus={updateCandidateStatus}
                      onUpdateRating={updateCandidateRating}
                      onDeleteCandidate={deleteCandidate}
                      selectedCandidateId={selectedCandidate?.id}
                    />
                  </TabsContent>
                  
                  <TabsContent value="new" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <CandidateTable 
                      candidates={(candidates?.filter(c => c.status === 'new') || []) as any}
                      loading={loading}
                      onSelectCandidate={setSelectedCandidate}
                      onUpdateStatus={updateCandidateStatus}
                      onUpdateRating={updateCandidateRating}
                      onDeleteCandidate={deleteCandidate}
                      selectedCandidateId={selectedCandidate?.id}
                    />
                  </TabsContent>
                  
                  <TabsContent value="interview" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <CandidateTable 
                      candidates={(candidates?.filter(c => c.status === 'interview') || []) as any}
                      loading={loading}
                      onSelectCandidate={setSelectedCandidate}
                      onUpdateStatus={updateCandidateStatus}
                      onUpdateRating={updateCandidateRating}
                      onDeleteCandidate={deleteCandidate}
                      selectedCandidateId={selectedCandidate?.id}
                    />
                  </TabsContent>
                  
                  <TabsContent value="hired" className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <CandidateTable 
                      candidates={(candidates?.filter(c => c.status === 'hired') || []) as any}
                      loading={loading}
                      onSelectCandidate={setSelectedCandidate}
                      onUpdateStatus={updateCandidateStatus}
                      onUpdateRating={updateCandidateRating}
                      onDeleteCandidate={deleteCandidate}
                      selectedCandidateId={selectedCandidate?.id}
                    />
                  </TabsContent>
                </div>
                
                <div>
                  {selectedCandidate ? (
                    <CandidateDetail
                      candidate={selectedCandidate as any}
                      onUpdateStatus={updateCandidateStatus}
                      onUpdateRating={updateCandidateRating}
                      onUpdateNotes={updateCandidateNotes}
                      onClose={() => setSelectedCandidate(null)}
                    />
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 h-full flex items-center justify-center text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        Sélectionnez un candidat pour voir les détails
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
