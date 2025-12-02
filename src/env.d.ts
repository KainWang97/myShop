// Fixed: Cannot find type definition file for 'vite/client'
// Removed the reference to vite/client as the types are missing in the environment.
// Added declaration for process to support process.env usage in the application.

declare var process: {
  env: {
    API_KEY?: string;
    [key: string]: string | undefined;
  }
};
