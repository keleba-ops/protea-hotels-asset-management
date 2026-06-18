export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { CATEGORY_LABELS, STATUS_LABELS, MOVEMENT_LABELS } from "@/types";
import { formatDate } from "@/lib/utils";
import { Package, AlertTriangle, ArrowLeftRight, TrendingDown } from "lucide-react";

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default async function ReportsPage() {
  const [assets, movements, alerts, stockTakes] = await Promise.all([
    prisma.asset.findMany({ orderBy: { category: "asc" } }),
    prisma.movement.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      include: { asset: { select: { name: true, category: true } } },
    }),
    prisma.alert.findMany({ where: { resolved: false }, include: { asset: { select: { name: true } } } }),
    prisma.stockTake.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { items: true, user: { select: { name: true } } } }),
  ]).catch(() => [[], [], [], []] as [never[], never[], never[], never[]]);

  // Aggregations
  const byCategory = Object.entries(
    assets.reduce<Record<string, { count: number; qty: number }>>((acc, a) => {
      if (!acc[a.category]) acc[a.category] = { count: 0, qty: 0 };
      acc[a.category].count++;
      acc[a.category].qty += a.quantity;
      return acc;
    }, {})
  );

  const byStatus = Object.entries(
    assets.reduce<Record<string, number>>((acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const byMovementType = Object.entries(
    movements.reduce<Record<string, number>>((acc, m) => {
      acc[m.type] = (acc[m.type] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const lowStock = assets.filter((a) => a.parLevel && a.quantity < a.parLevel);
  const lostAssets = assets.filter((a) => a.status === "LOST");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <TopBar title="Reports" subtitle="Inventory summary and activity analytics" />
        <div className="p-6 space-y-8">

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total Assets", value: assets.length, color: "text-navy-600" },
              { label: "Total Qty in Stock", value: assets.reduce((s, a) => s + a.quantity, 0), color: "text-green-600" },
              { label: "Low Stock Items", value: lowStock.length, color: "text-amber-600" },
              { label: "Lost / Missing", value: lostAssets.length, color: "text-red-600" },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{c.label}</p>
                <p className={`mt-1 text-3xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            <Section title="Assets by Category" icon={Package}>
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">SKUs</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Total Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {byCategory.map(([cat, { count, qty }]) => (
                      <tr key={cat} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">{count}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title="Asset Status Breakdown" icon={Package}>
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Count</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {byStatus.map(([status, count]) => (
                      <tr key={status} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{count}</td>
                        <td className="px-4 py-3 text-right text-gray-400">
                          {assets.length ? Math.round((count / assets.length) * 100) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title={`Movement Activity (Last 30 Days) — ${movements.length} total`} icon={ArrowLeftRight}>
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                {byMovementType.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-gray-400">No movements in the last 30 days.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Movement Type</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {byMovementType.map(([type, count]) => (
                        <tr key={type} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">{MOVEMENT_LABELS[type as keyof typeof MOVEMENT_LABELS] ?? type}</td>
                          <td className="px-4 py-3 text-right text-gray-700">{count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Section>

            <Section title={`Low Stock Items — ${lowStock.length} items below par`} icon={TrendingDown}>
              <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                {lowStock.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-gray-400">All items are at or above par level.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Asset</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500">In Stock</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500">Par Level</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500">Deficit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {lowStock.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                          <td className="px-4 py-3 text-right text-red-600 font-medium">{a.quantity} {a.unit}</td>
                          <td className="px-4 py-3 text-right text-gray-500">{a.parLevel} {a.unit}</td>
                          <td className="px-4 py-3 text-right text-amber-600 font-medium">{a.parLevel! - a.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Section>

          </div>

          {/* Lost assets */}
          {lostAssets.length > 0 && (
            <Section title={`Lost / Missing Assets — ${lostAssets.length} items`} icon={AlertTriangle}>
              <div className="overflow-hidden rounded-xl border border-red-100 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="border-b border-red-100 bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-red-700">Asset</th>
                      <th className="px-4 py-3 text-left font-medium text-red-700">Code</th>
                      <th className="px-4 py-3 text-left font-medium text-red-700">Category</th>
                      <th className="px-4 py-3 text-left font-medium text-red-700">Last Location</th>
                      <th className="px-4 py-3 text-right font-medium text-red-700">Qty</th>
                      <th className="px-4 py-3 text-left font-medium text-red-700">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {lostAssets.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                        <td className="px-4 py-3 font-mono text-gray-500">{a.code}</td>
                        <td className="px-4 py-3 text-gray-600">{CATEGORY_LABELS[a.category as keyof typeof CATEGORY_LABELS] ?? a.category}</td>
                        <td className="px-4 py-3 text-gray-600">{a.location}</td>
                        <td className="px-4 py-3 text-right text-red-600 font-medium">{a.quantity} {a.unit}</td>
                        <td className="px-4 py-3 text-gray-400">{formatDate(a.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

        </div>
      </main>
    </div>
  );
}
