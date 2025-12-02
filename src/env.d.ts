// Augment the NodeJS namespace to include API_KEY in ProcessEnv
// This avoids redeclaring 'process' which is already defined globally.

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}
