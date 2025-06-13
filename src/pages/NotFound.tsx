import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center audit-shadow">
          <CardContent className="p-8">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-warning-100 rounded-full mb-6">
              <AlertTriangle className="w-8 h-8 text-warning-600" />
            </div>

            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>

            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Página no encontrada
            </h2>

            <p className="text-muted-foreground mb-8">
              Lo sentimos, la página que estás buscando no existe o ha sido
              movida.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                asChild
                className="flex-1"
                onClick={() => window.history.back()}
              >
                <button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver atrás
                </button>
              </Button>

              <Link to="/dashboard" className="flex-1">
                <Button className="w-full audit-gradient text-white">
                  <Home className="w-4 h-4 mr-2" />
                  Ir al dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
