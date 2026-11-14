import type { Database } from "@/types/database.types";

export type Department = Database["public"]["Tables"]["departments"]["Row"];
export type StudyProgram =
  Database["public"]["Tables"]["study_programs"]["Row"];
export type AcademicYear =
  Database["public"]["Tables"]["academic_years"]["Row"];
export type SchoolClass = Database["public"]["Tables"]["classes"]["Row"];

export interface AcademicsOptions {
  departments: Pick<Department, "id" | "code" | "name_en">[];
  studyPrograms: Pick<
    StudyProgram,
    "id" | "code" | "name_en" | "department_id"
  >[];
  academicYears: Pick<AcademicYear, "id" | "name" | "is_current">[];
  classes: Pick<
    SchoolClass,
    "id" | "name" | "academic_year_id" | "department_id" | "grade_level"
  >[];
}

export interface StudyProgramListItem extends StudyProgram {
  department_name: string | null;
}

export interface ClassListItem extends SchoolClass {
  academic_year_name: string | null;
  department_name: string | null;
  study_program_name: string | null;
}
