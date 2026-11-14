export interface DashboardStats {
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  activeStudents: number;
  graduatedStudents: number;
  qrScansToday: number;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface DashboardCharts {
  enrollmentByYear: ChartPoint[];
  studentsByGrade: ChartPoint[];
  genderDistribution: ChartPoint[];
  provinceDistribution: ChartPoint[];
}

export interface RecentStudent {
  id: string;
  englishName: string;
  khmerName: string;
  studentCode: string;
  status: string;
  photoUrl: string | null;
  createdAt: string;
  academicYearEndDate: string | null;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  actorEmail: string | null;
}

export interface DashboardData {
  stats: DashboardStats;
  charts: DashboardCharts;
  recentStudents: RecentStudent[];
  latestActivity: ActivityLogEntry[];
}
