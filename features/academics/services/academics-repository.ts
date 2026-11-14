import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AcademicsOptions,
  AcademicYear,
  ClassListItem,
  Department,
  SchoolClass,
  StudyProgram,
  StudyProgramListItem,
} from "@/features/academics/types/academics";
import type {
  AcademicYearFormValues,
  ClassFormValues,
  DepartmentFormValues,
} from "@/features/academics/schemas/academics-schema";

const STUDY_PROGRAM_SELECT = `*, departments ( name_en )` as const;
const CLASS_SELECT = `
  *,
  academic_years ( name ),
  departments ( name_en ),
  study_programs ( name_en )
` as const;

export class AcademicsRepository {
  private get client() {
    return createAdminClient();
  }

  async getOptions(): Promise<AcademicsOptions> {
    const [departments, studyPrograms, academicYears, classes] =
      await Promise.all([
        this.client
          .from("departments")
          .select("id, code, name_en")
          .eq("is_active", true)
          .order("name_en"),
        this.client
          .from("study_programs")
          .select("id, code, name_en, department_id")
          .eq("is_active", true)
          .order("name_en"),
        this.client
          .from("academic_years")
          .select("id, name, is_current")
          .order("start_date", { ascending: false }),
        this.client
          .from("classes")
          .select("id, name, academic_year_id, department_id, grade_level")
          .order("name"),
      ]);

    if (departments.error) throw new Error(departments.error.message);
    if (studyPrograms.error) throw new Error(studyPrograms.error.message);
    if (academicYears.error) throw new Error(academicYears.error.message);
    if (classes.error) throw new Error(classes.error.message);

    return {
      departments: departments.data ?? [],
      studyPrograms: studyPrograms.data ?? [],
      academicYears: academicYears.data ?? [],
      classes: classes.data ?? [],
    };
  }

