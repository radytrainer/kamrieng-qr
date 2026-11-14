"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Download, Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { studentKeys } from "@/features/students/hooks/query-keys";

interface ImportResult {
  inserted: number;
  failed: number;
  errors: { row: number; message: string }[];
}

export function BulkImportDialog() {
  const t = useTranslations("admin.students.bulkImport");
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      toast.error(t("chooseFileFirst"));
      return;
    }

    setIsUploading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/students/bulk-import", {
        method: "POST",
        body: formData,
      });
      const body = (await response.json()) as ImportResult | { error: string };
      if (!response.ok || "error" in body) {
        throw new Error("error" in body ? body.error : t("importFailed"));
      }
      setResult(body);
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
      toast.success(t("imported", { count: body.inserted }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("importFailed"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="size-4" />
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- file download, not a page navigation; next/link would intercept the click instead of triggering the Content-Disposition download */}
          <a
            href="/api/students/bulk-import/template"
            className="text-primary inline-flex w-fit items-center gap-1.5 text-sm hover:underline"
          >
            <Download className="size-3.5" />
            {t("downloadTemplate")}
          </a>

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="border-input file:bg-secondary block w-full rounded-md border bg-transparent text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-sm"
          />

          {result && (
            <Alert variant={result.failed > 0 ? "destructive" : "default"}>
              <AlertTitle>
                {t("resultSummary", {
                  inserted: result.inserted,
                  failed: result.failed,
                })}
              </AlertTitle>
              {result.errors.length > 0 && (
                <AlertDescription>
                  <ul className="mt-1 max-h-32 list-inside list-disc overflow-y-auto text-xs">
                    {result.errors.map((e) => (
                      <li key={e.row}>
                        {t("rowError", { row: e.row, message: e.message })}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              )}
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleImport} disabled={isUploading}>
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {t("importButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
