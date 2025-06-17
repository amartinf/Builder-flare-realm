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
import { useAudits } from "@/hooks/useFileMaker";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import {
  Calendar,
  Users,
  Clock,
  FileText,
  AlertTriangle,
  Settings,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export default function SecretaryPortal() {
  const { user } = useAuth();
  const { audits, loading } = useAudits();

  // Calculate metrics for secretary oversight
  const totalAudits = audits.length;
  const scheduledAudits = audits.filter(
    (a) => a.status === "Programada",
  ).length;
  const inProgressAudits = audits.filter(
    (a) => a.status === "En progreso",
  ).length;
  const auditorsNeeded = audits.filter(
    (a) => !a.teamMembers || a.teamMembers.length === 0,
  ).length;

  // Audits needing time optimization
  const auditsWithTimeIssues = audits.filter((audit) => {
    const totalAssigned =
      audit.teamMembers?.reduce(
        (sum, member) => sum + (member.assignedDays || 0),
        0,
      ) || 0;
    return totalAssigned !== audit.workingDays;
  });

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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando portal de secretaría técnica...</p>
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
              Portal de Secretaría Técnica
            </h1>
            <p className="text-muted-foreground mt-1">
              Bienvenida, {user?.name} - Gestión de equipos auditores y
              planificación
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => (window.location.href = "/audits")}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Auditoría
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/users")}
            >
              <Users className="w-4 h-4 mr-2" />
              Gestionar Equipos
            </Button>
          </div>
        </div>

        {/* Alerts for time issues */}
        {auditsWithTimeIssues.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Clock className="w-5 h-5" />
                Auditorías con Problemas de Tiempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-orange-700">
                <p className="font-medium">
                  {auditsWithTimeIssues.length} auditoría
                  {auditsWithTimeIssues.length > 1 ? "s" : ""} requiere
                  {auditsWithTimeIssues.length === 1 ? "" : "n"} ajuste en la
                  distribución de tiempo
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 border-orange-200 text-orange-700 hover:bg-orange-100"
                  onClick={() => (window.location.href = "/audits")}
                >
                  Revisar y Ajustar
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
                Total Auditorías
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAudits}</div>
              <p className="text-xs text-muted-foreground">
                {inProgressAudits} en progreso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Programadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scheduledAudits}</div>
              <p className="text-xs text-muted-foreground">
                Próximas auditorías
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Necesitan Equipo
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditorsNeeded}</div>
              <p className="text-xs text-muted-foreground">
                Sin equipo asignado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Problemas de Tiempo
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {auditsWithTimeIssues.length}
              </div>
              <p className="text-xs text-muted-foreground">Requieren ajuste</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audits requiring attention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Gestión de Tiempo de Auditorías
              </CardTitle>
              <CardDescription>
                Auditorías que requieren optimización de tiempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditsWithTimeIssues.slice(0, 5).map((audit) => {
                  const totalAssigned =
                    audit.teamMembers?.reduce(
                      (sum, member) => sum + (member.assignedDays || 0),
                      0,
                    ) || 0;
                  const timeIssue =
                    totalAssigned > audit.workingDays
                      ? "Sobreasignado"
                      : totalAssigned < audit.workingDays
                        ? "Subasignado"
                        : "Correcto";

                  return (
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
                          Equipo: {audit.teamMembers?.length || 0} miembros
                        </div>
                        <div className="text-sm">
                          <span
                            className={
                              timeIssue === "Sobreasignado"
                                ? "text-red-600"
                                : timeIssue === "Subasignado"
                                  ? "text-orange-600"
                                  : "text-green-600"
                            }
                          >
                            {totalAssigned.toFixed(1)}/{audit.workingDays} días
                            - {timeIssue}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() =>
                            (window.location.href = `/audits?edit=${audit.id}`)
                          }
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {auditsWithTimeIssues.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-green-500" />
                    <p className="text-green-600 font-medium">
                      ¡Excelente! Todas las auditorías tienen distribución
                      correcta de tiempo
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team assignment overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Asignación de Equipos
              </CardTitle>
              <CardDescription>
                Estado de asignación de equipos auditores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {audits
                  .filter((a) => a.status !== "Completada")
                  .slice(0, 5)
                  .map((audit) => (
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
                        <div className="text-sm">
                          Equipo: {audit.teamMembers?.length || 0}/
                          {Math.ceil(audit.workingDays / 2)} recomendado
                        </div>
                        {audit.teamMembers && audit.teamMembers.length > 0 && (
                          <div className="mt-1">
                            <Progress
                              value={
                                (audit.teamMembers.length /
                                  Math.ceil(audit.workingDays / 2)) *
                                100
                              }
                              className="h-2"
                            />
                          </div>
                        )}
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones de Secretaría Técnica</CardTitle>
            <CardDescription>
              Herramientas para gestión de equipos y planificación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4"
                onClick={() => (window.location.href = "/audits")}
              >
                <div className="text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Programar Auditoría</div>
                  <div className="text-sm text-muted-foreground">
                    Nueva auditoría con equipo
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4"
                onClick={() => (window.location.href = "/users")}
              >
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Gestionar Equipos</div>
                  <div className="text-sm text-muted-foreground">
                    Asignar auditores a equipos
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Optimizar Tiempo</div>
                  <div className="text-sm text-muted-foreground">
                    Redistribuir jornadas
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4"
                onClick={() => (window.location.href = "/reports")}
              >
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-medium">Reportes</div>
                  <div className="text-sm text-muted-foreground">
                    Eficiencia de equipos
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
