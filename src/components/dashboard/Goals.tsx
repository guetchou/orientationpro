import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Goals = () => {
  const goals = [
    {
      title: "Identifier mes centres d'intérêt",
      progress: 80,
    },
    {
      title: "Choisir une filière d'études",
      progress: 60,
    },
    {
      title: "Explorer les métiers possibles",
      progress: 40,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Objectifs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.title} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">{goal.title}</span>
                <span className="text-sm text-gray-500">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};