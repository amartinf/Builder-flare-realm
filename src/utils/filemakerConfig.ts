// FileMaker Configuration Utilities

export interface FileMakerConfig {
  server: {
    host: string;
    port: number;
    protocol: "http" | "https";
    timeout: number;
  };
  database: {
    name: string;
    solution: string;
    version: string;
  };
  authentication: {
    username: string;
    password: string;
    authType: "basic" | "oauth" | "token";
    tokenExpiry: number;
  };
  connection: {
    maxConnections: number;
    retryAttempts: number;
    enableSSL: boolean;
    verifySSL: boolean;
  };
  layouts: {
    audits: string;
    nonConformities: string;
    users: string;
    evidence: string;
    comments: string;
  };
  preferences: {
    useMockData: boolean;
    debugMode: boolean;
    logLevel: "error" | "warn" | "info" | "debug";
    autoReconnect: boolean;
  };
}

export const getFileMakerConfig = (): FileMakerConfig | null => {
  try {
    const config = localStorage.getItem("filemaker-config");
    if (config) {
      const parsedConfig = JSON.parse(config);
      console.log("Loaded FileMaker config from localStorage:", parsedConfig);
      return parsedConfig;
    }
  } catch (error) {
    console.error("Error loading FileMaker config:", error);
  }
  return null;
};

export const isFileMakerConfigured = (): boolean => {
  const config = getFileMakerConfig();
  if (!config) return false;

  // Check if we're in demo mode
  if (config.preferences.useMockData) {
    console.log("FileMaker configured but in demo mode");
    return false;
  }

  // Check if all required fields are present
  const hasServer = config.server.host && config.server.port;
  const hasDatabase = config.database.name;
  const hasAuth =
    config.authentication.username && config.authentication.password;

  console.log("FileMaker configuration check:", {
    hasServer,
    hasDatabase,
    hasAuth,
    configured: hasServer && hasDatabase && hasAuth,
  });

  return !!(hasServer && hasDatabase && hasAuth);
};

export const getFileMakerURL = (config?: FileMakerConfig): string => {
  const fmConfig = config || getFileMakerConfig();
  if (!fmConfig) {
    throw new Error("FileMaker configuration not found");
  }

  return `${fmConfig.server.protocol}://${fmConfig.server.host}:${fmConfig.server.port}/fmi/data/v1/databases/${fmConfig.database.name}`;
};

export const shouldUseMockData = (): boolean => {
  const config = getFileMakerConfig();
  return config?.preferences.useMockData ?? true;
};

export const toggleMockData = (useMock: boolean): void => {
  const config = getFileMakerConfig();
  if (config) {
    config.preferences.useMockData = useMock;
    localStorage.setItem("filemaker-config", JSON.stringify(config));
    console.log(`Switched to ${useMock ? "mock" : "production"} data mode`);
  }
};
