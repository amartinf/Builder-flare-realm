// Configuración centralizada para las opciones de auditorías
// Edita este archivo para cambiar los tipos, estados y categorías disponibles

export interface AuditType {
  value: string;
  label: string;
  color?: string;
  description?: string;
}

export interface AuditStatus {
  value: string;
  label: string;
  color?: string;
  badge:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "pending"
    | "approved"
    | "draft";
  description?: string;
}

export interface AuditCategory {
  value: string;
  label: string;
  description?: string;
}

export interface NonConformitySeverity {
  value: string;
  label: string;
  color: string;
  badge: "default" | "secondary" | "destructive" | "outline";
  priority: number;
}

export interface NonConformityStatus {
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
  description?: string;
}

// TIPOS DE AUDITORÍA (Según etapas del proceso de certificación)
// Edita aquí para agregar, quitar o modificar tipos de auditoría
export const AUDIT_TYPES: AuditType[] = [
  {
    value: "etapa_1",
    label: "Etapa 1",
    color: "#0ea5e9",
    description: "Auditoría de revisión documental y preparación",
  },
  {
    value: "etapa_2",
    label: "Etapa 2",
    color: "#22c55e",
    description: "Auditoría de certificación - implementación del sistema",
  },
  {
    value: "seguimiento",
    label: "Seguimiento",
    color: "#f59e0b",
    description: "Auditoría de seguimiento anual",
  },
  {
    value: "renovacion",
    label: "Renovación",
    color: "#8b5cf6",
    description: "Auditoría de renovación de certificado (cada 3 años)",
  },
  {
    value: "extraordinaria",
    label: "Extraordinaria",
    color: "#ef4444",
    description: "Auditoría extraordinaria por cambios significativos",
  },
  {
    value: "interna",
    label: "Interna",
    color: "#64748b",
    description: "Auditoría interna del cliente",
  },
];

// MODALIDADES DE AUDITORÍA
export interface AuditModality {
  value: string;
  label: string;
  description?: string;
}

export const AUDIT_MODALITIES: AuditModality[] = [
  {
    value: "in_situ",
    label: "In Situ",
    description: "Auditoría presencial en las instalaciones del cliente",
  },
  {
    value: "online",
    label: "Online",
    description: "Auditoría remota a través de medios digitales",
  },
  {
    value: "mixta",
    label: "Mixta",
    description: "Combinación de auditoría presencial y remota",
  },
];

// NORMAS ISO AUDITADAS
export interface ISOStandard {
  value: string;
  label: string;
  fullName: string;
  color?: string;
}

export const ISO_STANDARDS: ISOStandard[] = [
  {
    value: "iso_9001",
    label: "ISO 9001",
    fullName: "ISO 9001:2015 - Sistemas de Gestión de Calidad",
    color: "#0ea5e9",
  },
  {
    value: "iso_14001",
    label: "ISO 14001",
    fullName: "ISO 14001:2015 - Sistemas de Gestión Ambiental",
    color: "#22c55e",
  },
  {
    value: "iso_45001",
    label: "ISO 45001",
    fullName:
      "ISO 45001:2018 - Sistemas de Gestión de Seguridad y Salud en el Trabajo",
    color: "#ef4444",
  },
  {
    value: "iso_27001",
    label: "ISO 27001",
    fullName:
      "ISO 27001:2022 - Sistemas de Gestión de Seguridad de la Información",
    color: "#8b5cf6",
  },
  {
    value: "iso_50001",
    label: "ISO 50001",
    fullName: "ISO 50001:2018 - Sistemas de Gestión de la Energía",
    color: "#f59e0b",
  },
  {
    value: "iso_22000",
    label: "ISO 22000",
    fullName: "ISO 22000:2018 - Sistemas de Gestión de Seguridad Alimentaria",
    color: "#06b6d4",
  },
  {
    value: "iso_13485",
    label: "ISO 13485",
    fullName:
      "ISO 13485:2016 - Sistemas de Gestión de Calidad para Productos Sanitarios",
    color: "#84cc16",
  },
  {
    value: "iso_37001",
    label: "ISO 37001",
    fullName: "ISO 37001:2016 - Sistemas de Gestión Antisoborno",
    color: "#f97316",
  },
];

// ROLES DEL EQUIPO AUDITOR
export interface AuditorRole {
  value: string;
  label: string;
  isLeader: boolean;
  description: string;
}

