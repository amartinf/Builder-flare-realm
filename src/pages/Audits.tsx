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
import { useAudits } from "@/hooks/useFileMaker";
import {
  getAuditTypeOptions,
  getAuditStatusOptions,
  getAuditStatus,
  AUDIT_TYPE_FILTER_MAP,
  AUDIT_STATUS_FILTER_MAP,
} from "@/config/auditOptions";
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
  Loader2,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Progress } from "@/components/ui/progress";

// Types imported from FileMaker hooks

function getStatusBadge(status: string) {
  const statusConfig = getAuditStatus(status);
  if (!statusConfig) {
    return <Badge variant="secondary">{status}</Badge>;
  }

  // Map our custom badge types to actual Badge variants
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
      variant={className.startsWith("status-") ? undefined : (className as any)}
    >
      {statusConfig.label}
    </Badge>
  );
}

export default function Audits() {
  // FileMaker integration
  const { audits, loading, error, createAudit, updateAudit, deleteAudit } =
    useAudits();

  // Local state for UI
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteAuditId, setDeleteAuditId] = useState<number | null>(null);
  const [editingAudit, setEditingAudit] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        audit.status === AUDIT_STATUS_FILTER_MAP[statusFilter] ||
        audit.status === statusFilter;

      const matchesType =
        typeFilter === "all" ||
        audit.type === AUDIT_TYPE_FILTER_MAP[typeFilter] ||
        audit.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [audits, searchQuery, statusFilter, typeFilter]);

  // Create audit
  const handleCreateAudit = async () => {
    if (
      !formData.name ||
      !formData.type ||
      !formData.auditor ||
      !formData.dueDate
    ) {
      return; // useToast error handled in hook
    }

    setIsSubmitting(true);
    try {
      const auditData = {
        name: formData.name,
        type: formData.type,
        auditor: formData.auditor,
        dueDate: formData.dueDate,
        description: formData.description,
        status: "Borrador" as const,
        progress: 0,
        createdDate: new Date().toISOString().split("T")[0],
      };

      await createAudit(auditData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit audit
  const handleEditAudit = (audit: any) => {
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
  const handleUpdateAudit = async () => {
    if (!editingAudit) return;

    setIsSubmitting(true);
    try {
      await updateAudit(editingAudit.id, formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Duplicate audit
  const handleDuplicateAudit = async (audit: any) => {
    setIsSubmitting(true);
    try {
      const duplicatedData = {
        name: `${audit.name} (Copia)`,
        type: audit.type,
        auditor: audit.auditor,
        dueDate: audit.dueDate,
        description: audit.description,
        status: "Borrador" as const,
        progress: 0,
        createdDate: new Date().toISOString().split("T")[0],
      };

      await createAudit(duplicatedData);
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete audit
  const handleDeleteAudit = async (id: number) => {
    try {
      await deleteAudit(id);
      setDeleteAuditId(null);
    } catch (error) {
      // Error handled by hook
    }
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
                        {getAuditTypeOptions().map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingAudit ? "Actualizando..." : "Creando..."}
                    </>
                  ) : (
                    `${editingAudit ? "Actualizar" : "Crear"} auditoría`
                  )}
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
                    {getAuditStatusOptions().map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {getAuditTypeOptions().map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
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

        {/* Loading State */}
        {loading ? (
          <Card className="text-center py-12">
            <CardContent>
              <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">
                Cargando auditorías...
              </h3>
              <p className="text-muted-foreground">
                Conectando con FileMaker y obteniendo datos
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="text-center py-12">
            <CardContent>
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-red-600">
                Error de conexión
              </h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : filteredAudits.length > 0 ? (
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
                          disabled={isSubmitting}
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
