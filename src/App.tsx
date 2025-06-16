import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Audits from "./pages/Audits";
import AuditDetail from "./pages/AuditDetail";
import NonConformities from "./pages/NonConformities";
import CorrectiveActions from "./pages/CorrectiveActions";
import ClientPortal from "./pages/ClientPortal";
import Configuration from "./pages/Configuration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Mock authentication state - in a real app this would come from context/state management
const isAuthenticated = () => {
  // Simple check - in production this would check for valid tokens, etc.
  return localStorage.getItem("isAuthenticated") === "true" || true; // Set to true for demo
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audits"
            element={
              <ProtectedRoute>
                <Audits />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audits/:id"
            element={
              <ProtectedRoute>
                <AuditDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/non-conformities"
            element={
              <ProtectedRoute>
                <NonConformities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/corrective-actions"
            element={
              <ProtectedRoute>
                <CorrectiveActions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-portal"
            element={
              <ProtectedRoute>
                <ClientPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuration"
            element={
              <ProtectedRoute>
                <Configuration />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