export const AUDITOR_ROLES: AuditorRole[] = [
  {
    value: "auditor_lider",
    label: "Auditor Líder",
    isLeader: true,
    description: "Responsable de dirigir el equipo auditor y la auditoría",
  },
  {
    value: "auditor_principal",
    label: "Auditor Principal",
    isLeader: false,
    description:
      "Auditor con experiencia que realiza auditorías independientes",
  },
  {
    value: "auditor_junior",
    label: "Auditor Junior",
    isLeader: false,
    description: "Auditor en formación que asiste al equipo auditor",
  },
  {
    value: "experto_tecnico",
    label: "Experto Técnico",
    isLeader: false,
    description: "Especialista técnico que asesora en temas específicos",
  },
  {
    value: "observador",
    label: "Observador",
    isLeader: false,
    description: "Persona que observa la auditoría con fines de aprendizaje",
  },
];

// ESTADOS DE AUDITORÍA
// Edita aquí para cambiar los estados disponibles
export const AUDIT_STATUSES: AuditStatus[] = [
  {
    value: "Borrador",
    label: "Borrador",
    badge: "secondary",
    color: "#64748b",
    description: "Auditoría en fase de planificación",
  },
  {
    value: "Pendiente",
    label: "Pendiente",
    badge: "draft",
    color: "#f59e0b",
    description: "Auditoría programada, esperando inicio",
  },
  {
    value: "En progreso",
    label: "En progreso",
    badge: "pending",
    color: "#0ea5e9",
    description: "Auditoría en ejecución",
  },
  {
    value: "En revisión",
    label: "En revisión",
    badge: "outline",
    color: "#8b5cf6",
    description: "Auditoría completada, en proceso de revisión",
  },
  {
    value: "Completada",
    label: "Completada",
    badge: "approved",
    color: "#22c55e",
    description: "Auditoría finalizada y aprobada",
  },
  {
    value: "Cancelada",
    label: "Cancelada",
    badge: "destructive",
    color: "#ef4444",
    description: "Auditoría cancelada",
  },
  {
    value: "Suspendida",
    label: "Suspendida",
    badge: "outline",
    color: "#f97316",
    description: "Auditoría temporalmente suspendida",
  },
];

// CATEGORÍAS DE EVIDENCIA
// Edita aquí para las categorías de evidencias
export const EVIDENCE_CATEGORIES: AuditCategory[] = [
  {
    value: "Documentación",
    label: "Documentación",
    description: "Manuales, procedimientos, políticas",
  },
  {
    value: "Evidencia visual",
    label: "Evidencia visual",
    description: "Fotografías, videos, capturas de pantalla",
  },
  {
    value: "Registros",
    label: "Registros",
    description: "Formularios, bitácoras, reportes",
  },
  {
    value: "Certificados",
    label: "Certificados",
    description: "Certificaciones, acreditaciones, licencias",
  },
  {
    value: "Contratos",
    label: "Contratos",
    description: "Contratos, acuerdos, convenios",
  },
  {
    value: "Reportes técnicos",
    label: "Reportes técnicos",
    description: "Análisis, estudios, evaluaciones técnicas",
  },
  {
    value: "Comunicaciones",
    label: "Comunicaciones",
    description: "Emails, cartas, notificaciones oficiales",
  },
  {
    value: "Otros",
    label: "Otros",
    description: "Otros tipos de evidencia",
  },
];

// SEVERIDADES DE NO CONFORMIDAD
// Edita aquí para cambiar los niveles de severidad
export const NC_SEVERITIES: NonConformitySeverity[] = [
  {
    value: "Crítica",
    label: "Crítica",
    color: "#dc2626",
    badge: "destructive",
    priority: 1,
  },
  {
    value: "Alta",
    label: "Alta",
    color: "#ea580c",
    badge: "destructive",
    priority: 2,
  },
  {
    value: "Media",
    label: "Media",
    color: "#ca8a04",
    badge: "outline",
    priority: 3,
  },
  {
    value: "Baja",
    label: "Baja",
    color: "#16a34a",
    badge: "outline",
    priority: 4,
  },
];

