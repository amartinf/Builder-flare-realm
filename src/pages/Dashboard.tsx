import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  Calendar,
  Users,
  BarChart3,
  Activity,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";

// Mock data for the dashboard
const stats = [
  {
    title: "Auditorías Activas",
    value: "12",
    change: "+3 este mes",
    icon: FileText,
    color: "text-audit-600",
    bgColor: "bg-audit-100",
  },
  {
    title: "No Conformidades",
    value: "8",
    change: "-2 resueltas",
    icon: AlertTriangle,
    color: "text-warning-600",
    bgColor: "bg-warning-100",
  },
  {
    title: "Auditorías Completadas",
    value: "24",
    change: "+6 este mes",
    icon: CheckCircle,
    color: "text-success-600",
    bgColor: "bg-success-100",
  },
  {
    title: "Tiempo Promedio",
    value: "4.2 días",
    change: "-0.5 días",
    icon: Clock,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
];

const recentAudits = [
  {
    id: 1,
    name: "Auditoría ISO 9001 - Planta Norte",
    type: "Calidad",
    status: "En progreso",
    progress: 75,
    dueDate: "2024-01-25",
    auditor: "María González",
    nonConformities: 2,
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
  },
];

const recentNonConformities = [
  {
    id: 1,
    title: "Falta de documentación en proceso de calidad",
    audit: "ISO 9001 - Planta Norte",
    severity: "Alta",
    status: "Abierta",
    assignee: "Roberto Silva",
    dueDate: "2024-01-28",
  },
  {
    id: 2,
    title: "Incumplimiento de protocolo de seguridad",
    audit: "Auditoría de Seguridad - Almacén",
    severity: "Crítica",
    status: "En revisión",
    assignee: "Carmen Torres",
    dueDate: "2024-01-22",
  },
  {
    id: 3,
    title: "Desviación en registro de temperaturas",
    audit: "Auditoría Ambiental - Sede Central",
    severity: "Media",
    status: "Cerrada",
    assignee: "Miguel Herrera",
    dueDate: "2024-01-20",
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
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "Crítica":
      return <Badge variant="destructive">Crítica</Badge>;
    case "Alta":
      return <Badge className="bg-orange-100 text-orange-800">Alta</Badge>;
    case "Media":
      return <Badge className="bg-yellow-100 text-yellow-800">Media</Badge>;
    case "Baja":
      return <Badge className="bg-green-100 text-green-800">Baja</Badge>;
    default:
      return <Badge variant="secondary">{severity}</Badge>;
  }
}

function getNonConformityStatusBadge(status: string) {
  switch (status) {
    case "Abierta":
      return <Badge variant="destructive">Abierta</Badge>;
    case "En revisión":
      return <Badge className="status-pending">En revisión</Badge>;
    case "Cerrada":
      return <Badge className="status-approved">Cerrada</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function Dashboard() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Resumen de tus auditorías y actividades recientes
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto">
              <BarChart3 className="w-4 h-4 mr-2" />
              Ver reportes
            </Button>
            <Link to="/audits">
              <Button className="w-full sm:w-auto audit-gradient text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nueva auditoría
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="stat-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="audits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
            <TabsTrigger value="audits" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Auditorías Recientes
            </TabsTrigger>
            <TabsTrigger
              value="nonconformities"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              No Conformidades
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Actividad
            </TabsTrigger>
          </TabsList>

          {/* Recent Audits Tab */}
          <TabsContent value="audits" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Auditorías Recientes</CardTitle>
                    <CardDescription>
                      Tus auditorías más recientes y su estado actual
                    </CardDescription>
                  </div>
                  <Link to="/audits">
                    <Button variant="outline" size="sm">
                      Ver todas
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAudits.map((audit) => (
                    <div
                      key={audit.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 space-y-2 sm:space-y-1 mb-3 sm:mb-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h4 className="font-semibold text-foreground">
                            {audit.name}
                          </h4>
                          <Badge variant="outline" className="w-fit">
                            {audit.type}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {audit.auditor}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Vence: {audit.dueDate}
                          </span>
                          {audit.nonConformities > 0 && (
                            <span className="flex items-center gap-1 text-warning-600">
                              <AlertTriangle className="w-3 h-3" />
                              {audit.nonConformities} no conformidad
                              {audit.nonConformities > 1 ? "es" : ""}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Progreso
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {audit.progress}%
                            </span>
                          </div>
                          <Progress value={audit.progress} className="h-2" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(audit.status)}
                        <Button variant="ghost" size="sm">
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Non-Conformities Tab */}
          <TabsContent value="nonconformities" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>No Conformidades Activas</CardTitle>
                    <CardDescription>
                      No conformidades pendientes de resolución
                    </CardDescription>
                  </div>
                  <Link to="/non-conformities">
                    <Button variant="outline" size="sm">
                      Ver todas
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentNonConformities.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 space-y-2 mb-3 sm:mb-0">
                        <h4 className="font-semibold text-foreground">
                          {item.title}
                        </h4>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground">
                          <span>{item.audit}</span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {item.assignee}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Vence: {item.dueDate}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        {getSeverityBadge(item.severity)}
                        {getNonConformityStatusBadge(item.status)}
                        <Button variant="ghost" size="sm">
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Últimas acciones realizadas en la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                    <div className="p-2 bg-success-100 rounded-full">
                      <CheckCircle className="w-4 h-4 text-success-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Auditoría completada</p>
                      <p className="text-sm text-muted-foreground">
                        Se completó la auditoría "ISO 9001 - Planta Norte"
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Hace 2 horas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                    <div className="p-2 bg-warning-100 rounded-full">
                      <AlertTriangle className="w-4 h-4 text-warning-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Nueva no conformidad</p>
                      <p className="text-sm text-muted-foreground">
                        Se registró una no conformidad crítica en Almacén
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Hace 4 horas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                    <div className="p-2 bg-audit-100 rounded-full">
                      <FileText className="w-4 h-4 text-audit-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Evidencia subida</p>
                      <p className="text-sm text-muted-foreground">
                        María González subió 3 evidencias a la auditoría
                        ambiental
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ayer a las 16:30
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
