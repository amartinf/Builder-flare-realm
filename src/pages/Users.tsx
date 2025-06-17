import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Users as UsersIcon,
  Plus,
  Edit,
  Trash2,
  Save,
  Search,
  Filter,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Building,
  Shield,
  MoreHorizontal,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { USER_ROLES, type UserRole } from "@/config/correctiveActions";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  notes?: string;
}

interface EditDialogState {
  isOpen: boolean;
  user: User | null;
  isNew: boolean;
}

const USERS_STORAGE_KEY = "auditpro-users";

// Datos de ejemplo para demostración
const SAMPLE_USERS: User[] = [
  {
    id: "1",
    email: "maria.garcia@empresa.com",
    firstName: "María",
    lastName: "García",
    role: "auditor_senior",
    department: "Calidad",
    phone: "+34 600 123 456",
    isActive: true,
    lastLogin: "2024-01-15T10:30:00Z",
    createdAt: "2023-06-01T08:00:00Z",
    notes: "Auditora líder con 5 años de experiencia",
  },
  {
    id: "2",
    email: "carlos.rodriguez@empresa.com",
    firstName: "Carlos",
    lastName: "Rodríguez",
    role: "auditor",
    department: "Seguridad",
    phone: "+34 600 234 567",
    isActive: true,
    lastLogin: "2024-01-14T16:45:00Z",
    createdAt: "2023-08-15T09:00:00Z",
  },
  {
    id: "3",
    email: "ana.lopez@cliente.com",
    firstName: "Ana",
    lastName: "López",
    role: "cliente_auditado",
    department: "Producción",
    phone: "+34 600 345 678",
    isActive: true,
    lastLogin: "2024-01-13T14:20:00Z",
    createdAt: "2023-09-01T10:00:00Z",
  },
  {
    id: "4",
    email: "roberto.martin@empresa.com",
    firstName: "Roberto",
    lastName: "Martín",
    role: "responsable_area",
    department: "Mantenimiento",
    isActive: false,
    createdAt: "2023-05-15T11:00:00Z",
    notes: "Usuario inactivo - cambio de departamento",
  },
];

export default function Users() {
  const { toast } = useToast();

  // Load users from localStorage on mount
  const loadUsers = (): User[] => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
    return SAMPLE_USERS;
  };

  const [users, setUsers] = useState<User[]>(loadUsers());
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [editDialog, setEditDialog] = useState<EditDialogState>({
    isOpen: false,
    user: null,
    isNew: false,
  });

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "",
    department: "",
    phone: "",
    isActive: true,
    notes: "",
  });

  // Save users to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.department.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) =>
        statusFilter === "active" ? user.isActive : !user.isActive,
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      role: "",
      department: "",
      phone: "",
      isActive: true,
      notes: "",
    });
  };

  const openEditDialog = (user?: User, isNew = false) => {
    if (isNew) {
      resetForm();
    } else if (user) {
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        phone: user.phone || "",
        isActive: user.isActive,
        notes: user.notes || "",
      });
    }

    setEditDialog({
      isOpen: true,
      user: user || null,
      isNew,
    });
  };

  const closeEditDialog = () => {
    setEditDialog({
      isOpen: false,
      user: null,
      isNew: false,
    });
    resetForm();
  };

  const handleSave = () => {
    if (
      !formData.email ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.role
    ) {
      toast({
        title: "Error",
        description: "Todos los campos obligatorios deben estar completos",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate email (except when editing the same user)
    const emailExists = users.some(
      (user) =>
        user.email === formData.email &&
        (!editDialog.user || user.id !== editDialog.user.id),
    );

    if (emailExists) {
      toast({
        title: "Error",
        description: "Ya existe un usuario con ese email",
        variant: "destructive",
      });
      return;
    }

    if (editDialog.isNew) {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
      toast({
        title: "Usuario creado",
        description: `${formData.firstName} ${formData.lastName} ha sido creado exitosamente`,
      });
    } else if (editDialog.user) {
      // Update existing user
      setUsers(
        users.map((user) =>
          user.id === editDialog.user!.id ? { ...user, ...formData } : user,
        ),
      );
      toast({
        title: "Usuario actualizado",
        description: `${formData.firstName} ${formData.lastName} ha sido actualizado exitosamente`,
      });
    }

    closeEditDialog();
  };

  const handleDelete = (user: User) => {
    setUsers(users.filter((u) => u.id !== user.id));
    toast({
      title: "Usuario eliminado",
      description: `${user.firstName} ${user.lastName} ha sido eliminado exitosamente`,
      variant: "destructive",
    });
  };

  const toggleUserStatus = (user: User) => {
    setUsers(
      users.map((u) =>
        u.id === user.id ? { ...u, isActive: !u.isActive } : u,
      ),
    );
    toast({
      title: user.isActive ? "Usuario desactivado" : "Usuario activado",
      description: `${user.firstName} ${user.lastName} ha sido ${user.isActive ? "desactivado" : "activado"}`,
    });
  };

  const getRoleLabel = (roleValue: string): string => {
    const role = USER_ROLES.find((r) => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const departments = [...new Set(users.map((user) => user.department))];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UsersIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Gestión de Usuarios
              </h1>
              <p className="text-muted-foreground mt-1">
                Administra los usuarios del sistema y sus roles
              </p>
            </div>
          </div>

          <Button onClick={() => openEditDialog(undefined, true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Nombre, email, departamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role-filter">Rol</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status-filter">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <Filter className="w-4 h-4 mr-2" />
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Usuarios ({filteredUsers.length})</CardTitle>
                <CardDescription>
                  Gestiona los usuarios registrados en el sistema
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último acceso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-primary font-medium text-sm">
                                {user.firstName[0]}
                                {user.lastName[0]}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span>{user.department}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-sm">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="truncate max-w-[150px]">
                              {user.email}
                            </span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-1 text-sm">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-500"}`}
                          />
                          <span
                            className={
                              user.isActive ? "text-green-700" : "text-red-700"
                            }
                          >
                            {user.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <span className="text-sm">
                            {formatDate(user.lastLogin)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Nunca
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserStatus(user)}
                            title={
                              user.isActive
                                ? "Desactivar usuario"
                                : "Activar usuario"
                            }
                          >
                            {user.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user, false)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Estás seguro?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará
                                  permanentemente a {user.firstName}{" "}
                                  {user.lastName} del sistema.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(user)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron usuarios que coincidan con los filtros
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editDialog.isOpen} onOpenChange={closeEditDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editDialog.isNew ? "Crear" : "Editar"} Usuario
              </DialogTitle>
              <DialogDescription>
                {editDialog.isNew ? "Crea un nuevo" : "Modifica el"} usuario del
                sistema
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    placeholder="Nombre"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    placeholder="Apellidos"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="usuario@empresa.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Rol *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4" />
                            <div>
                              <div>{role.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {role.permissions.length} permisos
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    placeholder="Departamento"
                    list="departments"
                  />
                  <datalist id="departments">
                    {departments.map((dept) => (
                      <option key={dept} value={dept} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+34 600 123 456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Notas adicionales sobre el usuario..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Usuario activo</Label>
              </div>

              {formData.role && (
                <div className="space-y-2">
                  <Label>Vista previa del rol</Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {getRoleLabel(formData.role)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {
                        USER_ROLES.find((r) => r.value === formData.role)
                          ?.description
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeEditDialog}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  !formData.email ||
                  !formData.firstName ||
                  !formData.lastName ||
                  !formData.role
                }
              >
                <Save className="w-4 h-4 mr-2" />
                {editDialog.isNew ? "Crear" : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
