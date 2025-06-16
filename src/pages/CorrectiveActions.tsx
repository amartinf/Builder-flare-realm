import { useState, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  Clock,
  Upload,
  Download,
  MessageSquare,
  FileText,
  AlertTriangle,
  Users,
  Calendar,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  ArrowRight,
  X,
  CheckCheck,
  XCircle,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import {
  getCorrectiveActionStatus,
  getCorrectiveActionStatusBadge,
  getAvailableTransitions,
  CORRECTIVE_ACTION_EVIDENCE_TYPES,
  CORRECTIVE_ACTION_TEMPLATES,
  hasPermission,
} from "@/config/correctiveActions";

// Mock data - en una app real vendría de la base de datos
const initialCorrectiveActions = [
  {
    id: 1,
    nonConformityId: 1,
    nonConformityCode: "NC-001",
    nonConformityTitle: "Falta de documentación en proceso de calidad",
    audit: "ISO 9001 - Planta Norte",
    status: "enviada",
    description:
      "Actualizar manual de calidad QP-001 para incluir procedimientos de control específicos para línea de producción A",
    implementationDate: "2024-02-15",
    assignedTo: "Roberto Silva",
    assignedBy: "María González",
    createdDate: "2024-01-22",
    lastModified: "2024-01-23",
    evidence: [
      {
        id: 1,
        type: "plan_accion",
        name: "Plan_Actualizacion_QP001.pdf",
        uploadDate: "2024-01-23",
        size: "2.1 MB",
      },
    ],
    comments: [
      {
        id: 1,
        author: "Roberto Silva",
        content:
          "Se ha actualizado el manual QP-001 incluyendo todos los controles requeridos",
        date: "2024-01-23T10:30:00",
        type: "submission",
      },
    ],
  },
  {
    id: 2,
    nonConformityId: 2,
    nonConformityCode: "NC-002",
    nonConformityTitle: "Incumplimiento de protocolo de seguridad",
    audit: "Auditoría de Seguridad - Almacén",
    status: "en_revision",
    description:
      "Implementar programa de capacitación semanal en uso de EPP y establecer supervisión diaria en áreas de alto riesgo",
    implementationDate: "2024-02-10",
    assignedTo: "Carmen Torres",
    assignedBy: "Ana López",
    createdDate: "2024-01-20",
    lastModified: "2024-01-24",
    evidence: [
      {
        id: 1,
        type: "capacitacion",
        name: "Programa_Capacitacion_EPP.docx",
        uploadDate: "2024-01-24",
        size: "1.8 MB",
      },
      {
        id: 2,
        type: "foto_antes_despues",
        name: "Evidencia_Visual_EPP.jpg",
        uploadDate: "2024-01-24",
        size: "3.2 MB",
      },
    ],
    comments: [
      {
        id: 1,
        author: "Carmen Torres",
        content:
          "Programa de capacitación implementado. Se adjunta cronograma y evidencia visual",
        date: "2024-01-24T14:15:00",
        type: "submission",
      },
      {
        id: 2,
        author: "Ana López",
        content: "Revisando evidencias y programa propuesto",
        date: "2024-01-24T16:00:00",
        type: "review",
      },
    ],
  },
  {
    id: 3,
    nonConformityId: 3,
    nonConformityCode: "NC-003",
    nonConformityTitle: "Desviación en registro de temperaturas",
    audit: "Auditoría Ambiental - Sede Central",
    status: "aprobada",
    description:
      "Calibrar sistema de climatización e implementar monitoreo automático de temperatura con alertas",
    implementationDate: "2024-01-30",
    assignedTo: "Miguel Herrera",
    assignedBy: "Carlos Ruiz",
    createdDate: "2024-01-16",
    lastModified: "2024-01-25",
    approvedDate: "2024-01-25",
    evidence: [
      {
        id: 1,
        type: "verificacion",
        name: "Certificado_Calibracion_Climatizacion.pdf",
        uploadDate: "2024-01-19",
        size: "1.5 MB",
      },
      {
        id: 2,
        type: "procedimiento",
        name: "Procedimiento_Monitoreo_Temperatura.pdf",
        uploadDate: "2024-01-19",
        size: "2.3 MB",
      },
    ],
    comments: [
      {
        id: 1,
        author: "Miguel Herrera",
        content: "Sistema calibrado y procedimiento de monitoreo implementado",
        date: "2024-01-19T11:30:00",
        type: "submission",
      },
      {
        id: 2,
        author: "Carlos Ruiz",
        content:
          "Acción correctiva aprobada. Sistema funcionando correctamente",
        date: "2024-01-25T09:15:00",
        type: "approval",
      },
    ],
  },
];

// Mock user - en una app real vendría del contexto de autenticación
const currentUser = {
  role: "auditor", // "auditor", "cliente_auditado", "responsable_area"
  name: "María González",
  email: "maria.gonzalez@empresa.com",
};

export default function CorrectiveActions() {
  const { toast } = useToast();
  const [correctiveActions, setCorrectiveActions] = useState(
    initialCorrectiveActions,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Filtros
  const filteredActions = useMemo(() => {
    return correctiveActions.filter((action) => {
      const matchesSearch =
        action.nonConformityTitle
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        action.nonConformityCode
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        action.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || action.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [correctiveActions, searchQuery, statusFilter]);

  // Cambiar estado de acción correctiva
  const handleStatusChange = (
    actionId: number,
    newStatus: string,
    comment?: string,
  ) => {
    setCorrectiveActions((prevActions) =>
      prevActions.map((action) =>
        action.id === actionId
          ? {
              ...action,
              status: newStatus,
              lastModified: new Date().toISOString(),
              approvedDate:
                newStatus === "aprobada"
                  ? new Date().toISOString().split("T")[0]
                  : action.approvedDate,
              comments: [
                ...action.comments,
                {
                  id: action.comments.length + 1,
                  author: currentUser.name,
                  content:
                    comment ||
                    `Estado cambiado a: ${getCorrectiveActionStatus(newStatus)?.label}`,
                  date: new Date().toISOString(),
                  type:
                    newStatus === "aprobada"
                      ? "approval"
                      : newStatus === "rechazada"
                        ? "rejection"
                        : "status_change",
                },
              ],
            }
          : action,
      ),
    );

    const statusConfig = getCorrectiveActionStatus(newStatus);
    toast({
      title: "Estado actualizado",
      description: `La acción correctiva cambió a: ${statusConfig?.label}`,
    });
  };

  // Agregar comentario
  const handleAddComment = (actionId: number) => {
    if (!newComment.trim()) return;

    setCorrectiveActions((prevActions) =>
      prevActions.map((action) =>
        action.id === actionId
          ? {
              ...action,
              lastModified: new Date().toISOString(),
              comments: [
                ...action.comments,
                {
                  id: action.comments.length + 1,
                  author: currentUser.name,
                  content: newComment.trim(),
                  date: new Date().toISOString(),
                  type: "comment",
                },
              ],
            }
          : action,
      ),
    );

    setNewComment("");
    toast({
      title: "Comentario agregado",
      description: "Tu comentario ha sido agregado exitosamente",
    });
  };

  // Obtener badge del estado
  const getStatusBadge = (status: string) => {
    const statusConfig = getCorrectiveActionStatus(status);
    if (!statusConfig) return <Badge variant="secondary">{status}</Badge>;

    const variantMap = {
      pending: "status-pending",
      approved: "status-approved",
      draft: "status-draft",
      default: "default",
      secondary: "secondary",
      destructive: "destructive",
      outline: "outline",
    } as const;

    const className = variantMap[statusConfig.badge] || statusConfig.badge;

    return (
      <Badge
        className={className.startsWith("status-") ? className : undefined}
        variant={
          className.startsWith("status-") ? undefined : (className as any)
        }
        style={{
          backgroundColor: statusConfig.color + "20",
          color: statusConfig.color,
          borderColor: statusConfig.color,
        }}
      >
        {statusConfig.label}
      </Badge>
    );
  };

  // Componente para acciones rápidas según el rol
  const QuickActions = ({ action }: { action: any }) => {
    const availableTransitions = getAvailableTransitions(
      action.status,
      currentUser.role,
    );

    if (availableTransitions.length === 0) return null;

    return (
      <div className="flex gap-2">
        {availableTransitions.map((transition) => {
          let icon,
            label,
            variant: "default" | "destructive" | "outline" = "outline";

          switch (transition?.value) {
            case "aprobada":
              icon = <CheckCheck className="w-4 h-4" />;
              label = "Aprobar";
              variant = "default";
              break;
            case "rechazada":
              icon = <XCircle className="w-4 h-4" />;
              label = "Rechazar";
              variant = "destructive";
              break;
            case "en_revision":
              icon = <Eye className="w-4 h-4" />;
              label = "Revisar";
              break;
            case "requiere_modificacion":
              icon = <Edit className="w-4 h-4" />;
              label = "Solicitar cambios";
              break;
            default:
              icon = <ArrowRight className="w-4 h-4" />;
              label = transition?.label || "";
          }

          return (
            <Button
              key={transition?.value}
              variant={variant}
              size="sm"
              onClick={() => handleStatusChange(action.id, transition!.value)}
            >
              {icon}
              {label}
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Acciones Correctivas
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona las acciones correctivas propuestas para las no
              conformidades
            </p>
          </div>
          {hasPermission(currentUser.role, "submit_corrective_actions") && (
            <Button className="audit-gradient text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nueva acción correctiva
            </Button>
          )}
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    placeholder="Buscar acciones correctivas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="enviada">Enviada</SelectItem>
                    <SelectItem value="en_revision">En revisión</SelectItem>
                    <SelectItem value="aprobada">Aprobada</SelectItem>
                    <SelectItem value="rechazada">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de acciones correctivas */}
        <div className="space-y-4">
          {filteredActions.map((action) => (
            <Card key={action.id} className="audit-card">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-mono text-muted-foreground">
                        {action.nonConformityCode}
                      </span>
                      {getStatusBadge(action.status)}
                    </div>
                    <CardTitle className="text-lg font-semibold mb-1">
                      {action.nonConformityTitle}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      <strong>Acción propuesta:</strong> {action.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedAction(action);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver detalles
                      </DropdownMenuItem>
                      {hasPermission(
                        currentUser.role,
                        "submit_corrective_actions",
                      ) && (
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Download className="w-4 h-4 mr-2" />
                        Descargar reporte
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-muted-foreground mb-1">Auditoría</p>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span className="font-medium">{action.audit}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Asignado a</p>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span className="font-medium">{action.assignedTo}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Implementación</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span className="font-medium">
                        {action.implementationDate}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Evidencias</p>
                    <div className="flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span className="font-medium">
                        {action.evidence.length} archivo(s)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones rápidas */}
                <div className="flex flex-col sm:flex-row gap-2 justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAction(action);
                        setIsDetailDialogOpen(true);
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver detalles
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Comentarios ({action.comments.length})
                    </Button>
                  </div>
                  <QuickActions action={action} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {filteredActions.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron acciones correctivas
              </h3>
              <p className="text-muted-foreground">
                Ajusta los filtros o revisa si hay no conformidades pendientes
                de acción
              </p>
            </CardContent>
          </Card>
        )}

        {/* Diálogo de detalles */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            {selectedAction && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl">
                      {selectedAction.nonConformityCode} - Acción Correctiva
                    </DialogTitle>
                    {getStatusBadge(selectedAction.status)}
                  </div>
                  <DialogDescription>
                    {selectedAction.audit} • Asignado a{" "}
                    {selectedAction.assignedTo}
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Detalles</TabsTrigger>
                    <TabsTrigger value="evidence">
                      Evidencias ({selectedAction.evidence.length})
                    </TabsTrigger>
                    <TabsTrigger value="comments">
                      Comentarios ({selectedAction.comments.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">
                          No conformidad:
                        </p>
                        <p>{selectedAction.nonConformityTitle}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Estado actual:
                        </p>
                        <div className="mt-1">
                          {getStatusBadge(selectedAction.status)}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Fecha de implementación:
                        </p>
                        <p>{selectedAction.implementationDate}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Última modificación:
                        </p>
                        <p>
                          {new Date(
                            selectedAction.lastModified,
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-muted-foreground mb-2">
                        Descripción de la acción correctiva:
                      </p>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">
                        {selectedAction.description}
                      </p>
                    </div>

                    {/* Acciones de estado disponibles */}
                    {hasPermission(
                      currentUser.role,
                      "review_corrective_actions",
                    ) && (
                      <div>
                        <p className="font-medium text-muted-foreground mb-2">
                          Acciones disponibles:
                        </p>
                        <QuickActions action={selectedAction} />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="evidence" className="space-y-4">
                    <div className="space-y-3">
                      {selectedAction.evidence.map((evidence: any) => (
                        <div
                          key={evidence.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-primary" />
                            <div>
                              <p className="font-medium">{evidence.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {
                                  CORRECTIVE_ACTION_EVIDENCE_TYPES.find(
                                    (t) => t.value === evidence.type,
                                  )?.label
                                }{" "}
                                •{evidence.size} • {evidence.uploadDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              Descargar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="comments" className="space-y-4">
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedAction.comments.map((comment: any) => (
                        <div key={comment.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {comment.author}
                              </span>
                              {comment.type === "approval" && (
                                <Badge variant="default" className="text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Aprobación
                                </Badge>
                              )}
                              {comment.type === "rejection" && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Rechazo
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.date).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Agregar comentario */}
                    <div className="border-t pt-4">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Agregar un comentario..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={2}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleAddComment(selectedAction.id)}
                          disabled={!newComment.trim()}
                          size="sm"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Enviar
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailDialogOpen(false)}
                  >
                    Cerrar
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
