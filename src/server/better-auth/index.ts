import { auth as authFromConfig } from "./config";

export type { Session } from "./config";

// Re-export auth with a stable binding and helper for easy DI in tests.
export const auth = authFromConfig;
export const getAuth = () => auth;

// Touch this if you move auth configuration or want to re-export additional Better Auth helpers.
