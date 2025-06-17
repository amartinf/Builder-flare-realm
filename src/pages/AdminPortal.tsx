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
  Shield,
  Users,
  Settings,
  BarChart3,
  AlertTriangle,
  FileText,
  TrendingUp,
  Calendar,
  Database,
  Key,
  Mail,
  Download,
} from "lucide-react";

export default function AdminPortal() {
  const { user } = useAuth();
  const { audits, loading: auditsLoading } = useAudits();
  const { nonConformities, loading: ncLoading } = useNonConformities();

  // Calculate statistics
  const totalAudits = audits.length;
  const activeAudits = audits.filter((a) => a.status === "En progreso").length;
  const completedAudits = audits.filter(
    (a) => a.status === "Completada",
  ).length;
  const totalNCs = nonConformities.length;
  const openNCs = nonConformities.filter(
    (nc) => nc.status !== "Cerrada",
  ).length;
  const criticalNCs = nonConformities.filter(
    (nc) => nc.severity === "Crítica" && nc.status !== "Cerrada",
  ).length;

  const completionRate =
    totalAudits > 0 ? Math.round((completedAudits / totalAudits) * 100) : 0;

  if (auditsLoading || ncLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando portal del administrador...</p>
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
            <h1 className="text-3xl font-bold text-foreground">
              Portal del Administrador
            </h1>
            <p className="text-muted-foreground mt-1">
              Bienvenido, {user?.name} - Panel de control y administración del
              sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => (window.location.href = "/configuration")}>
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/users")}
            >
              <Users className="w-4 h-4 mr-2" />
              Usuarios
            </Button>
          </div>
        </div>

        {/* Critical Alerts */}
        {criticalNCs > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                Alertas Críticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-red-700">
                <p className="font-medium">
                  {criticalNCs} no conformidad{criticalNCs > 1 ? "es" : ""}{" "}
                  crítica{criticalNCs > 1 ? "s" : ""} requiere
                  {criticalNCs === 1 ? "" : "n"} atención inmediata
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-red-200 text-red-700 hover:bg-red-100"
                >
                  Ver detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Auditorías
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAudits}</div>
              <p className="text-xs text-muted-foreground">
                {activeAudits} activas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tasa Completitud
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {completedAudits} de {totalAudits} auditorías
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
                Usuarios Activos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                8 auditores, 16 clientes
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Gestión del Sistema
              </CardTitle>
              <CardDescription>
                Configuración y administración general
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-4"
                  onClick={() => (window.location.href = "/users")}
                >
                  <div className="text-center">
                    <Users className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Usuarios</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4"
                  onClick={() => (window.location.href = "/configuration")}
                >
                  <div className="text-center">
                    <Settings className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Configuración</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4">
                  <div className="text-center">
                    <Key className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Roles y Permisos</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4">
                  <div className="text-center">
                    <Database className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Base de Datos</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reports and Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Reportes y Análisis
              </CardTitle>
              <CardDescription>
                Generación de reportes y métricas del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => (window.location.href = "/reports")}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard de Métricas
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Reporte de Auditorías
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Análisis de Tendencias
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Planificación de Auditorías
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Nueva auditoría creada
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ISO 9001 - Planta Norte por Carlos Ruiz
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">Hace 2h</span>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      No conformidad crítica reportada
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Falla en sistema de seguridad
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">Hace 4h</span>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Nuevo usuario registrado
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ana López - Cliente
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">Hace 1d</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
              <CardDescription>Monitoreo de salud del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Base de Datos</span>
                  <Badge className="bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Operativo
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Servidor Web</span>
                  <Badge className="bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Operativo
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">FileMaker API</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Demo Mode
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Service</span>
                  <Badge className="bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Operativo
                  </Badge>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2">
                    Uso de Recursos
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>CPU</span>
                        <span>23%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: "23%" }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Memoria</span>
                        <span>67%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: "67%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
