export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import { ALERT_LABELS } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { Bell, CheckCircle } from "lucide-react";
import { demoAlerts } from "@/lib/demo-data";

const alertColors: Record<string, string> = {
  LOW_STOCK: "bg-amber-100 text-amber-700 border-amber-200",
  ITEM_LOST: "bg-red-100 text-red-700 border-red-200",
  MAINTENANCE_DUE: "bg-blue-100 text-blue-700 border-blue-200",
  EXPIRY_SOON: "bg-orange-100 text-orange-700 border-orange-200",
  HIGH_VARIANCE: "bg-purple-100 text-purple-700 border-purple-200",
};

export default async function AlertsPage() {
  let active: typeof demoAlerts;
  let resolved: typeof demoAlerts = [];
  let isDemo = false;

  try {
    [active, resolved] = await Promise.all([
      prisma.alert.findMany({
        where: { resolved: false },
        orderBy: { createdAt: "desc" },
        include: { asset: true },
      }),
      prisma.alert.findMany({
        where: { resolved: true },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { asset: true },
      }),
    ]) as [typeof demoAlerts, typeof demoAlerts];
  } catch {
    active = demoAlerts;
    isDemo = true;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <TopBar title="Alerts" subtitle={`${active.length} active · ${resolved.length} resolved`} />
        <div className="p-6 space-y-6">
          {isDemo && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <strong>Demo mode</strong> — showing sample data.
            </div>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Active</h2>
            {active.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-6">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <p className="text-sm text-gray-500">No active alerts — all systems clear.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {active.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-4 rounded-xl border bg-white p-4 ${alertColors[alert.type] ?? "border-gray-200"}`}
                  >
                    <Bell className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide">
                          {ALERT_LABELS[alert.type as keyof typeof ALERT_LABELS]}
                        </span>
                        {alert.asset && (
                          <span className="text-xs opacity-70">· {alert.asset.name}</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm">{alert.message}</p>
                      <p className="mt-1 text-xs opacity-60">{formatDateTime(alert.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {resolved.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Recently Resolved</h2>
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Message</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Asset</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {resolved.map((a) => (
                      <tr key={a.id} className="opacity-60">
                        <td className="px-4 py-3 text-gray-600">
                          {ALERT_LABELS[a.type as keyof typeof ALERT_LABELS]}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{a.message}</td>
                        <td className="px-4 py-3 text-gray-500">{a.asset?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-400">{formatDateTime(a.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
