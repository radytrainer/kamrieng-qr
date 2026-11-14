import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "default" | "success" | "info" | "warning";
}

const TONE_STYLES: Record<NonNullable<StatTileProps["tone"]>, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning-foreground",
};

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = "default",
}: StatTileProps) {
  return (
    <Card className="py-0">
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            TONE_STYLES[tone]
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground truncate text-sm">{label}</p>
          <p className="text-2xl font-semibold tabular-nums">
            {value.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
