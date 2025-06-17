import { useState, useMemo, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useAudits } from "@/hooks/useFileMaker";
import { type AuditTeamMember } from "@/hooks/useFileMaker";
import {
  getAuditTypeOptions,
  getAuditStatusOptions,
  getAuditStatus,
  getAuditModalityOptions,
  getISOStandardOptions,
  getAuditorRoleOptions,
  getAuditType,
  getAuditModality,
  getISOStandard,
  AUDIT_TYPE_FILTER_MAP,
  AUDIT_STATUS_FILTER_MAP,
} from "@/config/auditOptions";
import { USER_ROLES } from "@/config/correctiveActions";
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
  MapPin,
  Clock,
  Award,
  Shield,
  X,
  CheckCircle,
  Download,
  RefreshCw,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

function getStatusBadge(status: string) {
  const statusConfig = getAuditStatus(status);
  if (!statusConfig) {
    return <Badge variant="secondary">{status}</Badge>;
  }

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

function getModalityIcon(modality: string) {
  switch (modality) {
    case "in_situ":
      return <MapPin className="w-4 h-4 text-blue-600" />;
    case "online":
      return <Users className="w-4 h-4 text-green-600" />;
    case "mixta":
      return <FileText className="w-4 h-4 text-purple-600" />;
    default:
      return <MapPin className="w-4 h-4 text-gray-400" />;
  }
}

const loadDynamicAuditorRoles = () => {
  try {
    const stored = localStorage.getItem("auditpro-configuration");
    if (stored) {
      const config = JSON.parse(stored);
      return config.auditorRoles || getAuditorRoleOptions();
    }
  } catch (error) {
    console.error("Error loading dynamic auditor roles:", error);
  }
  return getAuditorRoleOptions();
};

export default function Audits() {
  const { toast } = useToast();

  const {
    audits,
    loading,
    error,
    fetchAudits,
    createAudit,
    updateAudit,
    deleteAudit,
  } = useAudits();

  const handleRefresh = async () => {
    console.log("Manual refresh triggered");
    try {
      await fetchAudits();
      toast({
        title: "Datos actualizados",
        description: "La lista de auditorías se ha actualizado correctamente",
      });
    } catch (refreshError) {
      console.error("Error refreshing data:", refreshError);
      toast({
        title: "Error al actualizar",
        description: "No se pudieron cargar los datos actualizados",
        variant: "destructive",
      });
    }
  };

  const [availableAuditorRoles, setAvailableAuditorRoles] = useState(
    loadDynamicAuditorRoles(),
  );

  useEffect(() => {
    console.log("Audits state changed:", {
      count: audits.length,
      loading,
      error,
      auditsIds: audits.map((a) => a.id),
    });
  }, [audits, loading, error]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [isoFilter, setISOFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteAuditId, setDeleteAuditId] = useState<number | null>(null);
  const [editingAudit, setEditingAudit] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    startDate: "",
    endDate: "",
    workingDays: 1,
    auditor: "",
    teamMembers: [] as AuditTeamMember[],
    modality: "",
    isoStandard: "",
    description: "",
  });

  const [teamMemberForm, setTeamMemberForm] = useState({
    userId: "",
    name: "",
    role: "",
    isLeader: false,
    assignedDays: 1,
  });

  const [isAddingTeamMember, setIsAddingTeamMember] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const newRoles = loadDynamicAuditorRoles();
      if (JSON.stringify(newRoles) !== JSON.stringify(availableAuditorRoles)) {
        setAvailableAuditorRoles(newRoles);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [availableAuditorRoles]);

  const availableUsers = [
    { id: "1", name: "María González", email: "maria.gonzalez@auditor.com" },
    { id: "2", name: "Carlos Ruiz", email: "carlos.ruiz@auditor.com" },
    { id: "3", name: "Ana López", email: "ana.lopez@auditor.com" },
    { id: "4", name: "Luis Martín", email: "luis.martin@auditor.com" },
    { id: "5", name: "Roberto Silva", email: "roberto.silva@auditor.com" },
    { id: "6", name: "Carmen Torres", email: "carmen.torres@auditor.com" },
    { id: "7", name: "Pedro González", email: "pedro.gonzalez@auditor.com" },
  ];

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      startDate: "",
      endDate: "",
      workingDays: 1,
      auditor: "",
      teamMembers: [],
      modality: "",
      isoStandard: "",
      description: "",
    });
    setEditingAudit(null);
  };

  const calculateWorkingDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 1;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1;
  };

  const getTotalAssignedDays = () => {
    return formData.teamMembers.reduce(
      (total, member) => total + (member.assignedDays || 0),
      0,
    );
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.type ||
      !formData.startDate ||
      !formData.endDate
    ) {
      toast({
        title: "Error",
        description: "Todos los campos obligatorios deben estar completos",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const auditData = {
        ...formData,
        dueDate: formData.endDate,
        status: editingAudit ? editingAudit.status : "Borrador",
        progress: editingAudit ? editingAudit.progress : 0,
        nonConformities: editingAudit ? editingAudit.nonConformities : 0,
        evidences: editingAudit ? editingAudit.evidences : 0,
        createdDate: editingAudit
          ? editingAudit.createdDate
          : new Date().toISOString(),
      };

      if (editingAudit) {
        console.log("Actualizando auditoría:", editingAudit.id, auditData);
        try {
          const updatedAudit = await updateAudit(editingAudit.id, auditData);
          console.log("Auditoría actualizada exitosamente:", updatedAudit);

          toast({
            title: "Auditoría actualizada",
            description: "La auditoría ha sido actualizada exitosamente",
          });

          setIsCreateDialogOpen(false);
          resetForm();
          setEditingAudit(null);
        } catch (updateError) {
          console.error("Error updating audit:", updateError);
          throw updateError;
        }
      } else {
        try {
          const newAudit = await createAudit(auditData);
          console.log("Auditoría creada exitosamente:", newAudit);

          toast({
            title: "Auditoría creada",
            description: "La auditoría ha sido creada exitosamente",
          });

          setIsCreateDialogOpen(false);
          resetForm();
        } catch (createError) {
          console.error("Error creating audit:", createError);
          throw createError;
        }
      }
    } catch (error) {
      console.error("Error al guardar auditoría:", error);
      toast({
        title: "Error",
        description: `Hubo un error al guardar la auditoría: ${error instanceof Error ? error.message : "Error desconocido"}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (auditId: number) => {
    console.log("handleDelete called for audit:", auditId);
    try {
      await deleteAudit(auditId);
      console.log("Audit deleted successfully");
      toast({
        title: "Auditoría eliminada",
        description: "La auditoría ha sido eliminada exitosamente",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error deleting audit:", error);
      toast({
        title: "Error",
        description: `Hubo un error al eliminar la auditoría: ${error instanceof Error ? error.message : "Error desconocido"}`,
        variant: "destructive",
      });
    } finally {
      setDeleteAuditId(null);
    }
  };

  const filteredAudits = useMemo(() => {
    if (!Array.isArray(audits)) {
      console.error("Audits is not an array:", audits);
      return [];
    }

    try {
      return audits.filter((audit) => {
        if (!audit || typeof audit !== "object") {
          console.error("Invalid audit object:", audit);
          return false;
        }

        const matchesSearch =
          audit.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ??
          false;
        const matchesStatus =
          statusFilter === "all" ||
          audit.status === statusFilter ||
          AUDIT_STATUS_FILTER_MAP[statusFilter] === audit.status;
        const matchesType =
          typeFilter === "all" ||
          audit.type === typeFilter ||
          AUDIT_TYPE_FILTER_MAP[typeFilter] === audit.type;
        const matchesModality =
          modalityFilter === "all" || audit.modality === modalityFilter;
        const matchesISO =
          isoFilter === "all" || audit.isoStandard === isoFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesType &&
          matchesModality &&
          matchesISO
        );
      });
    } catch (filterError) {
      console.error("Error filtering audits:", filterError);
      return [];
    }
  }, [
    audits,
    searchQuery,
    statusFilter,
    typeFilter,
    modalityFilter,
    isoFilter,
  ]);

  const openEditDialog = (audit: any) => {
    setEditingAudit(audit);
    setFormData({
      name: audit.name,
      type: audit.type,
      startDate: audit.startDate,
      endDate: audit.endDate,
      workingDays: audit.workingDays,
      auditor: audit.auditor,
      teamMembers: audit.teamMembers || [],
      modality: audit.modality,
      isoStandard: audit.isoStandard,
      description: audit.description || "",
    });
    setIsCreateDialogOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Cargando auditorías...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-destructive">
            Error al cargar las auditorías: {error}
          </p>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Auditorías</h1>
              <p className="text-muted-foreground mt-1">
                Gestiona las auditorías del sistema de certificación
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Auditoría
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingAudit ? "Editar" : "Crear"} Auditoría
                  </DialogTitle>
                  <DialogDescription>
                    {editingAudit
                      ? "Modifica los datos"
                      : "Completa la información"}{" "}
                    de la auditoría
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Información General</h4>

                    <div className="space-y-2">
                      <Label htmlFor="audit-name">
                        Nombre de la Auditoría *
                      </Label>
                      <Input
                        id="audit-name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Ej. Auditoría ISO 9001 - Planta Norte"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="audit-type">Tipo de Auditoría *</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) =>
                            setFormData({ ...formData, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAuditTypeOptions().map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div>
                                  <div>{type.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {type.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="iso-standard">Norma ISO *</Label>
                        <Select
                          value={formData.isoStandard}
                          onValueChange={(value) =>
                            setFormData({ ...formData, isoStandard: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar norma" />
                          </SelectTrigger>
                          <SelectContent>
                            {getISOStandardOptions().map((standard) => (
                              <SelectItem
                                key={standard.value}
                                value={standard.value}
                              >
                                <div>
                                  <div>{standard.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {standard.fullName}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Descripción adicional de la auditoría..."
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
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.name || !formData.type}
                  >
                    {isSubmitting && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {editingAudit ? "Actualizar" : "Crear"} Auditoría
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

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
              <div className="text-2xl font-bold">{audits.length}</div>
              <p className="text-xs text-muted-foreground">
                +
                {
                  audits.filter(
                    (a) =>
                      new Date(a.createdDate) >
                      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                  ).length
                }{" "}
                este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {audits.filter((a) => a.status === "En progreso").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Auditorías activas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {audits.filter((a) => a.status === "Completada").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Certificaciones exitosas
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
              <div className="text-2xl font-bold">
                {audits.reduce((sum, a) => sum + a.nonConformities, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total identificadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Nombre de auditoría..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="type-filter">Tipo</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="modality-filter">Modalidad</Label>
                <Select
                  value={modalityFilter}
                  onValueChange={setModalityFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las modalidades</SelectItem>
                    {getAuditModalityOptions().map((modality) => (
                      <SelectItem key={modality.value} value={modality.value}>
                        {modality.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="iso-filter">Norma ISO</Label>
                <Select value={isoFilter} onValueChange={setISOFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las normas</SelectItem>
                    {getISOStandardOptions().map((standard) => (
                      <SelectItem key={standard.value} value={standard.value}>
                        {standard.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audits List */}
        <Card>
          <CardHeader>
            <CardTitle>Auditorías ({filteredAudits.length})</CardTitle>
            <CardDescription>
              Lista de auditorías registradas en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAudits.map((audit) => (
                <div
                  key={audit.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{audit.name}</h3>
                      {getStatusBadge(audit.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {audit.type} | {audit.auditor} | {audit.dueDate}
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Progreso</span>
                        <span>{audit.progress}%</span>
                      </div>
                      <Progress value={audit.progress} className="h-2" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(audit)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteAuditId(audit.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {filteredAudits.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron auditorías que coincidan con los filtros
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Dialog */}
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
                onClick={() => deleteAuditId && handleDelete(deleteAuditId)}
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
