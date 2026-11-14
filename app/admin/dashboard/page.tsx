import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  ScanLine,
  UserCheck,
  Users,
  UserRound,
  UserRoundCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardRepository } from "@/features/dashboard/services/dashboard-repository";
import { StatTile } from "@/features/dashboard/components/stat-tile";
import { BarMagnitudeChart } from "@/features/dashboard/components/bar-magnitude-chart";
import { GenderDistributionChart } from "@/features/dashboard/components/gender-distribution-chart";
import { RecentStudentsList } from "@/features/dashboard/components/recent-students-list";
import { LatestActivityFeed } from "@/features/dashboard/components/latest-activity-feed";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const t = await getTranslations("admin.dashboard");
  const [stats, charts, recentStudents, latestActivity] = await Promise.all([
    dashboardRepository.getStats(),
    dashboardRepository.getCharts(),
    dashboardRepository.getRecentStudents(),
    dashboardRepository.getLatestActivity(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label={t("statTotalStudents")}
          value={stats.totalStudents}
          icon={Users}
        />
        <StatTile
          label={t("statMale")}
          value={stats.maleStudents}
          icon={UserRound}
          tone="info"
        />
        <StatTile
          label={t("statFemale")}
          value={stats.femaleStudents}
          icon={UserRound}
          tone="info"
        />
        <StatTile
          label={t("statActiveStudents")}
          value={stats.activeStudents}
          icon={UserRoundCheck}
          tone="success"
        />
        <StatTile
          label={t("statGraduated")}
          value={stats.graduatedStudents}
          icon={UserCheck}
          tone="info"
        />
        <StatTile
          label={t("statQrScansToday")}
          value={stats.qrScansToday}
          icon={ScanLine}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("enrollmentByYear")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BarMagnitudeChart data={charts.enrollmentByYear} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("studentsByGrade")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BarMagnitudeChart data={charts.studentsByGrade} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("genderDistribution")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GenderDistributionChart data={charts.genderDistribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("provinceDistribution")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarMagnitudeChart
              data={charts.provinceDistribution}
              orientation="horizontal"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("recentStudents")}</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentStudentsList students={recentStudents} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("latestActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            <LatestActivityFeed entries={latestActivity} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
