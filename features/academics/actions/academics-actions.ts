"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/rbac/guards";
import { logActivity } from "@/lib/repositories/activity-log-repository";
import { ROUTES } from "@/lib/constants/routes";
import { runAction, type ActionResult } from "@/lib/actions/action-result";
import { academicsRepository } from "@/features/academics/services/academics-repository";
import {
  createAcademicYearFormSchema,
  createClassFormSchema,
  createDepartmentFormSchema,
  createGenerateClassesFormSchema,
  splitSections,
  type AcademicYearFormInput,
  type ClassFormInput,
  type DepartmentFormInput,
  type GenerateClassesFormInput,
} from "@/features/academics/schemas/academics-schema";
import type {
  AcademicYear,
  Department,
  SchoolClass,
} from "@/features/academics/types/academics";

// ----------------------------------------------------------- academic years
export async function createAcademicYearAction(
  input: AcademicYearFormInput
): Promise<ActionResult<AcademicYear>> {
  return runAction(async () => {
    const session = await requireAdmin();
    const tValidation = await getTranslations("validation");
    const values = createAcademicYearFormSchema(tValidation).parse(input);
    const year = await academicsRepository.createAcademicYear(values);
    await logActivity({
      userId: session.userId,
      action: "academic_year.created",
      entityType: "academic_year",
      entityId: year.id,
    });
    revalidatePath(ROUTES.admin.academics.academicYears);
    return year;
  });
}

export async function updateAcademicYearAction(
  id: string,
  input: AcademicYearFormInput
): Promise<ActionResult<AcademicYear>> {
  return runAction(async () => {
    const session = await requireAdmin();
    const tValidation = await getTranslations("validation");
    const values = createAcademicYearFormSchema(tValidation).parse(input);
    const year = await academicsRepository.updateAcademicYear(id, values);
    await logActivity({
      userId: session.userId,
      action: "academic_year.updated",
      entityType: "academic_year",
      entityId: id,
    });
    revalidatePath(ROUTES.admin.academics.academicYears);
    return year;
  });
}

export async function deleteAcademicYearAction(
  id: string
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const session = await requireAdmin();
    await academicsRepository.deleteAcademicYear(id);
    await logActivity({
      userId: session.userId,
      action: "academic_year.deleted",
      entityType: "academic_year",
      entityId: id,
    });
    revalidatePath(ROUTES.admin.academics.academicYears);
  });
}

// ------------------------------------------------------------------ classes
export async function createClassAction(
  input: ClassFormInput
): Promise<ActionResult<SchoolClass>> {
  return runAction(async () => {
    const session = await requireAdmin();
    const tValidation = await getTranslations("validation");
    const values = createClassFormSchema(tValidation).parse(input);
    const schoolClass = await academicsRepository.createClass(values);
    await logActivity({
      userId: session.userId,
      action: "class.created",
      entityType: "class",
      entityId: schoolClass.id,
    });
    revalidatePath(ROUTES.admin.academics.classes);
    return schoolClass;
  });
}

export async function updateClassAction(
  id: string,
  input: ClassFormInput
): Promise<ActionResult<SchoolClass>> {
  return runAction(async () => {
    const session = await requireAdmin();
    const tValidation = await getTranslations("validation");
    const values = createClassFormSchema(tValidation).parse(input);
    const schoolClass = await academicsRepository.updateClass(id, values);
    await logActivity({
      userId: session.userId,
      action: "class.updated",
      entityType: "class",
      entityId: id,
    });
    revalidatePath(ROUTES.admin.academics.classes);
    return schoolClass;
  });
}

export async function deleteClassAction(
  id: string
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const session = await requireAdmin();
    await academicsRepository.deleteClass(id);
    await logActivity({
      userId: session.userId,
      action: "class.deleted",
      entityType: "class",
      entityId: id,
    });
    revalidatePath(ROUTES.admin.academics.classes);
  });
}

export async function generateClassesAction(
  input: GenerateClassesFormInput
): Promise<ActionResult<SchoolClass[]>> {
  return runAction(async () => {
    const session = await requireAdmin();
    const tValidation = await getTranslations("validation");
    const values = createGenerateClassesFormSchema(tValidation).parse(input);
    const classes = await academicsRepository.bulkCreateClasses({
      ...values,
      sections: splitSections(values.sections),
    });
    await logActivity({
      userId: session.userId,
      action: "class.bulk_created",
      entityType: "class",
      entityId: null,
      metadata: {
        count: classes.length,
        gradeLevel: values.gradeLevel,
        academicYearId: values.academicYearId,
      },
    });
    revalidatePath(ROUTES.admin.academics.classes);
    return classes;
  });
}

export async function copyClassesToYearAction(
  ids: string[],
  targetAcademicYearId: string
): Promise<ActionResult<number>> {
  return runAction(async () => {
    const session = await requireAdmin();
    if (ids.length === 0) {
      throw new Error("Select at least one class first");
    }
    if (!targetAcademicYearId) {
      throw new Error("Choose a destination academic year");
    }

    const classes = await academicsRepository.copyClassesToYear(
      ids,
      targetAcademicYearId
    );
    await logActivity({
      userId: session.userId,
      action: "class.bulk_copied",
      entityType: "class",
      entityId: null,
      metadata: { count: classes.length, targetAcademicYearId },
    });
    revalidatePath(ROUTES.admin.academics.classes);
    return classes.length;
  });
}

export async function bulkSetClassDepartmentAction(
  ids: string[],
  departmentId: string | null
): Promise<ActionResult<number>> {
  return runAction(async () => {
    const session = await requireAdmin();
    if (ids.length === 0) {
      throw new Error("Select at least one class first");
    }

    await academicsRepository.bulkSetDepartment(ids, departmentId);
    await logActivity({
      userId: session.userId,
      action: "class.bulk_department_set",
      entityType: "class",
      entityId: null,
      metadata: { count: ids.length, departmentId },
    });
    revalidatePath(ROUTES.admin.academics.classes);
    return ids.length;
  });
}

// ------------------------------------------------------------- departments
export async function createDepartmentAction(
  input: DepartmentFormInput
): Promise<ActionResult<Department>> {
  return runAction(async () => {
    const session = await requireAdmin();
    const tValidation = await getTranslations("validation");
    const values = createDepartmentFormSchema(tValidation).parse(input);
    const department = await academicsRepository.createDepartment(values);
    await logActivity({
      userId: session.userId,
      action: "department.created",
      entityType: "department",
      entityId: department.id,
    });
    revalidatePath(ROUTES.admin.academics.departments);
    return department;
  });
}

export async function updateDepartmentAction(
  id: string,
  input: DepartmentFormInput
): Promise<ActionResult<Department>> {
  return runAction(async () => {
    const session = await requireAdmin();
    const tValidation = await getTranslations("validation");
    const values = createDepartmentFormSchema(tValidation).parse(input);
    const department = await academicsRepository.updateDepartment(id, values);
    await logActivity({
      userId: session.userId,
      action: "department.updated",
      entityType: "department",
      entityId: id,
    });
    revalidatePath(ROUTES.admin.academics.departments);
    return department;
  });
}

export async function deleteDepartmentAction(
  id: string
): Promise<ActionResult<void>> {
  return runAction(async () => {
    const session = await requireAdmin();
    await academicsRepository.deleteDepartment(id);
    await logActivity({
      userId: session.userId,
      action: "department.deleted",
      entityType: "department",
      entityId: id,
    });
    revalidatePath(ROUTES.admin.academics.departments);
  });
}
