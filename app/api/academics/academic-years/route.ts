import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/rbac/api-guards";
import { STAFF_ROLES } from "@/lib/constants/roles";
import { academicsRepository } from "@/features/academics/services/academics-repository";

export async function GET() {
  const auth = await requireApiSession(STAFF_ROLES);
  if (auth instanceof NextResponse) return auth;

  const years = await academicsRepository.listAcademicYears();
  return NextResponse.json(years);
}
