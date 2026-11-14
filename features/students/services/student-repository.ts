import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { earliestDate, isPastDate, todayIso } from "@/lib/utils/date";
import { STUDENT_STATUS } from "@/lib/constants/student-status";
import { isCardExpired } from "@/features/students/utils/card-status";
import type { StudentFormValues } from "@/features/students/schemas/student-schema";
import type {
  OfficialCardStudent,
  StudentInsert,
  StudentListItem,
  StudentListResult,
  StudentRow,
  StudentUpdate,
} from "@/features/students/types/student";

const LIST_SELECT_BASE = `
  *,
  departments ( name_en ),
  study_programs ( name_en ),
  academic_years ( name, end_date )
` as const;

/** Of the student's own academic year and their class's, picks whichever
 * ends first — so the card's displayed year name always matches the one
 * that's actually governing its expiry, instead of the two disagreeing. */
function pickGoverningAcademicYear(
  ...years: Array<{ name: string; end_date: string } | null | undefined>
): { name: string | null; end_date: string | null } {
  const endDate = earliestDate(...years.map((y) => y?.end_date));
  const match = years.find((y) => y?.end_date === endDate);
  return { name: match?.name ?? null, end_date: endDate };
}

// PostgREST only lets a filter on an embedded resource (classes.grade_level)
// restrict the parent rows when the embed is an inner join — a left-joined
// "classes ( ... )" embed can't be filtered that way. list() swaps to the
// `!inner` form only when a gradeLevel filter is actually supplied, so
// students without a class still show up in the unfiltered case.
//
// Classes carry their own academic_years.end_date (nested) — combined with
// the student's own academic_years FK above via earliestDate() below, so a
// card is expired once EITHER one has lapsed, whichever comes first.
function classesEmbed(inner: boolean): string {
  const fields = "name, grade_level, academic_years ( end_date )";
  return inner ? `classes!inner ( ${fields} )` : `classes ( ${fields} )`;
}

const LIST_SELECT = `${LIST_SELECT_BASE}, ${classesEmbed(false)}` as const;

// Used by list() (internal admin table) and getPublicProfileByToken() (the
// public QR verification page) — both need full parent contact details.
const LIST_SELECT_WITH_PARENTS = `
  ${LIST_SELECT},
  student_parents ( parents ( relationship, khmer_name, english_name, phone, occupation ) )
` as const;

type StudentJoinedRow = StudentRow & {
  departments: { name_en: string } | null;
  study_programs: { name_en: string } | null;
  classes: {
    name: string;
    grade_level: number | null;
    academic_years: { end_date: string } | null;
  } | null;
  academic_years: { name: string; end_date: string } | null;
  student_parents?: {
    parents: {
      relationship: string;
      khmer_name: string | null;
      english_name: string;
      phone: string | null;
      occupation: string | null;
    } | null;
  }[];
};

function toListItem(row: StudentJoinedRow): StudentListItem {
  const {
    departments,
    study_programs,
    classes,
    academic_years,
    student_parents,
    ...student
  } = row;
  const parents = student_parents?.map((sp) => sp.parents) ?? [];
  const father = parents.find((p) => p?.relationship === "father");
  const mother = parents.find((p) => p?.relationship === "mother");
  return {
    ...student,
    department_name: departments?.name_en ?? null,
    study_program_name: study_programs?.name_en ?? null,
    class_name: classes?.name ?? null,
    academic_year_name: academic_years?.name ?? null,
    academic_year_end_date: earliestDate(
      classes?.academic_years?.end_date,
      academic_years?.end_date
    ),
    father_name: father?.khmer_name || father?.english_name || null,
    father_phone: father?.phone ?? null,
    father_job: father?.occupation ?? null,
    mother_name: mother?.khmer_name || mother?.english_name || null,
    mother_phone: mother?.phone ?? null,
    mother_job: mother?.occupation ?? null,
  };
}

export interface StudentListFilters {
  search?: string;
  status?: string;
  departmentId?: string;
  classId?: string;
  academicYearId?: string;
  gradeLevel?: number;
  page: number;
  pageSize: number;
}

