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

  // Authentication - RESTful POST request with JSON response
  async authenticate(): Promise<string> {
    // Check if FileMaker is configured
    if (!isFileMakerConfigured()) {
      throw new Error(
        "FileMaker not configured. Please configure server connection first.",
      );
    }

    if (this.auth && this.auth.expiry > Date.now()) {
      return this.auth.token;
    }

    try {
      console.log(
        `[FileMaker API] Authenticating to: ${this.baseURL}/sessions`,
      );

      const response = await fetch(`${this.baseURL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`,
          Accept: "application/json",
        },
        body: JSON.stringify({}), // Empty body for authentication
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: FileMakerResponse = await response.json();
      console.log("[FileMaker API] Authentication response:", data);

      if (data.messages && data.messages[0] && data.messages[0].code === "0") {
        this.auth = {
          token: data.response.token,
          expiry: Date.now() + 14 * 60 * 1000, // 14 minutes
        };
        console.log(
          "[FileMaker API] Authentication successful, token acquired",
        );
        return this.auth.token;
      } else {
        const errorMsg =
          data.messages?.[0]?.message || "Unknown authentication error";
        throw new Error(`FileMaker authentication failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error("[FileMaker API] Authentication error:", error);
      throw new Error(
        `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
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

  // Generic RESTful request method with proper HTTP handling and JSON parsing
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<FileMakerResponse<T>> {
    const token = await this.authenticate();

    const url = `${this.baseURL}${endpoint}`;
    console.log(
      `[FileMaker API] ${options.method || "GET"} request to: ${url}`,
    );

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          ...options.headers,
        },
      });

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse JSON response
      const data: FileMakerResponse<T> = await response.json();
      console.log(`[FileMaker API] Response:`, data);

      // Check FileMaker specific error codes
      if (data.messages && data.messages[0] && data.messages[0].code !== "0") {
        throw new Error(
          `FileMaker API error: ${data.messages[0].message} (Code: ${data.messages[0].code})`,
        );
      }

      return data;
    } catch (error) {
      console.error(`[FileMaker API] Request failed:`, error);
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          `Network error: Unable to connect to FileMaker Server at ${this.config.server}`,
        );
      }
      throw error;
    }
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

  // Test RESTful connection to FileMaker Server
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    responseTime: number;
    serverInfo?: any;
  }> {
    const startTime = Date.now();

    try {
      console.log("[FileMaker API] Testing connection...");

      // First test: Basic server connectivity
      const healthUrl = `${this.config.server}/fmi/admin/api/v2/server/status`;
      let serverResponse;

      try {
        serverResponse = await fetch(healthUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          timeout: 10000,
        });
      } catch (error) {
        // If admin API is not accessible, try Data API
        console.log(
          "[FileMaker API] Admin API not accessible, testing Data API...",
        );
      }

      // Second test: Data API authentication
      const token = await this.authenticate();

      // Third test: Get database metadata
      const metadataResponse = await this.request("/layouts");

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        message: `Connection successful! Server responded in ${responseTime}ms`,
        responseTime,
        serverInfo: {
          database: this.config.database,
          layouts: metadataResponse.response?.data || [],
          authToken: token ? "�� Valid" : "✗ Invalid",
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error("[FileMaker API] Connection test failed:", error);

      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown connection error",
        responseTime,
      };
    }
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

// Environment configuration with localStorage fallback
const getFileMakerConfig = (): FileMakerConfig => {
  // Try to get config from localStorage first
  try {
    const storedConfig = localStorage.getItem("filemaker-config");
    if (storedConfig) {
      const config = JSON.parse(storedConfig);
      const port = config.server.port || 443;
      const protocol = config.server.protocol || "https";

      // Don't include default ports in server URL
      const isDefaultPort =
        (protocol === "https" && port === 443) ||
        (protocol === "http" && port === 80);

      const serverUrl = isDefaultPort
        ? `${protocol}://${config.server.host}`
        : `${protocol}://${config.server.host}:${port}`;

      return {
        server: serverUrl,
        database: config.database.name,
        username: config.authentication.username,
        password: config.authentication.password,
        layout: "API_Layout",
      };
    }
  } catch (error) {
    console.error("Error reading FileMaker config from localStorage:", error);
  }

  // Fallback to environment variables
  return {
    server: import.meta.env.VITE_FILEMAKER_SERVER || "",
    database: import.meta.env.VITE_FILEMAKER_DATABASE || "AuditPro",
    username: import.meta.env.VITE_FILEMAKER_USERNAME || "",
    password: import.meta.env.VITE_FILEMAKER_PASSWORD || "",
    layout: "API_Layout", // Default layout
  };
};

// Check if FileMaker is configured
export const isFileMakerConfigured = (): boolean => {
  const config = getFileMakerConfig();
  const isConfigured = !!(config.server && config.username && config.password);
  console.log("FileMaker configuration check:", {
    server: !!config.server,
    username: !!config.username,
    password: !!config.password,
    isConfigured,
  });
  return isConfigured;
};

// Check if we should use mock data
export const shouldUseMockData = (): boolean => {
  // First check localStorage configuration
  try {
    const config = localStorage.getItem("filemaker-config");
    if (config) {
      const parsedConfig = JSON.parse(config);
      const useMock = parsedConfig.preferences?.useMockData ?? true;
      console.log("Using mock data from config:", useMock);
      return useMock;
    }
  } catch (error) {
    console.error("Error reading FileMaker config from localStorage:", error);
  }

  // Fallback to environment variables
  const envMockData = import.meta.env.VITE_MOCK_DATA === "true";
  const filemakerConfigured = isFileMakerConfigured();

  console.log("FileMaker status:", {
    envMockData,
    filemakerConfigured,
    shouldUseMock: envMockData || !filemakerConfigured,
  });

  return envMockData || !filemakerConfigured;
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
