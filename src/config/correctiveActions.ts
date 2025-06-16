// Configuración para el workflow de acciones correctivas

export interface CorrectiveActionStatus {
  value: string;
  label: string;
  color: string;
  badge:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "pending"
    | "approved";
  description: string;
  allowedTransitions: string[];
  userTypes: ("auditor" | "client")[];
}

export interface UserRole {
  value: string;
  label: string;
  permissions: string[];
  description: string;
}

// Estados del workflow de acciones correctivas
export const CORRECTIVE_ACTION_STATUSES: CorrectiveActionStatus[] = [
  {
    value: "pendiente",
    label: "Pendiente de respuesta",
    color: "#f59e0b",
    badge: "pending",
    description: "Esperando que el cliente auditado envíe la acción correctiva",
    allowedTransitions: ["enviada"],
    userTypes: ["client"],
  },
  {
    value: "enviada",
    label: "Enviada para revisión",
    color: "#0ea5e9",
    badge: "outline",
    description: "Acción correctiva enviada, esperando revisión del auditor",
    allowedTransitions: ["en_revision", "pendiente"],
    userTypes: ["auditor"],
  },
  {
    value: "en_revision",
    label: "En revisión",
    color: "#8b5cf6",
    badge: "outline",
    description: "Auditor revisando la acción correctiva",
    allowedTransitions: ["aprobada", "rechazada", "requiere_modificacion"],
    userTypes: ["auditor"],
  },
  {
    value: "requiere_modificacion",
    label: "Requiere modificación",
    color: "#f97316",
    badge: "destructive",
    description: "Se requieren cambios en la acción correctiva",
    allowedTransitions: ["enviada"],
    userTypes: ["client"],
  },
  {
    value: "aprobada",
    label: "Aprobada",
    color: "#22c55e",
    badge: "approved",
    description: "Acción correctiva aprobada por el auditor",
    allowedTransitions: ["verificacion_implementacion"],
    userTypes: ["auditor"],
  },
  {
    value: "rechazada",
    label: "Rechazada",
    color: "#ef4444",
    badge: "destructive",
    description: "Acción correctiva rechazada, requiere nueva propuesta",
    allowedTransitions: ["enviada"],
    userTypes: ["client"],
  },
  {
    value: "verificacion_implementacion",
    label: "Verificando implementación",
    color: "#06b6d4",
    badge: "outline",
    description:
      "Verificando que la acción correctiva se implementó correctamente",
    allowedTransitions: ["implementada", "no_implementada"],
    userTypes: ["auditor"],
  },
  {
    value: "implementada",
    label: "Implementada",
    color: "#16a34a",
    badge: "approved",
    description: "Acción correctiva implementada satisfactoriamente",
    allowedTransitions: [],
    userTypes: [],
  },
  {
    value: "no_implementada",
    label: "No implementada",
    color: "#dc2626",
    badge: "destructive",
    description: "La implementación no fue satisfactoria",
    allowedTransitions: ["enviada"],
    userTypes: ["client"],
  },
];

// Roles de usuario en el sistema
export const USER_ROLES: UserRole[] = [
  {
    value: "auditor",
    label: "Auditor",
    permissions: [
      "create_audit",
      "create_nonconformity",
      "review_corrective_actions",
      "approve_corrective_actions",
      "reject_corrective_actions",
      "verify_implementation",
      "view_all_audits",
      "manage_configuration",
    ],
    description:
      "Auditor que puede crear auditorías y revisar acciones correctivas",
  },
  {
    value: "auditor_senior",
    label: "Auditor Senior",
    permissions: [
      "create_audit",
      "create_nonconformity",
      "review_corrective_actions",
      "approve_corrective_actions",
      "reject_corrective_actions",
      "verify_implementation",
      "view_all_audits",
      "manage_configuration",
      "manage_users",
      "final_approval",
    ],
    description: "Auditor senior con permisos de gestión y aprobación final",
  },
  {
    value: "cliente_auditado",
    label: "Cliente Auditado",
    permissions: [
      "view_assigned_nonconformities",
      "submit_corrective_actions",
      "modify_corrective_actions",
      "view_corrective_action_status",
      "upload_evidence",
    ],
    description:
      "Cliente que puede responder a no conformidades con acciones correctivas",
  },
  {
    value: "responsable_area",
    label: "Responsable de Área",
    permissions: [
      "view_area_nonconformities",
      "submit_corrective_actions",
      "modify_corrective_actions",
      "view_corrective_action_status",
      "upload_evidence",
      "assign_team_members",
    ],
    description:
      "Responsable de área que gestiona acciones correctivas de su departamento",
  },
];