function formToInsert(input: StudentFormValues): StudentInsert {
  return {
    // Omitted entirely (stays undefined) when blank, so the DB's
    // generate_student_code() default assigns one instead.
    student_code: input.studentCode,
    khmer_first_name: input.khmerFirstName,
    khmer_last_name: input.khmerLastName,
    english_first_name: input.englishFirstName,
    english_last_name: input.englishLastName,
    gender: input.gender,
    date_of_birth: input.dateOfBirth,
    place_of_birth: input.placeOfBirth ?? null,
    nationality: input.nationality,
    phone: input.phone ?? null,
    email: input.email ?? null,
    address: input.address ?? null,
    province: input.province ?? null,
    district: input.district ?? null,
    commune: input.commune ?? null,
    village: input.village ?? null,
    department_id: input.departmentId ?? null,
    study_program_id: input.studyProgramId ?? null,
    class_id: input.classId ?? null,
    academic_year_id: input.academicYearId ?? null,
    study_year: input.studyYear ?? null,
    semester: input.semester ?? null,
    gpa: input.gpa ?? null,
    credits_earned: input.creditsEarned,
    status: input.status,
    issue_date: input.issueDate ?? null,
    expiry_date: input.expiryDate ?? null,
    photo_url: input.photoUrl ?? null,
  };
}

export class StudentRepository {
  private get client() {
    return createAdminClient();
  }

