import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/rbac/api-guards";
import { STAFF_ROLES } from "@/lib/constants/roles";
import { studentRepository } from "@/features/students/services/student-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiSession(STAFF_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const student = await studentRepository.getById(id);
  if (!student) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(student);
}
