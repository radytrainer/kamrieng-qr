import {
  Activity,
  IdCard,
  Pencil,
  Plus,
  QrCode,
  ScanLine,
  Trash2,
  UserCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getTranslations } from "next-intl/server";
import type { ActivityLogEntry } from "@/features/dashboard/types/dashboard";

type ActionLabelKey =
  | "studentCreated"
  | "studentUpdated"
  | "studentDeleted"
  | "studentStatusChanged"
  | "studentQrRegenerated"
  | "studentBulkImported"
  | "studentParentAdded"
  | "studentParentRemoved"
  | "qrScanned"
  | "cardPrinted";

const ACTION_META: Record<
  string,
  { labelKey: ActionLabelKey; icon: LucideIcon }
> = {
  "student.created": { labelKey: "studentCreated", icon: Plus },
  "student.updated": { labelKey: "studentUpdated", icon: Pencil },
  "student.deleted": { labelKey: "studentDeleted", icon: Trash2 },
  "student.status_changed": { labelKey: "studentStatusChanged", icon: UserCog },
  "student.qr_regenerated": { labelKey: "studentQrRegenerated", icon: QrCode },
  "student.bulk_imported": { labelKey: "studentBulkImported", icon: Plus },
  "student.parent_added": { labelKey: "studentParentAdded", icon: Plus },
  "student.parent_removed": { labelKey: "studentParentRemoved", icon: Trash2 },
  "qr.scanned": { labelKey: "qrScanned", icon: ScanLine },
  "card.printed": { labelKey: "cardPrinted", icon: IdCard },
};

export async function LatestActivityFeed({
  entries,
}: {
  entries: ActivityLogEntry[];
}) {
  const t = await getTranslations("admin.dashboard");

  if (entries.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{t("noActivityYet")}</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => {
        const meta = ACTION_META[entry.action];
        const Icon = meta?.icon ?? Activity;
        const label = meta ? t(`action.${meta.labelKey}`) : entry.action;
        return (
          <div key={entry.id} className="flex items-start gap-3 text-sm">
            <div className="bg-muted mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full">
              <Icon className="text-muted-foreground size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p>
                <span className="font-medium">
                  {entry.actorEmail ?? t("system")}
                </span>{" "}
                <span className="text-muted-foreground">{label}</span>
              </p>
              <p className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(entry.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
