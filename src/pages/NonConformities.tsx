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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  FileText,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  ArrowRight,
  Activity,
} from "lucide-react";
import { Layout } from "@/components/Layout";

// Types
interface NonConformity {
  id: number;
  code: string;
  title: string;
  description: string;
  audit: string;
  auditId: number;
  auditType: string;
  severity: "Crítica" | "Alta" | "Media" | "Baja";
  status: "Abierta" | "En revisión" | "En progreso" | "Cerrada";
  assignee: string;
  reporter: string;
  dueDate: string;
  createdDate: string;
  closedDate?: string;
  category: string;
  evidence?: string;
  correctiveAction?: string;
  rootCause?: string;
  comments: Comment[];
}

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  type: "comment" | "status_change" | "assignment";
}

// Initial data
const initialNonConformities: NonConformity[] = [
  {
    id: 1,
    code: "NC-001",
    title: "Falta de documentación en proceso de calidad",
    description:
      "No se encontró evidencia documental del proceso de control de calidad establecido en el procedimiento QP-001. Los operarios no tienen acceso a las instrucciones de trabajo actualizadas.",
    audit: "ISO 9001 - Planta Norte",
    auditId: 1,
    auditType: "Calidad",
    severity: "Alta",
    status: "Abierta",
    assignee: "Roberto Silva",
    reporter: "María González",
    dueDate: "2024-01-28",
    createdDate: "2024-01-20",
    category: "Documentación",
    evidence: "Fotografías del área de trabajo sin documentación visible",
    comments: [
      {
        id: 1,
        author: "María González",
        content: "No conformidad identificada durante inspección de rutina",
        date: "2024-01-20T10:30:00",
        type: "comment",
      },
    ],
  },
  {
    id: 2,
    code: "NC-002",
    title: "Incumplimiento de protocolo de seguridad",
    description:
      "Personal trabajando sin equipo de protección individual obligatorio en área de riesgo alto. Se observaron 3 trabajadores sin casco de seguridad y 2 sin gafas protectoras.",
    audit: "Auditoría de Seguridad - Almacén",
    auditId: 3,
    auditType: "Seguridad",
    severity: "Crítica",
    status: "En revisión",
    assignee: "Carmen Torres",
    reporter: "Ana López",
    dueDate: "2024-01-22",
    createdDate: "2024-01-18",
    category: "Seguridad",
    evidence: "Video del área de trabajo",
    rootCause: "Falta de supervisión y entrenamiento del personal",
    comments: [
      {
        id: 1,
        author: "Ana López",
        content: "Situación crítica identificada durante auditoría",
        date: "2024-01-18T14:15:00",
        type: "comment",
      },
      {
        id: 2,
        author: "Carmen Torres",
        content: "Iniciando investigación de causa raíz",
        date: "2024-01-19T09:00:00",
        type: "status_change",
      },
    ],
  },
  {
    id: 3,
    code: "NC-003",
    title: "Desviación en registro de temperaturas",
    description:
      "Los registros de temperatura del almacén muestran valores fuera del rango establecido (18-22°C) durante 3 días consecutivos. Temperaturas registradas entre 25-27°C.",
    audit: "Auditoría Ambiental - Sede Central",
    auditId: 2,
    auditType: "Ambiental",
    severity: "Media",
    status: "Cerrada",
    assignee: "Miguel Herrera",
    reporter: "Carlos Ruiz",
    dueDate: "2024-01-20",
    createdDate: "2024-01-15",
    closedDate: "2024-01-19",
    category: "Monitoreo",
    evidence: "Registros de temperatura automáticos",
    correctiveAction:
      "Calibración del sistema de climatización y ajuste de termostatos",
    rootCause: "Mal funcionamiento del sistema de climatización",
    comments: [
      {
        id: 1,
        author: "Carlos Ruiz",
        content: "Desviación detectada en revisión de registros",
        date: "2024-01-15T16:45:00",
        type: "comment",
      },
      {
        id: 2,
        author: "Miguel Herrera",
        content: "Sistema de climatización reparado y calibrado",
        date: "2024-01-19T11:30:00",
        type: "comment",
      },
    ],
  },
  {
    id: 4,
    code: "NC-004",
    title: "Error en conciliación bancaria",
    description:
      "Diferencia no identificada de $2,500 en la conciliación bancaria del mes de diciembre. Discrepancia entre registros contables y estado bancario.",
    audit: "Auditoría Financiera Q4",
    auditId: 4,
    auditType: "Financiera",
    severity: "Alta",
    status: "En progreso",
    assignee: "Patricia Morales",
    reporter: "Luis Martín",
    dueDate: "2024-01-25",
    createdDate: "2024-01-19",
    category: "Contabilidad",
    evidence: "Estados bancarios y registros contables",
    rootCause: "Error en registro de transacción del 28 de diciembre",
    comments: [
      {
        id: 1,
        author: "Luis Martín",
        content: "Discrepancia encontrada durante conciliación mensual",
        date: "2024-01-19T13:20:00",
        type: "comment",
      },
      {
        id: 2,
        author: "Patricia Morales",
        content: "Iniciando revisión detallada de transacciones",
        date: "2024-01-20T08:15:00",
        type: "status_change",
      },
    ],
  },
  {
    id: 5,
    code: "NC-005",
    title: "Falta de calibración en equipos",
    description:
      "Tres equipos de medición no presentan certificado de calibración vigente: Balanza analítica (BA-001), pHmetro (PH-003) y termómetro digital (TD-007).",
    audit: "Auditoría de Calidad - Laboratorio",
    auditId: 5,
    auditType: "Calidad",
    severity: "Media",
    status: "Abierta",
    assignee: "Diego Fernández",
    reporter: "Laura Jiménez",
    dueDate: "2024-02-05",
    createdDate: "2024-01-21",
    category: "Equipos",
    evidence: "Certificados de calibración vencidos",
    comments: [
      {
        id: 1,
        author: "Laura Jiménez",
        content: "Equipos identificados durante inspección de laboratorio",
        date: "2024-01-21T15:10:00",
        type: "comment",
      },
    ],
  },
];

