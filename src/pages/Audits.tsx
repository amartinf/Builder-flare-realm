import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  AlertTriangle,
  MoreHorizontal,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for audits
const audits = [
  {
    id: 1,
    name: "Auditoría ISO 9001 - Planta Norte",
    type: "Calidad",
    status: "En progreso",
    progress: 75,
    dueDate: "2024-01-25",
    auditor: "María González",
    nonConformities: 2,
    evidences: 12,
    createdDate: "2024-01-10",
  },
  {
    id: 2,
    name: "Auditoría Ambiental - Sede Central",
    type: "Ambiental",
    status: "Pendiente",
    progress: 25,
    dueDate: "2024-02-01",
    auditor: "Carlos Ruiz",
    nonConformities: 0,
    evidences: 3,
    createdDate: "2024-01-12",
  },
  {
    id: 3,
    name: "Auditoría de Seguridad - Almacén",
    type: "Seguridad",
    status: "Completada",
    progress: 100,
    dueDate: "2024-01-15",
    auditor: "Ana López",
    nonConformities: 1,
    evidences: 24,
    createdDate: "2024-01-05",
  },
  {
    id: 4,
    name: "Auditoría Financiera Q4",
    type: "Financiera",
    status: "En progreso",
    progress: 60,
    dueDate: "2024-01-30",
    auditor: "Luis Martín",
    nonConformities: 3,
    evidences: 8,
    createdDate: "2024-01-08",
  },
  {
    id: 5,
    name: "Auditoría Interna de Procesos",
    type: "Procesos",
    status: "Borrador",
    progress: 10,
    dueDate: "2024-02-15",
    auditor: "Carmen Torres",
    nonConformities: 0,
    evidences: 1,
    createdDate: "2024-01-18",
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "En progreso":
      return <Badge className="status-pending">En progreso</Badge>;
    case "Completada":
      return <Badge className="status-approved">Completada</Badge>;
    case "Pendiente":
      return <Badge className="status-draft">Pendiente</Badge>;
    case "Borrador":
      return <Badge variant="secondary">Borrador</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function Audits() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Auditorías</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona y supervisa todas tus auditorías
            </p>
          </div>
          <Button className="audit-gradient text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nueva auditoría
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar auditorías..." className="pl-10" />
                </div>
              </div>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="progress">En progreso</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="quality">Calidad</SelectItem>
                    <SelectItem value="environmental">Ambiental</SelectItem>
                    <SelectItem value="security">Seguridad</SelectItem>
                    <SelectItem value="financial">Financiera</SelectItem>
                    <SelectItem value="processes">Procesos</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {audits.map((audit) => (
            <Card key={audit.id} className="audit-card hover:shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold line-clamp-2">
                      {audit.name}
                    </CardTitle>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline">{audit.type}</Badge>
                      <CardDescription className="m-0">
                        Creada: {audit.createdDate}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Duplicar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status and Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    {getStatusBadge(audit.status)}
                    <span className="text-sm text-muted-foreground">
                      {audit.progress}%
                    </span>
                  </div>
                  <Progress value={audit.progress} className="h-2" />
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3 h-3" />
                      Auditor
                    </span>
                    <span>{audit.auditor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Fecha límite
                    </span>
                    <span>{audit.dueDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      Evidencias
                    </span>
                    <span>{audit.evidences}</span>
                  </div>
                  {audit.nonConformities > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-warning-600">
                        <AlertTriangle className="w-3 h-3" />
                        No conformidades
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        {audit.nonConformities}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Ver detalles
                  </Button>
                  <Button size="sm" className="flex-1">
                    {audit.status === "Borrador" ? "Continuar" : "Editar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State (if no audits) */}
        {audits.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay auditorías</h3>
              <p className="text-muted-foreground mb-4">
                Comienza creando tu primera auditoría
              </p>
              <Button className="audit-gradient text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nueva auditoría
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
