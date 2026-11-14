"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRegenerateToken } from "@/features/qr/hooks/use-regenerate-token";

interface StudentQrCardProps {
  studentId: string;
  canManage: boolean;
}

export function StudentQrCard({ studentId, canManage }: StudentQrCardProps) {
  const t = useTranslations("admin.qr");
  const tCommon = useTranslations("common");
  const regenerate = useRegenerateToken(studentId);
  // Cache-bust the <img> after regenerating so the new token's QR renders immediately.
  const [version, setVersion] = React.useState(0);

  const handleRegenerate = async () => {
    await regenerate.mutateAsync();
    setVersion((v) => v + 1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="flex size-48 items-center justify-center rounded-lg border bg-white p-3">
          <Image
            key={version}
            src={`/api/students/${studentId}/qr?size=384&v=${version}`}
            alt={t("title")}
            width={384}
            height={384}
            unoptimized
            className="size-full object-contain"
          />
        </div>

        <div className="flex w-full flex-col gap-2">
          <Button variant="outline" asChild>
            <a href={`/api/students/${studentId}/qr?download=1`} download>
              <Download className="size-4" />
              {t("downloadQr")}
            </a>
          </Button>

          {canManage && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                >
                  {regenerate.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  {t("regenerateButton")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {t("regenerateStudentTitle")}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("regenerateDescription")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRegenerate}>
                    {t("regenerate")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
