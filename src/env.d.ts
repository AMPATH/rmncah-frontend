// The settings read from .env files. Every VITE_ variable the app uses is listed here,
// so a missing or misspelled one is caught by TypeScript.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
