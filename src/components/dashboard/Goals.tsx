
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Check, Edit2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Goal {
  id: string;
  title: string;
  progress: number;
  target: number;
  completed: boolean;
  category: "career" | "education" | "personal";
}

export const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState(100);
  const [newGoalCategory, setNewGoalCategory] = useState<"career" | "education" | "personal">("career");
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  useEffect(() => {
    // Simuler le chargement des objectifs depuis une API
    const savedGoals = localStorage.getItem("userGoals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      // Données par défaut
      const defaultGoals: Goal[] = [
        {
          id: "1",
          title: "Compléter 5 tests d'orientation",
          progress: 40,
          target: 100,
          completed: false,
          category: "career"
        },
        {
          id: "2",
          title: "Prendre rendez-vous avec un conseiller",
          progress: 100,
          target: 100,
          completed: true,
          category: "education"
        }
      ];
      setGoals(defaultGoals);
      localStorage.setItem("userGoals", JSON.stringify(defaultGoals));
    }
  }, []);

  // Sauvegarde des objectifs lorsqu'ils sont modifiés
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem("userGoals", JSON.stringify(goals));
    }
  }, [goals]);

  const addGoal = () => {
    if (!newGoalTitle.trim()) {
      toast.error("Veuillez entrer un titre pour l'objectif");
      return;
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      progress: 0,
      target: newGoalTarget,
      completed: false,
      category: newGoalCategory
    };

    setGoals([...goals, newGoal]);
    setNewGoalTitle("");
    setNewGoalTarget(100);
    setNewGoalCategory("career");
    setIsAddingGoal(false);
    toast.success("Objectif ajouté avec succès");
  };

  const updateGoalProgress = (id: string, newProgress: number) => {
    setGoals(
      goals.map((goal) => {
        if (goal.id === id) {
          const isCompleted = newProgress >= goal.target;
          return {
            ...goal,
            progress: newProgress,
            completed: isCompleted
          };
        }
        return goal;
      })
    );
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
    toast.success("Objectif supprimé");
  };

  const updateGoalTitle = (id: string, newTitle: string) => {
    if (!newTitle.trim()) {
      toast.error("Le titre ne peut pas être vide");
      return;
    }
    
    setGoals(
      goals.map((goal) => {
        if (goal.id === id) {
          return { ...goal, title: newTitle };
        }
        return goal;
      })
    );
    setEditingGoalId(null);
    toast.success("Objectif mis à jour");
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "career":
        return "bg-blue-500";
      case "education":
        return "bg-green-500";
      case "personal":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Vos objectifs personnels</h3>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setIsAddingGoal(!isAddingGoal)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Ajouter</span>
        </Button>
      </div>

      <AnimatePresence>
        {isAddingGoal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-4"
          >
            <div className="space-y-3">
              <Input
                placeholder="Titre de l'objectif"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                className="mb-2"
              />
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <select
                    value={newGoalCategory}
                    onChange={(e) => setNewGoalCategory(e.target.value as any)}
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                  >
                    <option value="career">Carrière</option>
                    <option value="education">Éducation</option>
                    <option value="personal">Personnel</option>
                  </select>
                </div>
                
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Objectif"
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(Number(e.target.value))}
                    min={1}
                    max={1000}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={() => setIsAddingGoal(false)}>
                  Annuler
                </Button>
                <Button onClick={addGoal}>
                  Ajouter
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Vous n'avez pas encore d'objectifs. Ajoutez-en un pour commencer à suivre votre progression.</p>
          </div>
        ) : (
          goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  {editingGoalId === goal.id ? (
                    <div className="flex gap-2">
                      <Input
                        defaultValue={goal.title}
                        onBlur={(e) => updateGoalTitle(goal.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateGoalTitle(goal.id, e.currentTarget.value);
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => setEditingGoalId(null)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div 
                        className={`w-3 h-3 rounded-full mr-2 ${getCategoryColor(goal.category)}`} 
                      />
                      <h4 className={`font-medium ${goal.completed ? "line-through text-gray-500 dark:text-gray-400" : ""}`}>
                        {goal.title}
                      </h4>
                    </div>
                  )}
                </div>
                
                {editingGoalId !== goal.id && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingGoalId(goal.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteGoal(goal.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Progression</span>
                  <span>{goal.progress}%</span>
                </div>
                
                <div className="relative">
                  <Progress value={goal.progress} className="h-2" />
                  {goal.completed && (
                    <div className="absolute -right-1 -top-1">
                      <div className="bg-green-500 rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="pt-2">
                  <input
                    type="range"
                    min="0"
                    max={goal.target}
                    value={goal.progress}
                    onChange={(e) => updateGoalProgress(goal.id, parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
