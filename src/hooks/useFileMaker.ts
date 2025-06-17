import { useState, useEffect, useCallback } from "react";
import { useToast } from "./use-toast";
import {
  fileMakerAPI,
  LAYOUTS,
  FileMakerAudit,
  FileMakerNonConformity,
  FileMakerEvidence,
  FileMakerComment,
  shouldUseMockData,
} from "../services/filemakerApi";
import { MockFileMakerAPI } from "../services/mockData";

// Types for our application data models
export interface AuditTeamMember {
  userId: string;
  name: string;
  role: string;
  isLeader: boolean;
  assignedDays: number;
}

export interface Audit {
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
  teamMembers: AuditTeamMember[];
  modality: string;
  isoStandard: string;
  nonConformities: number;
  evidences: number;
  createdDate: string;
  description?: string;
}

export interface NonConformity {
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
  comments: Comment[];
}

export interface Evidence {
  id: number;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  description: string;
  category: string;
  file?: File;
}

export interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  type: "comment" | "status_change" | "assignment";
}

// Mappers to convert FileMaker data to our application format
const mapFileMakerAudit = (fmAudit: FileMakerAudit): Audit => ({
  id: fmAudit["Audits::ID"],
  name: fmAudit["Audits::Name"],
  type: fmAudit["Audits::Type"],
  status: fmAudit["Audits::Status"],
  progress: fmAudit["Audits::Progress"],
  startDate: fmAudit["Audits::StartDate"] || fmAudit["Audits::DueDate"],
  endDate: fmAudit["Audits::EndDate"] || fmAudit["Audits::DueDate"],
  dueDate: fmAudit["Audits::DueDate"],
  workingDays: fmAudit["Audits::WorkingDays"] || 1,
  auditor: fmAudit["Audits::Auditor"],
  teamMembers: fmAudit["Audits::TeamMembers"]
    ? JSON.parse(fmAudit["Audits::TeamMembers"])
    : [],
  modality: fmAudit["Audits::Modality"] || "in_situ",
  isoStandard: fmAudit["Audits::ISOStandard"] || "iso_9001",
  nonConformities: fmAudit["Audits::NonConformityCount"] || 0,
  evidences: fmAudit["Audits::EvidenceCount"] || 0,
  createdDate: fmAudit["Audits::CreatedDate"],
  description: fmAudit["Audits::Description"],
});

const mapFileMakerNonConformity = (
  fmNC: FileMakerNonConformity,
): Omit<NonConformity, "comments"> => ({
  id: fmNC["NonConformities::ID"],
  code: fmNC["NonConformities::Code"],
  title: fmNC["NonConformities::Title"],
  description: fmNC["NonConformities::Description"],
  audit: fmNC["NonConformities::Audit"],
  auditId: fmNC["NonConformities::AuditID"],
  auditType: fmNC["NonConformities::AuditType"],
  severity: fmNC["NonConformities::Severity"] as NonConformity["severity"],
  status: fmNC["NonConformities::Status"] as NonConformity["status"],
  assignee: fmNC["NonConformities::Assignee"],
  reporter: fmNC["NonConformities::Reporter"],
  dueDate: fmNC["NonConformities::DueDate"],
  createdDate: fmNC["NonConformities::CreatedDate"],
  closedDate: fmNC["NonConformities::ClosedDate"],
  category: fmNC["NonConformities::Category"],
  evidence: fmNC["NonConformities::Evidence"],
  correctiveAction: fmNC["NonConformities::CorrectiveAction"],
  rootCause: fmNC["NonConformities::RootCause"],
});

const mapFileMakerEvidence = (fmEvidence: FileMakerEvidence): Evidence => ({
  id: fmEvidence["Evidence::ID"],
  name: fmEvidence["Evidence::Name"],
  type: fmEvidence["Evidence::Type"],
  size: fmEvidence["Evidence::Size"],
  uploadDate: fmEvidence["Evidence::UploadDate"],
  description: fmEvidence["Evidence::Description"],
  category: fmEvidence["Evidence::Category"],
});

const mapFileMakerComment = (fmComment: FileMakerComment): Comment => ({
  id: fmComment["Comments::ID"],
  author: fmComment["Comments::Author"],
  content: fmComment["Comments::Content"],
  date: fmComment["Comments::Date"],
  type: fmComment["Comments::Type"] as Comment["type"],
});

// Custom hooks for each data type

