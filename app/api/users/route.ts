import { NextResponse, type NextRequest } from "next/server";
import { requireApiSession } from "@/lib/rbac/api-guards";
import { ROLES } from "@/lib/constants/roles";
import { userFilterSchema } from "@/features/users/schemas/user-schema";
import { userRepository } from "@/features/users/services/user-repository";

export async function GET(request: NextRequest) {
  const auth = await requireApiSession([ROLES.SUPER_ADMIN]);
  if (auth instanceof NextResponse) return auth;

  const parsed = userFilterSchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 }
    );
  }

  const result = await userRepository.list(parsed.data);
  return NextResponse.json(result);
}
