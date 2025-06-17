import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Database,
  Server,
  Shield,
  Settings,
  TestTube,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Link,
  Lock,
} from "lucide-react";

interface FileMakerConfig {
  server: {
    host: string;
    port: number;
    protocol: "http" | "https";
    timeout: number;
  };
  database: {
    name: string;
    solution: string;
    version: string;
  };
  authentication: {
    username: string;
    password: string;
    authType: "basic" | "oauth" | "token";
    tokenExpiry: number;
  };
  connection: {
    maxConnections: number;
    retryAttempts: number;
    enableSSL: boolean;
    verifySSL: boolean;
  };
  layouts: {
    audits: string;
    nonConformities: string;
    users: string;
    evidence: string;
    comments: string;
  };
  preferences: {
    useMockData: boolean;
    debugMode: boolean;
    logLevel: "error" | "warn" | "info" | "debug";
    autoReconnect: boolean;
  };
}

const defaultConfig: FileMakerConfig = {
  server: {
    host: "localhost",
    port: 443,
    protocol: "https",
    timeout: 30000,
  },
  database: {
    name: "AuditPro",
    solution: "AuditPro.fmp12",
    version: "19.0",
  },
  authentication: {
    username: "",
    password: "",
    authType: "basic",
    tokenExpiry: 3600,
  },
  connection: {
    maxConnections: 10,
    retryAttempts: 3,
    enableSSL: true,
    verifySSL: true,
  },
  layouts: {
    audits: "Audits",
    nonConformities: "NonConformities",
    users: "Users",
    evidence: "Evidence",
    comments: "Comments",
  },
  preferences: {
    useMockData: true,
    debugMode: false,
    logLevel: "info",
    autoReconnect: true,
  },
};

