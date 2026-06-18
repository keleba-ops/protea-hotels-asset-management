export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { formatDateTime } from "@/lib/utils";
import { saveStockTakeItems, cancelStockTake } from "@/app/actions/stock-takes";
import { SubmitButton } from "@/components/ui/SubmitButton";
import Link from "next/link";

export default async function StockTakeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const st = await prisma.stockTake.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      items: {
        include: { asset: { select: { id: true, name: true, code: true, unit: true, location: true } } },
        orderBy: { asset: { name: "asc" } },
      },
    },
  }).catch(() => null);

  if (!st) notFound();

  const isOpen = st.status === "IN_PROGRESS";
  const totalVariance = st.items.reduce((sum, i) => sum + Math.abs(i.variance), 0);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <TopBar
          title={`Stock Take — ${st.location ?? "All Locations"}`}
          subtitle={`Started ${formatDateTime(st.createdAt)} by ${st.user.name}`}
        />
        <div className="p-6 space-y-4">
          {/* Status bar */}
          <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
            <div className="flex gap-6 text-sm">
              <span><span className="font-semibold text-gray-900">{st.items.length}</span> <span className="text-gray-500">items</span></span>
              <span><span className="font-semibold text-amber-600">{st.items.filter((i) => i.variance !== 0).length}</span> <span className="text-gray-500">variances</span></span>
              <span><span className="font-semibold text-gray-900">{totalVariance}</span> <span className="text-gray-500">units unaccounted</span></span>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isOpen ? "bg-navy-100 text-navy-700" : st.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {st.status.replace("_", " ")}
            </span>
          </div>

          {st.notes && (
            <p className="text-sm text-gray-600 italic">{st.notes}</p>
          )}

          <form action={saveStockTakeItems}>
            <input type="hidden" name="stockTakeId" value={st.id} />

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Asset</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Location</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Expected</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Counted</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {st.items.map((item) => (
                    <tr key={item.id} className={item.variance !== 0 ? "bg-amber-50/50" : ""}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.asset.name}</p>
                        <p className="text-xs text-gray-400">{item.asset.code}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{item.asset.location}</td>
                      <td className="px-4 py-3 text-gray-700">{item.expected} {item.asset.unit}</td>
                      <td className="px-4 py-3">
                        {isOpen ? (
                          <input
                            type="number"
                            name={`counted_${item.id}`}
                            defaultValue={item.counted}
                            min={0}
                            className="w-24 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
                          />
                        ) : (
                          <span className="text-gray-900">{item.counted} {item.asset.unit}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={item.variance === 0 ? "text-green-600" : item.variance < 0 ? "text-red-600 font-medium" : "text-amber-600 font-medium"}>
                          {item.variance > 0 ? "+" : ""}{item.variance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isOpen && (
              <div className="mt-4 flex items-center gap-3">
                <button type="submit" name="complete" value="false"
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Save Progress
                </button>
                <button type="submit" name="complete" value="true"
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                  Complete Stock Take
                </button>
                <div className="ml-auto">
                  <form action={cancelStockTake}>
                    <input type="hidden" name="id" value={st.id} />
                    <SubmitButton variant="danger">Cancel Stock Take</SubmitButton>
                  </form>
                </div>
              </div>
            )}
          </form>

          {!isOpen && (
            <div className="flex justify-end">
              <Link href="/stock-takes" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                ← Back to Stock Takes
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
