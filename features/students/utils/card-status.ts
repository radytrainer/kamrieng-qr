import { isPastDate } from "@/lib/utils/date";
import { STUDENT_STATUS } from "@/lib/constants/student-status";

interface CardExpiryFields {
  status: string;
  expiry_date?: string | null;
  academic_year_end_date?: string | null;
}

/** An active student's card is expired once either its own manually-set
 * expiry_date, or the academic year of the student's class, has passed —
 * same rule used for QR verification and the status badge. */
export function isCardExpired(student: CardExpiryFields): boolean {
  return (
    student.status === STUDENT_STATUS.ACTIVE &&
    (isPastDate(student.expiry_date) ||
      isPastDate(student.academic_year_end_date))
  );
}
