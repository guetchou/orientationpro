import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const RecentTests = () => {
  const tests = [
    {
      name: "Test RIASEC",
      date: "15 Avril 2024",
      score: "Profil Investigateur",
    },
    {
      name: "Test d'Intelligence Émotionnelle",
      date: "10 Avril 2024",
      score: "85/100",
    },
    {
      name: "Test des Intelligences Multiples",
      date: "5 Avril 2024",
      score: "Logique-mathématique dominant",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tests Récents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tests.map((test) => (
            <div
              key={test.name}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium">{test.name}</p>
                <p className="text-sm text-gray-500">{test.date}</p>
              </div>
              <div className="text-sm font-medium text-primary">{test.score}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};