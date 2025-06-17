import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type UserRole = "admin" | "auditor" | "client" | "secretary";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  organization?: string;
}

interface AuthContextType {
  user: User | null;
  currentRole: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: "1",
    name: "María González",
    email: "admin@auditpro.com",
    role: "admin",
    permissions: ["*"], // Admin has all permissions
    organization: "AuditPro Corp",
  },
  {
    id: "2",
    name: "Carlos Ruiz",
    email: "auditor@auditpro.com",
    role: "auditor",
    permissions: [
      "view_audits",
      "create_audits",
      "edit_audits",
      "create_nonconformities",
      "view_nonconformities",
      "upload_evidence",
      "view_evidence",
      "create_reports",
    ],
    organization: "Certificadora ISO",
  },
  {
    id: "3",
    name: "Ana López",
    email: "client@empresa.com",
    role: "client",
    permissions: [
      "view_own_audits",
      "view_own_nonconformities",
      "view_own_evidence",
      "download_reports",
      "submit_corrective_actions",
    ],
    organization: "Empresa Cliente SA",
  },
  {
    id: "4",
    name: "Carmen Torres",
    email: "secretary@auditpro.com",
    role: "secretary",
    permissions: [
      "view_audits",
      "edit_audits",
      "manage_audit_time",
      "assign_team_members",
      "view_nonconformities",
      "schedule_audits",
      "manage_audit_workflow",
    ],
    organization: "AuditPro Corp",
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on app start
    const storedUser = localStorage.getItem("auditpro-user");
    const storedRole = localStorage.getItem(
      "auditpro-current-role",
    ) as UserRole;

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setCurrentRole(storedRole || parsedUser.role);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("auditpro-user");
        localStorage.removeItem("auditpro-current-role");
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find user by email (in real app, this would be an API call)
    const foundUser = mockUsers.find((u) => u.email === email);

    if (!foundUser) {
      throw new Error("Usuario no encontrado");
    }

    // In a real app, you'd verify the password here
    if (password !== "demo123") {
      throw new Error("Contraseña incorrecta");
    }

    setUser(foundUser);
    setCurrentRole(foundUser.role);

    // Store in localStorage
    localStorage.setItem("auditpro-user", JSON.stringify(foundUser));
    localStorage.setItem("auditpro-current-role", foundUser.role);

    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    setCurrentRole(null);
    localStorage.removeItem("auditpro-user");
    localStorage.removeItem("auditpro-current-role");
  };

  const switchRole = (role: UserRole) => {
    if (user && (user.role === "admin" || user.role === role)) {
      setCurrentRole(role);
      localStorage.setItem("auditpro-current-role", role);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Admin has all permissions
    if (user.permissions.includes("*")) return true;

    return user.permissions.includes(permission);
  };

  const value: AuthContextType = {
    user,
    currentRole,
    isLoading,
    login,
    logout,
    switchRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
