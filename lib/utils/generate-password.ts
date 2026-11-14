import "server-only";
import { randomBytes } from "crypto";

/** Readable random temporary password, e.g. "K3jP-9xQm-2LbW". Not meant to
 * be kept long-term — communicate it out-of-band and treat as one-time use. */
export function generateTempPassword(): string {
  const group = () =>
    randomBytes(3)
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 4);
  return [group(), group(), group()].join("-");
}
