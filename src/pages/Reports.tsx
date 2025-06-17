import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAudits, useNonConformities } from "@/hooks/useFileMaker";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import {
  BarChart3,
  Download,
  FileText,
  AlertTriangle,
  TrendingUp,
  Calendar,
  PieChart,
  Filter,
  Mail,
} from "lucide-react";

export default function Reports() {
  const { user, currentRole } = useAuth();
  const { audits, loading: auditsLoading } = useAudits();
  const { nonConformities, loading: ncLoading } = useNonConformities();

  // Calculate metrics
  const totalAudits = audits.length;
  const completedAudits = audits.filter(
    (a) => a.status === "Completada",
  ).length;
  const totalNCs = nonConformities.length;
  const openNCs = nonConformities.filter(
    (nc) => nc.status !== "Cerrada",
  ).length;
  const completionRate =
    totalAudits > 0 ? Math.round((completedAudits / totalAudits) * 100) : 0;

  const reportTypes = [
    {
      id: "audit-summary",
      title: "Resumen de Auditorías",
      description: "Reporte general del estado de todas las auditorías",
      icon: FileText,
      format: ["PDF", "Excel"],
      available: true,
    },
    {
      id: "nc-analysis",
      title: "Análisis de No Conformidades",
      description: "Estadísticas y tendencias de no conformidades",
      icon: AlertTriangle,
      format: ["PDF", "Excel"],
      available: true,
    },
    {
      id: "performance-metrics",
      title: "Métricas de Rendimiento",
      description: "KPIs y métricas de eficiencia del sistema",
      icon: TrendingUp,
      format: ["PDF", "Excel"],
      available: currentRole === "admin",
    },
    {
      id: "compliance-report",
      title: "Reporte de Cumplimiento",
      description: "Estado de cumplimiento por organización",
      icon: BarChart3,
      format: ["PDF"],
      available: currentRole === "admin" || currentRole === "auditor",
    },
    {
      id: "schedule-report",
      title: "Programación de Auditorías",
      description: "Calendario y planificación de auditorías futuras",
      icon: Calendar,
      format: ["PDF", "Excel"],
      available: true,
    },
    {
      id: "trends-analysis",
      title: "Análisis de Tendencias",
      description: "Evolución temporal de métricas clave",
      icon: PieChart,
      format: ["PDF", "Excel"],
      available: currentRole === "admin",
    },
  ];

  const availableReports = reportTypes.filter((report) => report.available);

  if (auditsLoading || ncLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando reportes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
            <p className="text-muted-foreground mt-1">
              Generación de reportes y análisis del sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Programar Envío
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Auditorías Totales
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAudits}</div>
              <p className="text-xs text-muted-foreground">
                {completedAudits} completadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tasa de Completitud
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Promedio del período
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                No Conformidades
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalNCs}</div>
              <p className="text-xs text-muted-foreground">
                {openNCs} abiertas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reportes Generados
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Reportes Disponibles</CardTitle>
            <CardDescription>
              Selecciona el tipo de reporte que deseas generar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableReports.map((report) => {
                const Icon = report.icon;
                return (
                  <Card
                    key={report.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-sm">
                            {report.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {report.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {report.format.map((format) => (
                            <Badge
                              key={format}
                              variant="outline"
                              className="text-xs"
                            >
                              {format}
                            </Badge>
                          ))}
                        </div>
                        <Button size="sm">
                          <Download className="w-3 h-3 mr-1" />
                          Generar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Reportes frecuentes y configuraciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Reporte Mensual</div>
                  <div className="text-sm text-muted-foreground">
                    Resumen ejecutivo del mes
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Alertas Críticas</div>
                  <div className="text-sm text-muted-foreground">
                    NCs que requieren atención
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Programar Reportes</div>
                  <div className="text-sm text-muted-foreground">
                    Configurar envío automático
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Reportes Recientes</CardTitle>
            <CardDescription>
              Historial de reportes generados recientemente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  name: "Resumen de Auditorías - Enero 2024",
                  type: "PDF",
                  date: "2024-01-28",
                  size: "2.4 MB",
                },
                {
                  name: "Análisis de No Conformidades - Q4 2023",
                  type: "Excel",
                  date: "2024-01-25",
                  size: "1.8 MB",
                },
                {
                  name: "Métricas de Rendimiento - Enero 2024",
                  type: "PDF",
                  date: "2024-01-20",
                  size: "3.2 MB",
                },
              ].map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{report.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.type} • {report.size} • {report.date}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
