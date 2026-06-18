"use client";

import { useActionState } from "react";
import { createMovement } from "@/app/actions/movements";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { MOVEMENT_TYPES, MOVEMENT_LABELS, HOTEL_LOCATIONS } from "@/types";
import Link from "next/link";

type AssetOption = { id: string; name: string; code: string; location: string; quantity: number; unit: string };

const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-navy-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy-500";
const labelCls = "mb-1.5 block text-sm font-medium text-gray-700";

export default function MovementForm({ assets }: { assets: AssetOption[] }) {
  const [state, formAction] = useActionState(createMovement, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Movement Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Asset *</label>
            <select name="assetId" required className={inputCls}>
              <option value="">Select asset…</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.code}) — {a.quantity} {a.unit} @ {a.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Movement Type *</label>
            <select name="type" required className={inputCls}>
              <option value="">Select type…</option>
              {Object.entries(MOVEMENT_TYPES).map(([k, v]) => (
                <option key={k} value={v}>{MOVEMENT_LABELS[v as keyof typeof MOVEMENT_LABELS]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Destination *</label>
            <select name="toLocation" required className={inputCls}>
              <option value="">Select destination…</option>
              {HOTEL_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Quantity *</label>
            <input type="number" name="quantity" required min={1} defaultValue={1} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <input name="notes" placeholder="Optional notes…" className={inputCls} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton className="px-6">Record Movement</SubmitButton>
        <Link href="/tracking" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
          Cancel
        </Link>
      </div>
    </form>
  );
}
