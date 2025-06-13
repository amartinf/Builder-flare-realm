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
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  FileText,
  Clock,
} from "lucide-react";
import { Layout } from "@/components/Layout";

// Mock data for non-conformities
const nonConformities = [
  {
    id: 1,
    title: "Falta de documentación en proceso de calidad",
    description:
      "No se encontró evidencia documental del proceso de control de calidad establecido en el procedimiento QP-001.",
    audit: "ISO 9001 - Planta Norte",
    auditType: "Calidad",
    severity: "Alta",
    status: "Abierta",
    assignee: "Roberto Silva",
    reporter: "María González",
    dueDate: "2024-01-28",
    createdDate: "2024-01-20",
    category: "Documentación",
  },
  {
    id: 2,
    title: "Incumplimiento de protocolo de seguridad",
    description:
      "Personal trabajando sin equipo de protección individual obligatorio en área de riesgo alto.",
    audit: "Auditoría de Seguridad - Almacén",
    auditType: "Seguridad",
    severity: "Crítica",
    status: "En revisión",
    assignee: "Carmen Torres",
    reporter: "Ana López",
    dueDate: "2024-01-22",
    createdDate: "2024-01-18",
    category: "Seguridad",
  },
  {
    id: 3,
    title: "Desviación en registro de temperaturas",
    description:
      "Los registros de temperatura del almacén muestran valores fuera del rango establecido durante 3 días consecutivos.",
    audit: "Auditoría Ambiental - Sede Central",
    auditType: "Ambiental",
    severity: "Media",
    status: "Cerrada",
    assignee: "Miguel Herrera",
    reporter: "Carlos Ruiz",
    dueDate: "2024-01-20",
    createdDate: "2024-01-15",
    category: "Monitoreo",
  },
  {
    id: 4,
    title: "Error en conciliación bancaria",
    description:
      "Diferencia no identificada de $2,500 en la conciliación bancaria del mes de diciembre.",
    audit: "Auditoría Financiera Q4",
    auditType: "Financiera",
    severity: "Alta",
    status: "En progreso",
    assignee: "Patricia Morales",
    reporter: "Luis Martín",
    dueDate: "2024-01-25",
    createdDate: "2024-01-19",
    category: "Contabilidad",
  },
  {
    id: 5,
    title: "Falta de calibración en equipos",
    description:
      "Tres equipos de medición no presentan certificado de calibración vigente.",
    audit: "Auditoría de Calidad - Laboratorio",
    auditType: "Calidad",
    severity: "Media",
    status: "Abierta",
    assignee: "Diego Fernández",
    reporter: "Laura Jiménez",
    dueDate: "2024-02-05",
    createdDate: "2024-01-21",
    category: "Equipos",
  },
];

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "Crítica":
      return <Badge variant="destructive">Crítica</Badge>;
    case "Alta":
      return (
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          Alta
        </Badge>
      );
    case "Media":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Media
        </Badge>
      );
    case "Baja":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          Baja
        </Badge>
      );
    default:
      return <Badge variant="secondary">{severity}</Badge>;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "Abierta":
      return <Badge variant="destructive">Abierta</Badge>;
    case "En revisión":
      return <Badge className="status-pending">En revisión</Badge>;
    case "En progreso":
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          En progreso
        </Badge>
      );
    case "Cerrada":
      return <Badge className="status-approved">Cerrada</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getDaysUntilDue(dueDate: string): {
  days: number;
  status: "overdue" | "urgent" | "normal";
} {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { days: Math.abs(diffDays), status: "overdue" };
  if (diffDays <= 3) return { days: diffDays, status: "urgent" };
  return { days: diffDays, status: "normal" };
}

export default function NonConformities() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              No Conformidades
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona y supervisa todas las no conformidades encontradas
            </p>
          </div>
          <Button className="audit-gradient text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nueva no conformidad
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar no conformidades..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="open">Abierta</SelectItem>
                    <SelectItem value="review">En revisión</SelectItem>
                    <SelectItem value="progress">En progreso</SelectItem>
                    <SelectItem value="closed">Cerrada</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Severidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las severidades</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total
                  </p>
                  <p className="text-2xl font-bold">15</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Críticas
                  </p>
                  <p className="text-2xl font-bold text-red-600">2</p>
                </div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pendientes
                  </p>
                  <p className="text-2xl font-bold text-orange-600">8</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Cerradas
                  </p>
                  <p className="text-2xl font-bold text-green-600">5</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Non-Conformities List */}
        <div className="space-y-4">
          {nonConformities.map((item) => {
            const dueInfo = getDaysUntilDue(item.dueDate);
            return (
              <Card key={item.id} className="audit-card">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-muted-foreground">
                            NC-{item.id.toString().padStart(3, "0")}
                          </span>
                          {getSeverityBadge(item.severity)}
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                      <CardTitle className="text-lg font-semibold mb-1">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {item.description}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Ver detalles
                      </Button>
                      <Button size="sm">Gestionar</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Auditoría</p>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span className="font-medium">{item.audit}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Asignado a</p>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span className="font-medium">{item.assignee}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Fecha límite</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span
                          className={`font-medium ${
                            dueInfo.status === "overdue"
                              ? "text-red-600"
                              : dueInfo.status === "urgent"
                                ? "text-orange-600"
                                : "text-foreground"
                          }`}
                        >
                          {item.dueDate}
                        </span>
                      </div>
                      {dueInfo.status === "overdue" && (
                        <p className="text-xs text-red-600 mt-1">
                          Vencida hace {dueInfo.days} días
                        </p>
                      )}
                      {dueInfo.status === "urgent" && (
                        <p className="text-xs text-orange-600 mt-1">
                          Vence en {dueInfo.days} días
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Categoría</p>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {nonConformities.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No hay no conformidades
              </h3>
              <p className="text-muted-foreground mb-4">
                Excelente trabajo manteniendo la conformidad
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
