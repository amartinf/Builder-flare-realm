// Mock data service for development when FileMaker is not available

export interface MockAuditTeamMember {
  userId: string;
  name: string;
  role: string;
  isLeader: boolean;
}

export interface MockAudit {
  id: number;
  name: string;
  type: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  dueDate: string;
  workingDays: number;
  auditor: string;
  teamMembers: MockAuditTeamMember[];
  modality: string;
  isoStandard: string;
  nonConformities: number;
  evidences: number;
  createdDate: string;
  description?: string;
}

export interface MockNonConformity {
  id: number;
  code: string;
  title: string;
  description: string;
  audit: string;
  auditId: number;
  auditType: string;
  severity: "Crítica" | "Alta" | "Media" | "Baja";
  status: "Abierta" | "En revisión" | "En progreso" | "Cerrada";
  assignee: string;
  reporter: string;
  dueDate: string;
  createdDate: string;
  closedDate?: string;
  category: string;
  evidence?: string;
  correctiveAction?: string;
  rootCause?: string;
  comments: MockComment[];
}

export interface MockEvidence {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  description: string;
  category: string;
  file?: File;
}

export interface MockComment {
  id: number;
  author: string;
  content: string;
  date: string;
  type: "comment" | "status_change" | "assignment";
}

// Mock data
export const mockAudits: MockAudit[] = [
  {
    id: 1,
    name: "Auditoría ISO 9001 - Planta Norte",
    type: "etapa_2",
    status: "En progreso",
    progress: 75,
    startDate: "2024-01-15",
    endDate: "2024-01-17",
    dueDate: "2024-01-25",
    workingDays: 3,
    auditor: "María González",
    teamMembers: [
      {
        userId: "1",
        name: "María González",
        role: "auditor_lider",
        isLeader: true,
      },
      {
        userId: "2",
        name: "Carlos Ruiz",
        role: "auditor_principal",
        isLeader: false,
      },
      {
        userId: "4",
        name: "Dr. Luis Martín",
        role: "experto_tecnico",
        isLeader: false,
      },
    ],
    modality: "in_situ",
    isoStandard: "iso_9001",
    nonConformities: 2,
    evidences: 12,
    createdDate: "2024-01-10",
    description: "Auditoría de certificación etapa 2 para ISO 9001:2015",
  },
  {
    id: 2,
    name: "Auditoría ISO 14001 - Sede Central",
    type: "seguimiento",
    status: "Pendiente",
    progress: 25,
    startDate: "2024-02-05",
    endDate: "2024-02-06",
    dueDate: "2024-02-01",
    workingDays: 2,
    auditor: "Carlos Ruiz",
    teamMembers: [
      {
        userId: "2",
        name: "Carlos Ruiz",
        role: "auditor_lider",
        isLeader: true,
      },
      {
        userId: "3",
        name: "Ana López",
        role: "auditor_principal",
        isLeader: false,
      },
    ],
    modality: "mixta",
    isoStandard: "iso_14001",
    nonConformities: 0,
    evidences: 3,
    createdDate: "2024-01-12",
    description:
      "Auditoría de seguimiento anual del sistema de gestión ambiental",
  },
  {
    id: 3,
    name: "Auditoría ISO 45001 - Almacén",
    type: "renovacion",
    status: "Completada",
    progress: 100,
    startDate: "2024-01-08",
    endDate: "2024-01-10",
    dueDate: "2024-01-15",
    workingDays: 3,
    auditor: "Ana López",
    teamMembers: [
      { userId: "3", name: "Ana López", role: "auditor_lider", isLeader: true },
      {
        userId: "1",
        name: "María González",
        role: "auditor_principal",
        isLeader: false,
      },
      {
        userId: "5",
        name: "Roberto Silva",
        role: "auditor_junior",
        isLeader: false,
      },
    ],
    modality: "in_situ",
    isoStandard: "iso_45001",
    nonConformities: 1,
    evidences: 24,
    createdDate: "2024-01-05",
    description: "Auditoría de renovación del certificado ISO 45001",
  },
  {
    id: 4,
    name: "Auditoría Financiera Q4",
    type: "Financiera",
    status: "En progreso",
    progress: 60,
    dueDate: "2024-01-30",
    auditor: "Luis Martín",
    nonConformities: 3,
    evidences: 8,
    createdDate: "2024-01-08",
    description: "Revisión financiera del cuarto trimestre",
  },
  {
    id: 5,
    name: "Auditoría Interna de Procesos",
    type: "Procesos",
    status: "Borrador",
    progress: 10,
    dueDate: "2024-02-15",
    auditor: "Carmen Torres",
    nonConformities: 0,
    evidences: 1,
    createdDate: "2024-01-18",
    description: "Evaluación de procesos internos de la organización",
  },
];

