import "server-only";
import ExcelJS from "exceljs";
import type { StudentListItem } from "@/features/students/types/student";
import type { StudentFormInput } from "@/features/students/schemas/student-schema";

export const IMPORT_COLUMNS = [
  { header: "studentID", key: "studentId" },
  { header: "name", key: "name" },
  { header: "sex (male/female or ប្រុស/ស្រី)", key: "sex" },
  { header: "date_of_birth (YYYY-MM-DD)", key: "dateOfBirth" },
  { header: "phonenumber", key: "phone" },
  { header: "address", key: "address" },
  { header: "fathername", key: "fatherName" },
  { header: "fatherphone", key: "fatherPhone" },
  { header: "fatherjob", key: "fatherJob" },
  { header: "mothername", key: "motherName" },
  { header: "motherphone", key: "motherPhone" },
  { header: "motherjob", key: "motherJob" },
  { header: "class", key: "class" },
] as const;

export async function generateImportTemplate(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Students");
  sheet.columns = IMPORT_COLUMNS.map((c) => ({
    header: c.header,
    key: c.key,
    width: 20,
  }));
  sheet.getRow(1).font = { bold: true };
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export interface RawImportRow {
  rowNumber: number;
  studentId?: string;
  name?: string;
  sex?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherJob?: string;
  motherName?: string;
  motherPhone?: string;
  motherJob?: string;
  class?: string;
}

function excelDateToIso(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

export async function parseImportFile(buffer: Buffer): Promise<RawImportRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const rows: RawImportRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header row

    const get = (colIndex: number) => row.getCell(colIndex + 1).value;
    const asText = (v: unknown) =>
      v === null || v === undefined ? undefined : String(v).trim();

    rows.push({
      rowNumber,
      studentId: asText(get(0)),
      name: asText(get(1)),
      sex: asText(get(2)),
      dateOfBirth: excelDateToIso(get(3)),
      phone: asText(get(4)),
      address: asText(get(5)),
      fatherName: asText(get(6)),
      fatherPhone: asText(get(7)),
      fatherJob: asText(get(8)),
      motherName: asText(get(9)),
      motherPhone: asText(get(10)),
      motherJob: asText(get(11)),
      class: asText(get(12)),
    });
  });

  return rows;
}

/** Uses the exact same columns as the import template (IMPORT_COLUMNS), so
 * an exported file — edited in Excel — can be fed straight back through
 * Bulk Import without reshuffling columns. */
export async function generateStudentsWorkbook(
  students: StudentListItem[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Students");
  sheet.columns = IMPORT_COLUMNS.map((c) => ({
    header: c.header,
    key: c.key,
    width: 20,
  }));
  sheet.getRow(1).font = { bold: true };

  for (const student of students) {
    sheet.addRow({
      studentId: student.student_code,
      name: `${student.khmer_first_name} ${student.khmer_last_name}`.trim(),
      sex: student.gender,
      dateOfBirth: student.date_of_birth,
      phone: student.phone,
      address: student.address,
      fatherName: student.father_name,
      fatherPhone: student.father_phone,
      fatherJob: student.father_job,
      motherName: student.mother_name,
      motherPhone: student.mother_phone,
      motherJob: student.mother_job,
      class: student.class_name,
    });
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export type { StudentFormInput };