// Tipos de evidencia para acciones correctivas
export const CORRECTIVE_ACTION_EVIDENCE_TYPES = [
  {
    value: "plan_accion",
    label: "Plan de Acción",
    description: "Documento que describe las acciones a implementar",
  },
  {
    value: "procedimiento",
    label: "Procedimiento Actualizado",
    description: "Procedimientos nuevos o actualizados",
  },
  {
    value: "capacitacion",
    label: "Evidencia de Capacitación",
    description: "Registros de capacitación realizada",
  },
  {
    value: "verificacion",
    label: "Evidencia de Verificación",
    description: "Documentos que demuestran la implementación",
  },
  {
    value: "foto_antes_despues",
    label: "Fotos Antes/Después",
    description: "Evidencia visual de los cambios implementados",
  },
  {
    value: "documento_soporte",
    label: "Documento de Soporte",
    description: "Cualquier documento que respalde la acción correctiva",
  },
];

// Plantillas de acciones correctivas por categoría de no conformidad
export const CORRECTIVE_ACTION_TEMPLATES = {
  Documentación: [
    "Actualizar el procedimiento [nombre] para incluir [requisito faltante]",
    "Crear nueva instrucción de trabajo para [proceso específico]",
    "Establecer control de versiones para documentos críticos",
    "Implementar sistema de revisión periódica de documentos",
  ],
  Seguridad: [
    "Reforzar programa de capacitación en seguridad para [área específica]",
    "Instalar señalización de seguridad adicional",
    "Establecer inspecciones diarias de EPP",
    "Implementar sistema de reporte de incidentes",
  ],
  Calidad: [
    "Implementar controles adicionales en [proceso específico]",
    "Calibrar equipos de medición según cronograma",
    "Establecer registro de control de calidad diario",
    "Capacitar personal en técnicas de control de calidad",
  ],
  Ambiental: [
    "Implementar programa de monitoreo ambiental",
    "Establecer procedimiento de manejo de residuos",
    "Capacitar personal en gestión ambiental",
    "Instalar sistemas de control de emisiones",
  ],
};

// Funciones utilitarias
export const getCorrectiveActionStatus = (value: string) =>
  CORRECTIVE_ACTION_STATUSES.find((s) => s.value === value);

export const getCorrectiveActionStatusBadge = (status: string) => {
  const statusConfig = getCorrectiveActionStatus(status);
  if (!statusConfig) {
    return "secondary";
  }
  return statusConfig.badge;
};

export const canUserTransitionStatus = (
  currentStatus: string,
  newStatus: string,
  userRole: string,
): boolean => {
  const statusConfig = getCorrectiveActionStatus(currentStatus);
  if (!statusConfig) return false;

  const hasTransition = statusConfig.allowedTransitions.includes(newStatus);
  const hasPermission = statusConfig.userTypes.includes(userRole as any);

  return hasTransition && hasPermission;
};

export const getAvailableTransitions = (
  currentStatus: string,
  userRole: string,
) => {
  const statusConfig = getCorrectiveActionStatus(currentStatus);
  if (!statusConfig) return [];

  if (!statusConfig.userTypes.includes(userRole as any)) return [];

  return statusConfig.allowedTransitions
    .map((transition) => getCorrectiveActionStatus(transition))
    .filter((status) => status !== undefined);
};

export const getUserRole = (value: string) =>
  USER_ROLES.find((role) => role.value === value);

export const hasPermission = (
  userRole: string,
  permission: string,
): boolean => {
  const role = getUserRole(userRole);
  return role ? role.permissions.includes(permission) : false;
};

export default {
  CORRECTIVE_ACTION_STATUSES,
  USER_ROLES,
  CORRECTIVE_ACTION_EVIDENCE_TYPES,
  CORRECTIVE_ACTION_TEMPLATES,
  getCorrectiveActionStatus,
  getCorrectiveActionStatusBadge,
  canUserTransitionStatus,
  getAvailableTransitions,
  getUserRole,
  hasPermission,
};
