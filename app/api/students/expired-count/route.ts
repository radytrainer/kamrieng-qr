import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireApiSession } from "@/lib/rbac/api-guards";
import { STAFF_ROLES } from "@/lib/constants/roles";
import { studentRepository } from "@/features/students/services/student-repository";

const querySchema = z.object({
  search: z.string().trim().optional(),
  classId: z.string().optional(),
  gradeLevel: z.coerce.number().int().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(STAFF_ROLES);
  if (auth instanceof NextResponse) return auth;

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 }
    );
  }

  const ids = await studentRepository.findActiveExpiredIds(parsed.data);
  return NextResponse.json({ count: ids.length });
}
