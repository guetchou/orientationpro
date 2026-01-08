
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StudentProgress } from "@/types/dashboard";
import { Search } from "lucide-react";

const mockStudents: StudentProgress[] = [
  {
    id: "1",
    name: "Jean Batchi",
    avatar: "/placeholder.svg",
    progress: 85,
    lastActive: "2023-09-12",
    testsCompleted: 4,
    status: "active"
  },
  {
    id: "2",
    name: "Marie Doukaga",
    avatar: "/placeholder.svg",
    progress: 65,
    lastActive: "2023-09-10",
    testsCompleted: 3,
    status: "active"
  },
  {
    id: "3",
    name: "Christian Mouamba",
    avatar: "/placeholder.svg",
    progress: 42,
    lastActive: "2023-09-05",
    testsCompleted: 2,
    status: "active"
  },
  {
    id: "4",
    name: "Sophie Ndinga",
    avatar: "/placeholder.svg",
    progress: 90,
    lastActive: "2023-09-11",
    testsCompleted: 4,
    status: "active"
  },
  {
    id: "5",
    name: "Pascal Kassa",
    avatar: "/placeholder.svg",
    progress: 20,
    lastActive: "2023-08-28",
    testsCompleted: 1,
    status: "inactive"
  },
  {
    id: "6",
    name: "Astride Mampouya",
    avatar: "/placeholder.svg",
    progress: 60,
    lastActive: "2023-09-08",
    testsCompleted: 3,
    status: "active"
  },
  {
    id: "7",
    name: "Michel Moussounda",
    avatar: "/placeholder.svg",
    progress: 15,
    lastActive: "2023-08-20",
    testsCompleted: 1,
    status: "onHold"
  },
  {
    id: "8",
    name: "Clarisse Mavoungou",
    avatar: "/placeholder.svg",
    progress: 75,
    lastActive: "2023-09-09",
    testsCompleted: 3,
    status: "active"
  }
];

export function StudentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive' | 'onHold'>('all');
  
  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: 'active' | 'inactive' | 'onHold') => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Actif</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500">Inactif</Badge>;
      case 'onHold':
        return <Badge className="bg-yellow-500">En pause</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR').format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des étudiants</CardTitle>
        <div className="flex items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            className="border rounded-md p-2 text-sm"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="onHold">En pause</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Étudiant</TableHead>
              <TableHead>Progression</TableHead>
              <TableHead>Tests</TableHead>
              <TableHead>Dernière activité</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback>{student.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{student.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-full flex items-center gap-2">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            student.progress > 66 ? 'bg-green-500' : 
                            student.progress > 33 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{student.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{student.testsCompleted}</TableCell>
                  <TableCell>{formatDate(student.lastActive)}</TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Aucun étudiant trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
