import { ReactNode } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: string;
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback,
}: ProtectedRouteProps) {
  const { user, currentRole, hasPermission } = useAuth();

  // If user is not logged in
  if (!user || !currentRole) {
    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-red-800">
                Acceso Requerido
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Necesitas iniciar sesión para acceder a esta página.
              </p>
              <Button
                onClick={() => (window.location.href = "/")}
                className="w-full"
              >
                Ir al Login
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Check role permissions
  if (requiredRole && currentRole !== requiredRole && user.role !== "admin") {
    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-red-800">
                Acceso Denegado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-2">
                No tienes permisos para acceder a esta página.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Se requiere el rol: <strong>{requiredRole}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Tu rol actual: <strong>{currentRole}</strong>
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => (window.location.href = "/dashboard")}
                  className="w-full"
                >
                  Ir al Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="w-full"
                >
                  Volver
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // Check specific permissions
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl text-red-800">
                Permisos Insuficientes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-2">
                No tienes el permiso necesario para realizar esta acción.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Permiso requerido: <strong>{requiredPermission}</strong>
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => (window.location.href = "/dashboard")}
                  className="w-full"
                >
                  Ir al Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="w-full"
                >
                  Volver
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    );
  }

  // User has access, render the protected content
  return <>{children}</>;
}
