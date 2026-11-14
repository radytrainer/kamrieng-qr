/**
 * Centralized route paths so links and redirects never rely on hand-typed
 * strings scattered across features.
 */
export const ROUTES = {
  home: "/",
  login: "/login",
  unauthorized: "/unauthorized",
  student: (token: string) => `/student/${token}`,

  admin: {
    dashboard: "/admin/dashboard",
    students: "/admin/students",
    studentNew: "/admin/students/new",
    studentDetail: (id: string) => `/admin/students/${id}`,
    cards: "/admin/cards",
    printStudentCard: (id: string) => `/admin/cards/print/student/${id}`,
    academics: {
      classes: "/admin/academics/classes",
      academicYears: "/admin/academics/academic-years",
      departments: "/admin/academics/departments",
    },
    settings: "/admin/settings",
  },

  api: {
    verify: (token: string) => `/api/verify/${token}`,
    students: "/api/students",
    studentQr: (id: string) => `/api/students/${id}/qr`,
  },
} as const;
