import { useState } from "react";
import { RiasecResults } from "@/types/test";
import { getAIEnhancedAnalysis } from "@/utils/aiEnhancedAnalysis";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useRiasecTest = () => {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RiasecResults | null>(null);
  const navigate = useNavigate();

  const resetTest = () => {
    setStarted(false);
    setCompleted(false);
    setCurrentQuestion(0);
    setAnswers([]);
    setResults(null);
  };

  const startTest = () => setStarted(true);

  const handleAnswer = async (score: number, questions: any[]) => {
    setLoading(true);
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setLoading(false);
      return;
    }
    await completeTest(newAnswers, questions);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const completeTest = async (finalAnswers: number[], questions: any[]) => {
    const rawScores: Record<string, number> = {
      realistic: 0,
      investigative: 0,
      artistic: 0,
      social: 0,
      enterprising: 0,
      conventional: 0,
    };

    finalAnswers.forEach((answer, index) => {
      const category = questions[index]?.category;
      if (category in rawScores) rawScores[category] += answer;
    });

    const normalize = (category: string) => {
      const count = questions.filter((question) => question.category === category).length;
      return count > 0 ? Math.round((rawScores[category] / (5 * count)) * 100) : 0;
    };

    const testResults: RiasecResults = {
      realistic: normalize("realistic"),
      investigative: normalize("investigative"),
      artistic: normalize("artistic"),
      social: normalize("social"),
      enterprising: normalize("enterprising"),
      conventional: normalize("conventional"),
      personalityCode: "",
      confidenceScore: 90,
      dominantTypes: [],
    };

    const rankedScores = [
      { code: "R", score: testResults.realistic },
      { code: "I", score: testResults.investigative },
      { code: "A", score: testResults.artistic },
      { code: "S", score: testResults.social },
      { code: "E", score: testResults.enterprising },
      { code: "C", score: testResults.conventional },
    ].sort((a, b) => b.score - a.score);

    testResults.personalityCode = rankedScores.slice(0, 3).map(({ code }) => code).join("");
    testResults.dominantTypes = rankedScores.slice(0, 3).map(({ code }) => code);
    setResults(testResults);

    try {
      const aiInsights = await getAIEnhancedAnalysis("riasec", testResults);
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const authUser = authData.user;

      if (authUser?.id && authUser.email) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .upsert(
            {
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "email" },
          )
          .select("id")
          .single();
        if (profileError) throw profileError;

        const averageScore = Math.round(
          (testResults.realistic + testResults.investigative + testResults.artistic + testResults.social + testResults.enterprising + testResults.conventional) / 6,
        );

        const { error: saveError } = await supabase.from("test_results").insert({
          profile_id: profile.id,
          test_type: "riasec",
          test_data: { answers: finalAnswers },
          results: { ...testResults, aiInsights },
          score: averageScore,
          interpretation: aiInsights.analysis,
          recommendations: aiInsights.recommendations,
          completed_at: new Date().toISOString(),
        });
        if (saveError) throw saveError;
        toast.success("Test complété et enregistré dans votre tableau de bord.");
      } else {
        toast.info("Test complété. Connectez-vous pour conserver le résultat.");
      }
      setCompleted(true);
    } catch (error) {
      console.error("Error finalizing test:", error);
      toast.error("Le résultat a été calculé, mais son enregistrement a échoué.");
      setCompleted(true);
    } finally {
      setLoading(false);
    }
  };

  const viewResults = () => {
    if (results) navigate("/test-results", { state: { results, testType: "riasec" } });
  };

  return { started, completed, currentQuestion, answers, loading, results, resetTest, startTest, handleAnswer, handlePrevious, viewResults };
};
