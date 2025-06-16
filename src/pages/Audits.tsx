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
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  AlertTriangle,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Progress } from "@/components/ui/progress";

// Types
interface Audit {
  id: number;
  name: string;
  type: string;
  status: string;
  progress: number;
  dueDate: string;
  auditor: string;
  nonConformities: number;
  evidences: number;
  createdDate: string;
  description?: string;
}

// Initial data
const initialAudits: Audit[] = [
  {
    id: 1,
    name: "Auditoría ISO 9001 - Planta Norte",
    type: "Calidad",
    status: "En progreso",
    progress: 75,
    dueDate: "2024-01-25",
    auditor: "María González",
    nonConformities: 2,
    evidences: 12,
    createdDate: "2024-01-10",
    description: "Auditoría anual de calidad para certificación ISO 9001",
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
    evidences: 3,
    createdDate: "2024-01-12",
    description: "Evaluación del sistema de gestión ambiental",
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
    evidences: 24,
    createdDate: "2024-01-05",
    description: "Auditoría de seguridad y salud ocupacional",
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
    evidences: 8,
    createdDate: "2024-01-08",
    description: "Revisión financiera del cuarto trimestre",
  },
  {
    id: 5,
    name: "Auditoría Interna de Procesos",
    type: "Procesos",
    status: "Borrador",
    progress: 10,
    dueDate: "2024-02-15",
    auditor: "Carmen Torres",
    nonConformities: 0,
    evidences: 1,
    createdDate: "2024-01-18",
    description: "Evaluación de procesos internos de la organización",
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
    case "Borrador":
      return <Badge variant="secondary">Borrador</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function Audits() {
  const { toast } = useToast();
  const [audits, setAudits] = useState<Audit[]>(initialAudits);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteAuditId, setDeleteAuditId] = useState<number | null>(null);
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null);

  // Form state for new/edit audit
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    auditor: "",
    dueDate: "",
    description: "",
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      auditor: "",
      dueDate: "",
      description: "",
    });
    setEditingAudit(null);
  };

  // Filtered audits
  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      const matchesSearch = audit.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "draft" && audit.status === "Borrador") ||
        (statusFilter === "pending" && audit.status === "Pendiente") ||
        (statusFilter === "progress" && audit.status === "En progreso") ||
        (statusFilter === "completed" && audit.status === "Completada");
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "quality" && audit.type === "Calidad") ||
        (typeFilter === "environmental" && audit.type === "Ambiental") ||
        (typeFilter === "security" && audit.type === "Seguridad") ||
        (typeFilter === "financial" && audit.type === "Financiera") ||
        (typeFilter === "processes" && audit.type === "Procesos");

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [audits, searchQuery, statusFilter, typeFilter]);

  // Create audit
  const handleCreateAudit = () => {
    if (
      !formData.name ||
      !formData.type ||
      !formData.auditor ||
      !formData.dueDate
    ) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const newAudit: Audit = {
      id: Math.max(...audits.map((a) => a.id)) + 1,
      name: formData.name,
      type: formData.type,
      auditor: formData.auditor,
      dueDate: formData.dueDate,
      description: formData.description,
      status: "Borrador",
      progress: 0,
      nonConformities: 0,
      evidences: 0,
      createdDate: new Date().toISOString().split("T")[0],
    };

    setAudits([...audits, newAudit]);
    setIsCreateDialogOpen(false);
    resetForm();

    toast({
      title: "Auditoría creada",
      description: `La auditoría "${formData.name}" ha sido creada exitosamente`,
    });
  };

  // Edit audit
  const handleEditAudit = (audit: Audit) => {
    setEditingAudit(audit);
    setFormData({
      name: audit.name,
      type: audit.type,
      auditor: audit.auditor,
      dueDate: audit.dueDate,
      description: audit.description || "",
    });
    setIsCreateDialogOpen(true);
  };

  // Update audit
  const handleUpdateAudit = () => {
    if (!editingAudit) return;

    const updatedAudits = audits.map((audit) =>
      audit.id === editingAudit.id ? { ...audit, ...formData } : audit,
    );

    setAudits(updatedAudits);
    setIsCreateDialogOpen(false);
    resetForm();

    toast({
      title: "Auditoría actualizada",
      description: `La auditoría "${formData.name}" ha sido actualizada exitosamente`,
    });
  };

  // Duplicate audit
  const handleDuplicateAudit = (audit: Audit) => {
    const duplicatedAudit: Audit = {
      ...audit,
      id: Math.max(...audits.map((a) => a.id)) + 1,
      name: `${audit.name} (Copia)`,
      status: "Borrador",
      progress: 0,
      nonConformities: 0,
      evidences: 0,
      createdDate: new Date().toISOString().split("T")[0],
    };

    setAudits([...audits, duplicatedAudit]);

    toast({
      title: "Auditoría duplicada",
      description: `Se ha creado una copia de "${audit.name}"`,
    });
  };

  // Delete audit
  const handleDeleteAudit = (id: number) => {
    const auditToDelete = audits.find((a) => a.id === id);
    setAudits(audits.filter((audit) => audit.id !== id));
    setDeleteAuditId(null);

    toast({
      title: "Auditoría eliminada",
      description: `La auditoría "${auditToDelete?.name}" ha sido eliminada`,
      variant: "destructive",
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Auditorías</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona y supervisa todas tus auditorías
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="audit-gradient text-white" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva auditoría
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingAudit ? "Editar auditoría" : "Nueva auditoría"}
                </DialogTitle>
                <DialogDescription>
                  {editingAudit
                    ? "Modifica los detalles de la auditoría"
                    : "Completa la información para crear una nueva auditoría"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la auditoría *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: Auditoría ISO 9001 - Planta Norte"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Calidad">Calidad</SelectItem>
                        <SelectItem value="Ambiental">Ambiental</SelectItem>
                        <SelectItem value="Seguridad">Seguridad</SelectItem>
                        <SelectItem value="Financiera">Financiera</SelectItem>
                        <SelectItem value="Procesos">Procesos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auditor">Auditor *</Label>
                    <Input
                      id="auditor"
                      value={formData.auditor}
                      onChange={(e) =>
                        setFormData({ ...formData, auditor: e.target.value })
                      }
                      placeholder="Nombre del auditor"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Fecha límite *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe el objetivo y alcance de la auditoría..."
                    rows={3}
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
                  onClick={editingAudit ? handleUpdateAudit : handleCreateAudit}
                >
                  {editingAudit ? "Actualizar" : "Crear"} auditoría
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
                    placeholder="Buscar auditorías..."
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
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="progress">En progreso</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="quality">Calidad</SelectItem>
                    <SelectItem value="environmental">Ambiental</SelectItem>
                    <SelectItem value="security">Seguridad</SelectItem>
                    <SelectItem value="financial">Financiera</SelectItem>
                    <SelectItem value="processes">Procesos</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredAudits.length} de {audits.length} auditorías
            {searchQuery && ` • Búsqueda: "${searchQuery}"`}
            {statusFilter !== "all" && ` • Estado filtrado`}
            {typeFilter !== "all" && ` • Tipo filtrado`}
          </div>
        )}

        {/* Audits Grid */}
        {filteredAudits.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAudits.map((audit) => (
              <Card key={audit.id} className="audit-card hover:shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {audit.name}
                      </CardTitle>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline">{audit.type}</Badge>
                        <CardDescription className="m-0">
                          Creada: {audit.createdDate}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            (window.location.href = `/audits/${audit.id}`)
                          }
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditAudit(audit)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicateAudit(audit)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteAuditId(audit.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status and Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      {getStatusBadge(audit.status)}
                      <span className="text-sm text-muted-foreground">
                        {audit.progress}%
                      </span>
                    </div>
                    <Progress value={audit.progress} className="h-2" />
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        Auditor
                      </span>
                      <span>{audit.auditor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        Fecha límite
                      </span>
                      <span>{audit.dueDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        Evidencias
                      </span>
                      <span>{audit.evidences}</span>
                    </div>
                    {audit.nonConformities > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-warning-600">
                          <AlertTriangle className="w-3 h-3" />
                          No conformidades
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          {audit.nonConformities}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        (window.location.href = `/audits/${audit.id}`)
                      }
                    >
                      Ver detalles
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditAudit(audit)}
                    >
                      {audit.status === "Borrador" ? "Continuar" : "Editar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {audits.length === 0
                  ? "No hay auditorías"
                  : "No se encontraron resultados"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {audits.length === 0
                  ? "Comienza creando tu primera auditoría"
                  : "Intenta ajustar los filtros de búsqueda"}
              </p>
              {audits.length === 0 && (
                <Button
                  className="audit-gradient text-white"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva auditoría
                </Button>
              )}
              {audits.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteAuditId !== null}
          onOpenChange={() => setDeleteAuditId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente
                la auditoría y todos sus datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  deleteAuditId && handleDeleteAudit(deleteAuditId)
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
