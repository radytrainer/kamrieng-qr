/**
 * Fallback issue-date line printed on official ID cards (next to
 * "នាយកវិទ្យាល័យ" / School Director, above the signature line), used only
 * if `school_settings` can't be read (e.g. migration not yet applied).
 * The editable copy of this lives in the `school_settings` table — see
 * features/settings — and is edited from Settings > Card Text in the app.
 *
 * This exists as plain text rather than computed automatically — the Khmer
 * Buddhist lunar calendar (កើត/រោច moon-phase day counting, 12-year zodiac
 * names, lunar month names) is a genuinely different calendar system from
 * the Gregorian one and isn't something to guess at silently on an official
 * document.
 */
export const DEFAULT_CARD_ISSUE_DATE = {
  buddhistLine: "ថ្ងៃសៅរ៍ ១១កើត ខែកត្តិក ឆ្នាំម្សាញ់ ព.ស ២៥៦៩",
  gregorianLine: "វិ.កំរៀង, ថ្ងៃទី ១ ខែវិច្ឆិកា ឆ្នាំ២០២៥",
} as const;
