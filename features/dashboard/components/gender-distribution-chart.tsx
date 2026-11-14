"use client";

import { useTranslations } from "next-intl";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ChartPoint } from "@/features/dashboard/types/dashboard";

// Fixed categorical order — blue, aqua, yellow — never reassigned per-render.
const SERIES_ORDER = ["Male", "Female", "Other"] as const;
const SERIES_COLORS: Record<(typeof SERIES_ORDER)[number], string> = {
  Male: "var(--chart-1)",
  Female: "var(--chart-2)",
  Other: "var(--chart-3)",
};

interface GenderDistributionChartProps {
  data: ChartPoint[];
}

export function GenderDistributionChart({
  data,
}: GenderDistributionChartProps) {
  const t = useTranslations("admin.dashboard");
  const byLabel = new Map(data.map((d) => [d.label, d.value]));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="text-muted-foreground flex h-24 items-center justify-center text-sm">
        {t("noDataYet")}
      </div>
    );
  }

  const row: Record<string, number | string> = { name: "Students" };
  const config: ChartConfig = {};
  for (const series of SERIES_ORDER) {
    if (!byLabel.has(series)) continue;
    row[series] = byLabel.get(series) ?? 0;
    config[series] = { label: series, color: SERIES_COLORS[series] };
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Direct labels as a summary row — safer than inline segment labels,
          which risk clipping in a narrow stacked segment. */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {SERIES_ORDER.filter((s) => byLabel.has(s)).map((series) => (
          <div key={series} className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: SERIES_COLORS[series] }}
            />
            <span className="text-muted-foreground">{series}</span>
            <span className="font-medium">{byLabel.get(series)}</span>
            <span className="text-muted-foreground text-xs">
              ({Math.round(((byLabel.get(series) ?? 0) / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>

      <ChartContainer config={config} className="h-14 w-full">
        <BarChart
          data={[row]}
          layout="vertical"
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" hide />
          <ChartTooltip content={<ChartTooltipContent />} />
          {SERIES_ORDER.filter((s) => byLabel.has(s)).map((series, i, arr) => (
            <Bar
              key={series}
              dataKey={series}
              stackId="gender"
              fill={SERIES_COLORS[series]}
              radius={
                i === 0
                  ? [4, 0, 0, 4]
                  : i === arr.length - 1
                    ? [0, 4, 4, 0]
                    : [0, 0, 0, 0]
              }
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}
