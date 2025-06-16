import { useState, useRef } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  Send,
  Eye,
  Download,
  Calendar,
  User,
  Building,
  MessageSquare,
  Plus,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import {
  getCorrectiveActionStatus,
  CORRECTIVE_ACTION_EVIDENCE_TYPES,
  CORRECTIVE_ACTION_TEMPLATES,
} from "@/config/correctiveActions";

// Mock data para no conformidades asignadas al cliente
const assignedNonConformities = [
  {
    id: 1,
    code: "NC-001",
    title: "Falta de documentación en proceso de calidad",
    description:
      "No se encontró evidencia documental del proceso de control de calidad establecido en el procedimiento QP-001.",
    audit: "ISO 9001 - Planta Norte",
    auditor: "María González",
    severity: "Alta",
    dueDate: "2024-01-28",
    createdDate: "2024-01-20",
    category: "Documentación",
    status: "pendiente", // pendiente, enviada, en_revision, aprobada, rechazada
    correctiveAction: null,
  },
  {
    id: 2,
    code: "NC-002",
    title: "Incumplimiento de protocolo de seguridad",
    description:
      "Personal trabajando sin equipo de protección individual obligatorio en área de riesgo alto.",
    audit: "Auditoría de Seguridad - Almacén",
    auditor: "Ana López",
    severity: "Crítica",
    dueDate: "2024-01-22",
    createdDate: "2024-01-18",
    category: "Seguridad",
    status: "en_revision",
    correctiveAction: {
      id: 1,
      description: "Implementar programa de capacitación semanal en uso de EPP",
      implementationDate: "2024-02-10",
      submittedDate: "2024-01-24",
      evidence: [
        {
          id: 1,
          name: "Programa_Capacitacion_EPP.docx",
          type: "capacitacion",
          size: "1.8 MB",
        },
      ],
      comments: [
        {
          id: 1,
          author: "Carmen Torres",
          content: "Programa enviado para revisión",
          date: "2024-01-24T14:15:00",
        },
      ],
    },
  },
  {
    id: 3,
    code: "NC-005",
    title: "Falta de calibración en equipos",
    description:
      "Tres equipos de medición no presentan certificado de calibración vigente.",
    audit: "Auditoría de Calidad - Laboratorio",
    auditor: "Laura Jiménez",
    severity: "Media",
    dueDate: "2024-02-05",
    createdDate: "2024-01-21",
    category: "Equipos",
    status: "requiere_modificacion",
    correctiveAction: {
      id: 2,
      description: "Calibrar equipos y establecer cronograma de mantenimiento",
      implementationDate: "2024-02-15",
      submittedDate: "2024-01-26",
      evidence: [
        {
          id: 1,
          name: "Cronograma_Calibracion.pdf",
          type: "plan_accion",
          size: "2.1 MB",
        },
      ],
      reviewComments:
        "Se requiere incluir procedimiento detallado de calibración y responsables específicos",
      comments: [
        {
          id: 1,
          author: "Diego Fernández",
          content: "Primera versión del cronograma enviada",
          date: "2024-01-26T10:30:00",
        },
        {
          id: 2,
          author: "Laura Jiménez",
          content: "Se requieren más detalles en el procedimiento",
          date: "2024-01-27T09:15:00",
        },
      ],
    },
  },
];

// Mock user data
const clientUser = {
  name: "Carmen Torres",
  role: "Responsable de Calidad",
  company: "Empresa Ejemplo S.A.",
  email: "carmen.torres@empresa.com",
  phone: "+52 555 123 4567",
};