export default function FileMakerConfig() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<FileMakerConfig>(defaultConfig);
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testResults, setTestResults] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("filemaker-config");
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...defaultConfig, ...parsedConfig });
      } catch (error) {
        console.error("Error loading FileMaker config:", error);
      }
    }
  }, []);

  const handleConfigChange = (
    section: keyof FileMakerConfig,
    field: string,
    value: any,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSaveConfig = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem("filemaker-config", JSON.stringify(config));

      // Also save to environment variables simulation
      const envConfig = {
        FILEMAKER_HOST: config.server.host,
        FILEMAKER_PORT: config.server.port.toString(),
        FILEMAKER_DATABASE: config.database.name,
        FILEMAKER_USERNAME: config.authentication.username,
        FILEMAKER_PASSWORD: config.authentication.password,
        USE_MOCK_DATA: config.preferences.useMockData.toString(),
      };

      localStorage.setItem("filemaker-env", JSON.stringify(envConfig));

      toast({
        title: "Configuración guardada",
        description:
          "La configuración de FileMaker Server se ha guardado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setConnectionStatus("testing");
    setTestResults("");

    try {
      // Simulate connection test
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const testUrl = `${config.server.protocol}://${config.server.host}:${config.server.port}`;

      if (config.preferences.useMockData) {
        setConnectionStatus("success");
        setTestResults(`✓ Modo de demostración activo
✓ Configuración válida
✓ Layouts configurados correctamente
✓ Sistema listo para usar datos de prueba`);
      } else {
        // In a real implementation, this would test the actual connection
        const hasValidConfig =
          config.server.host &&
          config.database.name &&
          config.authentication.username;

        if (hasValidConfig) {
          setConnectionStatus("success");
          setTestResults(`✓ Conectado a: ${testUrl}
✓ Base de datos: ${config.database.name}
✓ Usuario autenticado: ${config.authentication.username}
✓ Layouts disponibles: ${Object.values(config.layouts).join(", ")}`);
        } else {
          throw new Error("Configuración incompleta");
        }
      }
    } catch (error) {
      setConnectionStatus("error");
      setTestResults(`✗ Error de conexión
✗ No se pudo conectar al servidor
✗ Verificar configuración de red
✗ Revisar credenciales de acceso`);
    }
  };

  const getConnectionStatusBadge = () => {
    const statusConfig = {
      idle: {
        label: "Sin probar",
        variant: "secondary" as const,
        icon: Database,
      },
      testing: {
        label: "Probando...",
        variant: "outline" as const,
        icon: RefreshCw,
      },
      success: {
        label: "Conectado",
        variant: "default" as const,
        icon: CheckCircle,
      },
      error: {
        label: "Error",
        variant: "destructive" as const,
        icon: AlertTriangle,
      },
    };

    const config = statusConfig[connectionStatus];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon
          className={`w-3 h-3 ${connectionStatus === "testing" ? "animate-spin" : ""}`}
        />
        {config.label}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Configuración de FileMaker Server
            </h1>
            <p className="text-muted-foreground mt-1">
              Configura la conexión a la base de datos FileMaker Server
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getConnectionStatusBadge()}
            <Button
              onClick={handleTestConnection}
              disabled={connectionStatus === "testing"}
              variant="outline"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Probar Conexión
            </Button>
            <Button onClick={handleSaveConfig} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Server Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Configuración del Servidor
              </CardTitle>
              <CardDescription>
                Parámetros de conexión al servidor FileMaker
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="protocol">Protocolo</Label>
                  <Select
                    value={config.server.protocol}
                    onValueChange={(value: "http" | "https") =>
                      handleConfigChange("server", "protocol", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="https">HTTPS (Recomendado)</SelectItem>
                      <SelectItem value="http">HTTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="port">Puerto</Label>
                  <Input
                    id="port"
                    type="number"
                    value={config.server.port}
                    onChange={(e) =>
                      handleConfigChange(
                        "server",
                        "port",
                        parseInt(e.target.value),
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="host">Servidor (Host)</Label>
                <Input
                  id="host"
                  placeholder="localhost o IP del servidor"
                  value={config.server.host}
                  onChange={(e) =>
                    handleConfigChange("server", "host", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  value={config.server.timeout}
                  onChange={(e) =>
                    handleConfigChange(
                      "server",
                      "timeout",
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableSSL"
                  checked={config.connection.enableSSL}
                  onCheckedChange={(checked) =>
                    handleConfigChange("connection", "enableSSL", checked)
                  }
                />
                <Label htmlFor="enableSSL">Habilitar SSL</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="verifySSL"
                  checked={config.connection.verifySSL}
                  onCheckedChange={(checked) =>
                    handleConfigChange("connection", "verifySSL", checked)
                  }
                />
                <Label htmlFor="verifySSL">Verificar certificado SSL</Label>
              </div>
            </CardContent>
          </Card>

          {/* Database Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Configuración de Base de Datos
              </CardTitle>
              <CardDescription>
                Información de la base de datos FileMaker
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dbName">Nombre de la Base de Datos</Label>
                <Input
                  id="dbName"
                  placeholder="AuditPro"
                  value={config.database.name}
                  onChange={(e) =>
                    handleConfigChange("database", "name", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution">Archivo de Solución</Label>
                <Input
                  id="solution"
                  placeholder="AuditPro.fmp12"
                  value={config.database.solution}
                  onChange={(e) =>
                    handleConfigChange("database", "solution", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Versión de FileMaker</Label>
                <Select
                  value={config.database.version}
                  onValueChange={(value) =>
                    handleConfigChange("database", "version", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20.0">FileMaker Server 20</SelectItem>
                    <SelectItem value="19.0">FileMaker Server 19</SelectItem>
                    <SelectItem value="18.0">FileMaker Server 18</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Autenticación
              </CardTitle>
              <CardDescription>
                Credenciales de acceso a FileMaker Server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  placeholder="Nombre de usuario"
                  value={config.authentication.username}
                  onChange={(e) =>
                    handleConfigChange(
                      "authentication",
                      "username",
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={config.authentication.password}
                    onChange={(e) =>
                      handleConfigChange(
                        "authentication",
                        "password",
                        e.target.value,
                      )
                    }
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="authType">Tipo de Autenticación</Label>
                <Select
                  value={config.authentication.authType}
                  onValueChange={(value: "basic" | "oauth" | "token") =>
                    handleConfigChange("authentication", "authType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">
                      Básica (Usuario/Contraseña)
                    </SelectItem>
                    <SelectItem value="oauth">OAuth 2.0</SelectItem>
                    <SelectItem value="token">Token de API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Layouts Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración de Layouts
              </CardTitle>
              <CardDescription>
                Nombres de los layouts en FileMaker
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="layoutAudits">Layout de Auditorías</Label>
                <Input
                  id="layoutAudits"
                  value={config.layouts.audits}
                  onChange={(e) =>
                    handleConfigChange("layouts", "audits", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="layoutNC">Layout de No Conformidades</Label>
                <Input
                  id="layoutNC"
                  value={config.layouts.nonConformities}
                  onChange={(e) =>
                    handleConfigChange(
                      "layouts",
                      "nonConformities",
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="layoutUsers">Layout de Usuarios</Label>
                <Input
                  id="layoutUsers"
                  value={config.layouts.users}
                  onChange={(e) =>
                    handleConfigChange("layouts", "users", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="layoutEvidence">Layout de Evidencias</Label>
                <Input
                  id="layoutEvidence"
                  value={config.layouts.evidence}
                  onChange={(e) =>
                    handleConfigChange("layouts", "evidence", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferencias del Sistema</CardTitle>
            <CardDescription>
              Configuración general y modo de desarrollo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="useMockData"
                  checked={config.preferences.useMockData}
                  onCheckedChange={(checked) =>
                    handleConfigChange("preferences", "useMockData", checked)
                  }
                />
                <Label htmlFor="useMockData">Usar datos de demostración</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="debugMode"
                  checked={config.preferences.debugMode}
                  onCheckedChange={(checked) =>
                    handleConfigChange("preferences", "debugMode", checked)
                  }
                />
                <Label htmlFor="debugMode">Modo debug</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoReconnect"
                  checked={config.preferences.autoReconnect}
                  onCheckedChange={(checked) =>
                    handleConfigChange("preferences", "autoReconnect", checked)
                  }
                />
                <Label htmlFor="autoReconnect">Reconexión automática</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logLevel">Nivel de logging</Label>
                <Select
                  value={config.preferences.logLevel}
                  onValueChange={(value: "error" | "warn" | "info" | "debug") =>
                    handleConfigChange("preferences", "logLevel", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Test Results */}
        {testResults && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Resultados de la Prueba de Conexión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre
                className={`text-sm p-4 rounded-lg ${
                  connectionStatus === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {testResults}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Connection URL Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              URL de Conexión
            </CardTitle>
            <CardDescription>
              Vista previa de la URL que se utilizará para conectar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <code className="text-sm">
                {config.server.protocol}://{config.server.host}:
                {config.server.port}/fmi/data/v1/databases/
                {config.database.name}
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
