import type { Database } from "@/types/database.types";

export type SchoolSettingsRow =
  Database["public"]["Tables"]["school_settings"]["Row"];

export interface SchoolSettings {
  cardIssueBuddhistLine: string;
  cardIssueGregorianLine: string;
}
