import { useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Upload,
  FileText,
  Image,
  AlertTriangle,
  Plus,
  Download,
  Eye,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  X,
} from "lucide-react";
import { Layout } from "@/components/Layout";

// Types
interface Evidence {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  description: string;
  category: string;
  file?: File;
}

interface NonConformity {
  id: number;
  title: string;
  description: string;
  severity: "Crítica" | "Alta" | "Media" | "Baja";
  status: "Abierta" | "En revisión" | "Cerrada";
  assignee: string;
  dueDate: string;
  createdDate: string;
}

// Mock data for audit detail
const auditDetail = {
  id: 1,
  name: "Auditoría ISO 9001 - Planta Norte",
  type: "Calidad",
  status: "En progreso",
  progress: 75,
  dueDate: "2024-01-25",
  auditor: "María González",
  createdDate: "2024-01-10",
  description:
    "Auditoría anual de calidad para certificación ISO 9001 en la planta de producción norte.",
  scope:
    "Procesos de producción, control de calidad, gestión documental y recursos humanos",
  objectives: [
    "Verificar cumplimiento de norma ISO 9001:2015",
    "Identificar oportunidades de mejora",
    "Evaluar eficacia del sistema de gestión de calidad",
  ],
};

export default function AuditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [evidences, setEvidences] = useState<Evidence[]>([
    {
      id: 1,
      name: "Manual_Calidad_v2.pdf",
      type: "PDF",
      size: "2.4 MB",
      uploadDate: "2024-01-15",
      description: "Manual de calidad actualizado",
      category: "Documentación",
    },
    {
      id: 2,
      name: "Proceso_Produccion.jpg",
      type: "Imagen",
      size: "1.8 MB",
      uploadDate: "2024-01-16",
      description: "Fotografía del proceso de producción",
      category: "Evidencia visual",
    },
  ]);

  const [nonConformities, setNonConformities] = useState<NonConformity[]>([
    {
      id: 1,
      title: "Falta de documentación en proceso de calidad",
      description:
        "No se encontró evidencia documental del proceso de control de calidad",
      severity: "Alta",
      status: "Abierta",
      assignee: "Roberto Silva",
      dueDate: "2024-01-28",
      createdDate: "2024-01-20",
    },
  ]);

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isNonConformityDialogOpen, setIsNonConformityDialogOpen] =
    useState(false);
  const [uploadForm, setUploadForm] = useState({
    description: "",
    category: "",
  });
  const [nonConformityForm, setNonConformityForm] = useState({
    title: "",
    description: "",
    severity: "",
    assignee: "",
    dueDate: "",
  });

  // Handle file upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const newEvidence: Evidence = {
        id: Math.max(...evidences.map((e) => e.id)) + 1,
        name: file.name,
        type: file.type.includes("image")
          ? "Imagen"
          : file.type.includes("pdf")
            ? "PDF"
            : "Documento",
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split("T")[0],
        description: uploadForm.description,
        category: uploadForm.category,
        file,
      };

      setEvidences((prev) => [...prev, newEvidence]);
    });

    setIsUploadDialogOpen(false);
    setUploadForm({ description: "", category: "" });

    toast({
      title: "Evidencia subida",
      description: `Se ${files.length === 1 ? "subió" : "subieron"} ${files.length} archivo${files.length > 1 ? "s" : ""} exitosamente`,
    });
  };

  // Handle non-conformity creation
  const handleCreateNonConformity = () => {
    if (
      !nonConformityForm.title ||
      !nonConformityForm.description ||
      !nonConformityForm.severity
    ) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const newNonConformity: NonConformity = {
      id: Math.max(...nonConformities.map((nc) => nc.id)) + 1,
      title: nonConformityForm.title,
      description: nonConformityForm.description,
      severity: nonConformityForm.severity as NonConformity["severity"],
      status: "Abierta",
      assignee: nonConformityForm.assignee,
      dueDate: nonConformityForm.dueDate,
      createdDate: new Date().toISOString().split("T")[0],
    };

    setNonConformities((prev) => [...prev, newNonConformity]);
    setIsNonConformityDialogOpen(false);
    setNonConformityForm({
      title: "",
      description: "",
      severity: "",
      assignee: "",
      dueDate: "",
    });

    toast({
      title: "No conformidad registrada",
      description: "La no conformidad ha sido registrada exitosamente",
    });
  };

  if (!id) {
    return <div>Auditoría no encontrada</div>;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/audits")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a auditorías
          </Button>
        </div>

        {/* Audit Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      {auditDetail.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {auditDetail.description}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{auditDetail.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Auditor:</span>
                    <p className="font-medium">{auditDetail.auditor}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fecha límite:</span>
                    <p className="font-medium">{auditDetail.dueDate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estado:</span>
                    <p className="font-medium">{auditDetail.status}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Progreso:</span>
                    <p className="font-medium">{auditDetail.progress}%</p>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground text-sm">
                    Progreso general:
                  </span>
                  <Progress value={auditDetail.progress} className="mt-2" />
                </div>

                <div>
                  <span className="text-muted-foreground text-sm">
                    Alcance:
                  </span>
                  <p className="text-sm mt-1">{auditDetail.scope}</p>
                </div>

                <div>
                  <span className="text-muted-foreground text-sm">
                    Objetivos:
                  </span>
                  <ul className="text-sm mt-1 space-y-1">
                    {auditDetail.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">
                    {evidences.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Evidencias subidas
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning-600">
                    {nonConformities.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    No conformidades
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {auditDetail.progress}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Completado
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="evidence" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="evidence" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Evidencias ({evidences.length})
            </TabsTrigger>
            <TabsTrigger
              value="nonconformities"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              No Conformidades ({nonConformities.length})
            </TabsTrigger>
          </TabsList>

          {/* Evidence Tab */}
          <TabsContent value="evidence" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Evidencias de auditoría</h3>
              <Dialog
                open={isUploadDialogOpen}
                onOpenChange={setIsUploadDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir evidencia
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Subir evidencia</DialogTitle>
                    <DialogDescription>
                      Selecciona archivos para subir como evidencia de la
                      auditoría
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload">Archivos</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={(e) => {
                          if (e.target.files) {
                            handleFileUpload(e.target.files);
                          }
                        }}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Puedes seleccionar múltiples archivos. Tamaño máximo:
                        10MB por archivo.
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="category">Categoría</Label>
                      <Select
                        value={uploadForm.category}
                        onValueChange={(value) =>
                          setUploadForm({ ...uploadForm, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Documentación">
                            Documentación
                          </SelectItem>
                          <SelectItem value="Evidencia visual">
                            Evidencia visual
                          </SelectItem>
                          <SelectItem value="Registros">Registros</SelectItem>
                          <SelectItem value="Certificados">
                            Certificados
                          </SelectItem>
                          <SelectItem value="Otros">Otros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe brevemente esta evidencia..."
                        value={uploadForm.description}
                        onChange={(e) =>
                          setUploadForm({
                            ...uploadForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsUploadDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Seleccionar archivos
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Evidence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evidences.map((evidence) => (
                <Card
                  key={evidence.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {evidence.type === "Imagen" ? (
                            <Image className="w-5 h-5 text-primary" />
                          ) : (
                            <FileText className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {evidence.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {evidence.size}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <Badge variant="outline" className="text-xs">
                          {evidence.category}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {evidence.description}
                      </p>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>Subido: {evidence.uploadDate}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {evidences.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No hay evidencias
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Comienza subiendo evidencias para esta auditoría
                  </p>
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir primera evidencia
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Non-Conformities Tab */}
          <TabsContent value="nonconformities" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                No conformidades encontradas
              </h3>
              <Dialog
                open={isNonConformityDialogOpen}
                onOpenChange={setIsNonConformityDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Plus className="w-4 h-4 mr-2" />
                    Registrar no conformidad
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Registrar no conformidad</DialogTitle>
                    <DialogDescription>
                      Registra una nueva no conformidad encontrada durante la
                      auditoría
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nc-title">Título *</Label>
                      <Input
                        id="nc-title"
                        value={nonConformityForm.title}
                        onChange={(e) =>
                          setNonConformityForm({
                            ...nonConformityForm,
                            title: e.target.value,
                          })
                        }
                        placeholder="Título descriptivo de la no conformidad"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nc-description">Descripción *</Label>
                      <Textarea
                        id="nc-description"
                        value={nonConformityForm.description}
                        onChange={(e) =>
                          setNonConformityForm({
                            ...nonConformityForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe detalladamente la no conformidad encontrada..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nc-severity">Severidad *</Label>
                        <Select
                          value={nonConformityForm.severity}
                          onValueChange={(value) =>
                            setNonConformityForm({
                              ...nonConformityForm,
                              severity: value,
                            })
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
                      <div>
                        <Label htmlFor="nc-assignee">Responsable</Label>
                        <Input
                          id="nc-assignee"
                          value={nonConformityForm.assignee}
                          onChange={(e) =>
                            setNonConformityForm({
                              ...nonConformityForm,
                              assignee: e.target.value,
                            })
                          }
                          placeholder="Nombre del responsable"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="nc-dueDate">
                        Fecha límite de resolución
                      </Label>
                      <Input
                        id="nc-dueDate"
                        type="date"
                        value={nonConformityForm.dueDate}
                        onChange={(e) =>
                          setNonConformityForm({
                            ...nonConformityForm,
                            dueDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsNonConformityDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreateNonConformity}
                      variant="destructive"
                    >
                      Registrar no conformidad
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Non-Conformities List */}
            <div className="space-y-4">
              {nonConformities.map((nc) => (
                <Card key={nc.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-mono text-muted-foreground">
                            NC-{nc.id.toString().padStart(3, "0")}
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
                          <Badge
                            variant={
                              nc.status === "Abierta"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {nc.status}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-lg mb-2">
                          {nc.title}
                        </h4>
                        <p className="text-muted-foreground mb-4">
                          {nc.description}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Responsable:
                        </span>
                        <p className="font-medium">
                          {nc.assignee || "Sin asignar"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Fecha límite:
                        </span>
                        <p className="font-medium">
                          {nc.dueDate || "Sin definir"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Creada:</span>
                        <p className="font-medium">{nc.createdDate}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {nonConformities.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle className="w-12 h-12 text-success-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No hay no conformidades
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Excelente trabajo. No se han encontrado no conformidades en
                    esta auditoría.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
      />
    </Layout>
  );
}
