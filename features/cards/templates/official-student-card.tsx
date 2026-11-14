import Image from "next/image";
import { format } from "date-fns";
import { User } from "lucide-react";
import { SCHOOL_INFO } from "@/lib/constants/school";
import type { OfficialCardStudent } from "@/features/students/types/student";
import type { SchoolSettings } from "@/features/settings/types/school-settings";

const GENDER_LABEL: Record<string, string> = {
  male: "ប្រុស",
  female: "ស្រី",
  other: "ផ្សេងៗ",
};

const CARD_BORDER_COLOR = "#4472C4";

function formatDob(value: string): string {
  try {
    return format(new Date(value), "dd/MM/yyyy");
  } catch {
    return value;
  }
}

interface OfficialStudentCardProps {
  student: OfficialCardStudent;
  qrDataUrl: string;
  schoolSettings: SchoolSettings;
}

/** Ministry of Education, Youth and Sport style student identity
 * certificate — a paper document (not a plastic CR80 card), printed 6-up
 * on A4 landscape and cut out. Principal's signature is pre-printed from
 * /logo/Signature.png above the signature line.
 *
 * Sized 74mm x 92mm — wider than a standard CR80 card because the original
 * 62mm width left Khmer text cramped/truncated, but trimmed back down from
 * an initial 82mm after a physical print test came out larger than the
 * school's card holder/frame. A4 landscape's ~277mm usable width (after
 * 10mm page margins) has plenty of room for 3 columns at this width
 * (74*3 + 2*3mm gaps = 228mm) without dropping the 6-up layout in
 * OfficialCardsPrintView.
 *
 * Height is deliberately capped at 92mm: two rows plus the 3mm row gap
 * must stay under the ~190mm usable A4 landscape height (210mm - 2*10mm
 * page margins). Going even a couple mm over that (tried 93mm, then
 * 94.6mm) made Chrome's print engine mis-paginate the 6-card grid —
 * splitting a page mid-row and inserting a blank page — instead of just
 * printing slightly into the margin. Keep a real few mm of slack here;
 * don't raise this without a physical (or "Save as PDF") print test. */