// ESTADOS DE NO CONFORMIDAD
// Edita aquí para cambiar los estados de no conformidades
export const NC_STATUSES: NonConformityStatus[] = [
  {
    value: "Abierta",
    label: "Abierta",
    color: "#dc2626",
    badge: "destructive",
    description: "No conformidad identificada, pendiente de acción",
  },
  {
    value: "En revisión",
    label: "En revisión",
    color: "#ca8a04",
    badge: "pending",
    description: "No conformidad bajo análisis",
  },
  {
    value: "En progreso",
    label: "En progreso",
    color: "#0ea5e9",
    badge: "outline",
    description: "Acciones correctivas en implementación",
  },
  {
    value: "Verificación",
    label: "En verificación",
    color: "#8b5cf6",
    badge: "outline",
    description: "Verificando efectividad de acciones correctivas",
  },
  {
    value: "Cerrada",
    label: "Cerrada",
    color: "#16a34a",
    badge: "approved",
    description: "No conformidad resuelta y verificada",
  },
];

// CATEGORÍAS DE NO CONFORMIDAD
// Edita aquí para las categorías de no conformidades
export const NC_CATEGORIES: AuditCategory[] = [
  {
    value: "Documentación",
    label: "Documentación",
    description: "Falta o deficiencia en documentación",
  },
  {
    value: "Seguridad",
    label: "Seguridad",
    description: "Incumplimientos de seguridad y salud",
  },
  {
    value: "Calidad",
    label: "Calidad",
    description: "Desviaciones en procesos de calidad",
  },
  {
    value: "Ambiental",
    label: "Ambiental",
    description: "Incumplimientos ambientales",
  },
  {
    value: "Financiera",
    label: "Financiera",
    description: "Irregularidades financieras o contables",
  },
  {
    value: "Equipos",
    label: "Equipos",
    description: "Problemas con equipos e instrumentos",
  },
  {
    value: "Procesos",
    label: "Procesos",
    description: "Desviaciones en procesos operativos",
  },
  {
    value: "Personal",
    label: "Personal",
    description: "Temas relacionados con recursos humanos",
  },
  {
    value: "Monitoreo",
    label: "Monitoreo",
    description: "Deficiencias en sistemas de monitoreo",
  },
  {
    value: "Contabilidad",
    label: "Contabilidad",
    description: "Errores o irregularidades contables",
  },
  {
    value: "Cumplimiento",
    label: "Cumplimiento normativo",
    description: "Incumplimientos de normas y regulaciones",
  },
  {
    value: "Otros",
    label: "Otros",
    description: "Otras categorías no especificadas",
  },
];

// Funciones utilitarias para obtener opciones
export const getAuditTypeOptions = () => AUDIT_TYPES;
export const getAuditStatusOptions = () => AUDIT_STATUSES;
export const getEvidenceCategoryOptions = () => EVIDENCE_CATEGORIES;
export const getNCCategoryOptions = () => NC_CATEGORIES;
export const getNCSeverityOptions = () => NC_SEVERITIES;
export const getNCStatusOptions = () => NC_STATUSES;
export const getAuditModalityOptions = () => AUDIT_MODALITIES;
export const getISOStandardOptions = () => ISO_STANDARDS;
export const getAuditorRoleOptions = () => AUDITOR_ROLES;

// Funciones para obtener configuración específica
export const getAuditType = (value: string) =>
  AUDIT_TYPES.find((t) => t.value === value);
export const getAuditStatus = (value: string) =>
  AUDIT_STATUSES.find((s) => s.value === value);
export const getNCSeverity = (value: string) =>
  NC_SEVERITIES.find((s) => s.value === value);
export const getNCStatus = (value: string) =>
  NC_STATUSES.find((s) => s.value === value);
export const getAuditModality = (value: string) =>
  AUDIT_MODALITIES.find((m) => m.value === value);
export const getISOStandard = (value: string) =>
  ISO_STANDARDS.find((s) => s.value === value);
export const getAuditorRole = (value: string) =>
  AUDITOR_ROLES.find((r) => r.value === value);

// Mapeo para filtros (valor interno vs valor de filtro)
export const AUDIT_TYPE_FILTER_MAP: Record<string, string> = {
  quality: "Calidad",
  environmental: "Ambiental",
  security: "Seguridad",
  financial: "Financiera",
  processes: "Procesos",
  compliance: "Cumplimiento",
  it: "TI",
  internal: "Interna",
};

export const AUDIT_STATUS_FILTER_MAP: Record<string, string> = {
  draft: "Borrador",
  pending: "Pendiente",
  progress: "En progreso",
  review: "En revisión",
  completed: "Completada",
  cancelled: "Cancelada",
  suspended: "Suspendida",
};

export const NC_STATUS_FILTER_MAP: Record<string, string> = {
  open: "Abierta",
  review: "En revisión",
  progress: "En progreso",
  verification: "Verificación",
  closed: "Cerrada",
};
