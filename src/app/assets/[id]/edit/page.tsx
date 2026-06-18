export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import AssetForm from "@/components/assets/AssetForm";

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const asset = await prisma.asset.findUnique({ where: { id } }).catch(() => null);
  if (!asset) notFound();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <TopBar title="Edit Asset" subtitle={`${asset.name} · ${asset.code}`} />
        <div className="p-6">
          <div className="max-w-2xl">
            <AssetForm asset={asset} />
          </div>
        </div>
      </main>
    </div>
  );
}
