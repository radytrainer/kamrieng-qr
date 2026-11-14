"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Printer, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SingleCardPrintViewProps {
  personName: string;
  isExpired?: boolean;
  children: ReactNode;
}

/** Individual "Download Card" view — one official card centered on the
 * page with a print/save-as-PDF button, no pagination (that's what
 * OfficialCardsPrintView is for, when printing many at once). */
export function SingleCardPrintView({
  personName,
  isExpired,
  children,
}: SingleCardPrintViewProps) {
  const t = useTranslations("admin.cards.printView");
  return (
    <>
      <div className="no-print flex flex-col items-center gap-2 py-6 text-center">
        <p className="text-muted-foreground text-sm">
          {t("cardFor", { name: personName })}
        </p>

        {isExpired && (
          <div className="border-destructive/30 bg-destructive/10 text-destructive flex max-w-md items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium">
            <TriangleAlert className="size-4 shrink-0" />
            {t("cardExpired")}
          </div>
        )}

        <Button onClick={() => window.print()}>
          <Printer className="size-4" />
          {t("printSaveAsPdf")}
        </Button>
        <p className="text-muted-foreground max-w-md text-xs">
          {t("printHint")}
        </p>
      </div>

      <div className="flex justify-center py-4">{children}</div>
    </>
  );
}