// Audits Hook
export const useAudits = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (shouldUseMockData()) {
        // Use mock data for development
        const mockAudits = await MockFileMakerAPI.getAudits();
        setAudits(mockAudits);
      } else {
        // Use real FileMaker API
        const response = await fileMakerAPI.getRecords<FileMakerAudit>(
          LAYOUTS.AUDITS,
        );
        const mappedAudits =
          response.response.data?.map(mapFileMakerAudit) || [];
        setAudits(mappedAudits);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar auditorías";
      setError(errorMessage);

      // Don't show error toast for missing FileMaker config in development
      if (!shouldUseMockData()) {
        toast({
          title: "Error de conexión",
          description:
            "No se pudo conectar con FileMaker. Usando datos de demostración.",
          variant: "destructive",
        });
      }

      // Fallback to mock data if FileMaker fails
      try {
        const mockAudits = await MockFileMakerAPI.getAudits();
        setAudits(mockAudits);
        setError(null);
      } catch (mockErr) {
        console.error("Mock data error:", mockErr);
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createAudit = useCallback(
    async (auditData: Omit<Audit, "id" | "nonConformities" | "evidences">) => {
      try {
        if (shouldUseMockData()) {
          // Use mock data
          const newAudit = await MockFileMakerAPI.createAudit(auditData);
          setAudits((prev) => [...prev, newAudit]);

          toast({
            title: "Auditoría creada",
            description: `La auditoría "${auditData.name}" ha sido creada exitosamente`,
          });

          return newAudit;
        } else {
          // Use real FileMaker API
          const fmData = {
            "Audits::Name": auditData.name,
            "Audits::Type": auditData.type,
            "Audits::Status": auditData.status,
            "Audits::Progress": auditData.progress,
            "Audits::DueDate": auditData.dueDate,
            "Audits::Auditor": auditData.auditor,
            "Audits::CreatedDate": auditData.createdDate,
            "Audits::Description": auditData.description || "",
          };

          const response = await fileMakerAPI.createRecord<FileMakerAudit>(
            LAYOUTS.AUDITS,
            fmData,
          );

          if (response.response.data?.[0]) {
            const newAudit = mapFileMakerAudit(response.response.data[0]);
            setAudits((prev) => [...prev, newAudit]);

            toast({
              title: "Auditoría creada",
              description: `La auditoría "${auditData.name}" ha sido creada exitosamente`,
            });

            return newAudit;
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al crear auditoría";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      }
    },
    [toast],
  );

  const updateAudit = useCallback(
    async (id: number, auditData: Partial<Audit>) => {
      try {
        if (shouldUseMockData()) {
          // Use mock data
          const updatedAudit = await MockFileMakerAPI.updateAudit(
            id,
            auditData,
          );
          setAudits((prev) =>
            prev.map((a) => (a.id === id ? updatedAudit : a)),
          );
        } else {
          // Use real FileMaker API
          const audit = audits.find((a) => a.id === id);
          if (!audit) throw new Error("Auditoría no encontrada");

          const findResponse = await fileMakerAPI.findRecords<FileMakerAudit>(
            LAYOUTS.AUDITS,
            [{ "Audits::ID": id }],
          );

          if (!findResponse.response.data?.[0]?.recordId) {
            throw new Error("No se pudo encontrar el registro en FileMaker");
          }

          const recordId = findResponse.response.data[0].recordId;

          const fmData: Partial<Record<keyof FileMakerAudit, any>> = {};
          if (auditData.name) fmData["Audits::Name"] = auditData.name;
          if (auditData.type) fmData["Audits::Type"] = auditData.type;
          if (auditData.status) fmData["Audits::Status"] = auditData.status;
          if (auditData.progress !== undefined)
            fmData["Audits::Progress"] = auditData.progress;
          if (auditData.dueDate) fmData["Audits::DueDate"] = auditData.dueDate;
          if (auditData.auditor) fmData["Audits::Auditor"] = auditData.auditor;
          if (auditData.description)
            fmData["Audits::Description"] = auditData.description;

          await fileMakerAPI.updateRecord(LAYOUTS.AUDITS, recordId, fmData);

          setAudits((prev) =>
            prev.map((a) => (a.id === id ? { ...a, ...auditData } : a)),
          );
        }

        toast({
          title: "Auditoría actualizada",
          description: "Los cambios han sido guardados exitosamente",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al actualizar auditoría";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      }
    },
    [audits, toast],
  );

  const deleteAudit = useCallback(
    async (id: number) => {
      try {
        if (shouldUseMockData()) {
          // Use mock data
          await MockFileMakerAPI.deleteAudit(id);
        } else {
          // Use real FileMaker API
          const findResponse = await fileMakerAPI.findRecords<FileMakerAudit>(
            LAYOUTS.AUDITS,
            [{ "Audits::ID": id }],
          );

          if (!findResponse.response.data?.[0]?.recordId) {
            throw new Error("No se pudo encontrar el registro en FileMaker");
          }

          const recordId = findResponse.response.data[0].recordId;
          await fileMakerAPI.deleteRecord(LAYOUTS.AUDITS, recordId);
        }

        setAudits((prev) => prev.filter((a) => a.id !== id));

        toast({
          title: "Auditoría eliminada",
          description: "La auditoría ha sido eliminada exitosamente",
          variant: "destructive",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al eliminar auditoría";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  return {
    audits,
    loading,
    error,
    fetchAudits,
    createAudit,
    updateAudit,
    deleteAudit,
  };
};

// Non-Conformities Hook
export const useNonConformities = () => {
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNonConformities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch non-conformities
      const ncResponse = await fileMakerAPI.getRecords<FileMakerNonConformity>(
        LAYOUTS.NON_CONFORMITIES,
      );
      const nonConformitiesData =
        ncResponse.response.data?.map(mapFileMakerNonConformity) || [];

      // Fetch comments for each non-conformity
      const nonConformitiesWithComments = await Promise.all(
        nonConformitiesData.map(async (nc) => {
          try {
            const commentsResponse =
              await fileMakerAPI.findRecords<FileMakerComment>(
                LAYOUTS.COMMENTS,
                [{ "Comments::NonConformityID": nc.id }],
              );
            const comments =
              commentsResponse.response.data?.map(mapFileMakerComment) || [];
            return { ...nc, comments };
          } catch {
            return { ...nc, comments: [] };
          }
        }),
      );

      setNonConformities(nonConformitiesWithComments);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al cargar no conformidades";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createNonConformity = useCallback(
    async (ncData: Omit<NonConformity, "id" | "code" | "comments">) => {
      try {
        // Generate next code
        const maxId = Math.max(...nonConformities.map((nc) => nc.id), 0);
        const nextCode = `NC-${(maxId + 1).toString().padStart(3, "0")}`;

        const fmData = {
          "NonConformities::Code": nextCode,
          "NonConformities::Title": ncData.title,
          "NonConformities::Description": ncData.description,
          "NonConformities::AuditID": ncData.auditId,
          "NonConformities::Audit": ncData.audit,
          "NonConformities::AuditType": ncData.auditType,
          "NonConformities::Severity": ncData.severity,
          "NonConformities::Status": ncData.status,
          "NonConformities::Assignee": ncData.assignee,
          "NonConformities::Reporter": ncData.reporter,
          "NonConformities::DueDate": ncData.dueDate,
          "NonConformities::CreatedDate": ncData.createdDate,
          "NonConformities::Category": ncData.category,
          "NonConformities::Evidence": ncData.evidence || "",
          "NonConformities::RootCause": ncData.rootCause || "",
          "NonConformities::CorrectiveAction": ncData.correctiveAction || "",
        };

        const response =
          await fileMakerAPI.createRecord<FileMakerNonConformity>(
            LAYOUTS.NON_CONFORMITIES,
            fmData,
          );

        if (response.response.data?.[0]) {
          const newNC = {
            ...mapFileMakerNonConformity(response.response.data[0]),
            comments: [],
          };
          setNonConformities((prev) => [...prev, newNC]);

          toast({
            title: "No conformidad creada",
            description: `La no conformidad ${nextCode} ha sido registrada exitosamente`,
          });

          return newNC;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al crear no conformidad";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      }
    },
    [nonConformities, toast],
  );

  const updateNonConformity = useCallback(
    async (id: number, ncData: Partial<NonConformity>) => {
      try {
        // Find the FileMaker record ID
        const findResponse =
          await fileMakerAPI.findRecords<FileMakerNonConformity>(
            LAYOUTS.NON_CONFORMITIES,
            [{ "NonConformities::ID": id }],
          );

        if (!findResponse.response.data?.[0]?.recordId) {
          throw new Error("No se pudo encontrar el registro en FileMaker");
        }

        const recordId = findResponse.response.data[0].recordId;

        const fmData: Partial<Record<keyof FileMakerNonConformity, any>> = {};
        if (ncData.title) fmData["NonConformities::Title"] = ncData.title;
        if (ncData.description)
          fmData["NonConformities::Description"] = ncData.description;
        if (ncData.severity)
          fmData["NonConformities::Severity"] = ncData.severity;
        if (ncData.status) fmData["NonConformities::Status"] = ncData.status;
        if (ncData.assignee)
          fmData["NonConformities::Assignee"] = ncData.assignee;
        if (ncData.dueDate) fmData["NonConformities::DueDate"] = ncData.dueDate;
        if (ncData.closedDate)
          fmData["NonConformities::ClosedDate"] = ncData.closedDate;
        if (ncData.category)
          fmData["NonConformities::Category"] = ncData.category;
        if (ncData.evidence)
          fmData["NonConformities::Evidence"] = ncData.evidence;
        if (ncData.rootCause)
          fmData["NonConformities::RootCause"] = ncData.rootCause;
        if (ncData.correctiveAction)
          fmData["NonConformities::CorrectiveAction"] = ncData.correctiveAction;

        await fileMakerAPI.updateRecord(
          LAYOUTS.NON_CONFORMITIES,
          recordId,
          fmData,
        );

        setNonConformities((prev) =>
          prev.map((nc) => (nc.id === id ? { ...nc, ...ncData } : nc)),
        );

        toast({
          title: "No conformidad actualizada",
          description: "Los cambios han sido guardados exitosamente",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al actualizar no conformidad";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      }
    },
    [toast],
  );

  const deleteNonConformity = useCallback(
    async (id: number) => {
      try {
        // Find the FileMaker record ID
        const findResponse =
          await fileMakerAPI.findRecords<FileMakerNonConformity>(
            LAYOUTS.NON_CONFORMITIES,
            [{ "NonConformities::ID": id }],
          );

        if (!findResponse.response.data?.[0]?.recordId) {
          throw new Error("No se pudo encontrar el registro en FileMaker");
        }

        const recordId = findResponse.response.data[0].recordId;
        await fileMakerAPI.deleteRecord(LAYOUTS.NON_CONFORMITIES, recordId);

        setNonConformities((prev) => prev.filter((nc) => nc.id !== id));

        toast({
          title: "No conformidad eliminada",
          description: "La no conformidad ha sido eliminada exitosamente",
          variant: "destructive",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al eliminar no conformidad";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      }
    },
    [toast],
  );

  const addComment = useCallback(
    async (nonConformityId: number, comment: Omit<Comment, "id">) => {
      try {
        const fmData = {
          "Comments::NonConformityID": nonConformityId,
          "Comments::Author": comment.author,
          "Comments::Content": comment.content,
          "Comments::Date": comment.date,
          "Comments::Type": comment.type,
        };

        const response = await fileMakerAPI.createRecord<FileMakerComment>(
          LAYOUTS.COMMENTS,
          fmData,
        );

        if (response.response.data?.[0]) {
          const newComment = mapFileMakerComment(response.response.data[0]);

          setNonConformities((prev) =>
            prev.map((nc) =>
              nc.id === nonConformityId
                ? { ...nc, comments: [...nc.comments, newComment] }
                : nc,
            ),
          );

          return newComment;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al agregar comentario";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      }
    },
    [toast],
  );

  useEffect(() => {
    fetchNonConformities();
  }, [fetchNonConformities]);

  return {
    nonConformities,
    loading,
    error,
    fetchNonConformities,
    createNonConformity,
    updateNonConformity,
    deleteNonConformity,
    addComment,
  };
};

// Evidence Hook
export const useEvidence = (auditId?: number) => {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEvidence = useCallback(
    async (specificAuditId?: number) => {
      const targetAuditId = specificAuditId || auditId;
      if (!targetAuditId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fileMakerAPI.findRecords<FileMakerEvidence>(
          LAYOUTS.EVIDENCE,
          [{ "Evidence::AuditID": targetAuditId }],
        );
        const mappedEvidence =
          response.response.data?.map(mapFileMakerEvidence) || [];
        setEvidence(mappedEvidence);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al cargar evidencias";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [auditId, toast],
  );

  const uploadEvidence = useCallback(
    async (
      auditId: number,
      file: File,
      description: string,
      category: string,
    ) => {
      try {
        // First create the evidence record
        const fmData = {
          "Evidence::AuditID": auditId,
          "Evidence::Name": file.name,
          "Evidence::Type": file.type.includes("image")
            ? "Imagen"
            : file.type.includes("pdf")
              ? "PDF"
              : "Documento",
          "Evidence::Size": `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          "Evidence::UploadDate": new Date().toISOString().split("T")[0],
          "Evidence::Description": description,
          "Evidence::Category": category,
        };

        const response = await fileMakerAPI.createRecord<FileMakerEvidence>(
          LAYOUTS.EVIDENCE,
          fmData,
        );

        if (response.response.data?.[0]?.recordId) {
          const recordId = response.response.data[0].recordId;

          // Upload the actual file to the container field
          await fileMakerAPI.uploadFile(
            LAYOUTS.EVIDENCE,
            recordId,
            "Evidence::File",
            file,
          );

          const newEvidence = mapFileMakerEvidence(response.response.data[0]);
          setEvidence((prev) => [...prev, newEvidence]);

          toast({
            title: "Evidencia subida",
            description: `El archivo "${file.name}" ha sido subido exitosamente`,
          });

          return newEvidence;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error al subir evidencia";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        throw err;
      }
    },
    [toast],
  );

  useEffect(() => {
    if (auditId) {
      fetchEvidence();
    }
  }, [auditId, fetchEvidence]);

  return {
    evidence,
    loading,
    error,
    fetchEvidence,
    uploadEvidence,
  };
};