export const mockNonConformities: MockNonConformity[] = [
  {
    id: 1,
    code: "NC-001",
    title: "Falta de documentación en proceso de calidad",
    description:
      "No se encontró evidencia documental del proceso de control de calidad establecido en el procedimiento QP-001. Los operarios no tienen acceso a las instrucciones de trabajo actualizadas.",
    audit: "ISO 9001 - Planta Norte",
    auditId: 1,
    auditType: "Calidad",
    severity: "Alta",
    status: "Abierta",
    assignee: "Roberto Silva",
    reporter: "María González",
    dueDate: "2024-01-28",
    createdDate: "2024-01-20",
    category: "Documentación",
    evidence: "Fotografías del área de trabajo sin documentación visible",
    comments: [
      {
        id: 1,
        author: "María González",
        content: "No conformidad identificada durante inspección de rutina",
        date: "2024-01-20T10:30:00",
        type: "comment",
      },
    ],
  },
  {
    id: 2,
    code: "NC-002",
    title: "Incumplimiento de protocolo de seguridad",
    description:
      "Personal trabajando sin equipo de protección individual obligatorio en área de riesgo alto. Se observaron 3 trabajadores sin casco de seguridad y 2 sin gafas protectoras.",
    audit: "Auditoría de Seguridad - Almacén",
    auditId: 3,
    auditType: "Seguridad",
    severity: "Crítica",
    status: "En revisión",
    assignee: "Carmen Torres",
    reporter: "Ana López",
    dueDate: "2024-01-22",
    createdDate: "2024-01-18",
    category: "Seguridad",
    evidence: "Video del área de trabajo",
    rootCause: "Falta de supervisión y entrenamiento del personal",
    comments: [
      {
        id: 1,
        author: "Ana López",
        content: "Situación crítica identificada durante auditoría",
        date: "2024-01-18T14:15:00",
        type: "comment",
      },
      {
        id: 2,
        author: "Carmen Torres",
        content: "Iniciando investigación de causa raíz",
        date: "2024-01-19T09:00:00",
        type: "status_change",
      },
    ],
  },
  {
    id: 3,
    code: "NC-003",
    title: "Desviación en registro de temperaturas",
    description:
      "Los registros de temperatura del almacén muestran valores fuera del rango establecido (18-22°C) durante 3 días consecutivos. Temperaturas registradas entre 25-27°C.",
    audit: "Auditoría Ambiental - Sede Central",
    auditId: 2,
    auditType: "Ambiental",
    severity: "Media",
    status: "Cerrada",
    assignee: "Miguel Herrera",
    reporter: "Carlos Ruiz",
    dueDate: "2024-01-20",
    createdDate: "2024-01-15",
    closedDate: "2024-01-19",
    category: "Monitoreo",
    evidence: "Registros de temperatura automáticos",
    correctiveAction:
      "Calibración del sistema de climatización y ajuste de termostatos",
    rootCause: "Mal funcionamiento del sistema de climatización",
    comments: [
      {
        id: 1,
        author: "Carlos Ruiz",
        content: "Desviación detectada en revisión de registros",
        date: "2024-01-15T16:45:00",
        type: "comment",
      },
      {
        id: 2,
        author: "Miguel Herrera",
        content: "Sistema de climatización reparado y calibrado",
        date: "2024-01-19T11:30:00",
        type: "comment",
      },
    ],
  },
];

