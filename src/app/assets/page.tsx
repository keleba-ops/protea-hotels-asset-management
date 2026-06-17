import { prisma } from "@/lib/db";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import { STATUS_LABELS, CATEGORY_LABELS } from "@/types";
import { formatDate } from "@/lib/utils";
import { Package, Plus } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  IN_USE: "bg-blue-100 text-blue-700",
  IN_LAUNDRY: "bg-purple-100 text-purple-700",
  IN_MAINTENANCE: "bg-amber-100 text-amber-700",
  LOST: "bg-red-100 text-red-700",
  WRITTEN_OFF: "bg-gray-100 text-gray-600",
};

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const assets = await prisma.asset.findMany({
    where: {
      ...(params.category ? { category: params.category } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.q ? { name: { contains: params.q } } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <TopBar title="Assets" subtitle={`${assets.length} total assets`} />
        <div className="p-6 space-y-4">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            {["", "LINEN", "ELECTRONIC", "CONSUMABLE"].map((cat) => (
              <Link
                key={cat}
                href={cat ? `/assets?category=${cat}` : "/assets"}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  params.category === cat || (!params.category && cat === "")
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat ? CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] : "All"}
              </Link>
            ))}
            <div className="ml-auto">
              <Link
                href="/assets/new"
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Asset
              </Link>
            </div>
          </div>

          {/* Assets table */}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            {assets.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <Package className="h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-400">No assets found. Add your first asset to get started.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Asset</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Code</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Location</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Qty</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{asset.name}</td>
                      <td className="px-4 py-3 font-mono text-gray-500">{asset.code}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {CATEGORY_LABELS[asset.category as keyof typeof CATEGORY_LABELS]}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{asset.location}</td>
                      <td className="px-4 py-3 text-gray-900">
                        {asset.quantity} {asset.unit}
                        {asset.parLevel && asset.quantity < asset.parLevel && (
                          <span className="ml-1 text-red-500">⚠</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[asset.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABELS[asset.status as keyof typeof STATUS_LABELS]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{formatDate(asset.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
