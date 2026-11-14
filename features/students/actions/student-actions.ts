"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { randomUUID } from "crypto";
import { getTranslations } from "next-intl/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/rbac/guards";
import { logActivity } from "@/lib/repositories/activity-log-repository";
import { createAdminClient } from "@/lib/supabase/admin";
import { compressImage } from "@/lib/utils/image-compression";
import { ROUTES } from "@/lib/constants/routes";
import { runAction, type ActionResult } from "@/lib/actions/action-result";
import { DASHBOARD_CACHE_TAG } from "@/features/dashboard/services/dashboard-repository";
import {
  createStudentFormSchema,
  type StudentFormInput,
} from "@/features/students/schemas/student-schema";
import { studentRepository } from "@/features/students/services/student-repository";
import { createParentsForStudent } from "@/features/students/services/student-parent-helpers";
import type { StudentRow } from "@/features/students/types/student";

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
// Generous cap on the raw upload — compressImage() shrinks it to ~640px
// WebP server-side regardless, so real phone-camera originals (2-8MB) are
// fine. Must stay under next.config.ts's serverActions.bodySizeLimit (10mb).
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export async function uploadStudentPhotoAction(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    await requireAdmin();
    const t = await getTranslations("admin.students.photoUpload");

    const file = formData.get("file");
    if (!(file instanceof File)) throw new Error(t("noFileProvided"));
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      throw new Error(t("invalidFileType"));
    }
    if (file.size > MAX_PHOTO_BYTES) throw new Error(t("fileTooLarge"));

    const original = Buffer.from(await file.arrayBuffer());
    const compressed = await compressImage(original);

    const supabase = createAdminClient();
    const path = `students/${randomUUID()}.${compressed.extension}`;

    const { error } = await supabase.storage
      .from("student-photos")
      .upload(path, compressed.buffer, {
        contentType: compressed.contentType,
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from("student-photos").getPublicUrl(path);
    return { url: data.publicUrl };
  });
}

export async function createStudentAction(
  input: StudentFormInput
): Promise<ActionResult<StudentRow>> {
  return runAction(async () => {
    const session = await requireAdmin();
    const tValidation = await getTranslations("validation");
    const values = createStudentFormSchema(tValidation).parse(input);

    const student = await studentRepository.create(values);
    await createParentsForStudent(student.id, values);

    await logActivity({
      userId: session.userId,
      action: "student.created",
      entityType: "student",
      entityId: student.id,
      metadata: { student_code: student.student_code },
    });

    revalidatePath(ROUTES.admin.students);
    revalidateTag(DASHBOARD_CACHE_TAG);
    return student;
  });
}

export async function updateStudentAction(
  id: string,
  input: StudentFormInput
): Promise<ActionResult<StudentRow>> {
  return runAction(async () => {
    const session = await requireAdmin();
    const tValidation = await getTranslations("validation");
    const values = createStudentFormSchema(tValidation).parse(input);

    const student = await studentRepository.update(id, values);

    await logActivity({
      userId: session.userId,
      action: "student.updated",
      entityType: "student",
      entityId: student.id,
    });

    revalidatePath(ROUTES.admin.students);
    revalidatePath(ROUTES.admin.studentDetail(id));
    revalidateTag(DASHBOARD_CACHE_TAG);
    return student;
  });
}

export async function regenerateStudentTokenAction(
  id: string
): Promise<ActionResult<StudentRow>> {
  return runAction(async () => {
    const session = await requireAdmin();
    const student = await studentRepository.regenerateToken(id);

    await logActivity({
      userId: session.userId,
      action: "student.qr_regenerated",
      entityType: "student",
      entityId: id,
    });

    revalidatePath(ROUTES.admin.studentDetail(id));
    revalidatePath(ROUTES.admin.cards);
    return student;
  });
}

export async function setStudentStatusAction(
  id: string,
  status: string
): Promise<ActionResult<StudentRow>> {
  return runAction(async () => {
    const session = await requireAdmin();
    const student = await studentRepository.setStatus(id, status);

    await logActivity({
      userId: session.userId,
      action: "student.status_changed",
      entityType: "student",
      entityId: id,
      metadata: { status },
    });

    revalidatePath(ROUTES.admin.students);
    revalidatePath(ROUTES.admin.studentDetail(id));
    revalidateTag(DASHBOARD_CACHE_TAG);
    return student;
  });
}

