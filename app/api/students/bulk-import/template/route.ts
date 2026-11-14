import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/rbac/api-guards";
import { ADMIN_ROLES } from "@/lib/constants/roles";
import { generateImportTemplate } from "@/features/students/services/student-excel";

export async function GET() {
  const auth = await requireApiSession(ADMIN_ROLES);
  if (auth instanceof NextResponse) return auth;

  const buffer = await generateImportTemplate();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="student-import-template.xlsx"`,
    },
  });
}
