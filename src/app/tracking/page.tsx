export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import { MOVEMENT_LABELS } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeftRight } from "lucide-react";
import { demoMovements } from "@/lib/demo-data";

const typeColors: Record<string, string> = {
  CHECK_OUT: "bg-blue-100 text-blue-700",
  CHECK_IN: "bg-green-100 text-green-700",
  LAUNDRY_OUT: "bg-purple-100 text-purple-700",
  LAUNDRY_IN: "bg-indigo-100 text-indigo-700",
  TRANSFER: "bg-amber-100 text-amber-700",
  MAINTENANCE: "bg-orange-100 text-orange-700",
  LOSS_REPORT: "bg-red-100 text-red-700",
  WRITE_OFF: "bg-gray-100 text-gray-600",
};

export default async function TrackingPage() {
  let movements;
  let isDemo = false;

  try {
    movements = await prisma.movement.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { asset: true, user: true },
    });
  } catch {
    movements = demoMovements;
    isDemo = true;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <TopBar title="Movement Log" subtitle="Asset check-in / check-out history" />
        <div className="p-6">
          {isDemo && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <strong>Demo mode</strong> — showing sample data.
            </div>
          )}
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            {movements.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <ArrowLeftRight className="h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-400">No movements recorded yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Asset</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">From</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">To</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Qty</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Staff</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{m.asset.name}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[m.type] ?? "bg-gray-100 text-gray-600"}`}>
                          {MOVEMENT_LABELS[m.type as keyof typeof MOVEMENT_LABELS]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{m.fromLocation ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{m.toLocation}</td>
                      <td className="px-4 py-3 text-gray-900">{m.quantity}</td>
                      <td className="px-4 py-3 text-gray-600">{m.user.name}</td>
                      <td className="px-4 py-3 text-gray-400">{formatDateTime(m.createdAt)}</td>
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
