import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export type Session = import("./index").Session;

// Touch this if you need to customize the Better Auth client (custom fetch/base URL/headers)
// or if you move/rename the server auth export that provides the Session type.