  // ------------------------------------------------------------ departments
  async listDepartments(): Promise<Department[]> {
    const { data, error } = await this.client
      .from("departments")
      .select("*")
      .order("name_en");
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async createDepartment(input: DepartmentFormValues): Promise<Department> {
    const { data, error } = await this.client
      .from("departments")
      .insert({
        code: input.code,
        name_en: input.nameEn,
        name_km: input.nameKm ?? null,
        description: input.description ?? null,
        is_active: input.isActive,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505")
        throw new Error("A department with this code already exists");
      throw new Error(error.message);
    }
    return data;
  }

  async updateDepartment(
    id: string,
    input: DepartmentFormValues
  ): Promise<Department> {
    const { data, error } = await this.client
      .from("departments")
      .update({
        code: input.code,
        name_en: input.nameEn,
        name_km: input.nameKm ?? null,
        description: input.description ?? null,
        is_active: input.isActive,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505")
        throw new Error("A department with this code already exists");
      throw new Error(error.message);
    }
    return data;
  }

  async deleteDepartment(id: string): Promise<void> {
    const { error } = await this.client
      .from("departments")
      .delete()
      .eq("id", id);
    if (error) {
      if (error.code === "23503") {
        throw new Error(
          "This department has study programs, classes, teachers, or students and can't be deleted."
        );
      }
      throw new Error(error.message);
    }
  }

  // --------------------------------------------------------- study programs
  async listStudyPrograms(): Promise<StudyProgramListItem[]> {
    const { data, error } = await this.client
      .from("study_programs")
      .select(STUDY_PROGRAM_SELECT)
      .order("name_en");

    if (error) throw new Error(error.message);
    return (
      (data ?? []) as unknown as Array<
        StudyProgram & { departments: { name_en: string } | null }
      >
    ).map(({ departments, ...rest }) => ({
      ...rest,
      department_name: departments?.name_en ?? null,
    }));
  }

  // ---------------------------------------------------------- academic years
  async listAcademicYears(): Promise<AcademicYear[]> {
    const { data, error } = await this.client
      .from("academic_years")
      .select("*")
      .order("start_date", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async getCurrentAcademicYear(): Promise<AcademicYear | null> {
    const { data, error } = await this.client
      .from("academic_years")
      .select("*")
      .eq("is_current", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }

  async createAcademicYear(
    input: AcademicYearFormValues
  ): Promise<AcademicYear> {
    if (input.isCurrent) await this.clearCurrentAcademicYear();

    const { data, error } = await this.client
      .from("academic_years")
      .insert({
        name: input.name,
        start_date: input.startDate,
        end_date: input.endDate,
        is_current: input.isCurrent,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505")
        throw new Error("An academic year with this name already exists");
      throw new Error(error.message);
    }
    return data;
  }

  async updateAcademicYear(
    id: string,
    input: AcademicYearFormValues
  ): Promise<AcademicYear> {
    if (input.isCurrent) await this.clearCurrentAcademicYear(id);

    const { data, error } = await this.client
      .from("academic_years")
      .update({
        name: input.name,
        start_date: input.startDate,
        end_date: input.endDate,
        is_current: input.isCurrent,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  private async clearCurrentAcademicYear(exceptId?: string): Promise<void> {
    let query = this.client
      .from("academic_years")
      .update({ is_current: false })
      .eq("is_current", true);
    if (exceptId) query = query.neq("id", exceptId);
    await query;
  }

  async deleteAcademicYear(id: string): Promise<void> {
    const { error } = await this.client
      .from("academic_years")
      .delete()
      .eq("id", id);
    if (error) {
      if (error.code === "23503") {
        throw new Error(
          "This academic year has students or classes and can't be deleted."
        );
      }
      throw new Error(error.message);
    }
  }

  // ---------------------------------------------------------------- classes
  async listClasses(): Promise<ClassListItem[]> {
    const { data, error } = await this.client
      .from("classes")
      .select(CLASS_SELECT)
      .order("name");

    if (error) throw new Error(error.message);

    return (
      (data ?? []) as unknown as Array<
        SchoolClass & {
          academic_years: { name: string } | null;
          departments: { name_en: string } | null;
          study_programs: { name_en: string } | null;
        }
      >
    ).map(({ academic_years, departments, study_programs, ...rest }) => ({
      ...rest,
      academic_year_name: academic_years?.name ?? null,
      department_name: departments?.name_en ?? null,
      study_program_name: study_programs?.name_en ?? null,
    }));
  }

  async createClass(input: ClassFormValues): Promise<SchoolClass> {
    const { data, error } = await this.client
      .from("classes")
      .insert({
        name: input.name,
        academic_year_id: input.academicYearId,
        department_id: input.departmentId ?? null,
        study_program_id: input.studyProgramId ?? null,
        grade_level: input.gradeLevel ?? null,
        capacity: input.capacity ?? null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505")
        throw new Error(
          "A class with this name already exists for that academic year"
        );
      throw new Error(error.message);
    }
    return data;
  }

  async updateClass(id: string, input: ClassFormValues): Promise<SchoolClass> {
    const { data, error } = await this.client
      .from("classes")
      .update({
        name: input.name,
        academic_year_id: input.academicYearId,
        department_id: input.departmentId ?? null,
        study_program_id: input.studyProgramId ?? null,
        grade_level: input.gradeLevel ?? null,
        capacity: input.capacity ?? null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async deleteClass(id: string): Promise<void> {
    const { error } = await this.client.from("classes").delete().eq("id", id);
    if (error) {
      if (error.code === "23503") {
        throw new Error(
          "This class has students or attendance records and can't be deleted."
        );
      }
      throw new Error(error.message);
    }
  }

  /** Generates one class per section in a single insert — e.g. grade 7 +
   * sections "A,B,C" -> "7A", "7B", "7C" — instead of the admin filling out
   * the Add Class dialog N times. A single multi-row insert is atomic, so a
   * name collision fails the whole batch rather than creating half of it. */
  async bulkCreateClasses(input: {
    academicYearId: string;
    gradeLevel: number;
    namePrefix: string;
    sections: string[];
    departmentId?: string;
    studyProgramId?: string;
    capacity?: number;
  }): Promise<SchoolClass[]> {
    const rows = input.sections.map((section) => ({
      name: `${input.namePrefix}${section}`,
      academic_year_id: input.academicYearId,
      department_id: input.departmentId ?? null,
      study_program_id: input.studyProgramId ?? null,
      grade_level: input.gradeLevel,
      capacity: input.capacity ?? null,
    }));

    const { data, error } = await this.client
      .from("classes")
      .insert(rows)
      .select();

    if (error) {
      if (error.code === "23505")
        throw new Error(
          "One or more of these class names already exist for that academic year"
        );
      throw new Error(error.message);
    }
    return data ?? [];
  }

  /** Duplicates existing classes into a different academic year — e.g.
   * recreating this year's section structure for the next year — without
   * touching the source rows, which stay the historical record for whoever
   * was enrolled in them. Name/department/study program/capacity carry
   * over; only the academic year changes. */
  async copyClassesToYear(
    ids: string[],
    targetAcademicYearId: string
  ): Promise<SchoolClass[]> {
    const { data: source, error: selectError } = await this.client
      .from("classes")
      .select("name, department_id, study_program_id, grade_level, capacity")
      .in("id", ids);
    if (selectError) throw new Error(selectError.message);
    if (!source || source.length === 0) return [];

    const rows = source.map((c) => ({
      ...c,
      academic_year_id: targetAcademicYearId,
    }));

    const { data, error } = await this.client
      .from("classes")
      .insert(rows)
      .select();

    if (error) {
      if (error.code === "23505")
        throw new Error(
          "One or more of these classes already exist in the destination academic year"
        );
      throw new Error(error.message);
    }
    return data ?? [];
  }

  /** Bulk in-place department reassignment — safe to edit directly (unlike
   * academic year) since department isn't tied to a specific year's
   * historical roster. */
  async bulkSetDepartment(
    ids: string[],
    departmentId: string | null
  ): Promise<void> {
    const { error } = await this.client
      .from("classes")
      .update({ department_id: departmentId })
      .in("id", ids);
    if (error) throw new Error(error.message);
  }
}

export const academicsRepository = new AcademicsRepository();
