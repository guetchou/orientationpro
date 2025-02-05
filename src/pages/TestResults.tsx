import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";

interface TestResults {
  [key: string]: number;
}

interface LocationState {
  results: TestResults;
  testType: string;
}

export default function TestResults() {
  const location = useLocation();
  const { results, testType } = (location.state as LocationState) || { results: {}, testType: '' };

  const getTestTitle = () => {
    switch (testType) {
      case 'riasec':
        return "Résultats du Test RIASEC";
      case 'emotional':
        return "Résultats du Test d'Intelligence Émotionnelle";
      case 'multiple_intelligence':
        return "Résultats du Test des Intelligences Multiples";
      case 'learning_style':
        return "Résultats du Test de Style d'Apprentissage";
      default:
        return "Résultats du Test";
    }
  };

  const renderResults = () => {
    if (!results) return null;

    return Object.entries(results).map(([key, value]) => (
      <div key={key} className="mb-4">
        <h3 className="text-lg font-semibold capitalize mb-2">
          {key.replace(/_/g, ' ')}
        </h3>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${(Number(value) / 3) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Score: {value}
        </p>
      </div>
    ));
  };

  const handleDownload = () => {
    const resultsText = Object.entries(results)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    
    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${testType}_results.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{getTestTitle()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {renderResults()}
              
              <div className="flex justify-end mt-6">
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger les résultats
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}