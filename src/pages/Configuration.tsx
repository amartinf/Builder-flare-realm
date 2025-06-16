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
} from "lucide-react";
import { Layout } from "@/components/Layout";
import {
  getAuditTypeOptions,
  getAuditStatusOptions,
  getEvidenceCategoryOptions,
  getNCCategoryOptions,
  getNCSeverityOptions,
  getNCStatusOptions,
  type AuditType,
  type AuditStatus,
  type AuditCategory,
  type NonConformitySeverity,
  type NonConformityStatus,
} from "@/config/auditOptions";

interface EditDialogState {
  isOpen: boolean;
  type:
    | "auditType"
    | "auditStatus"
    | "evidenceCategory"
    | "ncCategory"
    | "ncSeverity"
    | "ncStatus"
    | null;
  item: any;
  isNew: boolean;
}

export default function Configuration() {
  const { toast } = useToast();
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
  });

  const resetForm = () => {
    setFormData({
      value: "",
      label: "",
      color: "#0ea5e9",
      description: "",
      badge: "default",
      priority: 1,
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
    // En una aplicación real, aquí se guardarían los cambios en la base de datos
    toast({
      title: editDialog.isNew ? "Elemento creado" : "Elemento actualizado",
      description: `${formData.label} ha sido ${editDialog.isNew ? "creado" : "actualizado"} exitosamente`,
    });
    closeEditDialog();
  };

  const handleDelete = (type: string, item: any) => {
    // En una aplicación real, aquí se eliminaría el elemento
    toast({
      title: "Elemento eliminado",
      description: `${item.label} ha sido eliminado exitosamente`,
      variant: "destructive",
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
              className="flex items-center justify-between p-3 border rounded-lg"
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(type!, item)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Configuración del Sistema
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona los tipos, estados y categorías utilizados en el sistema
              de auditorías
            </p>
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
                  Los cambios en esta configuración afectarán a todas las
                  auditorías y no conformidades existentes. Se recomienda hacer
                  respaldos antes de realizar modificaciones importantes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Tabs */}
        <Tabs defaultValue="audits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="audits" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Auditorías
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
          </TabsList>

          {/* Audits Tab */}
          <TabsContent value="audits" className="space-y-6">
            <ConfigurationSection
              title="Tipos de Auditoría"
              description="Define los tipos de auditoría disponibles en el sistema"
              items={getAuditTypeOptions()}
              type="auditType"
              showColor={true}
            />

            <ConfigurationSection
              title="Estados de Auditoría"
              description="Define los estados por los que puede pasar una auditoría"
              items={getAuditStatusOptions()}
              type="auditStatus"
              showColor={true}
              showBadge={true}
            />
          </TabsContent>

          {/* Non-Conformities Tab */}
          <TabsContent value="nonconformities" className="space-y-6">
            <ConfigurationSection
              title="Severidades de No Conformidad"
              description="Define los niveles de severidad para las no conformidades"
              items={getNCSeverityOptions()}
              type="ncSeverity"
              showColor={true}
              showBadge={true}
              showPriority={true}
            />

            <ConfigurationSection
              title="Estados de No Conformidad"
              description="Define los estados por los que puede pasar una no conformidad"
              items={getNCStatusOptions()}
              type="ncStatus"
              showColor={true}
              showBadge={true}
            />

            <ConfigurationSection
              title="Categorías de No Conformidad"
              description="Define las categorías para clasificar las no conformidades"
              items={getNCCategoryOptions()}
              type="ncCategory"
            />
          </TabsContent>

          {/* Evidence Tab */}
          <TabsContent value="evidence" className="space-y-6">
            <ConfigurationSection
              title="Categorías de Evidencia"
              description="Define las categorías para clasificar las evidencias"
              items={getEvidenceCategoryOptions()}
              type="evidenceCategory"
            />
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
                    {formData.color && (
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
                  </div>
                  {formData.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.description}
                    </p>
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
