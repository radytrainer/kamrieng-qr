import { NextResponse, type NextRequest } from "next/server";
import { requireApiSession } from "@/lib/rbac/api-guards";
import { STAFF_ROLES } from "@/lib/constants/roles";
import { studentRepository } from "@/features/students/services/student-repository";
import {
  generateStudentQrPng,
  generateStudentQrSvg,
} from "@/features/qr/services/qr-generator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiSession(STAFF_ROLES);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const student = await studentRepository.getById(id);
  if (!student) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const format =
    request.nextUrl.searchParams.get("format") === "svg" ? "svg" : "png";
  const size = Number(request.nextUrl.searchParams.get("size") ?? 512);
  const download = request.nextUrl.searchParams.get("download") === "1";
  const filename = `${student.student_code}-qr.${format}`;

  const disposition = download
    ? `attachment; filename="${filename}"`
    : "inline";

  if (format === "svg") {
    const svg = await generateStudentQrSvg(student.student_token, { size });
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": disposition,
        "Cache-Control": "private, max-age=60",
      },
    });
  }

  const png = await generateStudentQrPng(student.student_token, { size });
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": disposition,
      "Cache-Control": "private, max-age=60",
    },
  });
}
