import { useState, useEffect } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  RotateCcw,
  FileText,
  AlertTriangle,
  Tag,
  Palette,
  Download,
  Upload,
  Award,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import {
  getAuditTypeOptions,
  getAuditStatusOptions,
  getEvidenceCategoryOptions,
  getNCCategoryOptions,
  getNCSeverityOptions,
  getNCStatusOptions,
  getAuditModalityOptions,
  getISOStandardOptions,
  getAuditorRoleOptions,
  type AuditType,
  type AuditStatus,
  type AuditCategory,
  type NonConformitySeverity,
  type NonConformityStatus,
  type AuditModality,
  type ISOStandard,
  type AuditorRole,
} from "@/config/auditOptions";
import {
  USER_ROLES,
  CORRECTIVE_ACTION_STATUSES,
  type UserRole,
} from "@/config/correctiveActions";

interface EditDialogState {
  isOpen: boolean;
  type:
    | "auditType"
    | "auditStatus"
    | "evidenceCategory"
    | "ncCategory"
    | "ncSeverity"
    | "ncStatus"
    | "userRole"
    | "auditModality"
    | "isoStandard"
    | "auditorRole"
    | null;
  item: any;
  isNew: boolean;
}

const CONFIG_STORAGE_KEY = "auditpro-configuration";

