"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Shirt,
  Tv,
  ShoppingBag,
  ArrowLeftRight,
  ClipboardList,
  BarChart3,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assets", label: "All Assets", icon: Package },
  { href: "/assets?category=LINEN", label: "Linens", icon: Shirt },
  { href: "/assets?category=ELECTRONIC", label: "Electronics", icon: Tv },
  { href: "/assets?category=CONSUMABLE", label: "Consumables", icon: ShoppingBag },
  { href: "/tracking", label: "Movement Log", icon: ArrowLeftRight },
  { href: "/stock-takes", label: "Stock Takes", icon: ClipboardList },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  MANAGER: "Manager",
  HOUSEKEEPER: "Housekeeper",
  LAUNDRY_STAFF: "Laundry Staff",
  STORE_MANAGER: "Store Manager",
};

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-gray-200 px-4">
        <Image
          src="/Protealogo.png"
          alt="Protea Hotels by Marriott"
          width={180}
          height={79}
          className="object-contain"
          priority
          unoptimized
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href.split("?")[0] || pathname.startsWith(href.split("?")[0] + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-navy-50 text-navy-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {session?.user?.name ?? "Loading…"}
            </p>
            <p className="truncate text-xs text-gray-500">
              {session?.user?.role ? (roleLabels[session.user.role] ?? session.user.role) : ""}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <p className="text-center text-[10px] leading-tight text-gray-400">
          Developed by{" "}
          <span className="font-medium text-gray-500">i-Centric Technologies</span>
        </p>
      </div>
    </aside>
  );
}
