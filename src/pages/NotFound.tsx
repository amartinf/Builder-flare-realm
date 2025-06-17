import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";

export default function NotFound() {
  const { user, currentRole } = useAuth();

  const handleGoHome = () => {
    if (currentRole === "admin") {
      window.location.href = "/admin-portal";
    } else if (currentRole === "auditor") {
      window.location.href = "/auditor-portal";
    } else if (currentRole === "client") {
      window.location.href = "/client-portal";
    } else {
      window.location.href = "/dashboard";
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl text-red-800">
              Página No Encontrada
            </CardTitle>
            <CardDescription>
              La página que buscas no existe o has sido redirigido aquí por
              error.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Código de error: <strong>404</strong>
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl text-red-800">
              Página No Encontrada
            </CardTitle>
            <CardDescription>
              La página que buscas no existe o no tienes permisos para acceder a
              ella.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Código de error: <strong>404</strong>
            </p>
            <p className="text-sm text-gray-500">
              Usuario: <strong>{user.name}</strong> ({currentRole})
            </p>
            <div className="space-y-2">
              <Button onClick={handleGoHome} className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Ir a Mi Portal
              </Button>
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
