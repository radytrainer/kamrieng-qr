"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Loader2, Upload, User } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { unwrapAction } from "@/lib/actions/action-result";
import { uploadStudentPhotoAction } from "@/features/students/actions/student-actions";

interface PhotoUploadProps {
  value: string | undefined;
  onChange: (url: string) => void;
}

export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
  const t = useTranslations("admin.students.photoUpload");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const { url } = await unwrapAction(uploadStudentPhotoAction(formData));
      onChange(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("uploadFailed"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* w-16/h-24 = 2:3, matching the "4x6" (4cm x 6cm) photo box on the
       * printed ID card — a square preview here would mislead admins about
       * how much of the photo actually shows up on the card. */}
      <div className="bg-muted flex h-24 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
        {value ? (
          <Image
            src={value}
            alt={t("uploadPhoto")}
            width={64}
            height={96}
            className="size-full object-contain"
          />
        ) : (
          <User className="text-muted-foreground size-8" />
        )}
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {value ? t("changePhoto") : t("uploadPhoto")}
        </Button>
        <p className="text-muted-foreground mt-1 text-xs">{t("hint")}</p>
      </div>
    </div>
  );
}
