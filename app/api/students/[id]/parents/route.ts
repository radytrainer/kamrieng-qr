import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/rbac/api-guards";
import { STAFF_ROLES } from "@/lib/constants/roles";
import { parentRepository } from "@/features/students/services/parent-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiSession(STAFF_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const parents = await parentRepository.listByStudent(id);
  return NextResponse.json(parents);
}
