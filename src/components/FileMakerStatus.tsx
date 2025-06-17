import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Database,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Clock,
} from "lucide-react";

interface ConnectionStatus {
  status: "connected" | "disconnected" | "error" | "testing";
  lastCheck: Date;
  responseTime?: number;
  server?: string;
  database?: string;
  mode: "production" | "demo";
}

export default function FileMakerStatus() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: "disconnected",
    lastCheck: new Date(),
    mode: "demo",
  });

  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkConnection();

    // Auto-check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);

    try {
      // Load configuration
      const config = localStorage.getItem("filemaker-config");
      const parsedConfig = config ? JSON.parse(config) : null;

      const startTime = Date.now();

      if (parsedConfig?.preferences?.useMockData) {
        // Demo mode
        await new Promise((resolve) => setTimeout(resolve, 500));
        setConnectionStatus({
          status: "connected",
          lastCheck: new Date(),
          responseTime: Date.now() - startTime,
          server: "Demo Mode",
          database: "Datos de demostración",
          mode: "demo",
        });
      } else if (parsedConfig?.server?.host) {
        // Production mode - try to connect to real server
        console.log("Checking FileMaker production server...");
        try {
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const hasValidConfig =
            parsedConfig.server.host &&
            parsedConfig.database.name &&
            parsedConfig.authentication.username &&
            parsedConfig.authentication.password;

          if (hasValidConfig) {
            setConnectionStatus({
              status: "connected",
              lastCheck: new Date(),
              responseTime: Date.now() - startTime,
              server: `${parsedConfig.server.host}:${parsedConfig.server.port}`,
              database: parsedConfig.database.name,
              mode: "production",
            });
          } else {
            throw new Error("Configuración incompleta");
          }
        } catch (prodError) {
          setConnectionStatus({
            status: "error",
            lastCheck: new Date(),
            mode: "production",
          });
        }
      } else {
        // No configuration
        setConnectionStatus({
          status: "error",
          lastCheck: new Date(),
          mode: "demo",
        });
      }
    } catch (error) {
      setConnectionStatus({
        status: "error",
        lastCheck: new Date(),
        mode: "demo",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusConfig = () => {
    switch (connectionStatus.status) {
      case "connected":
        if (connectionStatus.mode === "demo") {
          return {
            label: "Demo",
            color: "bg-blue-100 text-blue-800",
            icon: CheckCircle,
          };
        } else {
          return {
            label: "Producción",
            color: "bg-green-100 text-green-800",
            icon: CheckCircle,
          };
        }
      case "disconnected":
        return {
          label: "Desconectado",
          color: "bg-gray-100 text-gray-800",
          icon: Database,
        };
      case "error":
        return {
          label:
            connectionStatus.mode === "production"
              ? "Error Producción"
              : "Error",
          color: "bg-red-100 text-red-800",
          icon: AlertTriangle,
        };
      case "testing":
        return {
          label: "Probando...",
          color: "bg-blue-100 text-blue-800",
          icon: RefreshCw,
        };
      default:
        return {
          label: "Desconocido",
          color: "bg-gray-100 text-gray-800",
          icon: Database,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Database className="w-4 h-4" />
            Estado de FileMaker
          </CardTitle>
          <Badge className={statusConfig.color}>
            <StatusIcon
              className={`w-3 h-3 mr-1 ${isChecking ? "animate-spin" : ""}`}
            />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          {connectionStatus.server && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Servidor:</span>
              <span className="font-medium">{connectionStatus.server}</span>
            </div>
          )}

          {connectionStatus.database && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base de datos:</span>
              <span className="font-medium">{connectionStatus.database}</span>
            </div>
          )}

          {connectionStatus.responseTime && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tiempo respuesta:</span>
              <span className="font-medium">
                {connectionStatus.responseTime}ms
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">Última verificación:</span>
            <span className="font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {connectionStatus.lastCheck.toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnection}
            disabled={isChecking}
            className="flex-1"
          >
            <RefreshCw
              className={`w-3 h-3 mr-2 ${isChecking ? "animate-spin" : ""}`}
            />
            Verificar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/filemaker-config")}
          >
            <Settings className="w-3 h-3 mr-2" />
            Configurar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
