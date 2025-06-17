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
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  AlertTriangle,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Settings,
  User,
  Shield,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Auditorías", href: "/audits", icon: FileText },
  { name: "No Conformidades", href: "/non-conformities", icon: AlertTriangle },
  { name: "Acciones Correctivas", href: "/corrective-actions", icon: FileText },
  { name: "Portal Cliente", href: "/client-portal", icon: User },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock user data - in a real app this would come from authentication context
  const user = {
    name: "María González",
    email: "maria.gonzalez@auditor.com",
    role: "Auditor Senior",
    avatar: "/placeholder.svg",
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    // In a real app, this would clear authentication tokens and redirect
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
        <div className="flex items-center justify-between">
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
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={getRoleConfig(currentRole).color}>
                        {getRoleConfig(currentRole).label}
                      </Badge>
                      <span className="hidden sm:inline text-sm font-medium">
                        {user.name}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.organization}</p>
                    </div>

                    <DropdownMenuSeparator />

                    {user.role === "admin" && (
                      <>
                        <div className="px-2 py-1.5">
                          <p className="text-xs font-medium text-muted-foreground">CAMBIAR VISTA</p>
                        </div>
                        <DropdownMenuItem onClick={() => switchRole("admin")}>
                          <Shield className="w-4 h-4 mr-2" />
                          Vista Administrador
                          {currentRole === "admin" && <span className="ml-auto text-xs">✓</span>}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => switchRole("auditor")}>
                          <User className="w-4 h-4 mr-2" />
                          Vista Auditor
                          {currentRole === "auditor" && <span className="ml-auto text-xs">✓</span>}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => switchRole("client")}>
                          <Building className="w-4 h-4 mr-2" />
                          Vista Cliente
                          {currentRole === "client" && <span className="ml-auto text-xs">✓</span>}
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
              </div>
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
            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <Badge variant="secondary" className="w-fit text-xs">
                      {user.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/users">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Gestión de Usuarios</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/configuration">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración del Sistema</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/diagnostics">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>🧪 Diagnósticos</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => {
                console.log("Mobile menu button clicked, current state:", isMobileMenuOpen);
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {item.name === "No Conformidades" && (
                      <Badge variant="destructive" className="text-xs">
                        3
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}