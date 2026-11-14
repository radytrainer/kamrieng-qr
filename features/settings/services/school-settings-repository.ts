import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_CARD_ISSUE_DATE } from "@/lib/constants/official-card";
import type { CardTextSettingsFormValues } from "@/features/settings/schemas/school-settings-schema";
import type { SchoolSettings } from "@/features/settings/types/school-settings";

const DEFAULTS: SchoolSettings = {
  cardIssueBuddhistLine: DEFAULT_CARD_ISSUE_DATE.buddhistLine,
  cardIssueGregorianLine: DEFAULT_CARD_ISSUE_DATE.gregorianLine,
};

export class SchoolSettingsRepository {
  private get client() {
    return createAdminClient();
  }

  /** Falls back to the hardcoded defaults if the row (or the table itself,
   * e.g. migration not yet applied) can't be read — printed cards should
   * never break because of a missing settings row. */
  async get(): Promise<SchoolSettings> {
    const { data, error } = await this.client
      .from("school_settings")
      .select("card_issue_buddhist_line, card_issue_gregorian_line")
      .eq("id", true)
      .maybeSingle();

    if (error || !data) return DEFAULTS;

    return {
      cardIssueBuddhistLine: data.card_issue_buddhist_line,
      cardIssueGregorianLine: data.card_issue_gregorian_line,
    };
  }

  async update(input: CardTextSettingsFormValues): Promise<SchoolSettings> {
    const { data, error } = await this.client
      .from("school_settings")
      .upsert(
        {
          id: true,
          card_issue_buddhist_line: input.cardIssueBuddhistLine,
          card_issue_gregorian_line: input.cardIssueGregorianLine,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select("card_issue_buddhist_line, card_issue_gregorian_line")
      .single();

    if (error) throw new Error(error.message);

    return {
      cardIssueBuddhistLine: data.card_issue_buddhist_line,
      cardIssueGregorianLine: data.card_issue_gregorian_line,
    };
  }
}

export const schoolSettingsRepository = new SchoolSettingsRepository();
