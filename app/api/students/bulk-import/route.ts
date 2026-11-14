import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireApiSession } from "@/lib/rbac/api-guards";
import { ADMIN_ROLES } from "@/lib/constants/roles";
import { logActivity } from "@/lib/repositories/activity-log-repository";
import { DASHBOARD_CACHE_TAG } from "@/features/dashboard/services/dashboard-repository";
import { academicsRepository } from "@/features/academics/services/academics-repository";
import { studentRepository } from "@/features/students/services/student-repository";
import { createParentsForStudent } from "@/features/students/services/student-parent-helpers";
import { parseImportFile } from "@/features/students/services/student-excel";
import {
  createStudentFormSchema,
  type StudentFormInput,
} from "@/features/students/schemas/student-schema";
import { parseGender } from "@/lib/utils/student-name";

interface ImportError {
  row: number;
  message: string;
}

export async function POST(request: NextRequest) {
  const auth = await requireApiSession(ADMIN_ROLES);
  if (auth instanceof NextResponse) return auth;
  const session = auth;
  const studentFormSchema = createStudentFormSchema(
    await getTranslations("validation")
  );

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const rows = await parseImportFile(buffer);
  const options = await academicsRepository.getOptions();

  const currentAcademicYearId =
    options.academicYears.find((y) => y.is_current)?.id ??
    options.academicYears[0]?.id;

  // Classes referenced by name that don't exist yet (e.g. "7A") are created
  // on the fly — the source spreadsheet uses grade-level labels that predate
  // this app's class list. Cached so repeated names in the file only create
  // the class once.
  const classByName = new Map(
    options.classes.map((c) => [c.name.toLowerCase(), c.id])
  );

  async function resolveClassId(
    className: string | undefined
  ): Promise<string | undefined> {
    if (!className) return undefined;
    const key = className.trim().toLowerCase();
    if (!key) return undefined;
    const existing = classByName.get(key);
    if (existing) return existing;
    if (!currentAcademicYearId) return undefined;

    const gradeMatch = className.match(/^(\d+)/);
    const created = await academicsRepository.createClass({
      name: className.trim(),
      academicYearId: currentAcademicYearId,
      departmentId: undefined,
      studyProgramId: undefined,
      gradeLevel: gradeMatch ? Number(gradeMatch[1]) : undefined,
    });
    classByName.set(key, created.id);
    return created.id;
  }

  const errors: ImportError[] = [];
  let inserted = 0;

  for (const row of rows) {
    try {
      const classId = await resolveClassId(row.class);

      const candidate: StudentFormInput = {
        studentCode: row.studentId,
        name: row.name ?? "",
        gender: parseGender(row.sex),
        dateOfBirth: row.dateOfBirth ?? "",
        phone: row.phone,
        address: row.address,
        classId,
        fatherName: row.fatherName,
        fatherPhone: row.fatherPhone,
        fatherJob: row.fatherJob,
        motherName: row.motherName,
        motherPhone: row.motherPhone,
        motherJob: row.motherJob,
      };

      const parsed = studentFormSchema.safeParse(candidate);
      if (!parsed.success) {
        errors.push({
          row: row.rowNumber,
          message: parsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
        });
        continue;
      }

      const student = await studentRepository.create(parsed.data);
      await createParentsForStudent(student.id, parsed.data);
      inserted += 1;
    } catch (error) {
      errors.push({
        row: row.rowNumber,
        message:
          error instanceof Error ? error.message : "Failed to import row",
      });
    }
  }

  await logActivity({
    userId: session.userId,
    action: "student.bulk_imported",
    entityType: "student",
    metadata: { inserted, failed: errors.length },
  });

  if (inserted > 0) revalidateTag(DASHBOARD_CACHE_TAG);

  return NextResponse.json({ inserted, failed: errors.length, errors });
}
