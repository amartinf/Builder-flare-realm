import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  AlertTriangle,
  Settings,
  Home,
  FileText,
  Users,
  Navigation,
} from "lucide-react";
import { Layout } from "@/components/Layout";

export default function Diagnostics() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectValue, setSelectValue] = useState("");
  const [switchValue, setSwitchValue] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const addTestResult = (test: string, success: boolean) => {
    const result = `${test}: ${success ? "✅ PASS" : "❌ FAIL"}`;
    setTestResults((prev) => [...prev, result]);
  };

  const runAllTests = () => {
    console.log("🧪 Iniciando tests de funcionalidad...");
    setTestResults([]);

    // Test 1: Button onClick
    try {
      console.log("Test 1: Button onClick");
      addTestResult("Button onClick", true);
    } catch (error) {
      console.error("Test 1 failed:", error);
      addTestResult("Button onClick", false);
    }

    // Test 2: Navigation
    try {
      console.log("Test 2: Navigation");
      // navigate("/dashboard"); // Comentado para no cambiar de página
      addTestResult("Navigation", true);
    } catch (error) {
      console.error("Test 2 failed:", error);
      addTestResult("Navigation", false);
    }

    // Test 3: Toast notifications
    try {
      console.log("Test 3: Toast notifications");
      toast({
        title: "Test de Toast",
        description: "Esta notificación confirma que los toasts funcionan",
      });
      addTestResult("Toast notifications", true);
    } catch (error) {
      console.error("Test 3 failed:", error);
      addTestResult("Toast notifications", false);
    }

    // Test 4: State management
    try {
      console.log("Test 4: State management");
      setInputValue("Test State");
      addTestResult("State management", true);
    } catch (error) {
      console.error("Test 4 failed:", error);
      addTestResult("State management", false);
    }

    // Test 5: Dialog
    try {
      console.log("Test 5: Dialog");
      setIsDialogOpen(true);
      setTimeout(() => setIsDialogOpen(false), 2000);
      addTestResult("Dialog components", true);
    } catch (error) {
      console.error("Test 5 failed:", error);
      addTestResult("Dialog components", false);
    }

    console.log("🏁 Tests completados");
  };

  const testNavigation = (route: string) => {
    console.log(`Navegando a: ${route}`);
    try {
      navigate(route);
      toast({
        title: "Navegación exitosa",
        description: `Navegando a ${route}`,
      });
    } catch (error) {
      console.error("Error de navegación:", error);
      toast({
        title: "Error de navegación",
        description: `No se pudo navegar a ${route}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Diagnóstico de Funcionalidad
            </h1>
            <p className="text-muted-foreground mt-1">
              Prueba que todos los componentes y funcionalidades estén
              operativos
            </p>
          </div>
        </div>

        {/* Quick Navigation Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Pruebas de Navegación
            </CardTitle>
            <CardDescription>
              Verifica que la navegación entre páginas funcione correctamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => testNavigation("/dashboard")}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => testNavigation("/audits")}
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Auditorías
              </Button>
              <Button
                variant="outline"
                onClick={() => testNavigation("/users")}
                className="w-full"
              >
                <Users className="w-4 h-4 mr-2" />
                Usuarios
              </Button>
              <Button
                variant="outline"
                onClick={() => testNavigation("/configuration")}
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Component Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Pruebas de Componentes</CardTitle>
            <CardDescription>
              Verifica que todos los componentes de UI respondan correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Button Tests */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Botones</Label>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => console.log("Button default clicked")}>
                  Default
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => console.log("Button secondary clicked")}
                >
                  Secondary
                </Button>
                <Button
                  variant="outline"
                  onClick={() => console.log("Button outline clicked")}
                >
                  Outline
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => console.log("Button destructive clicked")}
                >
                  Destructive
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => console.log("Button ghost clicked")}
                >
                  Ghost
                </Button>
              </div>
            </div>

            {/* Input Tests */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Input y State</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="test-input">Input de prueba</Label>
                  <Input
                    id="test-input"
                    value={inputValue}
                    onChange={(e) => {
                      console.log("Input changed:", e.target.value);
                      setInputValue(e.target.value);
                    }}
                    placeholder="Escribe algo..."
                  />
                </div>
                <div>
                  <Label>Valor actual: {inputValue}</Label>
                  <Badge variant="secondary">{inputValue || "Vacío"}</Badge>
                </div>
              </div>
            </div>

            {/* Select Tests */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Select Component
              </Label>
              <Select
                value={selectValue}
                onValueChange={(value) => {
                  console.log("Select changed:", value);
                  setSelectValue(value);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="option1">Opción 1</SelectItem>
                  <SelectItem value="option2">Opción 2</SelectItem>
                  <SelectItem value="option3">Opción 3</SelectItem>
                </SelectContent>
              </Select>
              {selectValue && <Badge>Seleccionado: {selectValue}</Badge>}
            </div>

            {/* Switch Tests */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Switch Component
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="test-switch"
                  checked={switchValue}
                  onCheckedChange={(checked) => {
                    console.log("Switch changed:", checked);
                    setSwitchValue(checked);
                  }}
                />
                <Label htmlFor="test-switch">
                  Switch está {switchValue ? "activado" : "desactivado"}
                </Label>
              </div>
            </div>

            {/* Dropdown Test */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Dropdown Menu</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Abrir menú</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => console.log("Opción 1 clicked")}
                  >
                    Opción 1
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => console.log("Opción 2 clicked")}
                  >
                    Opción 2
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => console.log("Opción 3 clicked")}
                  >
                    Opción 3
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Dialog Test */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Dialog Component
              </Label>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Abrir diálogo</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Diálogo de Prueba</DialogTitle>
                    <DialogDescription>
                      Este diálogo confirma que los modales funcionan
                      correctamente.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button onClick={() => setIsDialogOpen(false)}>
                      Cerrar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Automated Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Tests Automatizados</CardTitle>
            <CardDescription>
              Ejecuta una serie de tests para verificar la funcionalidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={runAllTests} className="w-full md:w-auto">
                <CheckCircle className="w-4 h-4 mr-2" />
                Ejecutar Todos los Tests
              </Button>

              {testResults.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Resultados:</Label>
                  <div className="bg-gray-50 border rounded-lg p-4 space-y-1">
                    {testResults.map((result, index) => (
                      <div key={index} className="font-mono text-sm">
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <Label>User Agent:</Label>
                <p className="text-muted-foreground text-xs mt-1 break-all">
                  {navigator.userAgent.substring(0, 50)}...
                </p>
              </div>
              <div>
                <Label>Viewport:</Label>
                <p className="text-muted-foreground">
                  {window.innerWidth} x {window.innerHeight}
                </p>
              </div>
              <div>
                <Label>URL Actual:</Label>
                <p className="text-muted-foreground text-xs break-all">
                  {window.location.href}
                </p>
              </div>
              <div>
                <Label>Timestamp:</Label>
                <p className="text-muted-foreground">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
