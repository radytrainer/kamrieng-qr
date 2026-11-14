"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { KeyRound, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useChangePassword,
  useUpdateProfile,
} from "@/features/auth/hooks/use-profile-mutations";
import {
  createProfileFormSchema,
  type ProfileFormInput,
} from "@/features/auth/schemas/profile-schema";
import {
  createChangePasswordFormSchema,
  type ChangePasswordFormInput,
} from "@/features/auth/schemas/change-password-schema";
import { useRoleLabels } from "@/lib/i18n/enum-labels";
import type { Role } from "@/lib/constants/roles";

const EMPTY_PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string | null;
  email: string;
  role: Role;
}

export function ProfileDialog({
  open,
  onOpenChange,
  displayName,
  email,
  role,
}: ProfileDialogProps) {
  const t = useTranslations("layout.profile");
  const tValidation = useTranslations("validation");
  const roleLabels = useRoleLabels();

  const profileFormSchema = React.useMemo(
    () => createProfileFormSchema(tValidation),
    [tValidation]
  );
  const passwordFormSchema = React.useMemo(
    () => createChangePasswordFormSchema(tValidation),
    [tValidation]
  );

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { displayName: displayName ?? "" },
  });
  const passwordForm = useForm<ChangePasswordFormInput>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: EMPTY_PASSWORD_FORM,
  });

  React.useEffect(() => {
    if (open) {
      profileForm.reset({ displayName: displayName ?? "" });
      passwordForm.reset(EMPTY_PASSWORD_FORM);
    }
  }, [open, displayName, profileForm, passwordForm]);

  const handleProfileSubmit = profileForm.handleSubmit(async (values) => {
    await updateProfile.mutateAsync(values);
  });

  const handlePasswordSubmit = passwordForm.handleSubmit(async (values) => {
    await changePassword.mutateAsync(values);
    passwordForm.reset(EMPTY_PASSWORD_FORM);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{email}</DialogDescription>
        </DialogHeader>

        <Badge variant="secondary" className="w-fit font-normal">
          {roleLabels[role]}
        </Badge>

        <Form {...profileForm}>
          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-3">
            <FormField
              control={profileForm.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("displayName")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="sm"
              className="w-fit"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {t("saveProfile")}
            </Button>
          </form>
        </Form>

        <div className="flex flex-col gap-3 border-t pt-4">
          <h3 className="text-sm font-medium">{t("changePasswordTitle")}</h3>
          <Form {...passwordForm}>
            <form
              onSubmit={handlePasswordSubmit}
              className="flex flex-col gap-3"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("currentPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("newPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("confirmPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="w-fit"
                disabled={changePassword.isPending}
              >
                {changePassword.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <KeyRound className="size-4" />
                )}
                {t("changePasswordButton")}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
