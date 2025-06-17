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
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

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

// Function to load dynamic roles from configuration
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

  // Debug function to test audit update from console
  (window as any).testAuditUpdate = async (id: number, data: any) => {
    try {
      console.log("Testing audit update:", { id, data });
      const { updateAudit } = useAudits();
      await updateAudit(id, data);
      console.log("Update successful");
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  // FileMaker integration
  const { audits, loading, error, createAudit, updateAudit, deleteAudit } =
    useAudits();

  // Dynamic roles
  const [availableAuditorRoles, setAvailableAuditorRoles] = useState(
    loadDynamicAuditorRoles(),
  );

  // Local state for UI
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [isoFilter, setISOFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteAuditId, setDeleteAuditId] = useState<number | null>(null);
  const [editingAudit, setEditingAudit] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for new/edit audit
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

  // Team member form state
  const [teamMemberForm, setTeamMemberForm] = useState({
    userId: "",
    name: "",
    role: "",
    isLeader: false,
    assignedDays: 1,
  });

  const [isAddingTeamMember, setIsAddingTeamMember] = useState(false);

  // Reload auditor roles when configuration changes
  useEffect(() => {
    const interval = setInterval(() => {
      const newRoles = loadDynamicAuditorRoles();
      if (JSON.stringify(newRoles) !== JSON.stringify(availableAuditorRoles)) {
        setAvailableAuditorRoles(newRoles);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [availableAuditorRoles]);

  // Available users (in a real app, this would come from the user management system)
  const availableUsers = [
    { id: "1", name: "María González", email: "maria.gonzalez@auditor.com" },
    { id: "2", name: "Carlos Ruiz", email: "carlos.ruiz@auditor.com" },
    { id: "3", name: "Ana López", email: "ana.lopez@auditor.com" },
    { id: "4", name: "Luis Martín", email: "luis.martin@auditor.com" },
    { id: "5", name: "Roberto Silva", email: "roberto.silva@auditor.com" },
    { id: "6", name: "Carmen Torres", email: "carmen.torres@auditor.com" },
    { id: "7", name: "Pedro González", email: "pedro.gonzalez@auditor.com" },
  ];

  // Reset form
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

  const resetTeamMemberForm = () => {
    setTeamMemberForm({
      userId: "",
      name: "",
      role: "",
      isLeader: false,
      assignedDays: 1,
    });
  };

  // Calculate working days between dates
  const calculateWorkingDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 1;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays + 1; // Include both start and end dates
  };

  // Calculate total assigned days for all team members
  const getTotalAssignedDays = () => {
    return formData.teamMembers.reduce(
      (total, member) => total + (member.assignedDays || 0),
      0,
    );
  };

  // Calculate remaining available days
  const getRemainingDays = () => {
    const totalAssigned = getTotalAssignedDays();
    return Math.max(0, formData.workingDays - totalAssigned);
  };

  // Distribute time proportionally among team members
  const redistributeTimeProportionally = (newTeam: AuditTeamMember[]) => {
    if (newTeam.length === 0) return [];

    // Define role weights for proportional distribution
    const getRoleWeight = (role: string) => {
      const weights: Record<string, number> = {
        auditor_lider: 1.0, // 100% participation
        auditor_principal: 0.8, // 80% participation
        auditor_junior: 0.6, // 60% participation
        experto_tecnico: 0.5, // 50% participation
        observador: 0.3, // 30% participation
      };
      return weights[role] || 0.6;
    };

    // Calculate total weight
    const totalWeight = newTeam.reduce(
      (sum, member) => sum + getRoleWeight(member.role),
      0,
    );

    // Distribute proportionally
    return newTeam.map((member) => {
      const memberWeight = getRoleWeight(member.role);
      const proportionalDays =
        Math.round((memberWeight / totalWeight) * formData.workingDays * 10) /
        10; // Round to 1 decimal

      return {
        ...member,
        assignedDays: Math.max(0.5, proportionalDays), // Minimum 0.5 days
      };
    });
  };

  // Get suggested days for new member based on proportional distribution
  const getSuggestedDaysForRole = (role: string) => {
    const roleConfig = availableAuditorRoles.find((r) => r.value === role);
    if (!roleConfig) return 1;

    // Create a temporary team with the new member to calculate proportional distribution
    const tempMember: AuditTeamMember = {
      userId: "temp",
      name: "temp",
      role: role,
      isLeader: roleConfig.isLeader,
      assignedDays: 1,
    };

    const tempTeam = [...formData.teamMembers, tempMember];
    const redistributed = redistributeTimeProportionally(tempTeam);
    const newMemberData = redistributed.find((m) => m.userId === "temp");

    return newMemberData ? newMemberData.assignedDays : 1;
  };

  // Auto-redistribute time when team changes
  const autoRedistributeTime = () => {
    if (formData.teamMembers.length === 0) return;

    const redistributed = redistributeTimeProportionally(formData.teamMembers);
    setFormData((prev) => ({
      ...prev,
      teamMembers: redistributed,
    }));

    toast({
      title: "Tiempo redistribuido",
      description:
        "El tiempo se ha distribuido proporcionalmente entre los miembros del equipo",
    });
  };

  // Manual time adjustment with validation
  const adjustMemberTime = (userId: string, newDays: number) => {
    const updatedMembers = formData.teamMembers.map((member) =>
      member.userId === userId ? { ...member, assignedDays: newDays } : member,
    );

    const totalAssigned = updatedMembers.reduce(
      (sum, member) => sum + member.assignedDays,
      0,
    );

    if (totalAssigned > formData.workingDays) {
      toast({
        title: "Error",
        description: `El tiempo total asignado (${totalAssigned} días) excede la duración de la auditoría (${formData.workingDays} días)`,
        variant: "destructive",
      });
      return false;
    }

    setFormData((prev) => ({
      ...prev,
      teamMembers: updatedMembers,
    }));

    return true;
  };

  // Export team configuration for reuse
  const exportTeamConfiguration = () => {
    if (formData.teamMembers.length === 0) {
      toast({
        title: "Error",
        description: "No hay equipo configurado para exportar",
        variant: "destructive",
      });
      return;
    }

    const config = {
      auditName: formData.name,
      workingDays: formData.workingDays,
      teamMembers: formData.teamMembers.map((member) => ({
        role: member.role,
        assignedDays: member.assignedDays,
        percentage: Math.round(
          (member.assignedDays / formData.workingDays) * 100,
        ),
      })),
      totalDays: getTotalAssignedDays(),
      efficiency: Math.round(
        (getTotalAssignedDays() / formData.workingDays) * 100,
      ),
    };

    // Create downloadable JSON
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `configuracion-tiempo-${formData.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Configuración exportada",
      description: "La configuración de tiempo del equipo se ha descargado",
    });
  };

  // Validate time distribution compliance
  const validateTimeCompliance = () => {
    const totalAssigned = getTotalAssignedDays();
    const compliance = {
      isCompliant: totalAssigned === formData.workingDays,
      utilization: (totalAssigned / formData.workingDays) * 100,
      variance: totalAssigned - formData.workingDays,
      recommendations: [] as string[],
    };

    if (compliance.variance > 0) {
      compliance.recommendations.push(
        `Reducir ${compliance.variance.toFixed(1)} jornadas del equipo`,
      );
    } else if (compliance.variance < 0) {
      compliance.recommendations.push(
        `Asignar ${Math.abs(compliance.variance).toFixed(1)} jornadas adicionales`,
      );
    }

    // Check for team efficiency
    const teamSize = formData.teamMembers.length;
    const avgDaysPerMember = totalAssigned / teamSize;

    if (avgDaysPerMember < 1) {
      compliance.recommendations.push(
        "Considerar reducir el tamaño del equipo",
      );
    } else if (avgDaysPerMember > formData.workingDays * 0.8) {
      compliance.recommendations.push(
        "Considerar añadir más miembros al equipo",
      );
    }

    return compliance;
  };

  // Handle date changes and auto-calculate working days
  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    const newFormData = { ...formData, [field]: value };

    if (field === "startDate" && formData.endDate) {
      newFormData.workingDays = calculateWorkingDays(value, formData.endDate);
    } else if (field === "endDate" && formData.startDate) {
      newFormData.workingDays = calculateWorkingDays(formData.startDate, value);
    }

    setFormData(newFormData);

    // Auto-redistribute time if team exists and working days changed
    if (
      newFormData.workingDays !== formData.workingDays &&
      formData.teamMembers.length > 0
    ) {
      setTimeout(() => {
        const redistributed = redistributeTimeProportionally(
          formData.teamMembers,
        );
        setFormData((prev) => ({
          ...prev,
          teamMembers: redistributed,
          workingDays: newFormData.workingDays,
        }));

        toast({
          title: "Tiempo redistribuido automáticamente",
          description: `Se ajustó la distribución del equipo para ${newFormData.workingDays} días de trabajo`,
        });
      }, 500);
    }
  };

  // Add team member
  const addTeamMember = () => {
    if (
      !teamMemberForm.userId ||
      !teamMemberForm.name ||
      !teamMemberForm.role ||
      teamMemberForm.assignedDays <= 0
    ) {
      toast({
        title: "Error",
        description:
          "Todos los campos del miembro del equipo son requeridos y las jornadas deben ser mayor a 0",
        variant: "destructive",
      });
      return;
    }

    // Check if user is already in team
    if (
      formData.teamMembers.some(
        (member) => member.userId === teamMemberForm.userId,
      )
    ) {
      toast({
        title: "Error",
        description: "Este usuario ya está en el equipo auditor",
        variant: "destructive",
      });
      return;
    }

    const newMember: AuditTeamMember = {
      userId: teamMemberForm.userId,
      name: teamMemberForm.name,
      role: teamMemberForm.role,
      isLeader: teamMemberForm.isLeader,
      assignedDays: teamMemberForm.assignedDays,
    };

    // Add member and redistribute time proportionally
    const newTeam = [...formData.teamMembers, newMember];
    const redistributedTeam = redistributeTimeProportionally(newTeam);

    setFormData({
      ...formData,
      teamMembers: redistributedTeam,
    });

    resetTeamMemberForm();
    setIsAddingTeamMember(false);

    // Set auditor field to team leader if this is the first leader
    if (teamMemberForm.isLeader && !formData.auditor) {
      setFormData((prev) => ({
        ...prev,
        auditor: teamMemberForm.name,
      }));
    }
  };

  // Remove team member
  const removeTeamMember = (userId: string) => {
    const updatedTeam = formData.teamMembers.filter(
      (member) => member.userId !== userId,
    );
    setFormData({
      ...formData,
      teamMembers: updatedTeam,
    });

    // Update auditor field if we removed the leader
    const removedMember = formData.teamMembers.find(
      (member) => member.userId === userId,
    );
    if (removedMember?.isLeader) {
      const newLeader = updatedTeam.find((member) => member.isLeader);
      setFormData((prev) => ({
        ...prev,
        auditor: newLeader ? newLeader.name : "",
      }));
    }
  };

  // Filtered audits
  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      const matchesSearch = audit.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
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
      const matchesISO = isoFilter === "all" || audit.isoStandard === isoFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesModality &&
        matchesISO
      );
    });
  }, [
    audits,
    searchQuery,
    statusFilter,
    typeFilter,
    modalityFilter,
    isoFilter,
  ]);

  // Open edit dialog
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

  // Submit form
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

    // Validate team has at least one leader
    const hasLeader = formData.teamMembers.some((member) => member.isLeader);
    if (formData.teamMembers.length > 0 && !hasLeader) {
      toast({
        title: "Error",
        description: "El equipo auditor debe tener al menos un auditor líder",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const auditData = {
        ...formData,
        dueDate: formData.endDate, // Use end date as due date
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
        const updatedAudit = await updateAudit(editingAudit.id, auditData);
        console.log("Auditoría actualizada exitosamente:", updatedAudit);

        toast({
          title: "Auditoría actualizada",
          description: "La auditoría ha sido actualizada exitosamente",
        });

        // Small delay to ensure state updates properly
        setTimeout(() => {
          setIsCreateDialogOpen(false);
          resetForm();
        }, 100);
      } else {
        const newAudit = await createAudit(auditData);
        console.log("Auditoría creada exitosamente:", newAudit);

        toast({
          title: "Auditoría creada",
          description: "La auditoría ha sido creada exitosamente",
        });

        setIsCreateDialogOpen(false);
        resetForm();
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

  // Handle delete
  const handleDelete = async (auditId: number) => {
    try {
      await deleteAudit(auditId);
      toast({
        title: "Auditoría eliminada",
        description: "La auditoría ha sido eliminada exitosamente",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al eliminar la auditoría",
        variant: "destructive",
      });
    }
    setDeleteAuditId(null);
  };

  // Handle duplicate
  const handleDuplicate = (audit: any) => {
    setEditingAudit(null);
    setFormData({
      name: `${audit.name} (Copia)`,
      type: audit.type,
      startDate: "",
      endDate: "",
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

            {/* Create/Edit Dialog Content */}
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
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="font-medium">Información General</h4>

                  <div className="space-y-2">
                    <Label htmlFor="audit-name">Nombre de la Auditoría *</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="modality">Modalidad de Auditoría *</Label>
                    <Select
                      value={formData.modality}
                      onValueChange={(value) =>
                        setFormData({ ...formData, modality: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar modalidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAuditModalityOptions().map((modality) => (
                          <SelectItem
                            key={modality.value}
                            value={modality.value}
                          >
                            <div className="flex items-center gap-2">
                              {getModalityIcon(modality.value)}
                              <div>
                                <div>{modality.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {modality.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dates and Duration */}
                <div className="space-y-4">
                  <h4 className="font-medium">Fechas y Duración</h4>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Fecha de Inicio *</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          handleDateChange("startDate", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end-date">Fecha de Fin *</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          handleDateChange("endDate", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="working-days">Jornadas de Trabajo</Label>
                      <Input
                        id="working-days"
                        type="number"
                        min="1"
                        value={formData.workingDays}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            workingDays: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Equipo Auditor</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingTeamMember(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Miembro
                    </Button>
                  </div>

                  {/* Team Member Form */}
                  {isAddingTeamMember && (
                    <Card className="p-4">
                      <div className="space-y-4">
                        {/* Time allocation info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-800">
                              Distribución de Jornadas
                            </span>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-blue-700">
                                {getRemainingDays()} jornadas disponibles de{" "}
                                {formData.workingDays}
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${(getTotalAssignedDays() / formData.workingDays) * 100}%`,
                              }}
                            />
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            {getTotalAssignedDays()} de {formData.workingDays}{" "}
                            jornadas asignadas
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Usuario</Label>
                            <Select
                              value={teamMemberForm.userId}
                              onValueChange={(value) => {
                                const user = availableUsers.find(
                                  (u) => u.id === value,
                                );
                                setTeamMemberForm({
                                  ...teamMemberForm,
                                  userId: value,
                                  name: user?.name || "",
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar usuario" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableUsers
                                  .filter(
                                    (user) =>
                                      !formData.teamMembers.some(
                                        (member) => member.userId === user.id,
                                      ),
                                  )
                                  .map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                      <div>
                                        <div>{user.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {user.email}
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Rol en el Equipo</Label>
                            <Select
                              value={teamMemberForm.role}
                              onValueChange={(value) => {
                                const role = availableAuditorRoles.find(
                                  (r) => r.value === value,
                                );
                                const suggestedDays =
                                  getSuggestedDaysForRole(value);
                                setTeamMemberForm({
                                  ...teamMemberForm,
                                  role: value,
                                  isLeader: role?.isLeader || false,
                                  assignedDays: suggestedDays,
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rol" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableAuditorRoles.map((role) => (
                                  <SelectItem
                                    key={role.value}
                                    value={role.value}
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        {role.isLeader && (
                                          <Shield className="w-3 h-3" />
                                        )}
                                        {role.label}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {role.description}
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="assigned-days">
                              Jornadas Asignadas *
                              {teamMemberForm.role && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (Sugerido:{" "}
                                  {getSuggestedDaysForRole(teamMemberForm.role)}
                                  )
                                </span>
                              )}
                            </Label>
                            <Input
                              id="assigned-days"
                              type="number"
                              min="0"
                              max={
                                getRemainingDays() + teamMemberForm.assignedDays
                              }
                              value={teamMemberForm.assignedDays}
                              onChange={(e) =>
                                setTeamMemberForm({
                                  ...teamMemberForm,
                                  assignedDays: parseInt(e.target.value) || 0,
                                })
                              }
                              className={
                                teamMemberForm.assignedDays > getRemainingDays()
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                            {teamMemberForm.assignedDays >
                              getRemainingDays() && (
                              <p className="text-xs text-red-600">
                                Excede las jornadas disponibles (
                                {getRemainingDays()})
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is-leader"
                              checked={teamMemberForm.isLeader}
                              onCheckedChange={(checked) =>
                                setTeamMemberForm({
                                  ...teamMemberForm,
                                  isLeader: checked,
                                })
                              }
                              disabled={
                                availableAuditorRoles.find(
                                  (r) => r.value === teamMemberForm.role,
                                )?.isLeader
                              }
                            />
                            <Label htmlFor="is-leader">Auditor Líder</Label>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsAddingTeamMember(false);
                                resetTeamMemberForm();
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button type="button" onClick={addTeamMember}>
                              Agregar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Team Members List */}
                  {formData.teamMembers.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Miembros del Equipo ({formData.teamMembers.length})
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Total: {getTotalAssignedDays()}/{formData.workingDays}{" "}
                          jornadas
                        </span>
                      </div>

                      {formData.teamMembers.map((member) => (
                        <div
                          key={member.userId}
                          className="p-3 border rounded-lg space-y-3"
                        >
                          {/* Member Info Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex items-center gap-2">
                                {member.isLeader && (
                                  <Shield className="w-4 h-4 text-primary" />
                                )}
                                <span className="font-medium">
                                  {member.name}
                                </span>
                              </div>
                              <Badge
                                variant={
                                  member.isLeader ? "default" : "secondary"
                                }
                              >
                                {
                                  availableAuditorRoles.find(
                                    (r) => r.value === member.role,
                                  )?.label
                                }
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTeamMember(member.userId)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Time Assignment Controls */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm">
                                Jornadas Asignadas
                              </Label>
                              <div className="text-xs text-muted-foreground">
                                {Math.round(
                                  (member.assignedDays / formData.workingDays) *
                                    100,
                                )}
                                % del tiempo total
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0.5"
                                max={formData.workingDays}
                                step="0.5"
                                value={member.assignedDays}
                                onChange={(e) => {
                                  const newDays =
                                    parseFloat(e.target.value) || 0;
                                  adjustMemberTime(member.userId, newDays);
                                }}
                                className="w-20 h-8"
                              />
                              <span className="text-sm text-muted-foreground">
                                de {formData.workingDays} días
                              </span>
                              <div className="flex-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.min((member.assignedDays / formData.workingDays) * 100, 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Time Management Controls */}
                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm">
                            Gestión de Tiempo
                          </h5>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={exportTeamConfiguration}
                              disabled={formData.teamMembers.length === 0}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Exportar
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={autoRedistributeTime}
                              disabled={formData.teamMembers.length === 0}
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Redistribuir
                            </Button>
                          </div>
                        </div>

                        {/* Overall Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Asignación Total de Tiempo</span>
                            <span
                              className={`font-medium ${
                                getTotalAssignedDays() > formData.workingDays
                                  ? "text-red-600"
                                  : getTotalAssignedDays() ===
                                      formData.workingDays
                                    ? "text-green-600"
                                    : "text-blue-600"
                              }`}
                            >
                              {getTotalAssignedDays().toFixed(1)}/
                              {formData.workingDays} días (
                              {Math.round(
                                (getTotalAssignedDays() /
                                  formData.workingDays) *
                                  100,
                              )}
                              %)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-300 ${
                                getTotalAssignedDays() > formData.workingDays
                                  ? "bg-red-500"
                                  : getTotalAssignedDays() ===
                                      formData.workingDays
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                              }`}
                              style={{
                                width: `${Math.min((getTotalAssignedDays() / formData.workingDays) * 100, 100)}%`,
                              }}
                            />
                          </div>

                          {/* Status Messages */}
                          {getTotalAssignedDays() > formData.workingDays && (
                            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm">
                                ⚠️ Tiempo sobreasignado:{" "}
                                {(
                                  getTotalAssignedDays() - formData.workingDays
                                ).toFixed(1)}{" "}
                                jornadas extra
                              </span>
                            </div>
                          )}

                          {getTotalAssignedDays() === formData.workingDays && (
                            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-green-700">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm">
                                ✓ Tiempo perfectamente distribuido
                              </span>
                            </div>
                          )}

                          {getTotalAssignedDays() < formData.workingDays &&
                            getTotalAssignedDays() > 0 && (
                              <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">
                                  {(
                                    formData.workingDays -
                                    getTotalAssignedDays()
                                  ).toFixed(1)}{" "}
                                  jornadas disponibles para asignar
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Team Validation Warnings */}
                  {formData.teamMembers.length > 0 && (
                    <div className="space-y-2">
                      {!formData.teamMembers.some((m) => m.isLeader) && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800">
                            El equipo auditor debe tener al menos un auditor
                            líder
                          </span>
                        </div>
                      )}

                      {getTotalAssignedDays() > formData.workingDays && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-800">
                            El tiempo asignado ({getTotalAssignedDays()}{" "}
                            jornadas) excede la duración de la auditoría (
                            {formData.workingDays} jornadas)
                          </span>
                        </div>
                      )}

                      {getTotalAssignedDays() < formData.workingDays &&
                        formData.teamMembers.length > 0 && (
                          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-800">
                              Quedan {getRemainingDays()} jornadas sin asignar.
                              Considera optimizar la distribución del tiempo.
                            </span>
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
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
                  disabled={
                    isSubmitting ||
                    !formData.name ||
                    !formData.type ||
                    !formData.startDate ||
                    !formData.endDate
                  }
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
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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

              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                    setModalityFilter("all");
                    setISOFilter("all");
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
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
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    {/* Main Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{audit.name}</h3>
                        {getStatusBadge(audit.status)}
                        <Badge variant="outline">
                          {getAuditType(audit.type)?.label || audit.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          {getModalityIcon(audit.modality)}
                          <span>{getAuditModality(audit.modality)?.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Secondary Info */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-muted-foreground" />
                        <span>{getISOStandard(audit.isoStandard)?.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {new Date(audit.startDate).toLocaleDateString()} -{" "}
                          {new Date(audit.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {audit.workingDays} jornada
                          {audit.workingDays > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {audit.teamMembers?.length || 1} auditor
                          {(audit.teamMembers?.length || 1) > 1 ? "es" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Team Members */}
                    {audit.teamMembers && audit.teamMembers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-wrap gap-1">
                          {audit.teamMembers.map((member) => (
                            <Badge
                              key={member.userId}
                              variant={
                                member.isLeader ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              {member.name} {member.isLeader ? "(Líder)" : ""}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progreso</span>
                        <span>{audit.progress}%</span>
                      </div>
                      <Progress value={audit.progress} className="h-2" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => openEditDialog(audit)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(audit)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteAuditId(audit.id)}
                          className="text-destructive"
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
