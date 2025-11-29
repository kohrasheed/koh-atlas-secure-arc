/// <reference types="vite/client" />
declare const GITHUB_RUNTIME_PERMANENT_NAME: string
declare const BASE_KV_SERVICE_URL: string

interface ImportMetaEnv {
  readonly VITE_ANTHROPIC_API_KEY: string;
  readonly VITE_AI_MODEL?: string;
  readonly VITE_AI_MAX_TOKENS?: string;
  readonly VITE_AI_TEMPERATURE?: string;
  readonly VITE_ENABLE_AI_RECOMMENDATIONS?: string;
  readonly VITE_ENABLE_CACHE?: string;
  readonly VITE_CACHE_TTL_DAYS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}