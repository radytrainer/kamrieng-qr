import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type Role } from "@/lib/constants/roles";
import { useRoleLabels } from "@/lib/i18n/enum-labels";

const ROLE_STYLES: Partial<Record<Role, string>> = {
  super_admin: "bg-destructive/10 text-destructive border-destructive/30",
  school_admin: "bg-primary/10 text-primary border-primary/30",
  teacher: "bg-info/10 text-info border-info/30",
  student: "bg-muted text-muted-foreground border-border",
};

export function UserRoleBadge({ role }: { role: string }) {
  const key = role as Role;
  const roleLabels = useRoleLabels();
  return (
    <Badge variant="outline" className={cn("font-normal", ROLE_STYLES[key])}>
      {roleLabels[key] ?? role}
    </Badge>
  );
}
