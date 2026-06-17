import { Alert, Asset } from "@prisma/client";
import { ALERT_LABELS } from "@/types";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, CheckCircle } from "lucide-react";

type AlertWithAsset = Alert & { asset: Asset | null };

interface AlertsListProps {
  alerts: AlertWithAsset[];
}

const alertColors: Record<string, string> = {
  LOW_STOCK: "text-amber-600 bg-amber-50",
  ITEM_LOST: "text-red-600 bg-red-50",
  MAINTENANCE_DUE: "text-blue-600 bg-blue-50",
  EXPIRY_SOON: "text-orange-600 bg-orange-50",
  HIGH_VARIANCE: "text-purple-600 bg-purple-50",
};

export default function AlertsList({ alerts }: AlertsListProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="font-semibold text-gray-900">Active Alerts</h2>
        <AlertTriangle className="h-4 w-4 text-amber-500" />
      </div>
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-5 py-8">
          <CheckCircle className="h-8 w-8 text-green-400" />
          <p className="text-sm text-gray-400">All clear — no active alerts.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {alerts.map((a) => (
            <li key={a.id} className="flex items-start gap-3 px-5 py-3">
              <span className={`mt-0.5 rounded-md px-2 py-0.5 text-xs font-medium ${alertColors[a.type] ?? "text-gray-600 bg-gray-100"}`}>
                {ALERT_LABELS[a.type as keyof typeof ALERT_LABELS]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-800">{a.message}</p>
                {a.asset && <p className="text-xs text-gray-400">{a.asset.name}</p>}
                <p className="text-xs text-gray-400">{formatDate(a.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
