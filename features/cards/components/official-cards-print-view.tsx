"use client";

import { useTranslations } from "next-intl";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OfficialStudentCard } from "@/features/cards/templates/official-student-card";
import type { OfficialCardStudent } from "@/features/students/types/student";
import type { SchoolSettings } from "@/features/settings/types/school-settings";

interface OfficialCardsPrintViewProps {
  students: { student: OfficialCardStudent; qrDataUrl: string }[];
  schoolSettings: SchoolSettings;
}

// Cards are 74mm x 92mm — sized so 2 rows of 3 (6 per sheet) fit within
// A4 landscape's ~190mm usable height after margins, with a few mm to
// spare for the row gap. Width-wise, 3 * 74mm + 2 * 3mm gaps = 228mm,
// comfortably inside the ~277mm usable width.
const PER_PAGE = 6;

export function OfficialCardsPrintView({
  students,
  schoolSettings,
}: OfficialCardsPrintViewProps) {
  const t = useTranslations("admin.cards.printView");
  const pages: (typeof students)[] = [];
  for (let i = 0; i < students.length; i += PER_PAGE) {
    pages.push(students.slice(i, i + PER_PAGE));
  }

  return (
    <>
      <div className="no-print flex flex-col items-center gap-2 py-6 text-center">
        <p className="text-muted-foreground text-sm">
          {t("summary", { count: students.length, pages: pages.length })}
        </p>
        <Button onClick={() => window.print()}>
          <Printer className="size-4" />
          {t("printSaveAsPdf")}
        </Button>
        <p className="text-muted-foreground max-w-md text-xs">
          {t("printHint")}
        </p>
      </div>

      {/* Deliberately NOT wrapped in a flex/grid parent — forced page breaks
       * (break-after: page) are unreliable on flex/grid children in
       * Chrome's print engine, which was collapsing every page onto one
       * shrunk sheet instead of paginating. Plain block children paginate
       * correctly. */}
      <div>
        {pages.map((page, pageIndex) => (
          <div
            key={pageIndex}
            className="mx-auto grid w-[228mm] grid-cols-3 place-items-center gap-[3mm]"
            style={
              pageIndex < pages.length - 1
                ? { breakAfter: "page", pageBreakAfter: "always" }
                : undefined
            }
          >
            {page.map(({ student, qrDataUrl }) => (
              <OfficialStudentCard
                key={student.id}
                student={student}
                qrDataUrl={qrDataUrl}
                schoolSettings={schoolSettings}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