export function OfficialStudentCard({
  student,
  qrDataUrl,
  schoolSettings,
}: OfficialStudentCardProps) {
  const fullName = `${student.khmer_first_name} ${student.khmer_last_name}`;

  return (
    <div
      className="relative flex h-[92mm] w-[74mm] flex-col overflow-hidden rounded-[3mm] border-[0.4mm] bg-white p-[2.5mm] text-slate-900"
      style={{ borderColor: CARD_BORDER_COLOR }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local trusted SVG; next/image refuses to optimize SVG without dangerouslyAllowSVG */}
      <img
        src="/logo/moeys.svg"
        alt=""
        className="pointer-events-none absolute inset-0 m-auto size-[52mm] object-contain opacity-[0.22] blur-[0.6px] saturate-75"
      />

      <div className="relative flex items-start justify-between gap-[1.5mm]">
        <div className="flex flex-col items-center gap-[0.6mm]">
          {/* eslint-disable-next-line @next/next/no-img-element -- local trusted SVG; next/image refuses to optimize SVG without dangerouslyAllowSVG */}
          <img src="/logo/moeys.svg" alt="" className="h-[9mm] w-[7mm]" />
          <div className="font-khmer-card text-[2.1mm] leading-tight">
            <p>ក្រសួងអប់រំ យុវជន និងកីឡា</p>
            <p>មន្ទីរអប់រំ យុវជន និងកីឡាខេត្តបាត់ដំបង</p>
            <p className="font-semibold">{SCHOOL_INFO.khmerName}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-[1mm]">
          <div className="font-khmer-header text-right leading-tight">
            <p className="text-[2.4mm]">ព្រះរាជាណាចក្រកម្ពុជា</p>
            <p className="text-[1.8mm]">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
          </div>
          <div className="flex size-[15mm] shrink-0 items-center justify-center rounded-[1mm] bg-white p-[0.4mm] shadow-sm ring-[0.2mm] ring-slate-300">
            {/* eslint-disable-next-line @next/next/no-img-element -- data: URL, next/image cannot optimize it */}
            <img
              src={qrDataUrl}
              alt="Student QR code"
              className="size-full object-contain"
            />
          </div>
        </div>
      </div>

      <div className="relative mt-[1mm] text-center">
        <p className="font-khmer-card text-[3.8mm] font-bold text-amber-600">
          បណ្ណសម្គាល់ខ្លួនសិស្ស
        </p>
        <p className="font-khmer-card text-[2.5mm] text-slate-600">
          ឆ្នាំសិក្សា {student.academic_year_name ?? "—"}
        </p>
      </div>

      <div className="font-khmer-card relative mt-[1mm] flex flex-1 flex-col gap-[1.3mm] text-[2.9mm] leading-tight">
        <div className="flex gap-[1.5mm]">
          <p className="min-w-0 flex-[2] truncate">
            <span className="text-slate-500">គោត្តនាម និងនាម:</span> {fullName}
          </p>
          <p className="min-w-0 flex-1 truncate">
            <span className="text-slate-500">ភេទ:</span>{" "}
            {GENDER_LABEL[student.gender] ?? student.gender}
          </p>
        </div>
        <div className="flex gap-[1.5mm]">
          <p className="min-w-0 flex-[2] truncate">
            <span className="text-slate-500">ថ្ងៃខែឆ្នាំកំណើត:</span>{" "}
            {formatDob(student.date_of_birth)}
          </p>
          <p className="min-w-0 flex-1 truncate">
            <span className="text-slate-500">ថ្នាក់ទី:</span>{" "}
            {student.class_name ?? "—"}
          </p>
        </div>
        <p className="truncate">
          <span className="text-slate-500">អាសយដ្ឋាន:</span>{" "}
          {student.address ?? "—"}
        </p>
        <div className="flex gap-[1.5mm]">
          <p className="min-w-0 flex-1 truncate">
            <span className="text-slate-500">លេខទូរស័ព្ទ:</span>{" "}
            {student.phone ?? "—"}
          </p>
          <p className="min-w-0 flex-1 truncate">
            <span className="text-slate-500">ឈ្មោះឪពុក:</span>{" "}
            {student.father_name ?? "—"}
          </p>
        </div>
        <div className="flex gap-[1.5mm]">
          <p className="min-w-0 flex-1 truncate">
            <span className="text-slate-500">អត្តលេខ:</span>{" "}
            {student.student_code}
          </p>
          <p className="min-w-0 flex-1 truncate">
            <span className="text-slate-500">ឈ្មោះម្តាយ:</span>{" "}
            {student.mother_name ?? "—"}
          </p>
        </div>
      </div>

      <div className="relative mt-[0.7mm] flex items-stretch justify-between gap-[2mm]">
        {/* Photo box — always exactly 28mm x 22mm on every card (photo or
         * empty placeholder alike), no auto-sizing. object-cover fills the
         * box completely (cropping slightly if the photo isn't exactly
         * this ratio) so there's never a blank gap inside the frame. */}
        <div
          className="flex h-[28mm] w-[22mm] shrink-0 items-center justify-center overflow-hidden rounded-[1mm] border-[0.3mm] bg-white"
          style={{ borderColor: CARD_BORDER_COLOR }}
        >
          {student.photo_url ? (
            <Image
              src={student.photo_url}
              alt=""
              width={200}
              height={300}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-[0.8mm] text-slate-400">
              <User className="size-[6.5mm]" />
              <span className="font-khmer-card text-[2.6mm]">រូបថត</span>
            </div>
          )}
        </div>
        <div className="font-khmer-card flex flex-1 flex-col items-end justify-end text-right text-[2.1mm] leading-tight">
          <div>
            <p>{schoolSettings.cardIssueBuddhistLine}</p>
            <p>{schoolSettings.cardIssueGregorianLine}</p>
            <p className="mt-[0.5mm] text-[2.5mm] font-bold">នាយកវិទ្យាល័យ</p>
          </div>
          <div className="mt-[0.5mm] flex flex-col items-center gap-[0.3mm]">
            {/* eslint-disable-next-line @next/next/no-img-element -- local trusted PNG; must render reliably in print without next/image lazy-loading */}
            <img
              src="/logo/Signature.png"
              alt=""
              className="h-[11.5mm] w-auto object-contain"
            />
            <div className="h-[0.2mm] w-[26mm] bg-slate-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
