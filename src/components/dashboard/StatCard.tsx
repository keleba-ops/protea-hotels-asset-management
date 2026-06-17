import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "blue" | "green" | "amber" | "red" | "purple";
}

const colorMap = {
  blue:   { bg: "bg-blue-50",   icon: "bg-blue-100 text-blue-600",   text: "text-blue-600" },
  green:  { bg: "bg-green-50",  icon: "bg-green-100 text-green-600", text: "text-green-600" },
  amber:  { bg: "bg-amber-50",  icon: "bg-amber-100 text-amber-600", text: "text-amber-600" },
  red:    { bg: "bg-red-50",    icon: "bg-red-100 text-red-600",     text: "text-red-600" },
  purple: { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-600", text: "text-purple-600" },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "blue",
}: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={cn("rounded-xl border border-gray-100 bg-white p-5 shadow-sm")}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={cn("mt-1 text-xs font-medium", trend.value >= 0 ? "text-green-600" : "text-red-600")}>
              {trend.value >= 0 ? "▲" : "▼"} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn("rounded-lg p-2.5", c.icon)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
