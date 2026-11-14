"use client";

import { useTranslations } from "next-intl";
import { ROLES, type Role } from "@/lib/constants/roles";
import {
  STUDENT_STATUS,
  type StudentStatus,
} from "@/lib/constants/student-status";

export function useRoleLabels(): Record<Role, string> {
  const t = useTranslations("enums.role");
  return {
    [ROLES.SUPER_ADMIN]: t("super_admin"),
    [ROLES.SCHOOL_ADMIN]: t("school_admin"),
    [ROLES.TEACHER]: t("teacher"),
    [ROLES.STUDENT]: t("student"),
    [ROLES.VISITOR]: t("visitor"),
  };
}

export function useStudentStatusLabels(): Record<StudentStatus, string> {
  const t = useTranslations("enums.studentStatus");
  return {
    [STUDENT_STATUS.ACTIVE]: t("active"),
    [STUDENT_STATUS.INACTIVE]: t("inactive"),
    [STUDENT_STATUS.GRADUATED]: t("graduated"),
    [STUDENT_STATUS.SUSPENDED]: t("suspended"),
    [STUDENT_STATUS.TRANSFERRED]: t("transferred"),
    [STUDENT_STATUS.EXPELLED]: t("expelled"),
  };
}

export function useGenderLabel(): Record<string, string> {
  const t = useTranslations("enums.gender");
  return {
    male: t("male"),
    female: t("female"),
    other: t("other"),
  };
}
