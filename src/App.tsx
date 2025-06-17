import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import RoleSelector from "./components/RoleSelector";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Audits from "./pages/Audits";
import AuditDetail from "./pages/AuditDetail";
import NonConformities from "./pages/NonConformities";
import CorrectiveActions from "./pages/CorrectiveActions";
import ClientPortal from "./pages/ClientPortal";
import AuditorPortal from "./pages/AuditorPortal";
import AdminPortal from "./pages/AdminPortal";
import SecretaryPortal from "./pages/SecretaryPortal";
import Configuration from "./pages/Configuration";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Diagnostics from "./pages/Diagnostics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando AuditPro...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <RoleSelector />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Admin Portal */}
      <Route
        path="/admin-portal"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPortal />
          </ProtectedRoute>
        }
      />

      {/* Auditor Portal */}
      <Route
        path="/auditor-portal"
        element={
          <ProtectedRoute requiredPermission="view_audits">
            <AuditorPortal />
          </ProtectedRoute>
        }
      />

      {/* Secretary Portal */}
      <Route
        path="/secretary-portal"
        element={
          <ProtectedRoute requiredPermission="manage_audit_time">
            <SecretaryPortal />
          </ProtectedRoute>
        }
      />

      {/* Client Portal */}
      <Route
        path="/client-portal"
        element={
          <ProtectedRoute requiredPermission="view_own_audits">
            <ClientPortal />
          </ProtectedRoute>
        }
      />

      {/* Audits */}
      <Route
        path="/audits"
        element={
          <ProtectedRoute requiredPermission="view_audits">
            <Audits />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audits/:id"
        element={
          <ProtectedRoute requiredPermission="view_audits">
            <AuditDetail />
          </ProtectedRoute>
        }
      />

      {/* Non-Conformities */}
      <Route
        path="/non-conformities"
        element={
          <ProtectedRoute requiredPermission="view_nonconformities">
            <NonConformities />
          </ProtectedRoute>
        }
      />

      {/* Corrective Actions - Available to all authenticated users */}
      <Route path="/corrective-actions" element={<CorrectiveActions />} />

      {/* Admin Only Routes */}
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredRole="admin">
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/configuration"
        element={
          <ProtectedRoute requiredRole="admin">
            <Configuration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diagnostics"
        element={
          <ProtectedRoute requiredRole="admin">
            <Diagnostics />
          </ProtectedRoute>
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute requiredPermission="create_reports">
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