  async list(filters: StudentListFilters): Promise<StudentListResult> {
    const {
      search,
      status,
      departmentId,
      classId,
      academicYearId,
      gradeLevel,
      page,
      pageSize,
    } = filters;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const select =
      gradeLevel !== undefined
        ? `${LIST_SELECT_BASE}, ${classesEmbed(true)}, student_parents ( parents ( relationship, khmer_name, english_name, phone, occupation ) )`
        : LIST_SELECT_WITH_PARENTS;

    let query = this.client
      .from("students")
      .select(select, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) {
      const term = search.trim().replace(/[%,]/g, "");
      query = query.or(
        `english_first_name.ilike.%${term}%,english_last_name.ilike.%${term}%,khmer_first_name.ilike.%${term}%,khmer_last_name.ilike.%${term}%,student_code.ilike.%${term}%`
      );
    }
    if (status) query = query.eq("status", status);
    if (departmentId) query = query.eq("department_id", departmentId);
    if (classId) query = query.eq("class_id", classId);
    if (academicYearId) query = query.eq("academic_year_id", academicYearId);
    if (gradeLevel !== undefined)
      query = query.eq("classes.grade_level", gradeLevel);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      items: ((data ?? []) as unknown as StudentJoinedRow[]).map(toListItem),
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  async getById(id: string): Promise<StudentListItem | null> {
    const { data, error } = await this.client
      .from("students")
      .select(LIST_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? toListItem(data as unknown as StudentJoinedRow) : null;
  }

  async getByToken(token: string): Promise<StudentRow | null> {
    const { data, error } = await this.client
      .from("students")
      .select("*")
      .eq("student_token", token)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  /** Joined variant for the public verification page — needs class name
   * plus full parent contact details (the QR scan result shows both). */
  async getPublicProfileByToken(
    token: string
  ): Promise<StudentListItem | null> {
    const { data, error } = await this.client
      .from("students")
      .select(LIST_SELECT_WITH_PARENTS)
      .eq("student_token", token)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? toListItem(data as unknown as StudentJoinedRow) : null;
  }

  async getByCode(studentCode: string): Promise<StudentRow | null> {
    const { data, error } = await this.client
      .from("students")
      .select("*")
      .eq("student_code", studentCode)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  async create(input: StudentFormValues): Promise<StudentRow> {
    const { data, error } = await this.client
      .from("students")
      .insert(formToInsert(input))
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, input: StudentFormValues): Promise<StudentRow> {
    const { data, error } = await this.client
      .from("students")
      .update(formToInsert(input))
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async setStatus(id: string, status: string): Promise<StudentRow> {
    const update: StudentUpdate = { status };
    const { data, error } = await this.client
      .from("students")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /** Bulk status change (e.g. "deactivate this whole grade") — only touches
   * currently-active students, since transitioning an already-inactive or
   * graduated student isn't the intent of a bulk deactivate action. Selects
   * matching IDs first, then updates by `.in("id", ids)` rather than
   * filtering the UPDATE directly by the embedded classes.grade_level
   * column — `!inner`-embed filtering is verified to work for SELECT, but
   * its behavior on UPDATE/PATCH isn't something to gamble a bulk status
   * change on. Returns how many rows were updated. */
  async setStatusByFilter(
    filters: { search?: string; classId?: string; gradeLevel?: number },
    status: string
  ): Promise<number> {
    let idQuery = this.client
      .from("students")
      .select(`id, ${classesEmbed(filters.gradeLevel !== undefined)}`)
      .eq("status", STUDENT_STATUS.ACTIVE);

    if (filters.search) {
      const term = filters.search.trim().replace(/[%,]/g, "");
      idQuery = idQuery.or(
        `english_first_name.ilike.%${term}%,english_last_name.ilike.%${term}%,khmer_first_name.ilike.%${term}%,khmer_last_name.ilike.%${term}%,student_code.ilike.%${term}%`
      );
    }
    if (filters.classId) idQuery = idQuery.eq("class_id", filters.classId);
    if (filters.gradeLevel !== undefined) {
      idQuery = idQuery.eq("classes.grade_level", filters.gradeLevel);
    }

    const { data: matches, error: selectError } = await idQuery;
    if (selectError) throw new Error(selectError.message);

    const ids = ((matches ?? []) as unknown as { id: string }[]).map(
      (row) => row.id
    );
    if (ids.length === 0) return 0;

    const { error: updateError } = await this.client
      .from("students")
      .update({ status })
      .in("id", ids);

    if (updateError) throw new Error(updateError.message);
    return ids.length;
  }

  /** IDs of active students whose card is currently expired — own expiry_date
   * past, or the governing academic year (class's or their own, whichever
   * ends first) has lapsed. Same rule as isCardExpired()/the status badge,
   * just resolved across a filtered set instead of one student. Used to
   * find the "everyone whose card just expired" population for bulk
   * renewal, without requiring the admin to check every box by hand. */
  async findActiveExpiredIds(filters: {
    search?: string;
    classId?: string;
    gradeLevel?: number;
  }): Promise<string[]> {
    let query = this.client
      .from("students")
      .select(
        `id, expiry_date, status, ${classesEmbed(filters.gradeLevel !== undefined)}, academic_years ( end_date )`
      )
      .eq("status", STUDENT_STATUS.ACTIVE);

    if (filters.search) {
      const term = filters.search.trim().replace(/[%,]/g, "");
      query = query.or(
        `english_first_name.ilike.%${term}%,english_last_name.ilike.%${term}%,khmer_first_name.ilike.%${term}%,khmer_last_name.ilike.%${term}%,student_code.ilike.%${term}%`
      );
    }
    if (filters.classId) query = query.eq("class_id", filters.classId);
    if (filters.gradeLevel !== undefined) {
      query = query.eq("classes.grade_level", filters.gradeLevel);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    type Row = {
      id: string;
      expiry_date: string | null;
      status: string;
      classes: { academic_years: { end_date: string } | null } | null;
      academic_years: { end_date: string } | null;
    };

    return ((data ?? []) as unknown as Row[])
      .filter((row) =>
        isCardExpired({
          status: row.status,
          expiry_date: row.expiry_date,
          academic_year_end_date: earliestDate(
            row.classes?.academic_years?.end_date,
            row.academic_years?.end_date
          ),
        })
      )
      .map((row) => row.id);
  }

  /** Reassigns a batch of students to a new class/academic year in one go —
   * e.g. promoting "Grade 7A" into "Grade 8A" and "Grade 8B" at year-end, or
   * clearing the backlog of expired cards once a new academic year starts.
   * Always resets issue_date/expiry_date so the card's validity is governed
   * purely by the new (unexpired) academic year — leaving a stale manual
   * expiry_date behind would otherwise keep the card showing "Expired" even
   * after the class/year change. `classId: null` unassigns the class,
   * leaving academicYearId as the sole source of the governing year.
   * `regenerateQr` additionally issues a fresh QR token per student, so the
   * old printed card's QR — likely still floating around — stops verifying. */
  async bulkMoveClass(
    ids: string[],
    input: {
      classId: string | null;
      academicYearId: string;
      regenerateQr: boolean;
    }
  ): Promise<void> {
    const { error } = await this.client
      .from("students")
      .update({
        class_id: input.classId,
        academic_year_id: input.academicYearId,
        issue_date: todayIso(),
        expiry_date: null,
      })
      .in("id", ids);
    if (error) throw new Error(error.message);

    if (input.regenerateQr) {
      await Promise.all(ids.map((id) => this.regenerateToken(id)));
    }
  }

  /** Issues a fresh QR token (e.g. lost/compromised card) and invalidates the old one. */
  async regenerateToken(id: string): Promise<StudentRow> {
    const { data: tokenResult, error: tokenError } = await this.client.rpc(
      "generate_student_token"
    );
    if (tokenError) throw new Error(tokenError.message);

    const { data, error } = await this.client
      .from("students")
      .update({ student_token: tokenResult })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from("students").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  /** Bulk delete (e.g. clearing out a graduated cohort at year-end). Deletes
   * whatever's passed in regardless of status — unlike setStatusByFilter,
   * this isn't restricted to active students since old/inactive records are
   * exactly what year-end cleanup targets. */
  async deleteMany(ids: string[]): Promise<void> {
    const { error } = await this.client.from("students").delete().in("id", ids);
    if (error) throw new Error(error.message);
  }

  /** Export filters are deliberately narrow — name, class, or generation —
   * matching the picker in the Export dialog. Uses the *ForOfficialCard-style
   * parents embed so father/mother columns (part of the shared import/export
   * template) are actually populated, unlike the plain LIST_SELECT used by
   * list(). `ids`, when given, overrides search/classId/gradeLevel entirely —
   * it's an explicit checkbox selection from the students table, so it
   * should export exactly those students (any status) regardless of
   * whatever filter is currently set, same convention as
   * listActiveForOfficialCard()'s `ids` override. */
  async getAllForExport(filters: {
    ids?: string[];
    search?: string;
    classId?: string;
    gradeLevel?: number;
  }) {
    const select =
      !filters.ids && filters.gradeLevel !== undefined
        ? `${LIST_SELECT_BASE}, ${classesEmbed(true)}, student_parents ( parents ( relationship, khmer_name, english_name, phone, occupation ) )`
        : LIST_SELECT_WITH_PARENTS;

    let query = this.client
      .from("students")
      .select(select)
      .order("student_code", { ascending: true });

    if (filters.ids) {
      query = query.in("id", filters.ids);
    } else {
      if (filters.search) {
        const term = filters.search.trim().replace(/[%,]/g, "");
        query = query.or(
          `english_first_name.ilike.%${term}%,english_last_name.ilike.%${term}%,khmer_first_name.ilike.%${term}%,khmer_last_name.ilike.%${term}%,student_code.ilike.%${term}%`
        );
      }
      if (filters.classId) query = query.eq("class_id", filters.classId);
      if (filters.gradeLevel !== undefined) {
        query = query.eq("classes.grade_level", filters.gradeLevel);
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown as StudentJoinedRow[]).map(toListItem);
  }

  /** Every active student, with the class/parent names the official card
   * template needs (father/mother name come from the linked parents, not
   * columns on students itself). Used for the bulk print-all / QR-zip runs —
   * `filters` lets print-all narrow the run down (by class, generation, or
   * a name/code search) instead of always printing every active student.
   * `ids`, when given, overrides search/classId/gradeLevel entirely — it's
   * an explicit checkbox selection from the cards table, so it should print
   * exactly those students regardless of whatever filter is currently set. */
  async listActiveForOfficialCard(filters?: {
    ids?: string[];
    search?: string;
    classId?: string;
    gradeLevel?: number;
  }): Promise<OfficialCardStudent[]> {
    const classesEmbedWithYear =
      filters?.gradeLevel !== undefined
        ? "classes!inner ( name, grade_level, academic_years ( name, end_date ) )"
        : "classes ( name, grade_level, academic_years ( name, end_date ) )";

    let query = this.client
      .from("students")
      .select(
        `
          id, student_code, student_token, khmer_first_name, khmer_last_name,
          gender, date_of_birth, address, phone, photo_url, status, expiry_date,
          academic_years ( name, end_date ),
          ${classesEmbedWithYear},
          student_parents ( parents ( relationship, khmer_name, english_name ) )
        `
      )
      .eq("status", STUDENT_STATUS.ACTIVE)
      .order("khmer_first_name", { ascending: true });

    if (filters?.ids) {
      query = query.in("id", filters.ids);
    } else {
      if (filters?.search) {
        const term = filters.search.trim().replace(/[%,]/g, "");
        query = query.or(
          `english_first_name.ilike.%${term}%,english_last_name.ilike.%${term}%,khmer_first_name.ilike.%${term}%,khmer_last_name.ilike.%${term}%,student_code.ilike.%${term}%`
        );
      }
      if (filters?.classId) query = query.eq("class_id", filters.classId);
      if (filters?.gradeLevel !== undefined)
        query = query.eq("classes.grade_level", filters.gradeLevel);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    type Row = {
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
      academic_years: { name: string; end_date: string } | null;
      classes: {
        name: string;
        academic_years: { name: string; end_date: string } | null;
      } | null;
      student_parents: {
        parents: {
          relationship: string;
          khmer_name: string | null;
          english_name: string;
        } | null;
      }[];
    };

    return ((data ?? []) as unknown as Row[])
      .map((row) => {
        const parents = row.student_parents?.map((sp) => sp.parents) ?? [];
        const father = parents.find((p) => p?.relationship === "father");
        const mother = parents.find((p) => p?.relationship === "mother");
        const governingYear = pickGoverningAcademicYear(
          row.classes?.academic_years,
          row.academic_years
        );
        return {
          id: row.id,
          student_code: row.student_code,
          student_token: row.student_token,
          khmer_first_name: row.khmer_first_name,
          khmer_last_name: row.khmer_last_name,
          gender: row.gender,
          date_of_birth: row.date_of_birth,
          address: row.address,
          phone: row.phone,
          photo_url: row.photo_url,
          status: row.status,
          expiry_date: row.expiry_date,
          class_name: row.classes?.name ?? null,
          academic_year_name: governingYear.name,
          academic_year_end_date: governingYear.end_date,
          father_name: father?.khmer_name || father?.english_name || null,
          mother_name: mother?.khmer_name || mother?.english_name || null,
        };
      })
      .filter((student) => !isPastDate(student.academic_year_end_date));
  }

  /** Single-student variant of listActiveForOfficialCard(), for the
   * individual "Download Card" action — any status, not just active. */
  async getOfficialCardById(id: string): Promise<OfficialCardStudent | null> {
    const { data, error } = await this.client
      .from("students")
      .select(
        `
          id, student_code, student_token, khmer_first_name, khmer_last_name,
          gender, date_of_birth, address, phone, photo_url, status, expiry_date,
          academic_years ( name, end_date ),
          classes ( name, academic_years ( name, end_date ) ),
          student_parents ( parents ( relationship, khmer_name, english_name ) )
        `
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;

    type Row = {
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
      academic_years: { name: string; end_date: string } | null;
      classes: {
        name: string;
        academic_years: { name: string; end_date: string } | null;
      } | null;
      student_parents: {
        parents: {
          relationship: string;
          khmer_name: string | null;
          english_name: string;
        } | null;
      }[];
    };

    const row = data as unknown as Row;
    const parents = row.student_parents?.map((sp) => sp.parents) ?? [];
    const father = parents.find((p) => p?.relationship === "father");
    const mother = parents.find((p) => p?.relationship === "mother");
    const governingYear = pickGoverningAcademicYear(
      row.classes?.academic_years,
      row.academic_years
    );

    return {
      id: row.id,
      student_code: row.student_code,
      student_token: row.student_token,
      khmer_first_name: row.khmer_first_name,
      khmer_last_name: row.khmer_last_name,
      gender: row.gender,
      date_of_birth: row.date_of_birth,
      address: row.address,
      phone: row.phone,
      photo_url: row.photo_url,
      status: row.status,
      expiry_date: row.expiry_date,
      class_name: row.classes?.name ?? null,
      academic_year_name: governingYear.name,
      academic_year_end_date: governingYear.end_date,
      father_name: father?.khmer_name || father?.english_name || null,
      mother_name: mother?.khmer_name || mother?.english_name || null,
    };
  }
}

export const studentRepository = new StudentRepository();