export default function Configuration() {
  const { toast } = useToast();

  // Load configuration from localStorage on mount
  const loadConfiguration = () => {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        return {
          auditTypes: config.auditTypes || getAuditTypeOptions(),
          auditStatuses: config.auditStatuses || getAuditStatusOptions(),
          evidenceCategories:
            config.evidenceCategories || getEvidenceCategoryOptions(),
          ncCategories: config.ncCategories || getNCCategoryOptions(),
          ncSeverities: config.ncSeverities || getNCSeverityOptions(),
          ncStatuses: config.ncStatuses || getNCStatusOptions(),
          userRoles: config.userRoles || USER_ROLES,
          auditModalities: config.auditModalities || getAuditModalityOptions(),
          isoStandards: config.isoStandards || getISOStandardOptions(),
          auditorRoles: config.auditorRoles || getAuditorRoleOptions(),
        };
      }
    } catch (error) {
      console.error("Error loading configuration:", error);
    }

    return {
      auditTypes: getAuditTypeOptions(),
      auditStatuses: getAuditStatusOptions(),
      evidenceCategories: getEvidenceCategoryOptions(),
      ncCategories: getNCCategoryOptions(),
      ncSeverities: getNCSeverityOptions(),
      ncStatuses: getNCStatusOptions(),
      userRoles: USER_ROLES,
      auditModalities: getAuditModalityOptions(),
      isoStandards: getISOStandardOptions(),
      auditorRoles: getAuditorRoleOptions(),
    };
  };

  const initialConfig = loadConfiguration();

  // State for managing editable data
  const [auditTypes, setAuditTypes] = useState<AuditType[]>(
    initialConfig.auditTypes,
  );
  const [auditStatuses, setAuditStatuses] = useState<AuditStatus[]>(
    initialConfig.auditStatuses,
  );
  const [evidenceCategories, setEvidenceCategories] = useState<AuditCategory[]>(
    initialConfig.evidenceCategories,
  );
  const [ncCategories, setNCCategories] = useState<AuditCategory[]>(
    initialConfig.ncCategories,
  );
  const [ncSeverities, setNCSeverities] = useState<NonConformitySeverity[]>(
    initialConfig.ncSeverities,
  );
  const [ncStatuses, setNCStatuses] = useState<NonConformityStatus[]>(
    initialConfig.ncStatuses,
  );
  const [userRoles, setUserRoles] = useState<UserRole[]>(
    initialConfig.userRoles,
  );
  const [auditModalities, setAuditModalities] = useState<AuditModality[]>(
    initialConfig.auditModalities,
  );
  const [isoStandards, setISOStandards] = useState<ISOStandard[]>(
    initialConfig.isoStandards,
  );
  const [auditorRoles, setAuditorRoles] = useState<AuditorRole[]>(
    initialConfig.auditorRoles,
  );

  const [hasChanges, setHasChanges] = useState(false);

  const [editDialog, setEditDialog] = useState<EditDialogState>({
    isOpen: false,
    type: null,
    item: null,
    isNew: false,
  });

  const [formData, setFormData] = useState({
    value: "",
    label: "",
    color: "#0ea5e9",
    description: "",
    badge: "default",
    priority: 1,
    permissions: [] as string[],
  });

  // Save configuration to localStorage whenever data changes
  useEffect(() => {
    const config = {
      auditTypes,
      auditStatuses,
      evidenceCategories,
      ncCategories,
      ncSeverities,
      ncStatuses,
      userRoles,
      auditModalities,
      isoStandards,
      auditorRoles,
    };

    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    setHasChanges(true);
  }, [
    auditTypes,
    auditStatuses,
    evidenceCategories,
    ncCategories,
    ncSeverities,
    ncStatuses,
    userRoles,
    auditModalities,
    isoStandards,
    auditorRoles,
  ]);

  const resetForm = () => {
    setFormData({
      value: "",
      label: "",
      color: "#0ea5e9",
      description: "",
      badge: "default",
      priority: 1,
      permissions: [],
    });
  };

  const openEditDialog = (
    type: EditDialogState["type"],
    item?: any,
    isNew = false,
  ) => {
    if (isNew) {
      resetForm();
    } else if (item) {
      setFormData({
        value: item.value || "",
        label: item.label || "",
        color: item.color || "#0ea5e9",
        description: item.description || "",
        badge: item.badge || "default",
        priority: item.priority || 1,
        permissions: item.permissions || [],
      });
    }

    setEditDialog({
      isOpen: true,
      type,
      item,
      isNew,
    });
  };

  const closeEditDialog = () => {
    setEditDialog({
      isOpen: false,
      type: null,
      item: null,
      isNew: false,
    });
    resetForm();
  };

  const handleSave = () => {
    if (!formData.value || !formData.label) {
      toast({
        title: "Error",
        description: "El valor y la etiqueta son requeridos",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate values
    const checkDuplicate = (items: any[], currentValue?: string) => {
      return items.some(
        (item) =>
          item.value === formData.value &&
          (!currentValue || item.value !== currentValue),
      );
    };

    let isDuplicate = false;
    switch (editDialog.type) {
      case "auditType":
        isDuplicate = checkDuplicate(auditTypes, editDialog.item?.value);
        break;
      case "auditStatus":
        isDuplicate = checkDuplicate(auditStatuses, editDialog.item?.value);
        break;
      case "evidenceCategory":
        isDuplicate = checkDuplicate(
          evidenceCategories,
          editDialog.item?.value,
        );
        break;
      case "ncCategory":
        isDuplicate = checkDuplicate(ncCategories, editDialog.item?.value);
        break;
      case "ncSeverity":
        isDuplicate = checkDuplicate(ncSeverities, editDialog.item?.value);
        break;
      case "ncStatus":
        isDuplicate = checkDuplicate(ncStatuses, editDialog.item?.value);
        break;
      case "userRole":
        isDuplicate = checkDuplicate(userRoles, editDialog.item?.value);
        break;
    }

    if (isDuplicate) {
      toast({
        title: "Error",
        description: "Ya existe un elemento con ese valor",
        variant: "destructive",
      });
      return;
    }

    const newItem = { ...formData };

    if (editDialog.isNew) {
      // Agregar nuevo elemento
      switch (editDialog.type) {
        case "auditType":
          setAuditTypes([...auditTypes, newItem as AuditType]);
          break;
        case "auditStatus":
          setAuditStatuses([...auditStatuses, newItem as AuditStatus]);
          break;
        case "evidenceCategory":
          setEvidenceCategories([
            ...evidenceCategories,
            newItem as AuditCategory,
          ]);
          break;
        case "ncCategory":
          setNCCategories([...ncCategories, newItem as AuditCategory]);
          break;
        case "ncSeverity":
          setNCSeverities([...ncSeverities, newItem as NonConformitySeverity]);
          break;
        case "ncStatus":
          setNCStatuses([...ncStatuses, newItem as NonConformityStatus]);
          break;
        case "userRole":
          setUserRoles([...userRoles, newItem as UserRole]);
          break;
      }
    } else {
      // Actualizar elemento existente
      switch (editDialog.type) {
        case "auditType":
          setAuditTypes(
            auditTypes.map((item) =>
              item.value === editDialog.item.value
                ? (newItem as AuditType)
                : item,
            ),
          );
          break;
        case "auditStatus":
          setAuditStatuses(
            auditStatuses.map((item) =>
              item.value === editDialog.item.value
                ? (newItem as AuditStatus)
                : item,
            ),
          );
          break;
        case "evidenceCategory":
          setEvidenceCategories(
            evidenceCategories.map((item) =>
              item.value === editDialog.item.value
                ? (newItem as AuditCategory)
                : item,
            ),
          );
          break;
        case "ncCategory":
          setNCCategories(
            ncCategories.map((item) =>
              item.value === editDialog.item.value
                ? (newItem as AuditCategory)
                : item,
            ),
          );
          break;
        case "ncSeverity":
          setNCSeverities(
            ncSeverities.map((item) =>
              item.value === editDialog.item.value
                ? (newItem as NonConformitySeverity)
                : item,
            ),
          );
          break;
        case "ncStatus":
          setNCStatuses(
            ncStatuses.map((item) =>
              item.value === editDialog.item.value
                ? (newItem as NonConformityStatus)
                : item,
            ),
          );
          break;
        case "userRole":
          setUserRoles(
            userRoles.map((item) =>
              item.value === editDialog.item.value
                ? (newItem as UserRole)
                : item,
            ),
          );
          break;
      }
    }

    toast({
      title: editDialog.isNew ? "Elemento creado" : "Elemento actualizado",
      description: `${formData.label} ha sido ${editDialog.isNew ? "creado" : "actualizado"} exitosamente`,
    });
    closeEditDialog();
  };

  const handleDelete = (type: string, item: any) => {
    switch (type) {
      case "auditType":
        setAuditTypes(auditTypes.filter((t) => t.value !== item.value));
        break;
      case "auditStatus":
        setAuditStatuses(auditStatuses.filter((s) => s.value !== item.value));
        break;
      case "evidenceCategory":
        setEvidenceCategories(
          evidenceCategories.filter((c) => c.value !== item.value),
        );
        break;
      case "ncCategory":
        setNCCategories(ncCategories.filter((c) => c.value !== item.value));
        break;
      case "ncSeverity":
        setNCSeverities(ncSeverities.filter((s) => s.value !== item.value));
        break;
      case "ncStatus":
        setNCStatuses(ncStatuses.filter((s) => s.value !== item.value));
        break;
      case "userRole":
        setUserRoles(userRoles.filter((r) => r.value !== item.value));
        break;
    }

    toast({
      title: "Elemento eliminado",
      description: `${item.label} ha sido eliminado exitosamente`,
      variant: "destructive",
    });
  };

  const handleResetAll = () => {
    setAuditTypes(getAuditTypeOptions());
    setAuditStatuses(getAuditStatusOptions());
    setEvidenceCategories(getEvidenceCategoryOptions());
    setNCCategories(getNCCategoryOptions());
    setNCSeverities(getNCSeverityOptions());
    setNCStatuses(getNCStatusOptions());
    setUserRoles(USER_ROLES);

    localStorage.removeItem(CONFIG_STORAGE_KEY);
    setHasChanges(false);

    toast({
      title: "Configuración restablecida",
      description: "Se ha restaurado la configuración predeterminada",
    });
  };

  const handleExportConfig = () => {
    const config = {
      auditTypes,
      auditStatuses,
      evidenceCategories,
      ncCategories,
      ncSeverities,
      ncStatuses,
      userRoles,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "auditpro-configuration.json";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Configuración exportada",
      description: "El archivo de configuración ha sido descargado",
    });
  };

  const badgeOptions = [
    { value: "default", label: "Predeterminado" },
    { value: "secondary", label: "Secundario" },
    { value: "destructive", label: "Destructivo" },
    { value: "outline", label: "Contorno" },
    { value: "pending", label: "Pendiente" },
    { value: "approved", label: "Aprobado" },
    { value: "draft", label: "Borrador" },
  ];

  // Lista de permisos disponibles en el sistema
  const availablePermissions = [
    {
      value: "create_audit",
      label: "Crear auditorías",
      category: "Auditorías",
    },
    { value: "edit_audit", label: "Editar auditorías", category: "Auditorías" },
    {
      value: "delete_audit",
      label: "Eliminar auditorías",
      category: "Auditorías",
    },
    {
      value: "view_all_audits",
      label: "Ver todas las auditorías",
      category: "Auditorías",
    },
    {
      value: "view_assigned_audits",
      label: "Ver auditorías asignadas",
      category: "Auditorías",
    },
    {
      value: "create_nonconformity",
      label: "Crear no conformidades",
      category: "No Conformidades",
    },
    {
      value: "edit_nonconformity",
      label: "Editar no conformidades",
      category: "No Conformidades",
    },
    {
      value: "delete_nonconformity",
      label: "Eliminar no conformidades",
      category: "No Conformidades",
    },
    {
      value: "view_all_nonconformities",
      label: "Ver todas las no conformidades",
      category: "No Conformidades",
    },
    {
      value: "view_assigned_nonconformities",
      label: "Ver no conformidades asignadas",
      category: "No Conformidades",
    },
    {
      value: "submit_corrective_actions",
      label: "Enviar acciones correctivas",
      category: "Acciones Correctivas",
    },
    {
      value: "modify_corrective_actions",
      label: "Modificar acciones correctivas",
      category: "Acciones Correctivas",
    },
    {
      value: "review_corrective_actions",
      label: "Revisar acciones correctivas",
      category: "Acciones Correctivas",
    },
    {
      value: "approve_corrective_actions",
      label: "Aprobar acciones correctivas",
      category: "Acciones Correctivas",
    },
    {
      value: "reject_corrective_actions",
      label: "Rechazar acciones correctivas",
      category: "Acciones Correctivas",
    },
    {
      value: "verify_implementation",
      label: "Verificar implementación",
      category: "Acciones Correctivas",
    },
    {
      value: "view_corrective_action_status",
      label: "Ver estado de acciones correctivas",
      category: "Acciones Correctivas",
    },
    {
      value: "upload_evidence",
      label: "Subir evidencias",
      category: "Evidencias",
    },
    { value: "view_evidence", label: "Ver evidencias", category: "Evidencias" },
    {
      value: "delete_evidence",
      label: "Eliminar evidencias",
      category: "Evidencias",
    },
    {
      value: "manage_configuration",
      label: "Gestionar configuración",
      category: "Administración",
    },
    {
      value: "manage_users",
      label: "Gestionar usuarios",
      category: "Administración",
    },
    {
      value: "assign_team_members",
      label: "Asignar miembros del equipo",
      category: "Administración",
    },
    {
      value: "final_approval",
      label: "Aprobación final",
      category: "Administración",
    },
    { value: "view_reports", label: "Ver reportes", category: "Reportes" },
    { value: "export_data", label: "Exportar datos", category: "Reportes" },
  ];

  const ConfigurationSection = ({
    title,
    description,
    items,
    type,
    showColor = false,
    showBadge = false,
    showPriority = false,
  }: {
    title: string;
    description: string;
    items: any[];
    type: EditDialogState["type"];
    showColor?: boolean;
    showBadge?: boolean;
    showPriority?: boolean;
  }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button onClick={() => openEditDialog(type, null, true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {showColor && item.color && (
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.label}</span>
                    {showBadge && (
                      <Badge variant={item.badge as any}>{item.label}</Badge>
                    )}
                    {showPriority && (
                      <Badge variant="outline" className="text-xs">
                        Prioridad {item.priority}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Valor: {item.value}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(type, item, false)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará
                        permanentemente "{item.label}" del sistema.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(type!, item)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay elementos configurados
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Configuración del Sistema
              </h1>
              <p className="text-muted-foreground mt-1">
                Gestiona los tipos, estados y categorías utilizados en el
                sistema de auditorías
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportConfig}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            {hasChanges && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restablecer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      ¿Restablecer configuración?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción restaurará la configuración predeterminada y
                      se perderán todos los cambios personalizados. Esta acción
                      no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetAll}>
                      Restablecer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Warning Note */}
        <Card className="border-warning bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
              <div>
                <p className="font-medium text-warning-800">Nota importante</p>
                <p className="text-sm text-warning-700 mt-1">
                  Los cambios en esta configuración se guardan automáticamente
                  en el navegador. Para cambios permanentes en producción, debes
                  actualizar el archivo de configuración del servidor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Tabs */}
        <Tabs defaultValue="audits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="audits" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Auditorías
            </TabsTrigger>
            <TabsTrigger
              value="audit-config"
              className="flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              Config. Auditorías
            </TabsTrigger>
            <TabsTrigger
              value="nonconformities"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              No Conformidades
            </TabsTrigger>
            <TabsTrigger value="evidence" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Evidencias
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Roles y Permisos
            </TabsTrigger>
          </TabsList>

          {/* Audits Tab */}
          <TabsContent value="audits" className="space-y-6">
            <ConfigurationSection
              title="Tipos de Auditoría"
              description="Define los tipos de auditoría disponibles en el sistema"
              items={auditTypes}
              type="auditType"
              showColor={true}
            />

            <ConfigurationSection
              title="Estados de Auditoría"
              description="Define los estados por los que puede pasar una auditoría"
              items={auditStatuses}
              type="auditStatus"
              showColor={true}
              showBadge={true}
            />
          </TabsContent>

          {/* Audit Configuration Tab */}
          <TabsContent value="audit-config" className="space-y-6">
            <ConfigurationSection
              title="Modalidades de Auditoría"
              description="Define las modalidades disponibles para realizar auditorías"
              items={auditModalities}
              type="auditModality"
            />

            <ConfigurationSection
              title="Normas ISO"
              description="Define las normas ISO disponibles para auditar"
              items={isoStandards}
              type="isoStandard"
            />

            <ConfigurationSection
              title="Roles del Equipo Auditor"
              description="Define los roles disponibles para los miembros del equipo auditor"
              items={auditorRoles}
              type="auditorRole"
            />
          </TabsContent>

          {/* Non-Conformities Tab */}
          <TabsContent value="nonconformities" className="space-y-6">
            <ConfigurationSection
              title="Severidades de No Conformidad"
              description="Define los niveles de severidad para las no conformidades"
              items={ncSeverities}
              type="ncSeverity"
              showColor={true}
              showBadge={true}
              showPriority={true}
            />

            <ConfigurationSection
              title="Estados de No Conformidad"
              description="Define los estados por los que puede pasar una no conformidad"
              items={ncStatuses}
              type="ncStatus"
              showColor={true}
              showBadge={true}
            />

            <ConfigurationSection
              title="Categorías de No Conformidad"
              description="Define las categorías para clasificar las no conformidades"
              items={ncCategories}
              type="ncCategory"
            />
          </TabsContent>

          {/* Evidence Tab */}
          <TabsContent value="evidence" className="space-y-6">
            <ConfigurationSection
              title="Categorías de Evidencia"
              description="Define las categorías para clasificar las evidencias"
              items={evidenceCategories}
              type="evidenceCategory"
            />
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Roles de Usuario</CardTitle>
                    <CardDescription>
                      Define los roles disponibles y sus permisos en el sistema
                      de workflow
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => openEditDialog("userRole", null, true)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Rol
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userRoles.map((role, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-lg">
                            {role.label}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {role.value}
                          </Badge>
                        </div>
                        {role.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {role.description}
                          </p>
                        )}
                        <div className="space-y-2">
                          <div className="text-sm font-medium">
                            Permisos ({role.permissions.length}):
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.map((permission, permIndex) => (
                              <Badge
                                key={permIndex}
                                variant="secondary"
                                className="text-xs"
                              >
                                {permission.replace(/_/g, " ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            openEditDialog("userRole", role, false)
                          }
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                ¿Estás seguro?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará
                                permanentemente el rol "{role.label}" del
                                sistema. Los usuarios con este rol perderán sus
                                permisos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete("userRole", role)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                  {userRoles.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay roles configurados
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={editDialog.isOpen} onOpenChange={closeEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editDialog.isNew ? "Agregar" : "Editar"} elemento
              </DialogTitle>
              <DialogDescription>
                {editDialog.isNew ? "Crea un nuevo" : "Modifica el"} elemento de
                configuración
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Valor *</Label>
                  <Input
                    id="value"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    placeholder="valor_interno"
                  />
                  <p className="text-xs text-muted-foreground">
                    Valor interno usado por el sistema (sin espacios)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="label">Etiqueta *</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    placeholder="Etiqueta visible"
                  />
                  <p className="text-xs text-muted-foreground">
                    Texto mostrado al usuario
                  </p>
                </div>
              </div>

              {(editDialog.type === "auditType" ||
                editDialog.type === "auditStatus" ||
                editDialog.type === "ncSeverity" ||
                editDialog.type === "ncStatus") && (
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="w-20 h-10"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      placeholder="#0ea5e9"
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {(editDialog.type === "auditStatus" ||
                editDialog.type === "ncSeverity" ||
                editDialog.type === "ncStatus") && (
                <div className="space-y-2">
                  <Label htmlFor="badge">Estilo de Badge</Label>
                  <Select
                    value={formData.badge}
                    onValueChange={(value) =>
                      setFormData({ ...formData, badge: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {badgeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {editDialog.type === "ncSeverity" && (
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    1 = Mayor prioridad, 10 = Menor prioridad
                  </p>
                </div>
              )}

              {editDialog.type === "userRole" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Permisos del Rol</Label>
                    <p className="text-xs text-muted-foreground">
                      Selecciona los permisos que tendrá este rol en el sistema
                    </p>
                    <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                      {Object.entries(
                        availablePermissions.reduce(
                          (acc, permission) => {
                            if (!acc[permission.category]) {
                              acc[permission.category] = [];
                            }
                            acc[permission.category].push(permission);
                            return acc;
                          },
                          {} as Record<string, typeof availablePermissions>,
                        ),
                      ).map(([category, permissions]) => (
                        <div key={category} className="mb-4">
                          <div className="font-medium text-sm mb-2 text-primary">
                            {category}
                          </div>
                          <div className="space-y-2">
                            {permissions.map((permission) => (
                              <div
                                key={permission.value}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  id={permission.value}
                                  checked={formData.permissions.includes(
                                    permission.value,
                                  )}
                                  onChange={(e) => {
                                    const newPermissions = e.target.checked
                                      ? [
                                          ...formData.permissions,
                                          permission.value,
                                        ]
                                      : formData.permissions.filter(
                                          (p) => p !== permission.value,
                                        );
                                    setFormData({
                                      ...formData,
                                      permissions: newPermissions,
                                    });
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <Label
                                  htmlFor={permission.value}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {permission.label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            permissions: availablePermissions.map(
                              (p) => p.value,
                            ),
                          });
                        }}
                      >
                        Seleccionar Todos
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData({ ...formData, permissions: [] });
                        }}
                      >
                        Deseleccionar Todos
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descripción del elemento..."
                  rows={3}
                />
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Vista previa</Label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {formData.color && editDialog.type !== "userRole" && (
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: formData.color }}
                      />
                    )}
                    <span className="font-medium">
                      {formData.label || "Etiqueta"}
                    </span>
                    {(editDialog.type === "auditStatus" ||
                      editDialog.type === "ncSeverity" ||
                      editDialog.type === "ncStatus") && (
                      <Badge variant={formData.badge as any}>
                        {formData.label || "Etiqueta"}
                      </Badge>
                    )}
                    {editDialog.type === "userRole" && (
                      <Badge variant="outline" className="text-xs">
                        {formData.value || "valor_rol"}
                      </Badge>
                    )}
                  </div>
                  {formData.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.description}
                    </p>
                  )}
                  {editDialog.type === "userRole" &&
                    formData.permissions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium mb-1">
                          Permisos seleccionados ({formData.permissions.length}
                          ):
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {formData.permissions
                            .slice(0, 5)
                            .map((permission) => (
                              <Badge
                                key={permission}
                                variant="secondary"
                                className="text-xs"
                              >
                                {permission.replace(/_/g, " ")}
                              </Badge>
                            ))}
                          {formData.permissions.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{formData.permissions.length - 5} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeEditDialog}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.value || !formData.label}
              >
                <Save className="w-4 h-4 mr-2" />
                {editDialog.isNew ? "Crear" : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
