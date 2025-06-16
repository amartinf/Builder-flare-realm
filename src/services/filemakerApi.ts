// FileMaker Data API Service
// Configure your FileMaker Server details here

interface FileMakerConfig {
  server: string;
  database: string;
  username: string;
  password: string;
  layout: string;
}

interface FileMakerResponse<T = any> {
  response: {
    data?: T[];
    dataInfo?: {
      database: string;
      layout: string;
      table: string;
      totalRecordCount: number;
      foundCount: number;
      returnedCount: number;
    };
  };
  messages: Array<{
    code: string;
    message: string;
  }>;
}

interface FileMakerAuth {
  token: string;
  expiry: number;
}

class FileMakerAPI {
  private config: FileMakerConfig;
  private auth: FileMakerAuth | null = null;
  private baseURL: string;

  constructor(config: FileMakerConfig) {
    this.config = config;
    this.baseURL = `https://${config.server}/fmi/data/vLatest/databases/${config.database}`;
  }

  // Authentication
  async authenticate(): Promise<string> {
    if (this.auth && this.auth.expiry > Date.now()) {
      return this.auth.token;
    }

    try {
      const response = await fetch(`${this.baseURL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`,
        },
      });

      const data = await response.json();

      if (data.messages[0].code === "0") {
        this.auth = {
          token: data.response.token,
          expiry: Date.now() + 14 * 60 * 1000, // 14 minutes
        };
        return this.auth.token;
      } else {
        throw new Error(
          `FileMaker authentication failed: ${data.messages[0].message}`,
        );
      }
    } catch (error) {
      console.error("FileMaker authentication error:", error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    if (!this.auth) return;

    try {
      await fetch(`${this.baseURL}/sessions/${this.auth.token}`, {
        method: "DELETE",
      });
      this.auth = null;
    } catch (error) {
      console.error("FileMaker logout error:", error);
    }
  }

  // Generic request method
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<FileMakerResponse<T>> {
    const token = await this.authenticate();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (data.messages[0].code !== "0") {
      throw new Error(`FileMaker API error: ${data.messages[0].message}`);
    }

    return data;
  }

  // CRUD Operations

  // Get all records
  async getRecords<T = any>(
    layout: string,
    params: {
      limit?: number;
      offset?: number;
      sort?: Array<{ fieldName: string; sortOrder: "ascend" | "descend" }>;
    } = {},
  ): Promise<FileMakerResponse<T>> {
    const queryParams = new URLSearchParams();

    if (params.limit) queryParams.append("_limit", params.limit.toString());
    if (params.offset) queryParams.append("_offset", params.offset.toString());
    if (params.sort) queryParams.append("_sort", JSON.stringify(params.sort));

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

    return this.request<T>(`/layouts/${layout}/records${query}`);
  }

  // Get record by ID
  async getRecord<T = any>(
    layout: string,
    recordId: string,
  ): Promise<FileMakerResponse<T>> {
    return this.request<T>(`/layouts/${layout}/records/${recordId}`);
  }

  // Create record
  async createRecord<T = any>(
    layout: string,
    data: Record<string, any>,
  ): Promise<FileMakerResponse<T>> {
    return this.request<T>(`/layouts/${layout}/records`, {
      method: "POST",
      body: JSON.stringify({ fieldData: data }),
    });
  }

  // Update record
  async updateRecord<T = any>(
    layout: string,
    recordId: string,
    data: Record<string, any>,
  ): Promise<FileMakerResponse<T>> {
    return this.request<T>(`/layouts/${layout}/records/${recordId}`, {
      method: "PATCH",
      body: JSON.stringify({ fieldData: data }),
    });
  }

  // Delete record
  async deleteRecord(
    layout: string,
    recordId: string,
  ): Promise<FileMakerResponse> {
    return this.request(`/layouts/${layout}/records/${recordId}`, {
      method: "DELETE",
    });
  }

  // Find records
  async findRecords<T = any>(
    layout: string,
    query: Array<{
      [fieldName: string]: string | number;
    }>,
    params: {
      limit?: number;
      offset?: number;
      sort?: Array<{ fieldName: string; sortOrder: "ascend" | "descend" }>;
    } = {},
  ): Promise<FileMakerResponse<T>> {
    const body: any = { query };

    if (params.limit) body.limit = params.limit;
    if (params.offset) body.offset = params.offset;
    if (params.sort) body.sort = params.sort;

    return this.request<T>(`/layouts/${layout}/_find`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // Upload container data (for file uploads)
  async uploadFile(
    layout: string,
    recordId: string,
    fieldName: string,
    file: File,
  ): Promise<FileMakerResponse> {
    const token = await this.authenticate();
    const formData = new FormData();
    formData.append("upload", file);

    const response = await fetch(
      `${this.baseURL}/layouts/${layout}/records/${recordId}/containers/${fieldName}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );

    return response.json();
  }
}

// FileMaker field mappings for our application
export interface FileMakerAudit {
  recordId?: string;
  modId?: string;
  "Audits::ID": number;
  "Audits::Name": string;
  "Audits::Type": string;
  "Audits::Status": string;
  "Audits::Progress": number;
  "Audits::DueDate": string;
  "Audits::Auditor": string;
  "Audits::CreatedDate": string;
  "Audits::Description": string;
  "Audits::NonConformityCount": number;
  "Audits::EvidenceCount": number;
}

export interface FileMakerNonConformity {
  recordId?: string;
  modId?: string;
  "NonConformities::ID": number;
  "NonConformities::Code": string;
  "NonConformities::Title": string;
  "NonConformities::Description": string;
  "NonConformities::AuditID": number;
  "NonConformities::Audit": string;
  "NonConformities::AuditType": string;
  "NonConformities::Severity": string;
  "NonConformities::Status": string;
  "NonConformities::Assignee": string;
  "NonConformities::Reporter": string;
  "NonConformities::DueDate": string;
  "NonConformities::CreatedDate": string;
  "NonConformities::ClosedDate": string;
  "NonConformities::Category": string;
  "NonConformities::Evidence": string;
  "NonConformities::RootCause": string;
  "NonConformities::CorrectiveAction": string;
}

export interface FileMakerEvidence {
  recordId?: string;
  modId?: string;
  "Evidence::ID": number;
  "Evidence::AuditID": number;
  "Evidence::Name": string;
  "Evidence::Type": string;
  "Evidence::Size": string;
  "Evidence::UploadDate": string;
  "Evidence::Description": string;
  "Evidence::Category": string;
  "Evidence::File": string; // Container field
}

export interface FileMakerComment {
  recordId?: string;
  modId?: string;
  "Comments::ID": number;
  "Comments::NonConformityID": number;
  "Comments::Author": string;
  "Comments::Content": string;
  "Comments::Date": string;
  "Comments::Type": string;
}

// Environment configuration
const getFileMakerConfig = (): FileMakerConfig => {
  return {
    server: import.meta.env.VITE_FILEMAKER_SERVER || "your-server.com",
    database: import.meta.env.VITE_FILEMAKER_DATABASE || "AuditPro",
    username: import.meta.env.VITE_FILEMAKER_USERNAME || "api_user",
    password: import.meta.env.VITE_FILEMAKER_PASSWORD || "api_password",
    layout: "API_Layout", // Default layout
  };
};

// Create singleton instance
export const fileMakerAPI = new FileMakerAPI(getFileMakerConfig());

// Layout names - configure according to your FileMaker database
export const LAYOUTS = {
  AUDITS: "Audits_API",
  NON_CONFORMITIES: "NonConformities_API",
  EVIDENCE: "Evidence_API",
  COMMENTS: "Comments_API",
} as const;

export default FileMakerAPI;
