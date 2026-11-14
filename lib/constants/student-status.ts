export const STUDENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  GRADUATED: "graduated",
  SUSPENDED: "suspended",
  TRANSFERRED: "transferred",
  EXPELLED: "expelled",
} as const;

export type StudentStatus =
  (typeof STUDENT_STATUS)[keyof typeof STUDENT_STATUS];

/** Statuses for which a scanned QR code should verify successfully. */
export const VERIFIABLE_STATUSES: StudentStatus[] = [STUDENT_STATUS.ACTIVE];
