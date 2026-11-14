import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { earliestDate } from "@/lib/utils/date";
import { STUDENT_STATUS } from "@/lib/constants/student-status";
import type {
  ActivityLogEntry,
  DashboardCharts,
  DashboardStats,
  RecentStudent,
} from "@/features/dashboard/types/dashboard";

/** Cache tag for all dashboard reads. The admin layout's requireStaff()
 * call forces this route dynamic (no automatic fetch caching applies), so
 * without this every dashboard visit re-ran all ~10 Supabase round trips.
 * Actions that materially change these numbers (student create, update,
 * delete, status changes, bulk import) call
 * revalidateTag(DASHBOARD_CACHE_TAG) to refresh it immediately; otherwise
 * it self-refreshes every DASHBOARD_REVALIDATE_SECONDS. */
export const DASHBOARD_CACHE_TAG = "dashboard";
const DASHBOARD_REVALIDATE_SECONDS = 60;

function startOfTodayIso(): string {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();
}

export class DashboardRepository {
  private get client() {
    return createAdminClient();
  }

  async getStats(): Promise<DashboardStats> {
    const client = this.client;

    const [
      totalStudents,
      maleStudents,
      femaleStudents,
      activeStudents,
      graduatedStudents,
      qrScansToday,
    ] = await Promise.all([
      client.from("students").select("*", { count: "exact", head: true }),
      client
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("gender", "male"),
      client
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("gender", "female"),
      client
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("status", STUDENT_STATUS.ACTIVE),
      client
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("status", STUDENT_STATUS.GRADUATED),
      client
        .from("activity_logs")
        .select("*", { count: "exact", head: true })
        .eq("action", "qr.scanned")
        .gte("created_at", startOfTodayIso()),
    ]);

    return {
      totalStudents: totalStudents.count ?? 0,
      maleStudents: maleStudents.count ?? 0,
      femaleStudents: femaleStudents.count ?? 0,
      activeStudents: activeStudents.count ?? 0,
      graduatedStudents: graduatedStudents.count ?? 0,
      qrScansToday: qrScansToday.count ?? 0,
    };
  }

  async getCharts(): Promise<DashboardCharts> {
    const { data, error } = await this.client.rpc("get_dashboard_charts");
    if (error) throw new Error(error.message);
    return data as unknown as DashboardCharts;
  }

  async getRecentStudents(limit = 8): Promise<RecentStudent[]> {
    const { data, error } = await this.client
      .from("students")
      .select(
        `
          id, english_first_name, english_last_name, khmer_first_name, khmer_last_name,
          student_code, status, photo_url, created_at,
          academic_years ( end_date ),
          classes ( academic_years ( end_date ) )
        `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    type Row = {
      id: string;
      english_first_name: string;
      english_last_name: string;
      khmer_first_name: string;
      khmer_last_name: string;
      student_code: string;
      status: string;
      photo_url: string | null;
      created_at: string;
      academic_years: { end_date: string } | null;
      classes: { academic_years: { end_date: string } | null } | null;
    };

    return ((data ?? []) as unknown as Row[]).map((s) => ({
      id: s.id,
      englishName: `${s.english_first_name} ${s.english_last_name}`,
      khmerName: `${s.khmer_first_name} ${s.khmer_last_name}`,
      studentCode: s.student_code,
      status: s.status,
      photoUrl: s.photo_url,
      createdAt: s.created_at,
      academicYearEndDate: earliestDate(
        s.classes?.academic_years?.end_date,
        s.academic_years?.end_date
      ),
    }));
  }

  async getLatestActivity(limit = 15): Promise<ActivityLogEntry[]> {
    const { data, error } = await this.client
      .from("activity_logs")
      .select("id, action, entity_type, entity_id, created_at, users ( email )")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    return (
      (data ?? []) as unknown as Array<{
        id: string;
        action: string;
        entity_type: string;
        entity_id: string | null;
        created_at: string;
        users: { email: string } | null;
      }>
    ).map((row) => ({
      id: row.id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      createdAt: row.created_at,
      actorEmail: row.users?.email ?? null,
    }));
  }
}

const uncachedDashboardRepository = new DashboardRepository();

const cacheOptions = {
  revalidate: DASHBOARD_REVALIDATE_SECONDS,
  tags: [DASHBOARD_CACHE_TAG],
};

export const dashboardRepository = {
  getStats: unstable_cache(
    () => uncachedDashboardRepository.getStats(),
    ["dashboard-stats"],
    cacheOptions
  ),
  getCharts: unstable_cache(
    () => uncachedDashboardRepository.getCharts(),
    ["dashboard-charts"],
    cacheOptions
  ),
  getRecentStudents: unstable_cache(
    (limit?: number) => uncachedDashboardRepository.getRecentStudents(limit),
    ["dashboard-recent-students"],
    cacheOptions
  ),
  getLatestActivity: unstable_cache(
    (limit?: number) => uncachedDashboardRepository.getLatestActivity(limit),
    ["dashboard-latest-activity"],
    cacheOptions
  ),
};