export default function ClientPortal() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nonConformities, setNonConformities] = useState(
    assignedNonConformities,
  );
  const [selectedNC, setSelectedNC] = useState<any>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    description: "",
    implementationDate: "",
    evidenceFiles: [] as File[],
    evidenceTypes: [] as string[],
  });

  const [newComment, setNewComment] = useState("");

  // Obtener badge del estado
  const getStatusBadge = (status: string) => {
    const statusConfig = getCorrectiveActionStatus(status);
    if (!statusConfig) return <Badge variant="secondary">{status}</Badge>;

    return (
      <Badge
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

  // Manejar subida de archivos
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    setFormData((prev) => ({
      ...prev,
      evidenceFiles: [...prev.evidenceFiles, ...fileArray],
    }));

    toast({
      title: "Archivos agregados",
      description: `${fileArray.length} archivo(s) agregado(s) exitosamente`,
    });
  };

  // Enviar acción correctiva
  const handleSubmitCorrectiveAction = () => {
    if (!formData.description || !formData.implementationDate) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const newAction = {
      id: Date.now(),
      description: formData.description,
      implementationDate: formData.implementationDate,
      submittedDate: new Date().toISOString().split("T")[0],
      evidence: formData.evidenceFiles.map((file, index) => ({
        id: index + 1,
        name: file.name,
        type: formData.evidenceTypes[index] || "documento_soporte",
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      })),
      comments: [
        {
          id: 1,
          author: clientUser.name,
          content: "Acción correctiva enviada para revisión",
          date: new Date().toISOString(),
        },
      ],
    };

    setNonConformities((prev) =>
      prev.map((nc) =>
        nc.id === selectedNC?.id
          ? { ...nc, status: "enviada", correctiveAction: newAction }
          : nc,
      ),
    );

    setIsSubmitDialogOpen(false);
    setFormData({
      description: "",
      implementationDate: "",
      evidenceFiles: [],
      evidenceTypes: [],
    });

    toast({
      title: "Acción correctiva enviada",
      description: "Tu propuesta ha sido enviada para revisión del auditor",
    });
  };

  // Agregar comentario
  const handleAddComment = (ncId: number) => {
    if (!newComment.trim()) return;

    setNonConformities((prev) =>
      prev.map((nc) =>
        nc.id === ncId && nc.correctiveAction
          ? {
              ...nc,
              correctiveAction: {
                ...nc.correctiveAction,
                comments: [
                  ...nc.correctiveAction.comments,
                  {
                    id: nc.correctiveAction.comments.length + 1,
                    author: clientUser.name,
                    content: newComment.trim(),
                    date: new Date().toISOString(),
                  },
                ],
              },
            }
          : nc,
      ),
    );

    setNewComment("");
    toast({
      title: "Comentario agregado",
      description: "Tu comentario ha sido agregado exitosamente",
    });
  };

  // Obtener días hasta vencimiento
  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header con información del cliente */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Building className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Portal del Cliente
              </h1>
              <p className="text-muted-foreground mt-1">
                Bienvenido, {clientUser.name} - {clientUser.role}
              </p>
              <p className="text-sm text-muted-foreground">
                {clientUser.company} • {clientUser.email}
              </p>
            </div>
          </div>
        </div>

        {/* Resumen de estado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total
                  </p>
                  <p className="text-2xl font-bold">{nonConformities.length}</p>
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
                    Pendientes
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {
                      nonConformities.filter((nc) => nc.status === "pendiente")
                        .length
                    }
                  </p>
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
                    En revisión
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {
                      nonConformities.filter(
                        (nc) => nc.status === "en_revision",
                      ).length
                    }
                  </p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Aprobadas
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      nonConformities.filter((nc) => nc.status === "aprobada")
                        .length
                    }
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de no conformidades */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">No Conformidades Asignadas</h2>

          {nonConformities.map((nc) => {
            const daysUntilDue = getDaysUntilDue(nc.dueDate);
            const isOverdue = daysUntilDue < 0;
            const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;

            return (
              <Card key={nc.id} className="audit-card">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-mono text-muted-foreground">
                          {nc.code}
                        </span>
                        <Badge
                          variant={
                            nc.severity === "Crítica"
                              ? "destructive"
                              : nc.severity === "Alta"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {nc.severity}
                        </Badge>
                        {getStatusBadge(nc.status)}
                      </div>
                      <CardTitle className="text-lg font-semibold mb-1">
                        {nc.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {nc.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground mb-1">Auditoría</p>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span className="font-medium">{nc.audit}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Auditor</p>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="font-medium">{nc.auditor}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Fecha límite</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span
                          className={`font-medium ${isOverdue ? "text-red-600" : isUrgent ? "text-orange-600" : ""}`}
                        >
                          {nc.dueDate}
                        </span>
                      </div>
                      {isOverdue && (
                        <p className="text-xs text-red-600 mt-1">
                          Vencida hace {Math.abs(daysUntilDue)} días
                        </p>
                      )}
                      {isUrgent && (
                        <p className="text-xs text-orange-600 mt-1">
                          Vence en {daysUntilDue} días
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Estado de acción correctiva */}
                  {nc.correctiveAction && (
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <p className="text-sm font-medium mb-1">
                        Acción correctiva propuesta:
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {nc.correctiveAction.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span>
                          Implementación:{" "}
                          {nc.correctiveAction.implementationDate}
                        </span>
                        <span>
                          Evidencias: {nc.correctiveAction.evidence.length}
                        </span>
                        <span>
                          Comentarios: {nc.correctiveAction.comments.length}
                        </span>
                      </div>
                      {nc.status === "requiere_modificacion" &&
                        nc.correctiveAction.reviewComments && (
                          <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                            <p className="font-medium text-orange-800">
                              Comentarios del auditor:
                            </p>
                            <p className="text-orange-700">
                              {nc.correctiveAction.reviewComments}
                            </p>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex flex-col sm:flex-row gap-2 justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedNC(nc);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver detalles
                      </Button>
                      {nc.correctiveAction && (
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Comentarios ({nc.correctiveAction.comments.length})
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {(nc.status === "pendiente" ||
                        nc.status === "requiere_modificacion") && (
                        <Button
                          onClick={() => {
                            setSelectedNC(nc);
                            if (nc.correctiveAction) {
                              setFormData({
                                description: nc.correctiveAction.description,
                                implementationDate:
                                  nc.correctiveAction.implementationDate,
                                evidenceFiles: [],
                                evidenceTypes: [],
                              });
                            }
                            setIsSubmitDialogOpen(true);
                          }}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          {nc.correctiveAction ? "Actualizar" : "Enviar"} acción
                          correctiva
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Diálogo para enviar acción correctiva */}
        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedNC?.correctiveAction ? "Actualizar" : "Enviar"} Acción
                Correctiva
              </DialogTitle>
              <DialogDescription>
                {selectedNC?.code} - {selectedNC?.title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Plantillas sugeridas */}
              {selectedNC && !selectedNC.correctiveAction && (
                <div>
                  <Label>Plantillas sugeridas</Label>
                  <div className="mt-2 space-y-2">
                    {(
                      CORRECTIVE_ACTION_TEMPLATES[
                        selectedNC.category as keyof typeof CORRECTIVE_ACTION_TEMPLATES
                      ] || []
                    ).map((template, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-left h-auto p-2 justify-start"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            description: template,
                          }))
                        }
                      >
                        <Plus className="w-3 h-3 mr-2 flex-shrink-0" />
                        <span className="text-xs">{template}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">
                  Descripción de la acción correctiva *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe detalladamente las acciones que implementarás para corregir la no conformidad..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="implementationDate">
                  Fecha de implementación *
                </Label>
                <Input
                  id="implementationDate"
                  type="date"
                  value={formData.implementationDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      implementationDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Evidencias de soporte</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                  />
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Seleccionar archivos
                  </Button>
                </div>

                {formData.evidenceFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.evidenceFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(file.size / 1024 / 1024).toFixed(1)} MB)
                          </span>
                        </div>
                        <Select
                          value={formData.evidenceTypes[index] || ""}
                          onValueChange={(value) => {
                            const newTypes = [...formData.evidenceTypes];
                            newTypes[index] = value;
                            setFormData((prev) => ({
                              ...prev,
                              evidenceTypes: newTypes,
                            }));
                          }}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Tipo de evidencia" />
                          </SelectTrigger>
                          <SelectContent>
                            {CORRECTIVE_ACTION_EVIDENCE_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsSubmitDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSubmitCorrectiveAction}>
                <Send className="w-4 h-4 mr-2" />
                {selectedNC?.correctiveAction ? "Actualizar" : "Enviar"} acción
                correctiva
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo de detalles */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            {selectedNC && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl">
                      {selectedNC.code} - {selectedNC.title}
                    </DialogTitle>
                    {getStatusBadge(selectedNC.status)}
                  </div>
                  <DialogDescription>
                    {selectedNC.audit} • Auditor: {selectedNC.auditor}
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="nonconformity" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="nonconformity">
                      No Conformidad
                    </TabsTrigger>
                    <TabsTrigger value="action">Acción Correctiva</TabsTrigger>
                  </TabsList>

                  <TabsContent value="nonconformity" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Severidad:
                        </p>
                        <Badge
                          variant={
                            selectedNC.severity === "Crítica"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {selectedNC.severity}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Categoría:
                        </p>
                        <p>{selectedNC.category}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Fecha límite:
                        </p>
                        <p>{selectedNC.dueDate}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Fecha de creación:
                        </p>
                        <p>{selectedNC.createdDate}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-muted-foreground mb-2">
                        Descripción:
                      </p>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">
                        {selectedNC.description}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="action" className="space-y-4">
                    {selectedNC.correctiveAction ? (
                      <>
                        <div>
                          <p className="font-medium text-muted-foreground mb-2">
                            Acción correctiva propuesta:
                          </p>
                          <p className="text-sm bg-muted/50 p-3 rounded-lg">
                            {selectedNC.correctiveAction.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-muted-foreground">
                              Fecha de implementación:
                            </p>
                            <p>
                              {selectedNC.correctiveAction.implementationDate}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">
                              Fecha de envío:
                            </p>
                            <p>{selectedNC.correctiveAction.submittedDate}</p>
                          </div>
                        </div>

                        {/* Evidencias */}
                        <div>
                          <p className="font-medium text-muted-foreground mb-2">
                            Evidencias (
                            {selectedNC.correctiveAction.evidence.length})
                          </p>
                          <div className="space-y-2">
                            {selectedNC.correctiveAction.evidence.map(
                              (evidence: any) => (
                                <div
                                  key={evidence.id}
                                  className="flex items-center justify-between p-2 border rounded"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    <div>
                                      <p className="text-sm font-medium">
                                        {evidence.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {
                                          CORRECTIVE_ACTION_EVIDENCE_TYPES.find(
                                            (t) => t.value === evidence.type,
                                          )?.label
                                        }{" "}
                                        • {evidence.size}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                      <Eye className="w-3 h-3 mr-1" />
                                      Ver
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <Download className="w-3 h-3 mr-1" />
                                      Descargar
                                    </Button>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Comentarios */}
                        <div>
                          <p className="font-medium text-muted-foreground mb-2">
                            Comentarios (
                            {selectedNC.correctiveAction.comments.length})
                          </p>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedNC.correctiveAction.comments.map(
                              (comment: any) => (
                                <div
                                  key={comment.id}
                                  className="p-2 border rounded text-sm"
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-medium">
                                      {comment.author}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(comment.date).toLocaleString()}
                                    </span>
                                  </div>
                                  <p>{comment.content}</p>
                                </div>
                              ),
                            )}
                          </div>

                          {/* Agregar comentario */}
                          <div className="flex gap-2 mt-2">
                            <Textarea
                              placeholder="Agregar comentario..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              rows={2}
                              className="flex-1"
                            />
                            <Button
                              onClick={() => handleAddComment(selectedNC.id)}
                              disabled={!newComment.trim()}
                              size="sm"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Enviar
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Acción correctiva pendiente
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Aún no has enviado una acción correctiva para esta no
                          conformidad
                        </p>
                        <Button
                          onClick={() => {
                            setIsDetailDialogOpen(false);
                            setIsSubmitDialogOpen(true);
                          }}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Enviar acción correctiva
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailDialogOpen(false)}
                  >
                    Cerrar
                  </Button>
                  {selectedNC.status === "pendiente" ||
                  selectedNC.status === "requiere_modificacion" ? (
                    <Button
                      onClick={() => {
                        setIsDetailDialogOpen(false);
                        setIsSubmitDialogOpen(true);
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {selectedNC.correctiveAction
                        ? "Actualizar"
                        : "Enviar"}{" "}
                      acción correctiva
                    </Button>
                  ) : null}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
