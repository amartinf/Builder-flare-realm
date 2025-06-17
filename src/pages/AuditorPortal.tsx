import { useState } from "react";
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
  FileText,
  AlertTriangle,
  Upload,
  Calendar,
  CheckCircle,
  Clock,
  User,
  Plus,
  Eye,
  Edit,
} from "lucide-react";

export default function AuditorPortal() {
  const { user } = useAuth();
  const { audits, loading: auditsLoading } = useAudits();
  const { nonConformities, loading: ncLoading } = useNonConformities();

  // Filter audits assigned to current auditor
  const myAudits = audits.filter(
    (audit) =>
      audit.auditor === user?.name ||
      audit.teamMembers?.some((member) => member.name === user?.name),
  );

  const myNonConformities = nonConformities.filter(
    (nc) => nc.reporter === user?.name || nc.assignee === user?.name,
  );

  const pendingAudits = myAudits.filter(
    (a) => a.status === "Programada" || a.status === "En progreso",
  );
  const completedAudits = myAudits.filter((a) => a.status === "Completada");
  const openNCs = myNonConformities.filter((nc) => nc.status !== "Cerrada");

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
            <p>Cargando portal del auditor...</p>
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
              Portal del Auditor
            </h1>
            <p className="text-muted-foreground mt-1">
              Bienvenido, {user?.name} - Gestiona tus auditorías y no
              conformidades
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => (window.location.href = "/audits")}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Auditoría
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/non-conformities")}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Nueva NC
            </Button>
          </div>
        </div>

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
              <div className="text-2xl font-bold">{myAudits.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingAudits.length} pendientes
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
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedAudits.length}</div>
              <p className="text-xs text-muted-foreground">Este período</p>
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
              <div className="text-2xl font-bold">{openNCs.length}</div>
              <p className="text-xs text-muted-foreground">Abiertas</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Audits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Mis Auditorías Asignadas
              </CardTitle>
              <CardDescription>
                Auditorías donde participas como auditor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myAudits.slice(0, 5).map((audit) => (
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
                        {audit.type} | {audit.dueDate}
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Progreso</span>
                          <span>{audit.progress}%</span>
                        </div>
                        <Progress value={audit.progress} className="h-2" />
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          (window.location.href = `/audits/${audit.id}`)
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          (window.location.href = `/audits?edit=${audit.id}`)
                        }
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {myAudits.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tienes auditorías asignadas</p>
                  </div>
                )}

                {myAudits.length > 5 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => (window.location.href = "/audits")}
                  >
                    Ver todas las auditorías
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Non-Conformities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Mis No Conformidades
              </CardTitle>
              <CardDescription>
                No conformidades reportadas o asignadas a ti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myNonConformities.slice(0, 5).map((nc) => (
                  <div
                    key={nc.id}
                    className="flex items-start justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          {nc.code}
                        </span>
                        {getSeverityBadge(nc.severity)}
                      </div>
                      <h4 className="font-medium mb-1">{nc.title}</h4>
                      <div className="text-sm text-muted-foreground">
                        {nc.audit} | Vence: {nc.dueDate}
                      </div>
                      {nc.assignee === user?.name && (
                        <div className="text-xs text-blue-600 mt-1">
                          Asignada a ti
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        (window.location.href = `/non-conformities/${nc.id}`)
                      }
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {myNonConformities.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No tienes no conformidades asignadas</p>
                  </div>
                )}

                {myNonConformities.length > 5 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => (window.location.href = "/non-conformities")}
                  >
                    Ver todas las no conformidades
                  </Button>
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
              Funciones frecuentes para auditores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4"
                onClick={() => (window.location.href = "/audits")}
              >
                <div className="text-center">
                  <Plus className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Crear Auditoría</div>
                  <div className="text-sm text-muted-foreground">
                    Nueva auditoría programada
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4"
                onClick={() => (window.location.href = "/non-conformities")}
              >
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Reportar NC</div>
                  <div className="text-sm text-muted-foreground">
                    Nueva no conformidad
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Subir Evidencia</div>
                  <div className="text-sm text-muted-foreground">
                    Documentos y fotos
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
