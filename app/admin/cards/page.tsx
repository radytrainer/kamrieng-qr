import type { Metadata } from "next";
import { requireAdmin } from "@/lib/rbac/guards";
import { CardsListView } from "@/features/cards/components/cards-list-view";

export const metadata: Metadata = {
  title: "Cards",
};

export default async function CardsPage() {
  await requireAdmin();
  return <CardsListView />;
}
