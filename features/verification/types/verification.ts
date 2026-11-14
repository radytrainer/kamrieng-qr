import type { StudentListItem } from "@/features/students/types/student";

export type VerificationOutcome =
  "success" | "expired" | "inactive" | "not_found";

export type VerificationResult =
  | { outcome: "success" | "expired" | "inactive"; student: StudentListItem }
  | { outcome: "not_found"; student: null };
