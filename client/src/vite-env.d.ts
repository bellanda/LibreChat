/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_LOGGER: string;
  readonly VITE_LOGGER_FILTER: string;
  readonly VITE_PYTHON_TOOLS_API_URL: string;
  // Add other env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
