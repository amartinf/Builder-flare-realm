import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Shield, User, Building, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roleConfig = {
  admin: {
    icon: Shield,
    title: "Administrador",
    description: "Acceso completo al sistema",
    email: "admin@auditpro.com",
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
  },
  auditor: {
    icon: User,
    title: "Auditor",
    description: "Gestión de auditorías y no conformidades",
    email: "auditor@auditpro.com",
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
  },
  secretary: {
    icon: User,
    title: "Secretaría Técnica",
    description: "Gestión de equipos y planificación",
    email: "secretary@auditpro.com",
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
  },
  client: {
    icon: Building,
    title: "Cliente",
    description: "Consulta de auditorías y reportes",
    email: "client@empresa.com",
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
  },
};

export default function RoleSelector() {
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [customEmail, setCustomEmail] = useState("");
  const [password, setPassword] = useState("demo123");
  const [useCustomEmail, setUseCustomEmail] = useState(false);

  const handleLogin = async () => {
    try {
      const email = useCustomEmail
        ? customEmail
        : roleConfig[selectedRole].email;
      await login(email, password);

      toast({
        title: "Acceso concedido",
        description: `Bienvenido como ${roleConfig[selectedRole].title}`,
      });
    } catch (error) {
      toast({
        title: "Error de acceso",
        description:
          error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">AuditPro</CardTitle>
          <CardDescription>
            Selecciona tu rol para acceder al sistema de demostración
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <Label>Seleccionar Rol</Label>
            {Object.entries(roleConfig).map(([role, config]) => {
              const Icon = config.icon;
              const isSelected = selectedRole === role;

              return (
                <div
                  key={role}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? `${config.bgColor} border-current`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedRole(role as UserRole)}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 ${isSelected ? config.color : "text-gray-400"}`}
                    />
                    <div className="flex-1">
                      <div
                        className={`font-medium ${isSelected ? config.color : "text-gray-700"}`}
                      >
                        {config.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {config.description}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {config.email}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Email Option */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="useCustomEmail"
                checked={useCustomEmail}
                onChange={(e) => setUseCustomEmail(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="useCustomEmail" className="text-sm">
                Usar email personalizado
              </Label>
            </div>

            {useCustomEmail && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="tu-email@empresa.com"
                />
              </div>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
            />
            <p className="text-xs text-gray-500">
              Contraseña de demostración:{" "}
              <code className="bg-gray-100 px-1 rounded">demo123</code>
            </p>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={isLoading || (!useCustomEmail ? false : !customEmail)}
            className="w-full"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Acceder como {roleConfig[selectedRole].title}
          </Button>

          {/* Demo Info */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t">
            <p className="mb-2 font-medium">Funcionalidades por rol:</p>
            <div className="text-left space-y-1">
              <p>
                <span className="font-medium text-red-600">Admin:</span> Gestión
                completa, configuración, usuarios
              </p>
              <p>
                <span className="font-medium text-blue-600">Auditor:</span>{" "}
                Auditorías, no conformidades, evidencias
              </p>
              <p>
                <span className="font-medium text-purple-600">Secretaría:</span>{" "}
                Gestión de equipos y distribución de tiempo
              </p>
              <p>
                <span className="font-medium text-green-600">Cliente:</span>{" "}
                Consulta de auditorías y reportes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
