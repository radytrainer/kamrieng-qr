import { NextResponse, type NextRequest } from "next/server";
import { requireApiSession } from "@/lib/rbac/api-guards";
import { STAFF_ROLES } from "@/lib/constants/roles";
import { studentFilterSchema } from "@/features/students/schemas/student-schema";
import { studentRepository } from "@/features/students/services/student-repository";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(STAFF_ROLES);
  if (auth instanceof NextResponse) return auth;

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = studentFilterSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 }
    );
  }

  const {
    search,
    status,
    departmentId,
    classId,
    academicYearId,
    gradeLevel,
    page,
    pageSize,
  } = parsed.data;

  const result = await studentRepository.list({
    search,
    status,
    departmentId,
    classId,
    academicYearId,
    gradeLevel,
    page,
    pageSize,
  });

  return NextResponse.json(result);
}
