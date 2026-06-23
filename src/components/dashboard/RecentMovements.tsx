import { Movement, Asset, User } from "@prisma/client";
import { MOVEMENT_LABELS } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeftRight } from "lucide-react";

type MovementWithRelations = Movement & { asset: Asset; user: User | null };

interface RecentMovementsProps {
  movements: MovementWithRelations[];
}

export default function RecentMovements({ movements }: RecentMovementsProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="font-semibold text-gray-900">Recent Movements</h2>
        <ArrowLeftRight className="h-4 w-4 text-gray-400" />
      </div>
      {movements.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-gray-400">No movements recorded yet.</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {movements.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{m.asset.name}</p>
                <p className="text-xs text-gray-500">
                  {MOVEMENT_LABELS[m.type as keyof typeof MOVEMENT_LABELS]} · {m.user?.name ?? "System"}
                </p>
              </div>
              <div className="ml-4 shrink-0 text-right">
                <p className="text-xs text-gray-400">{formatDateTime(m.createdAt)}</p>
                <p className="text-xs text-gray-500">{m.toLocation}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