// Available audits for selection
const availableAudits = [
  { id: 1, name: "ISO 9001 - Planta Norte", type: "Calidad" },
  { id: 2, name: "Auditoría Ambiental - Sede Central", type: "Ambiental" },
  { id: 3, name: "Auditoría de Seguridad - Almacén", type: "Seguridad" },
  { id: 4, name: "Auditoría Financiera Q4", type: "Financiera" },
  { id: 5, name: "Auditoría de Calidad - Laboratorio", type: "Calidad" },
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
  const { toast } = useToast();
  const [nonConformities, setNonConformities] = useState<NonConformity[]>(
    initialNonConformities,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [auditFilter, setAuditFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedNonConformity, setSelectedNonConformity] =
    useState<NonConformity | null>(null);
  const [editingNonConformity, setEditingNonConformity] =
    useState<NonConformity | null>(null);
  const [deleteNonConformityId, setDeleteNonConformityId] = useState<
    number | null
  >(null);

  // Form state for new/edit non-conformity
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    audit: "",
    severity: "",
    assignee: "",
    dueDate: "",
    category: "",
    evidence: "",
    rootCause: "",
    correctiveAction: "",
  });

  // Comment form state
  const [newComment, setNewComment] = useState("");

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      audit: "",
      severity: "",
      assignee: "",
      dueDate: "",
      category: "",
      evidence: "",
      rootCause: "",
      correctiveAction: "",
    });
    setEditingNonConformity(null);
  };

  // Filtered non-conformities
  const filteredNonConformities = useMemo(() => {
    return nonConformities.filter((nc) => {
      const matchesSearch =
        nc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nc.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || nc.status === statusFilter;
      const matchesSeverity =
        severityFilter === "all" || nc.severity === severityFilter;
      const matchesAudit =
        auditFilter === "all" || nc.auditId.toString() === auditFilter;

      return matchesSearch && matchesStatus && matchesSeverity && matchesAudit;
    });
  }, [nonConformities, searchQuery, statusFilter, severityFilter, auditFilter]);

  // Generate next NC code
  const generateNextCode = () => {
    const maxId = Math.max(...nonConformities.map((nc) => nc.id), 0);
    return `NC-${(maxId + 1).toString().padStart(3, "0")}`;
  };

  // Create non-conformity
  const handleCreateNonConformity = () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.audit ||
      !formData.severity
    ) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const selectedAudit = availableAudits.find(
      (a) => a.id.toString() === formData.audit,
    );
    if (!selectedAudit) return;

    const newNonConformity: NonConformity = {
      id: Math.max(...nonConformities.map((nc) => nc.id)) + 1,
      code: generateNextCode(),
      title: formData.title,
      description: formData.description,
      audit: selectedAudit.name,
      auditId: selectedAudit.id,
      auditType: selectedAudit.type,
      severity: formData.severity as NonConformity["severity"],
      status: "Abierta",
      assignee: formData.assignee,
      reporter: "Usuario Actual", // En una app real vendría del contexto de auth
      dueDate: formData.dueDate,
      createdDate: new Date().toISOString().split("T")[0],
      category: formData.category,
      evidence: formData.evidence,
      rootCause: formData.rootCause,
      correctiveAction: formData.correctiveAction,
      comments: [
        {
          id: 1,
          author: "Usuario Actual",
          content: "No conformidad registrada",
          date: new Date().toISOString(),
          type: "comment",
        },
      ],
    };

    setNonConformities([...nonConformities, newNonConformity]);
    setIsCreateDialogOpen(false);
    resetForm();

    toast({
      title: "No conformidad creada",
      description: `La no conformidad ${newNonConformity.code} ha sido registrada exitosamente`,
    });
  };

  // Edit non-conformity
  const handleEditNonConformity = (nc: NonConformity) => {
    setEditingNonConformity(nc);
    setFormData({
      title: nc.title,
      description: nc.description,
      audit: nc.auditId.toString(),
      severity: nc.severity,
      assignee: nc.assignee,
      dueDate: nc.dueDate,
      category: nc.category,
      evidence: nc.evidence || "",
      rootCause: nc.rootCause || "",
      correctiveAction: nc.correctiveAction || "",
    });
    setIsCreateDialogOpen(true);
  };

  // Update non-conformity
  const handleUpdateNonConformity = () => {
    if (!editingNonConformity) return;

    const selectedAudit = availableAudits.find(
      (a) => a.id.toString() === formData.audit,
    );
    if (!selectedAudit) return;

    const updatedNonConformities = nonConformities.map((nc) =>
      nc.id === editingNonConformity.id
        ? {
            ...nc,
            ...formData,
            audit: selectedAudit.name,
            auditId: selectedAudit.id,
            auditType: selectedAudit.type,
            severity: formData.severity as NonConformity["severity"],
          }
        : nc,
    );

    setNonConformities(updatedNonConformities);
    setIsCreateDialogOpen(false);
    resetForm();

    toast({
      title: "No conformidad actualizada",
      description: `La no conformidad ${editingNonConformity.code} ha sido actualizada exitosamente`,
    });
  };

  // Change status
  const handleStatusChange = (
    nc: NonConformity,
    newStatus: NonConformity["status"],
  ) => {
    const updatedNonConformities = nonConformities.map((item) =>
      item.id === nc.id
        ? {
            ...item,
            status: newStatus,
            closedDate:
              newStatus === "Cerrada"
                ? new Date().toISOString().split("T")[0]
                : undefined,
            comments: [
              ...item.comments,
              {
                id: item.comments.length + 1,
                author: "Usuario Actual",
                content: `Estado cambiado a: ${newStatus}`,
                date: new Date().toISOString(),
                type: "status_change" as const,
              },
            ],
          }
        : item,
    );

    setNonConformities(updatedNonConformities);

    toast({
      title: "Estado actualizado",
      description: `La no conformidad ${nc.code} cambió a: ${newStatus}`,
    });
  };

  // Delete non-conformity
  const handleDeleteNonConformity = (id: number) => {
    const ncToDelete = nonConformities.find((nc) => nc.id === id);
    setNonConformities(nonConformities.filter((nc) => nc.id !== id));
    setDeleteNonConformityId(null);

    toast({
      title: "No conformidad eliminada",
      description: `La no conformidad ${ncToDelete?.code} ha sido eliminada`,
      variant: "destructive",
    });
  };

  // Add comment
  const handleAddComment = () => {
    if (!selectedNonConformity || !newComment.trim()) return;

    const updatedNonConformities = nonConformities.map((nc) =>
      nc.id === selectedNonConformity.id
        ? {
            ...nc,
            comments: [
              ...nc.comments,
              {
                id: nc.comments.length + 1,
                author: "Usuario Actual",
                content: newComment.trim(),
                date: new Date().toISOString(),
                type: "comment" as const,
              },
            ],
          }
        : nc,
    );

    setNonConformities(updatedNonConformities);
    setSelectedNonConformity({
      ...selectedNonConformity,
      comments: [
        ...selectedNonConformity.comments,
        {
          id: selectedNonConformity.comments.length + 1,
          author: "Usuario Actual",
          content: newComment.trim(),
          date: new Date().toISOString(),
          type: "comment",
        },
      ],
    });
    setNewComment("");

    toast({
      title: "Comentario agregado",
      description: "Tu comentario ha sido agregado exitosamente",
    });
  };

  // Get statistics
  const stats = {
    total: nonConformities.length,
    critical: nonConformities.filter((nc) => nc.severity === "Crítica").length,
    open: nonConformities.filter((nc) => nc.status === "Abierta").length,
    overdue: nonConformities.filter((nc) => {
      const dueInfo = getDaysUntilDue(nc.dueDate);
      return dueInfo.status === "overdue" && nc.status !== "Cerrada";
    }).length,
  };

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
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="audit-gradient text-white" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva no conformidad
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingNonConformity
                    ? "Editar no conformidad"
                    : "Nueva no conformidad"}
                </DialogTitle>
                <DialogDescription>
                  {editingNonConformity
                    ? "Modifica los detalles de la no conformidad"
                    : "Registra una nueva no conformidad encontrada durante la auditoría"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Título descriptivo de la no conformidad"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe detalladamente la no conformidad encontrada..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="audit">Auditoría *</Label>
                    <Select
                      value={formData.audit}
                      onValueChange={(value) =>
                        setFormData({ ...formData, audit: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la auditoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAudits.map((audit) => (
                          <SelectItem
                            key={audit.id}
                            value={audit.id.toString()}
                          >
                            {audit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="severity">Severidad *</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value) =>
                        setFormData({ ...formData, severity: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la severidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Crítica">Crítica</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Baja">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Responsable</Label>
                    <Input
                      id="assignee"
                      value={formData.assignee}
                      onChange={(e) =>
                        setFormData({ ...formData, assignee: e.target.value })
                      }
                      placeholder="Nombre del responsable"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Fecha límite</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Documentación">
                        Documentación
                      </SelectItem>
                      <SelectItem value="Seguridad">Seguridad</SelectItem>
                      <SelectItem value="Calidad">Calidad</SelectItem>
                      <SelectItem value="Ambiental">Ambiental</SelectItem>
                      <SelectItem value="Financiera">Financiera</SelectItem>
                      <SelectItem value="Equipos">Equipos</SelectItem>
                      <SelectItem value="Procesos">Procesos</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Monitoreo">Monitoreo</SelectItem>
                      <SelectItem value="Contabilidad">Contabilidad</SelectItem>
                      <SelectItem value="Otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evidence">Evidencia</Label>
                  <Textarea
                    id="evidence"
                    value={formData.evidence}
                    onChange={(e) =>
                      setFormData({ ...formData, evidence: e.target.value })
                    }
                    placeholder="Describe la evidencia que respalda esta no conformidad..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rootCause">Causa raíz</Label>
                  <Textarea
                    id="rootCause"
                    value={formData.rootCause}
                    onChange={(e) =>
                      setFormData({ ...formData, rootCause: e.target.value })
                    }
                    placeholder="Análisis de la causa raíz del problema..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correctiveAction">Acción correctiva</Label>
                  <Textarea
                    id="correctiveAction"
                    value={formData.correctiveAction}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        correctiveAction: e.target.value,
                      })
                    }
                    placeholder="Acciones correctivas propuestas o implementadas..."
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={
                    editingNonConformity
                      ? handleUpdateNonConformity
                      : handleCreateNonConformity
                  }
                >
                  {editingNonConformity ? "Actualizar" : "Crear"} no conformidad
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="Abierta">Abierta</SelectItem>
                    <SelectItem value="En revisión">En revisión</SelectItem>
                    <SelectItem value="En progreso">En progreso</SelectItem>
                    <SelectItem value="Cerrada">Cerrada</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={severityFilter}
                  onValueChange={setSeverityFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Severidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las severidades</SelectItem>
                    <SelectItem value="Crítica">Crítica</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={auditFilter} onValueChange={setAuditFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Auditoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las auditorías</SelectItem>
                    {availableAudits.map((audit) => (
                      <SelectItem key={audit.id} value={audit.id.toString()}>
                        {audit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setSeverityFilter("all");
                    setAuditFilter("all");
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Limpiar
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
                  <p className="text-2xl font-bold">{stats.total}</p>
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
                  <p className="text-2xl font-bold text-red-600">
                    {stats.critical}
                  </p>
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
                    Abiertas
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.open}
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
                    Vencidas
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.overdue}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Summary */}
        {(searchQuery ||
          statusFilter !== "all" ||
          severityFilter !== "all" ||
          auditFilter !== "all") && (
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredNonConformities.length} de{" "}
            {nonConformities.length} no conformidades
            {searchQuery && ` • Búsqueda: "${searchQuery}"`}
            {statusFilter !== "all" && ` • Estado filtrado`}
            {severityFilter !== "all" && ` • Severidad filtrada`}
            {auditFilter !== "all" && ` • Auditoría filtrada`}
          </div>
        )}

        {/* Non-Conformities List */}
        {filteredNonConformities.length > 0 ? (
          <div className="space-y-4">
            {filteredNonConformities.map((item) => {
              const dueInfo = getDaysUntilDue(item.dueDate);
              return (
                <Card key={item.id} className="audit-card">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-muted-foreground">
                              {item.code}
                            </span>
                            {getSeverityBadge(item.severity)}
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                        <CardTitle className="text-lg font-semibold mb-1">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {item.description}
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
                              setSelectedNonConformity(item);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditNonConformity(item)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {item.status !== "En revisión" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(item, "En revisión")
                              }
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Marcar en revisión
                            </DropdownMenuItem>
                          )}
                          {item.status !== "En progreso" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(item, "En progreso")
                              }
                            >
                              <Activity className="w-4 h-4 mr-2" />
                              Marcar en progreso
                            </DropdownMenuItem>
                          )}
                          {item.status !== "Cerrada" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(item, "Cerrada")
                              }
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Cerrar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteNonConformityId(item.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                          <span className="font-medium">
                            {item.assignee || "Sin asignar"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">
                          Fecha límite
                        </p>
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
                            {item.dueDate || "Sin definir"}
                          </span>
                        </div>
                        {dueInfo.status === "overdue" && item.dueDate && (
                          <p className="text-xs text-red-600 mt-1">
                            Vencida hace {dueInfo.days} días
                          </p>
                        )}
                        {dueInfo.status === "urgent" && item.dueDate && (
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

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedNonConformity(item);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver detalles
                      </Button>
                      {item.status !== "Cerrada" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleStatusChange(item, "En progreso")
                          }
                          variant={
                            item.status === "En progreso"
                              ? "default"
                              : "outline"
                          }
                        >
                          <ArrowRight className="w-3 h-3 mr-1" />
                          {item.status === "En progreso"
                            ? "En progreso"
                            : "Gestionar"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <Card className="text-center py-12">
            <CardContent>
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {nonConformities.length === 0
                  ? "No hay no conformidades"
                  : "No se encontraron resultados"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {nonConformities.length === 0
                  ? "Excelente trabajo manteniendo la conformidad"
                  : "Intenta ajustar los filtros de búsqueda"}
              </p>
              {nonConformities.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setSeverityFilter("all");
                    setAuditFilter("all");
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            {selectedNonConformity && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl">
                      {selectedNonConformity.code} -{" "}
                      {selectedNonConformity.title}
                    </DialogTitle>
                    {getSeverityBadge(selectedNonConformity.severity)}
                    {getStatusBadge(selectedNonConformity.status)}
                  </div>
                  <DialogDescription>
                    {selectedNonConformity.audit} •{" "}
                    {selectedNonConformity.category}
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Detalles</TabsTrigger>
                    <TabsTrigger value="analysis">Análisis</TabsTrigger>
                    <TabsTrigger value="comments">
                      Comentarios ({selectedNonConformity.comments.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Reportado por:
                        </p>
                        <p>{selectedNonConformity.reporter}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Asignado a:
                        </p>
                        <p>{selectedNonConformity.assignee || "Sin asignar"}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Fecha de creación:
                        </p>
                        <p>{selectedNonConformity.createdDate}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Fecha límite:
                        </p>
                        <p>{selectedNonConformity.dueDate || "Sin definir"}</p>
                      </div>
                      {selectedNonConformity.closedDate && (
                        <div>
                          <p className="font-medium text-muted-foreground">
                            Fecha de cierre:
                          </p>
                          <p>{selectedNonConformity.closedDate}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-muted-foreground mb-2">
                        Descripción:
                      </p>
                      <p className="text-sm">
                        {selectedNonConformity.description}
                      </p>
                    </div>

                    {selectedNonConformity.evidence && (
                      <div>
                        <p className="font-medium text-muted-foreground mb-2">
                          Evidencia:
                        </p>
                        <p className="text-sm">
                          {selectedNonConformity.evidence}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="analysis" className="space-y-4">
                    {selectedNonConformity.rootCause ? (
                      <div>
                        <p className="font-medium text-muted-foreground mb-2">
                          Causa raíz:
                        </p>
                        <p className="text-sm">
                          {selectedNonConformity.rootCause}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          Análisis de causa raíz pendiente
                        </p>
                      </div>
                    )}

                    {selectedNonConformity.correctiveAction ? (
                      <div>
                        <p className="font-medium text-muted-foreground mb-2">
                          Acción correctiva:
                        </p>
                        <p className="text-sm">
                          {selectedNonConformity.correctiveAction}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          Acciones correctivas pendientes
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="comments" className="space-y-4">
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedNonConformity.comments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {comment.author}
                              </span>
                              {comment.type === "status_change" && (
                                <Badge variant="outline" className="text-xs">
                                  <Activity className="w-3 h-3 mr-1" />
                                  Estado
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
                          onClick={handleAddComment}
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
                  <div className="flex gap-2">
                    {selectedNonConformity.status !== "Cerrada" && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleStatusChange(
                              selectedNonConformity,
                              "En revisión",
                            )
                          }
                          disabled={
                            selectedNonConformity.status === "En revisión"
                          }
                        >
                          Marcar en revisión
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleStatusChange(
                              selectedNonConformity,
                              "En progreso",
                            )
                          }
                          disabled={
                            selectedNonConformity.status === "En progreso"
                          }
                        >
                          Marcar en progreso
                        </Button>
                        <Button
                          onClick={() =>
                            handleStatusChange(selectedNonConformity, "Cerrada")
                          }
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Cerrar
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailDialogOpen(false)}
                    >
                      Cerrar
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteNonConformityId !== null}
          onOpenChange={() => setDeleteNonConformityId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente
                la no conformidad y todos sus datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteNonConformityId &&
                  handleDeleteNonConformity(deleteNonConformityId)
                }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
