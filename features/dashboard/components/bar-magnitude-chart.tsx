"use client";

import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ChartPoint } from "@/features/dashboard/types/dashboard";

interface BarMagnitudeChartProps {
  data: ChartPoint[];
  orientation?: "vertical" | "horizontal";
}

/** Single-hue magnitude bar chart (sequential blue) — used for enrollment by
 * year, students by grade, and province distribution. */
export function BarMagnitudeChart({
  data,
  orientation = "vertical",
}: BarMagnitudeChartProps) {
  const t = useTranslations("admin.dashboard");
  const chartConfig = {
    value: {
      label: t("chartSeriesStudents"),
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
        {t("noDataYet")}
      </div>
    );
  }

  const isHorizontal = orientation === "horizontal";

  return (
    <ChartContainer config={chartConfig} className="max-h-72 w-full">
      <BarChart
        data={data}
        layout={isHorizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 24, left: isHorizontal ? 8 : 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="0"
          vertical={isHorizontal}
          horizontal={!isHorizontal}
          className="stroke-border"
        />
        {isHorizontal ? (
          <>
            <XAxis
              type="number"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              tickLine={false}
              axisLine={false}
              width={100}
            />
          </>
        ) : (
          <>
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              type="number"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
            />
          </>
        )}
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel={isHorizontal} />}
        />
        <Bar
          dataKey="value"
          fill="var(--color-value)"
          radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          maxBarSize={24}
        >
          <LabelList
            dataKey="value"
            position={isHorizontal ? "right" : "top"}
            className="fill-foreground"
            fontSize={11}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
