/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FILEMAKER_SERVER: string;
  readonly VITE_FILEMAKER_DATABASE: string;
  readonly VITE_FILEMAKER_USERNAME: string;
  readonly VITE_FILEMAKER_PASSWORD: string;
  readonly VITE_FILEMAKER_PORT?: string;
  readonly VITE_FILEMAKER_SSL_VERIFY?: string;
  readonly VITE_DEVELOPMENT_MODE?: string;
  readonly VITE_MOCK_DATA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
