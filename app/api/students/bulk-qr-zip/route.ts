import { NextResponse, type NextRequest } from "next/server";
import JSZip from "jszip";
import { requireApiSession } from "@/lib/rbac/api-guards";
import { ADMIN_ROLES } from "@/lib/constants/roles";
import { studentRepository } from "@/features/students/services/student-repository";
import { generateStudentQrPng } from "@/features/qr/services/qr-generator";

/** Filesystem-unsafe characters stripped from the Khmer name before it's
 * used as a filename — zip tools disagree on Unicode normalization across
 * OSes, but the printable characters themselves round-trip fine. */
function sanitizeForFilename(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, "").trim();
}

export async function GET(request: NextRequest) {
  const auth = await requireApiSession(ADMIN_ROLES);
  if (auth instanceof NextResponse) return auth;

  const ids = request.nextUrl.searchParams.get("ids");
  const students = await studentRepository.listActiveForOfficialCard(
    ids ? { ids: ids.split(",").filter(Boolean) } : undefined
  );

  const zip = new JSZip();
  const usedNames = new Set<string>();

  await Promise.all(
    students.map(async (student) => {
      const png = await generateStudentQrPng(student.student_token, {
        size: 512,
      });
      const name = sanitizeForFilename(
        `${student.khmer_first_name}${student.khmer_last_name}`
      );
      let filename = `${name}-${student.student_code}-qr.png`;
      // Guard against two students producing the same filename.
      let suffix = 2;
      while (usedNames.has(filename)) {
        filename = `${name}-${student.student_code}-qr-${suffix}.png`;
        suffix += 1;
      }
      usedNames.add(filename);
      zip.file(filename, png);
    })
  );

  const buffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="student-qr-codes.zip"`,
    },
  });
}
