export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/db";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { formatDateTime } from "@/lib/utils";
import { Plus, ClipboardList } from "lucide-react";

const statusStyles: Record<string, string> = {
  IN_PROGRESS: "bg-navy-100 text-navy-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default async function StockTakesPage() {
  const stockTakes = await prisma.stockTake.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      items: { select: { id: true, variance: true } },
    },
  }).catch(() => []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <TopBar title="Stock Takes" subtitle={`${stockTakes.length} total · ${stockTakes.filter((s) => s.status === "IN_PROGRESS").length} in progress`} />
        <div className="p-6 space-y-4">
          <div className="flex justify-end">
            <Link href="/stock-takes/new" className="flex items-center gap-2 rounded-lg bg-navy-600 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700">
              <Plus className="h-4 w-4" /> New Stock Take
            </Link>
          </div>

          {stockTakes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-100 bg-white py-16 shadow-sm">
              <ClipboardList className="h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-400">No stock takes yet. Start one to count your inventory.</p>
              <Link href="/stock-takes/new" className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700">
                Start Stock Take
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Location</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Items</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Variances</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Conducted by</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stockTakes.map((st) => {
                    const variances = st.items.filter((i) => i.variance !== 0).length;
                    return (
                      <tr key={st.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500">{formatDateTime(st.createdAt)}</td>
                        <td className="px-4 py-3 text-gray-900">{st.location ?? "All Locations"}</td>
                        <td className="px-4 py-3 text-gray-900">{st.items.length}</td>
                        <td className="px-4 py-3">
                          {variances > 0 ? (
                            <span className="text-amber-600 font-medium">{variances} variances</span>
                          ) : (
                            <span className="text-green-600">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{st.user.name}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[st.status] ?? "bg-gray-100 text-gray-600"}`}>
                            {st.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/stock-takes/${st.id}`} className="text-navy-600 hover:underline text-xs font-medium">
                            {st.status === "IN_PROGRESS" ? "Continue →" : "View →"}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
