import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Database, TestTube, X } from "lucide-react";

export default function DataModeIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    const checkDataMode = () => {
      try {
        const config = localStorage.getItem("filemaker-config");
        if (config) {
          const parsedConfig = JSON.parse(config);
          const useMockData = parsedConfig.preferences?.useMockData ?? true;
          setIsDemo(useMockData);

          // Show indicator for 10 seconds when mode changes
          setIsVisible(true);
          setTimeout(() => setIsVisible(false), 10000);
        }
      } catch (error) {
        console.error("Error checking data mode:", error);
      }
    };

    // Check on mount
    checkDataMode();

    // Listen for storage changes (when config is updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "filemaker-config") {
        checkDataMode();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for direct localStorage changes
    const interval = setInterval(checkDataMode, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm">
      <div
        className={`p-4 rounded-lg shadow-lg border-l-4 ${
          isDemo
            ? "bg-blue-50 border-blue-500"
            : "bg-orange-50 border-orange-500"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-1 rounded ${isDemo ? "bg-blue-100" : "bg-orange-100"}`}
          >
            {isDemo ? (
              <TestTube
                className={`w-4 h-4 ${isDemo ? "text-blue-600" : "text-orange-600"}`}
              />
            ) : (
              <Database
                className={`w-4 h-4 ${isDemo ? "text-blue-600" : "text-orange-600"}`}
              />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                className={
                  isDemo
                    ? "bg-blue-100 text-blue-800"
                    : "bg-orange-100 text-orange-800"
                }
              >
                {isDemo ? "Modo Demo" : "Modo Producción"}
              </Badge>
            </div>

            <p
              className={`text-sm font-medium ${isDemo ? "text-blue-800" : "text-orange-800"}`}
            >
              {isDemo
                ? "Utilizando datos de demostración"
                : "Conectado a servidor FileMaker"}
            </p>

            <p
              className={`text-xs mt-1 ${isDemo ? "text-blue-600" : "text-orange-600"}`}
            >
              {isDemo
                ? "Los cambios no afectarán datos reales"
                : "⚠️ Los cambios afectarán datos de producción"}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="p-1 h-auto"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
