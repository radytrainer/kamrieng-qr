"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Role } from "@/lib/constants/roles";
import { useRoleLabels } from "@/lib/i18n/enum-labels";
import { ROUTES } from "@/lib/constants/routes";
import { signOut } from "@/features/auth/services/auth-client";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ProfileDialog } from "@/components/layout/profile-dialog";

interface AdminHeaderProps {
  displayName: string | null;
  email: string;
  photoUrl: string | null;
  role: Role;
}

export function AdminHeader({
  displayName,
  email,
  photoUrl,
  role,
}: AdminHeaderProps) {
  const t = useTranslations("layout");
  const tToast = useTranslations("toast");
  const router = useRouter();
  const roleLabels = useRoleLabels();
  const initials = (displayName ?? email).slice(0, 2).toUpperCase();
  const [profileOpen, setProfileOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success(tToast("signedOut"));
    router.push(ROUTES.login);
    router.refresh();
  };

  return (
    <header className="no-print bg-background flex h-16 items-center justify-between border-b px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-normal">
          {roleLabels[role]}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <LanguageSwitcher />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ring-ring flex items-center gap-2 rounded-full outline-none focus-visible:ring-2">
              <Avatar className="size-8">
                <AvatarImage
                  src={photoUrl ?? undefined}
                  alt={displayName ?? email}
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="truncate text-sm font-medium">
                {displayName ?? t("profile.defaultUser")}
              </span>
              <span className="text-muted-foreground truncate text-xs font-normal">
                {email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setProfileOpen(true)}>
              <UserIcon className="size-4" />
              {t("profile.myProfile")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleSignOut} variant="destructive">
              <LogOut className="size-4" />
              {t("profile.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        displayName={displayName}
        email={email}
        role={role}
      />
    </header>
  );
}
