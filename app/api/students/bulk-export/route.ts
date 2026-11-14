import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireApiSession } from "@/lib/rbac/api-guards";
import { ADMIN_ROLES } from "@/lib/constants/roles";
import { studentRepository } from "@/features/students/services/student-repository";
import { generateStudentsWorkbook } from "@/features/students/services/student-excel";

const querySchema = z.object({
  search: z.string().trim().optional(),
  classId: z.string().optional(),
  gradeLevel: z.coerce.number().int().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(ADMIN_ROLES);
  if (auth instanceof NextResponse) return auth;

  const ids = request.nextUrl.searchParams.get("ids");
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(params);
  const filters = {
    ...(parsed.success ? parsed.data : {}),
    ids: ids ? ids.split(",").filter(Boolean) : undefined,
  };

  const students = await studentRepository.getAllForExport(filters);
  const buffer = await generateStudentsWorkbook(students);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="students-export-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}
