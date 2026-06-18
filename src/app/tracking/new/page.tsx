export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MovementForm from "@/components/tracking/MovementForm";

export const metadata = { title: "Record Movement — Protea Hotels by Marriott" };

export default async function NewMovementPage({ searchParams }: { searchParams: Promise<{ assetId?: string }> }) {
  const { assetId } = await searchParams;

  const assets = await prisma.asset.findMany({
    where: { status: { not: "WRITTEN_OFF" } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true, location: true, quantity: true, unit: true },
  }).catch(() => []);

  // Reorder so pre-selected asset is first
  const sorted = assetId
    ? [...assets.filter((a) => a.id === assetId), ...assets.filter((a) => a.id !== assetId)]
    : assets;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <TopBar title="Record Movement" subtitle="Log a check-out, transfer, laundry or other movement" />
        <div className="p-6">
          <div className="max-w-2xl">
            <MovementForm assets={sorted} />
          </div>
        </div>
      </main>
    </div>
  );
}
