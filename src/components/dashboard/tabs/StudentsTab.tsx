
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export const StudentsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes Étudiants</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">
          Liste des étudiants à venir...
        </p>
      </CardContent>
    </Card>
  );
};