export interface BulkStudentStatusFilters {
  search?: string;
  classId?: string;
  gradeLevel?: number;
}

export async function bulkSetStudentStatusAction(
  filters: BulkStudentStatusFilters,
  status: string
): Promise<ActionResult<number>> {
  return runAction(async () => {
    const session = await requireAdmin();

    if (
      !filters.search &&
      !filters.classId &&
      filters.gradeLevel === undefined
    ) {
      throw new Error(
        "Choose a class, generation, or name/ID search before applying a bulk status change"
      );
    }

    const count = await studentRepository.setStatusByFilter(filters, status);

    await logActivity({
      userId: session.userId,
      action: "student.bulk_status_changed",
      entityType: "student",
      entityId: null,
      metadata: { status, count, ...filters },
    });

    revalidatePath(ROUTES.admin.students);
    revalidateTag(DASHBOARD_CACHE_TAG);
    return count;
  });
}

export async function deleteStudentAction(
  id: string
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const session = await requireSuperAdmin();
    await studentRepository.delete(id);

    await logActivity({
      userId: session.userId,
      action: "student.deleted",
      entityType: "student",
      entityId: id,
    });

    revalidatePath(ROUTES.admin.students);
    revalidateTag(DASHBOARD_CACHE_TAG);
  });
}

export interface MoveClassInput {
  classId: string | null;
  academicYearId: string;
  regenerateQr: boolean;
}

/** Reassigns explicitly selected students to a new class/academic year —
 * e.g. splitting "Grade 7A" into "Grade 8A" and "Grade 8B" at promotion
 * time, where each half needs a different destination class. */
export async function bulkMoveClassAction(
  ids: string[],
  input: MoveClassInput
): Promise<ActionResult<number>> {
  return runAction(async () => {
    const session = await requireAdmin();
    if (ids.length === 0) {
      throw new Error("Select at least one student first");
    }

    await studentRepository.bulkMoveClass(ids, input);

    await logActivity({
      userId: session.userId,
      action: "student.bulk_class_changed",
      entityType: "student",
      entityId: null,
      metadata: { count: ids.length, ...input },
    });

    revalidatePath(ROUTES.admin.students);
    revalidateTag(DASHBOARD_CACHE_TAG);
    return ids.length;
  });
}

export interface RenewExpiredCardsFilters {
  search?: string;
  classId?: string;
  gradeLevel?: number;
}

/** One-click fix for "the school year ended and now everyone's card shows
 * expired": finds every active student whose card has lapsed (optionally
 * narrowed to one class/generation/search) and moves them into the given
 * destination class + academic year, issuing each a fresh QR token so the
 * QR on their old, expired card can't be reused. */
export async function bulkRenewExpiredCardsAction(
  filters: RenewExpiredCardsFilters,
  destination: { classId: string | null; academicYearId: string }
): Promise<ActionResult<number>> {
  return runAction(async () => {
    const session = await requireAdmin();

    const ids = await studentRepository.findActiveExpiredIds(filters);
    if (ids.length === 0) return 0;

    await studentRepository.bulkMoveClass(ids, {
      ...destination,
      regenerateQr: true,
    });

    await logActivity({
      userId: session.userId,
      action: "student.bulk_cards_renewed",
      entityType: "student",
      entityId: null,
      metadata: { count: ids.length, ...filters, ...destination },
    });

    revalidatePath(ROUTES.admin.students);
    revalidateTag(DASHBOARD_CACHE_TAG);
    return ids.length;
  });
}

/** Bulk delete — e.g. clearing out students explicitly picked by name, or
 * an entire graduated/expired class at once. Superadmin-only, matching the
 * single-student delete action's permission level. */
export async function bulkDeleteStudentsAction(
  ids: string[]
): Promise<ActionResult<number>> {
  return runAction(async () => {
    const session = await requireSuperAdmin();
    if (ids.length === 0) {
      throw new Error("Select at least one student first");
    }

    await studentRepository.deleteMany(ids);

    await logActivity({
      userId: session.userId,
      action: "student.bulk_deleted",
      entityType: "student",
      entityId: null,
      metadata: { count: ids.length },
    });

    revalidatePath(ROUTES.admin.students);
    revalidateTag(DASHBOARD_CACHE_TAG);
    return ids.length;
  });
}
