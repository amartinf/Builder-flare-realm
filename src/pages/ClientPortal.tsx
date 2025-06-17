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
import { useAudits, useNonConformities } from "@/hooks/useFileMaker";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import {
  Building,
  FileText,
  AlertTriangle,
  Download,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  Upload,
  MessageSquare,
} from "lucide-react";

export default function ClientPortal() {
  const { user } = useAuth();
  const { audits, loading: auditsLoading } = useAudits();
  const { nonConformities, loading: ncLoading } = useNonConformities();

  // Filter data relevant to client's organization
  // In a real app, this would be filtered by organization/client ID
  const clientAudits = audits; // For demo, show all audits
  const clientNCs = nonConformities.filter(
    (nc) => nc.status !== "Cerrada", // Show only open NCs for client action
  );

  const completedAudits = clientAudits.filter((a) => a.status === "Completada");
  const pendingAudits = clientAudits.filter((a) => a.status !== "Completada");
  const myNCs = clientNCs.filter(
    (nc) => nc.status === "Abierta" || nc.status === "En revisión",
  );
  const overdueNCs = clientNCs.filter(
    (nc) => new Date(nc.dueDate) < new Date(),
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className?: string }> = {
      Programada: { variant: "outline" },
      "En progreso": {
        variant: "default",
        className: "bg-blue-100 text-blue-800",
      },
      Completada: {
        variant: "default",
        className: "bg-green-100 text-green-800",
      },
      Borrador: { variant: "secondary" },
    };

    const config = variants[status] || { variant: "secondary" };

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, { variant: any; className?: string }> = {
      Crítica: { variant: "destructive" },
      Alta: { variant: "default", className: "bg-orange-100 text-orange-800" },
      Media: { variant: "default", className: "bg-yellow-100 text-yellow-800" },
      Baja: { variant: "outline" },
    };

    const config = variants[severity] || { variant: "secondary" };

    return (
      <Badge variant={config.variant} className={config.className}>
        {severity}
      </Badge>
    );
  };

  if (auditsLoading || ncLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando portal del cliente...</p>
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
              Portal del Cliente
            </h1>
            <p className="text-muted-foreground mt-1">
              Bienvenido, {user?.name} - {user?.organization}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => (window.location.href = "/corrective-actions")}
            >
              <Upload className="w-4 h-4 mr-2" />
              Subir Acción Correctiva
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Descargar Reportes
            </Button>
          </div>
        </div>

        {/* Overdue Alerts */}
        {overdueNCs.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                Acciones Vencidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-red-700">
                <p className="font-medium">
                  {overdueNCs.length} no conformidad
                  {overdueNCs.length > 1 ? "es" : ""} vencida
                  {overdueNCs.length > 1 ? "s" : ""} requiere
                  {overdueNCs.length === 1 ? "" : "n"} acción inmediata
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-red-200 text-red-700 hover:bg-red-100"
                >
                  Ver acciones requeridas
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Mis Auditorías
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientAudits.length}</div>
              <p className="text-xs text-muted-foreground">
                {completedAudits.length} completadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingAudits.length}</div>
              <p className="text-xs text-muted-foreground">
                Auditorías activas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Acciones Pendientes
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myNCs.length}</div>
              <p className="text-xs text-muted-foreground">
                {overdueNCs.length} vencidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cumplimiento
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clientAudits.length > 0
                  ? Math.round(
                      (completedAudits.length / clientAudits.length) * 100,
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                Auditorías completadas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Audits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Mis Auditorías
              </CardTitle>
              <CardDescription>
                Estado de las auditorías de mi organización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientAudits.slice(0, 5).map((audit) => (
                  <div
                    key={audit.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{audit.name}</h4>
                        {getStatusBadge(audit.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {audit.type} | Auditor: {audit.auditor}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Vencimiento: {audit.dueDate}
                      </div>
                      {audit.status !== "Completada" && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>Progreso</span>
                            <span>{audit.progress}%</span>
                          </div>
                          <Progress value={audit.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {clientAudits.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay auditorías disponibles</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Acciones Requeridas
              </CardTitle>
              <CardDescription>
                No conformidades que requieren tu acción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myNCs.slice(0, 5).map((nc) => {
                  const isOverdue = new Date(nc.dueDate) < new Date();

                  return (
                    <div
                      key={nc.id}
                      className={`p-3 border rounded-lg ${isOverdue ? "border-red-200 bg-red-50" : ""}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {nc.code}
                          </span>
                          {getSeverityBadge(nc.severity)}
                          {isOverdue && (
                            <Badge variant="destructive" className="text-xs">
                              Vencida
                            </Badge>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                      <h4 className="font-medium mb-1">{nc.title}</h4>
                      <div className="text-sm text-muted-foreground mb-2">
                        {nc.audit}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={
                            isOverdue
                              ? "text-red-600 font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          Vence: {nc.dueDate}
                        </span>
                        <Button
                          size="sm"
                          onClick={() =>
                            (window.location.href = "/corrective-actions")
                          }
                        >
                          Subir Acción
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {myNCs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-green-500" />
                    <p className="text-green-600 font-medium">
                      ¡Excelente! No tienes acciones pendientes
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Funciones disponibles para clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <Download className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Descargar Reportes</div>
                  <div className="text-sm text-muted-foreground">
                    Certificados y auditorías
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4"
                onClick={() => (window.location.href = "/corrective-actions")}
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Subir Evidencia</div>
                  <div className="text-sm text-muted-foreground">
                    Acciones correctivas
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Programar Reunión</div>
                  <div className="text-sm text-muted-foreground">
                    Con el equipo auditor
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Contactar Soporte</div>
                  <div className="text-sm text-muted-foreground">
                    Ayuda y consultas
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
