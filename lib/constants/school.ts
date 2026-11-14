import { clientEnv } from "@/lib/env.client";

/**
 * School-level info shown on printed cards (card back) and reports.
 * Update these for your deployment — a full "School Settings" admin screen
 * is a natural follow-up but out of scope for the current phases.
 */
export const SCHOOL_INFO = {
  name: clientEnv.NEXT_PUBLIC_SCHOOL_NAME,
  khmerName: "វិទ្យាល័យ កំរៀង",
  khmerAddress: "ឃុំ អូរដា ស្រុកកំរៀង ខេត្តបាត់ដំបង",
  address: "Ou Da Commune, Kamrieng District, Battambang Province",
  phone: "095 85 85 45",
  website: clientEnv.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, ""),
  /** Sampled from the navy ring in public/logo/logo.png — keeps printed
   * card headers matching the school seal rather than the app's UI blue. */
  brandColor: "#2C2A7A",
} as const;
