
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Goals } from "@/components/dashboard/Goals";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, BookOpen, User } from "lucide-react";

export const UserGoals = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2 text-primary" />
          Vos objectifs
        </CardTitle>
        <CardDescription>
          Suivez votre progression et atteignez vos buts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="mb-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="career" className="flex items-center">
              <Target className="h-3.5 w-3.5 mr-1" />
              Carrière
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center">
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              Éducation
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center">
              <User className="h-3.5 w-3.5 mr-1" />
              Personnel
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <Goals />
          </TabsContent>
          
          <TabsContent value="career">
            <Goals />
          </TabsContent>
          
          <TabsContent value="education">
            <Goals />
          </TabsContent>
          
          <TabsContent value="personal">
            <Goals />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
