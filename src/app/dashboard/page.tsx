export const dynamic = "force-dynamic";

import { Package, Shirt, Tv, ShoppingBag, AlertTriangle, ArrowLeftRight } from "lucide-react";
import { prisma } from "@/lib/db";
import StatCard from "@/components/dashboard/StatCard";
import RecentMovements from "@/components/dashboard/RecentMovements";
import AlertsList from "@/components/dashboard/AlertsList";
import TopBar from "@/components/layout/TopBar";
import { demoMovements, demoAlerts, demoCounts } from "@/lib/demo-data";

async function getDashboardData() {
  try {
    const [total, linens, electronics, consumables, lost, lowStock, movements, alerts] =
      await Promise.all([
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
    return { counts: { total, linens, electronics, consumables, lost, lowStock, movementsToday: movements.length, activeAlerts: alerts.length }, movements, alerts, demo: false };
  } catch {
    return {
      counts: demoCounts,
      movements: demoMovements as never,
      alerts: demoAlerts as never,
      demo: true,
    };
  }
}

export default async function DashboardPage() {
  const { counts, movements, alerts, demo } = await getDashboardData();

  return (
    <div className="flex flex-col">
      <TopBar title="Dashboard" subtitle="Protea Hotel by Marriott — Asset Overview" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Assets" value={counts.total} icon={Package} color="blue" />
          <StatCard label="Linens" value={counts.linens} icon={Shirt} color="purple" />
          <StatCard label="Electronics" value={counts.electronics} icon={Tv} color="green" />
          <StatCard label="Consumables" value={counts.consumables} icon={ShoppingBag} color="amber" />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Lost / Missing" value={counts.lost} icon={AlertTriangle} color="red" />
          <StatCard label="Low Stock Alerts" value={counts.lowStock} icon={AlertTriangle} color="amber" />
          <StatCard label="Movements Today" value={counts.movementsToday} icon={ArrowLeftRight} color="blue" />
          <StatCard label="Active Alerts" value={counts.activeAlerts} icon={AlertTriangle} color="red" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentMovements movements={movements} />
          <AlertsList alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
