import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth, UserRole } from "@/context/AuthContext";
import {
  FileText,
  AlertTriangle,
  Upload,
  Users,
  Settings,
  BarChart3,
  Building,
  Menu,
  X,
  HelpCircle,
  Shield,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, currentRole, logout, switchRole } = useAuth();

  // Define navigation items based on user role
  const getNavigationItems = (role: UserRole | null) => {
    if (!role) return [];

    const baseItems = [
      { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
    ];

    const roleItems = {
      admin: [
        { href: "/admin-portal", icon: Shield, label: "Portal Admin" },
        { href: "/audits", icon: FileText, label: "Auditorías" },
        {
          href: "/non-conformities",
          icon: AlertTriangle,
          label: "No Conformidades",
        },
        {
          href: "/corrective-actions",
          icon: Upload,
          label: "Acciones Correctivas",
        },
        { href: "/users", icon: Users, label: "Usuarios" },
        { href: "/configuration", icon: Settings, label: "Configuración" },
        { href: "/reports", icon: BarChart3, label: "Reportes" },
        { href: "/client-portal", icon: Building, label: "Portal Cliente" },
        { href: "/auditor-portal", icon: User, label: "Portal Auditor" },
        { href: "/diagnostics", icon: HelpCircle, label: "Diagnósticos" },
      ],
      auditor: [
        { href: "/auditor-portal", icon: User, label: "Portal Auditor" },
        { href: "/audits", icon: FileText, label: "Auditorías" },
        {
          href: "/non-conformities",
          icon: AlertTriangle,
          label: "No Conformidades",
        },
        {
          href: "/corrective-actions",
          icon: Upload,
          label: "Acciones Correctivas",
        },
        { href: "/reports", icon: BarChart3, label: "Reportes" },
      ],
      secretary: [
        { href: "/secretary-portal", icon: Calendar, label: "Portal Secretaría" },
        { href: "/audits", icon: FileText, label: "Gestión de Auditorías" },
        { href: "/users", icon: Users, label: "Gestión de Equipos" },
        { href: "/reports", icon: BarChart3, label: "Reportes" },
      ],
      client: [
        { href: "/client-portal", icon: Building, label: "Portal Cliente" },
        { href: "/corrective-actions", icon: Upload, label: "Mis Acciones" },
      ],
    };

    return [...baseItems, ...(roleItems[role] || [])];
  };

  const navigationItems = getNavigationItems(currentRole);

  const getRoleConfig = (role: UserRole) => {
    const configs = {
      admin: { label: "Administrador", color: "bg-red-100 text-red-800" },
      auditor: { label: "Auditor", color: "bg-blue-100 text-blue-800" },
      secretary: { label: "Secretaría Técnica", color: "bg-purple-100 text-purple-800" },
      client: { label: "Cliente", color: "bg-green-100 text-green-800" },
    };
    return configs[role];
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-primary/10 rounded">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <span className="font-bold text-xl text-primary">AuditPro</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className="flex items-center space-x-2"
                asChild
              >
                <a href={item.href}>
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </a>
              </Button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {/* User Menu */}
            {user && currentRole && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleConfig(currentRole).color}>
                        {getRoleConfig(currentRole).label}
                      </Badge>
                      <span className="hidden sm:inline text-sm font-medium">
                        {user.name}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.organization}
                    </p>
                  </div>

                  <DropdownMenuSeparator />

                  {user.role === "admin" && (
                    <>
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-medium text-muted-foreground">
                          CAMBIAR VISTA
                        </p>
                      </div>
                      <DropdownMenuItem onClick={() => switchRole("admin")}>
                        <Shield className="w-4 h-4 mr-2" />
                        Vista Administrador
                        {currentRole === "admin" && (
                          <span className="ml-auto text-xs">✓</span>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => switchRole("auditor")}>
                        <User className="w-4 h-4 mr-2" />
                        Vista Auditor
                        {currentRole === "auditor" && (
                          <span className="ml-auto text-xs">✓</span>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => switchRole("secretary")}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Vista Secretaría
                        {currentRole === "secretary" && (
                          <span className="ml-auto text-xs">✓</span>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => switchRole("client")}>
                        <Building className="w-4 h-4 mr-2" />
                        Vista Cliente
                        {currentRole === "client" && (
                          <span className="ml-auto text-xs">✓</span>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            {user && currentRole && (
              <div className="pb-4 border-b">
                <div className="px-2 py-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <Badge className={`mt-2 ${getRoleConfig(currentRole).color}`}>
                    {getRoleConfig(currentRole).label}
                  </Badge>
                </div>
              </div>
            )}

            {navigationItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className="w-full justify-start flex items-center space-x-2"
                asChild
              >
                <a href={item.href}>
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </a>
              </Button>
            ))}

            {user && (
              <div className="pt-4 border-t space-y-2">
                {user.role === "admin" && (
                  <>
                    <p className="px-2 text-xs font-medium text-muted-foreground">
                      CAMBIAR VISTA
                    </p>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => switchRole("auditor")}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Vista Auditor
                      {currentRole === "auditor" && <span className="ml-auto text-xs">✓</span>}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => switchRole("secretary")}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Vista Secretaría
                      {currentRole === "secretary" && <span className="ml-auto text-xs">✓</span>}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => switchRole("client")}
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Vista Cliente
                      {currentRole === "client" && <span className="ml-auto text-xs">✓</span>}
                    </Button>
                      {currentRole === "auditor" && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => switchRole("client")}
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Vista Cliente
                      {currentRole === "client" && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </Button>
                  </>
                )}

                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}