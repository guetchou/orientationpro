
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Goals } from "@/components/dashboard/Goals";

export const UserGoals = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vos objectifs</CardTitle>
        <CardDescription>
          Suivez votre progression
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Goals />
      </CardContent>
    </Card>
  );
};
