export const dynamic = "force-dynamic";

import { Package, Shirt, Tv, ShoppingBag, AlertTriangle, ArrowLeftRight } from "lucide-react";
import { prisma } from "@/lib/db";
import StatCard from "@/components/dashboard/StatCard";
import RecentMovements from "@/components/dashboard/RecentMovements";
import AlertsList from "@/components/dashboard/AlertsList";
import TopBar from "@/components/layout/TopBar";

async function getDashboardData() {
  const [
    totalAssets,
    linens,
    electronics,
    consumables,
    lostAssets,
    lowStockCount,
    recentMovements,
    activeAlerts,
  ] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({ where: { category: "LINEN" } }),
    prisma.asset.count({ where: { category: "ELECTRONIC" } }),
    prisma.asset.count({ where: { category: "CONSUMABLE" } }),
    prisma.asset.count({ where: { status: "LOST" } }),
    prisma.alert.count({ where: { type: "LOW_STOCK", resolved: false } }),
    prisma.movement.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { asset: true, user: true },
    }),
    prisma.alert.findMany({
      where: { resolved: false },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { asset: true },
    }),
  ]);

  return { totalAssets, linens, electronics, consumables, lostAssets, lowStockCount, recentMovements, activeAlerts };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-col">
      <TopBar title="Dashboard" subtitle="Mariot Hotel — Asset Overview" />

      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Assets" value={data.totalAssets} icon={Package} color="blue" />
          <StatCard label="Linens" value={data.linens} icon={Shirt} color="purple" />
          <StatCard label="Electronics" value={data.electronics} icon={Tv} color="green" />
          <StatCard label="Consumables" value={data.consumables} icon={ShoppingBag} color="amber" />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Lost / Missing" value={data.lostAssets} icon={AlertTriangle} color="red" />
          <StatCard label="Low Stock Alerts" value={data.lowStockCount} icon={AlertTriangle} color="amber" />
          <StatCard label="Movements Today" value={data.recentMovements.length} icon={ArrowLeftRight} color="blue" />
          <StatCard label="Active Alerts" value={data.activeAlerts.length} icon={AlertTriangle} color="red" />
        </div>

        {/* Recent activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentMovements movements={data.recentMovements} />
          <AlertsList alerts={data.activeAlerts} />
        </div>
      </div>
    </div>
  );
}
