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
  Calendar,
  Home,
  Database,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, currentRole, logout, switchRole } = useAuth();

  // Define core navigation items (always visible)
  const getCoreNavigationItems = (role: UserRole | null) => {
    if (!role) return [];

    const baseItems = [
      { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
    ];

    const roleItems = {
      admin: [
        { href: "/audits", icon: FileText, label: "Auditorías" },
        {
          href: "/non-conformities",
          icon: AlertTriangle,
          label: "No Conformidades",
        },
        { href: "/users", icon: Users, label: "Usuarios" },
        { href: "/configuration", icon: Settings, label: "Configuración" },
        { href: "/filemaker-config", icon: Database, label: "FileMaker" },
        { href: "/reports", icon: BarChart3, label: "Reportes" },
      ],
      auditor: [
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
        { href: "/audits", icon: FileText, label: "Gestión de Auditorías" },
        { href: "/users", icon: Users, label: "Gestión de Equipos" },
        { href: "/reports", icon: BarChart3, label: "Reportes" },
      ],
      client: [
        { href: "/corrective-actions", icon: Upload, label: "Mis Acciones" },
      ],
    };

    return [...baseItems, ...(roleItems[role] || [])];
  };

  // Define portal items for dropdown
  const getPortalItems = (role: UserRole | null) => {
    if (!role) return [];

    const allPortals = [
      {
        href: "/admin-portal",
        icon: Shield,
        label: "Portal Admin",
        roles: ["admin"],
      },
      {
        href: "/auditor-portal",
        icon: User,
        label: "Portal Auditor",
        roles: ["admin", "auditor"],
      },
      {
        href: "/secretary-portal",
        icon: Calendar,
        label: "Portal Secretaría",
        roles: ["admin", "secretary"],
      },
      {
        href: "/client-portal",
        icon: Building,
        label: "Portal Cliente",
        roles: ["admin", "client"],
      },
    ];

    // Filter portals based on user role or admin access
    return allPortals.filter(
      (portal) => role === "admin" || portal.roles.includes(role),
    );
  };

  const coreNavigationItems = getCoreNavigationItems(currentRole);
  const portalItems = getPortalItems(currentRole);

  const getRoleConfig = (role: UserRole) => {
    const configs = {
      admin: { label: "Administrador", color: "bg-red-100 text-red-800" },
      auditor: { label: "Auditor", color: "bg-blue-100 text-blue-800" },
      secretary: {
        label: "Secretaría Técnica",
        color: "bg-purple-100 text-purple-800",
      },
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
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Portals Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>Portales</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {portalItems.map((portal) => (
                  <DropdownMenuItem key={portal.href} asChild>
                    <a
                      href={portal.href}
                      className="flex items-center space-x-2 w-full"
                    >
                      <portal.icon className="w-4 h-4" />
                      <span>{portal.label}</span>
                    </a>
                  </DropdownMenuItem>
                ))}
                {user?.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a
                        href="/diagnostics"
                        className="flex items-center space-x-2 w-full"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>Diagnósticos</span>
                      </a>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Core Navigation Items */}
            {coreNavigationItems.map((item) => (
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
              className="lg:hidden"
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
          <div className="lg:hidden mt-4 space-y-2 pb-4">
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

            {/* Mobile Portals Section */}
            <div className="pb-2 border-b">
              <p className="px-2 text-xs font-medium text-muted-foreground mb-2">
                PORTALES
              </p>
              {portalItems.map((portal) => (
                <Button
                  key={portal.href}
                  variant="ghost"
                  className="w-full justify-start flex items-center space-x-2"
                  asChild
                >
                  <a href={portal.href}>
                    <portal.icon className="w-4 h-4" />
                    <span>{portal.label}</span>
                  </a>
                </Button>
              ))}
              {user?.role === "admin" && (
                <Button
                  variant="ghost"
                  className="w-full justify-start flex items-center space-x-2"
                  asChild
                >
                  <a href="/diagnostics">
                    <HelpCircle className="w-4 h-4" />
                    <span>Diagnósticos</span>
                  </a>
                </Button>
              )}
            </div>

            {/* Mobile Core Navigation */}
            <div className="pb-2">
              <p className="px-2 text-xs font-medium text-muted-foreground mb-2">
                NAVEGACIÓN
              </p>
              {coreNavigationItems.map((item) => (
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
            </div>

            {/* Mobile User Actions */}
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
                      onClick={() => switchRole("admin")}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Vista Administrador
                      {currentRole === "admin" && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => switchRole("auditor")}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Vista Auditor
                      {currentRole === "auditor" && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => switchRole("secretary")}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Vista Secretaría
                      {currentRole === "secretary" && (
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
