import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { HOTEL_LOCATIONS } from "@/types";
import { createStockTake } from "@/app/actions/stock-takes";
import { SubmitButton } from "@/components/ui/SubmitButton";
import Link from "next/link";

export const metadata = { title: "New Stock Take — Protea Hotels by Marriott" };

const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-navy-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy-500";

export default function NewStockTakePage() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <TopBar title="New Stock Take" subtitle="Count inventory for a location or the whole property" />
        <div className="p-6">
          <div className="max-w-lg">
            <form action={createStockTake} className="space-y-6">
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                <h2 className="font-semibold text-gray-900">Stock Take Setup</h2>
                <p className="text-sm text-gray-500">
                  Assets at the chosen location will be loaded for counting. Select &ldquo;All Locations&rdquo; to count the entire property.
                </p>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Location</label>
                  <select name="location" className={inputCls} defaultValue="ALL">
                    <option value="ALL">All Locations</option>
                    {HOTEL_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Notes (optional)</label>
                  <textarea name="notes" rows={3} placeholder="e.g. End of month count, Quarterly audit…"
                    className={`${inputCls} resize-none`} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <SubmitButton className="px-6">Start Stock Take</SubmitButton>
                <Link href="/stock-takes" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
