export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { ROLES } from "@/types";
import { createUser, updateUserRole, deleteUser } from "@/app/actions/users";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { auth } from "@/auth";
import { ShieldAlert } from "lucide-react";

const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-navy-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy-500";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  MANAGER: "Manager",
  HOUSEKEEPER: "Housekeeper",
  LAUNDRY_STAFF: "Laundry Staff",
  STORE_MANAGER: "Store Manager",
};

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  MANAGER: "bg-navy-100 text-navy-700",
  HOUSEKEEPER: "bg-green-100 text-green-700",
  LAUNDRY_STAFF: "bg-purple-100 text-purple-700",
  STORE_MANAGER: "bg-amber-100 text-amber-700",
};

export default async function SettingsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  }).catch(() => []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <TopBar title="Settings" subtitle="User management and system configuration" />
        <div className="p-6 space-y-6">

          {!isAdmin && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>Admin access required</strong> to add or modify users. You can view the team below.
              </p>
            </div>
          )}

          {/* User list */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Team Members</h2>
              <span className="text-sm text-gray-400">{users.length} users</span>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                  {isAdmin && <th className="px-4 py-3 text-left font-medium text-gray-500">Change Role</th>}
                  {isAdmin && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {roleLabels[u.role] ?? u.role}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <form action={updateUserRole} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={u.id} />
                          <select name="role" defaultValue={u.role} className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500">
                            {Object.keys(ROLES).map((r) => (
                              <option key={r} value={r}>{roleLabels[r] ?? r}</option>
                            ))}
                          </select>
                          <SubmitButton className="py-1.5 text-xs">Save</SubmitButton>
                        </form>
                      </td>
                    )}
                    {isAdmin && (
                      <td className="px-4 py-3">
                        {u.id !== session?.user?.id && (
                          <form action={deleteUser}>
                            <input type="hidden" name="id" value={u.id} />
                            <SubmitButton variant="danger" className="py-1.5 text-xs">Remove</SubmitButton>
                          </form>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add user form */}
          {isAdmin && (
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 font-semibold text-gray-900">Add New User</h2>
              <form action={createUser} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Full Name *</label>
                  <input name="name" required placeholder="Jane Smith" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Email *</label>
                  <input type="email" name="email" required placeholder="jane@proteahotels.co.bw" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Password * (min 8 chars)</label>
                  <input type="password" name="password" required minLength={8} placeholder="••••••••" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Role *</label>
                  <select name="role" required className={inputCls} defaultValue="HOUSEKEEPER">
                    {Object.keys(ROLES).map((r) => (
                      <option key={r} value={r}>{roleLabels[r] ?? r}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <SubmitButton className="px-6">Add User</SubmitButton>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
