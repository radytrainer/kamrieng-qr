import type { Database } from "@/types/database.types";

export type StudentRow = Database["public"]["Tables"]["students"]["Row"];
export type StudentInsert = Database["public"]["Tables"]["students"]["Insert"];
export type StudentUpdate = Database["public"]["Tables"]["students"]["Update"];

/** Student row joined with the human-readable labels used throughout the UI. */
export interface StudentListItem extends StudentRow {
  department_name: string | null;
  study_program_name: string | null;
  class_name: string | null;
  academic_year_name: string | null;
  academic_year_end_date: string | null;
  father_name: string | null;
  father_phone: string | null;
  father_job: string | null;
  mother_name: string | null;
  mother_phone: string | null;
  mother_job: string | null;
}

export interface StudentListResult {
  items: StudentListItem[];
  total: number;
  page: number;
  pageSize: number;
}

/** Slim shape for the bulk official-card print run — only the fields that
 * template actually renders. */
export interface OfficialCardStudent {
  id: string;
  student_code: string;
  student_token: string;
  khmer_first_name: string;
  khmer_last_name: string;
  gender: string;
  date_of_birth: string;
  address: string | null;
  phone: string | null;
  photo_url: string | null;
  status: string;
  expiry_date: string | null;
  class_name: string | null;
  academic_year_name: string | null;
  academic_year_end_date: string | null;
  father_name: string | null;
  mother_name: string | null;
}
