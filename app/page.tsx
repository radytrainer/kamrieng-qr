import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  IdCard,
  QrCode,
  ScanLine,
  User,
} from "lucide-react";
import { SchoolLogo } from "@/components/shared/school-logo";
import { SCHOOL_INFO } from "@/lib/constants/school";

const CARD_BORDER_COLOR = "#4472C4";

const FEATURES = [
  {
    icon: ScanLine,
    tone: "text-primary bg-primary/10",
    title: "Instant QR Verification",
    description:
      "Scan a student's card and confirm their identity and status in under a second — no lookup, no paperwork.",
  },
  {
    icon: IdCard,
    tone: "text-success bg-success/10",
    title: "Digital Student Cards",
    description:
      "Generate CR80-standard student ID cards with a secure QR code, ready to print in landscape or portrait.",
  },
] as const;

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Decorative background: soft brand-colored blobs + faint grid */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-primary/10 absolute top-[-10%] left-[-5%] size-[36rem] rounded-full blur-3xl" />
        <div className="bg-success/10 absolute top-[20%] right-[-10%] size-[30rem] rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)",
          }}
        />
      </div>

      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2.5">
          <SchoolLogo size={32} />
          <div className="hidden leading-tight sm:flex sm:flex-col">
            <span className="text-sm font-semibold">
              Student QR Verification System
            </span>
            <span className="font-khmer-card text-muted-foreground text-xs">
              {SCHOOL_INFO.khmerName}
            </span>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/login">Sign In</Link>
        </Button>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-16 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:py-20">
          <div className="flex flex-col items-start gap-6 text-left">
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full py-1.5 pl-2.5 font-normal"
            >
              <span className="bg-success size-1.5 rounded-full" />
              Live for staff &amp; teachers
            </Badge>

            <h1 className="max-w-xl text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl">
              Digital student identity for{" "}
              <span className="from-primary to-success bg-gradient-to-r bg-clip-text text-transparent">
                modern Cambodian schools
              </span>
            </h1>
            <p className="font-khmer-card text-muted-foreground/90 max-w-xl text-lg font-medium">
              អត្តសញ្ញាណប័ណ្ណឌីជីថលសម្រាប់សិស្សនៅសាលារៀនកម្ពុជាទំនើប
            </p>

            <p className="text-muted-foreground max-w-md text-lg">
              Issue secure student ID cards, and verify identity instantly with
              a QR scan — all in one platform.
            </p>
            <p className="font-khmer-card text-muted-foreground max-w-md text-sm">
              ចេញប័ណ្ណសម្គាល់ខ្លួនសិស្សប្រកបដោយសុវត្ថិភាព
              ព្រមទាំងផ្ទៀងផ្ទាត់អត្តសញ្ញាណភ្លាមៗដោយស្កេន QR —
              គ្រប់យ៉ាងស្ថិតក្នុងវេទិកាតែមួយ។
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/login">
                  Admin &amp; Teacher Login
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Decorative product preview — mirrors the real official student
           * card style (see features/cards/templates/official-student-card.tsx),
           * with placeholder/blurred fields instead of real student data. */}
          <div className="relative mx-auto hidden w-full max-w-sm lg:block">
            <div className="bg-card/60 absolute top-6 -right-6 h-full w-full rotate-3 rounded-2xl border" />

            {/* Positioned outside the card's own overflow-hidden container,
             * or it gets clipped by its own parent instead of floating over the corner. */}
            <div className="bg-success text-success-foreground absolute -top-3 -right-3 z-10 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-md">
              <CheckCircle2 className="size-3.5" />
              Verified
            </div>

            <div
              className="relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white p-5 text-slate-900 shadow-xl"
              style={{ borderColor: CARD_BORDER_COLOR }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local trusted SVG watermark, matches the printed card's background treatment */}
              <img
                src="/logo/moeys.svg"
                alt=""
                className="pointer-events-none absolute inset-0 m-auto size-40 object-contain opacity-[0.15]"
              />

              <div className="relative flex items-start justify-between gap-2">
                <div className="flex flex-col items-center gap-1">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local trusted SVG; next/image refuses to optimize SVG without dangerouslyAllowSVG */}
                  <img src="/logo/moeys.svg" alt="" className="h-7 w-6" />
                  <div className="font-khmer-card text-center text-[9px] leading-tight text-slate-600">
                    <p>ក្រសួងអប់រំ យុវជន និងកីឡា</p>
                    <p className="font-semibold">{SCHOOL_INFO.khmerName}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <div className="font-khmer-header text-right leading-tight">
                    <p className="text-[11px]">ព្រះរាជាណាចក្រកម្ពុជា</p>
                    <p className="text-[8px] text-slate-600">
                      ជាតិ សាសនា ព្រះមហាក្សត្រ
                    </p>
                  </div>
                  <div className="flex size-11 items-center justify-center rounded-md border bg-white shadow-sm">
                    <QrCode className="size-7 text-slate-700" />
                  </div>
                </div>
              </div>

              <div className="relative mt-3 text-center">
                <p className="font-khmer-card text-base font-bold text-amber-600">
                  បណ្ណសម្គាល់ខ្លួនសិស្ស
                </p>
                <p className="font-khmer-card text-xs text-slate-500">
                  ឆ្នាំសិក្សា ២០២៥-២០២៦
                </p>
              </div>

              <div className="font-khmer-card relative mt-3 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">គោត្តនាម និងនាម:</span>
                  <span className="h-3 w-24 rounded bg-slate-200" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">ថ្នាក់ទី:</span>
                  <span className="h-3 w-16 rounded bg-slate-200" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">អត្តលេខ:</span>
                  <span className="h-3 w-16 rounded bg-slate-200" />
                </div>
              </div>

              <div className="relative mt-4 flex items-end justify-between gap-3">
                <div
                  className="flex size-16 items-center justify-center rounded-md border-2 bg-white"
                  style={{ borderColor: CARD_BORDER_COLOR }}
                >
                  <User className="size-7 text-slate-300" />
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  <span className="h-2 w-20 rounded bg-slate-200" />
                  <span className="font-khmer-card text-[10px] font-semibold text-slate-600">
                    នាយកវិទ្យាល័យ
                  </span>
                  <span className="h-2 w-16 rounded bg-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10">
          <div className="mb-10 flex flex-col items-center gap-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything the school office needs
            </h2>
            <p className="font-khmer-card text-muted-foreground">
              អ្វីៗគ្រប់យ៉ាងដែលការិយាល័យសាលារៀនត្រូវការ
            </p>
            <p className="text-muted-foreground max-w-md">
              One system for student and staff identity and verification — built
              for how Cambodian schools actually work.
            </p>
          </div>

          <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-card flex flex-col gap-3 rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-lg ${feature.tone}`}
                >
                  <feature.icon className="size-5" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-6 sm:px-10">
        <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 text-sm sm:flex-row">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <div className="flex items-center gap-2">
              <SchoolLogo size={20} />
              <span>{SCHOOL_INFO.name}</span>
              <span className="font-khmer-card text-muted-foreground/80">
                · {SCHOOL_INFO.khmerName}
              </span>
            </div>
            <p className="text-muted-foreground/70 text-xs">
              Built by Passerelles Numériques Cambodia (PNC) Students ❤️
            </p>
          </div>
          <p>Student QR Verification System</p>
        </div>
      </footer>
    </div>
  );
}