export const mockEvidence: MockEvidence[] = [
  {
    id: 1,
    name: "Manual_Calidad_v2.pdf",
    type: "PDF",
    size: "2.4 MB",
    uploadDate: "2024-01-15",
    description: "Manual de calidad actualizado",
    category: "Documentación",
  },
  {
    id: 2,
    name: "Proceso_Produccion.jpg",
    type: "Imagen",
    size: "1.8 MB",
    uploadDate: "2024-01-16",
    description: "Fotografía del proceso de producción",
    category: "Evidencia visual",
  },
];

// Mock API functions with delays to simulate network requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockFileMakerAPI {
  static async getAudits(): Promise<MockAudit[]> {
    await delay(500); // Simulate network delay
    return [...mockAudits];
  }

  static async createAudit(
    audit: Omit<MockAudit, "id" | "nonConformities" | "evidences">,
  ): Promise<MockAudit> {
    await delay(800);
    const newAudit: MockAudit = {
      ...audit,
      id: Math.max(...mockAudits.map((a) => a.id)) + 1,
      nonConformities: 0,
      evidences: 0,
    };
    mockAudits.push(newAudit);
    return newAudit;
  }

  static async updateAudit(
    id: number,
    updates: Partial<MockAudit>,
  ): Promise<MockAudit> {
    await delay(600);
    const index = mockAudits.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Audit not found");

    mockAudits[index] = { ...mockAudits[index], ...updates };
    return mockAudits[index];
  }

  static async deleteAudit(id: number): Promise<void> {
    await delay(400);
    const index = mockAudits.findIndex((a) => a.id === id);
    if (index === -1) throw new Error("Audit not found");

    mockAudits.splice(index, 1);
  }

  static async getNonConformities(): Promise<MockNonConformity[]> {
    await delay(600);
    return [...mockNonConformities];
  }

  static async createNonConformity(
    nc: Omit<MockNonConformity, "id" | "code" | "comments">,
  ): Promise<MockNonConformity> {
    await delay(900);
    const maxId = Math.max(...mockNonConformities.map((nc) => nc.id), 0);
    const newNC: MockNonConformity = {
      ...nc,
      id: maxId + 1,
      code: `NC-${(maxId + 1).toString().padStart(3, "0")}`,
      comments: [],
    };
    mockNonConformities.push(newNC);
    return newNC;
  }

  static async updateNonConformity(
    id: number,
    updates: Partial<MockNonConformity>,
  ): Promise<MockNonConformity> {
    await delay(700);
    const index = mockNonConformities.findIndex((nc) => nc.id === id);
    if (index === -1) throw new Error("Non-conformity not found");

    mockNonConformities[index] = { ...mockNonConformities[index], ...updates };
    return mockNonConformities[index];
  }

  static async deleteNonConformity(id: number): Promise<void> {
    await delay(500);
    const index = mockNonConformities.findIndex((nc) => nc.id === id);
    if (index === -1) throw new Error("Non-conformity not found");

    mockNonConformities.splice(index, 1);
  }

  static async addComment(
    ncId: number,
    comment: Omit<MockComment, "id">,
  ): Promise<MockComment> {
    await delay(300);
    const nc = mockNonConformities.find((nc) => nc.id === ncId);
    if (!nc) throw new Error("Non-conformity not found");

    const newComment: MockComment = {
      ...comment,
      id: nc.comments.length + 1,
    };

    nc.comments.push(newComment);
    return newComment;
  }

  static async getEvidence(auditId: number): Promise<MockEvidence[]> {
    await delay(400);
    return mockEvidence.filter(() => Math.random() > 0.5); // Random subset for demo
  }

  static async uploadEvidence(
    auditId: number,
    file: File,
    description: string,
    category: string,
  ): Promise<MockEvidence> {
    await delay(1200); // Longer delay for file upload simulation

    const newEvidence: MockEvidence = {
      id: Math.max(...mockEvidence.map((e) => e.id), 0) + 1,
      name: file.name,
      type: file.type.includes("image")
        ? "Imagen"
        : file.type.includes("pdf")
          ? "PDF"
          : "Documento",
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split("T")[0],
      description,
      category,
      file,
    };

    mockEvidence.push(newEvidence);
    return newEvidence;
  }
}
