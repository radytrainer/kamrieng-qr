/**
 * Application roles, in descending order of privilege.
 * Mirrors the `role` enum defined on the `users` table (see Phase 2 schema).
 */
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  SCHOOL_ADMIN: "school_admin",
  TEACHER: "teacher",
  STUDENT: "student",
  VISITOR: "visitor",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Roles allowed to sign in to the /admin area at all. */
export const STAFF_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.SCHOOL_ADMIN,
  ROLES.TEACHER,
];

/** Roles allowed to view sensitive student PII (contact info, parents, address). */
export const PII_VISIBLE_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.SCHOOL_ADMIN,
  ROLES.TEACHER,
];

/** Roles allowed to create/edit/delete records (not just view). */
export const ADMIN_ROLES: Role[] = [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN];
