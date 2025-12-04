import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export type Session = import("./index").Session;
