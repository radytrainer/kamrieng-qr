"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResetPasswordResultDialogProps {
  email: string | null;
  password: string | null;
  onClose: () => void;
}

export function ResetPasswordResultDialog({
  email,
  password,
  onClose,
}: ResetPasswordResultDialogProps) {
  const t = useTranslations("admin.users.resetPasswordDialog");
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog
      open={Boolean(password)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t.rich("description", {
              email: (chunks) => <strong>{chunks}</strong>,
              code: (chunks) => <code>{chunks}</code>,
              emailAddress: email ?? "",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted flex items-center gap-2 rounded-lg border p-3">
          <code className="flex-1 font-mono text-sm">{password}</code>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="text-success size-4" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>{t("done")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
