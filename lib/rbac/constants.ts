/**
 * Deliberately dependency-free (no firebase-admin, no supabase). middleware.ts
 * runs on the Edge runtime and cannot bundle firebase-admin's Node-only
 * dependencies (net/http/tls) — importing this constant must never pull
 * those in transitively. Real verification of the cookie happens in
 * lib/rbac/session.ts, which only ever runs in the Node.js runtime
 * (Server Components/Actions/Route Handlers).
 */
export const SESSION_COOKIE_NAME = "session";
