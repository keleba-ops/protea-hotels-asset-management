"use client";

import { useActionState } from "react";
import { createAsset, updateAsset } from "@/app/actions/assets";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { CATEGORIES, ASSET_STATUSES, CONDITIONS, HOTEL_LOCATIONS, STATUS_LABELS, CATEGORY_LABELS } from "@/types";
import Link from "next/link";

type AssetData = {
  id: string; name: string; code: string; category: string; subcategory: string | null;
  description: string | null; status: string; condition: string; location: string;
  quantity: number; parLevel: number | null; unit: string; supplier: string | null;
  cost: number | null; purchaseDate: Date | null; expiryDate: Date | null;
};

const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-navy-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy-500";
const labelCls = "mb-1.5 block text-sm font-medium text-gray-700";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

export default function AssetForm({ asset }: { asset?: AssetData | null }) {
  const isEdit = !!asset;
  const action = isEdit ? updateAsset : createAsset;
  const [state, formAction] = useActionState(action, null);

  const fmt = (d: Date | null) => d ? new Date(d).toISOString().split("T")[0] : "";

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && <input type="hidden" name="id" value={asset.id} />}

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      {/* Basic info */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Basic Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Asset Name *">
            <input name="name" required defaultValue={asset?.name} placeholder="e.g. Bath Towels (Large)" className={inputCls} />
          </Field>
          <Field label="Asset Code">
            <input name="code" defaultValue={asset?.code} placeholder="Auto-generated if blank" className={inputCls} />
          </Field>
          <Field label="Category *">
            <select name="category" required defaultValue={asset?.category ?? ""} className={inputCls}>
              <option value="">Select category…</option>
              {Object.entries(CATEGORIES).map(([k, v]) => (
                <option key={k} value={v}>{CATEGORY_LABELS[v as keyof typeof CATEGORY_LABELS]}</option>
              ))}
            </select>
          </Field>
          <Field label="Sub-category">
            <input name="subcategory" defaultValue={asset?.subcategory ?? ""} placeholder="e.g. Bath Linen" className={inputCls} />
          </Field>
          <Field label="Description">
            <input name="description" defaultValue={asset?.description ?? ""} placeholder="Optional description" className={inputCls} />
          </Field>
          <Field label="Supplier">
            <input name="supplier" defaultValue={asset?.supplier ?? ""} placeholder="Supplier name" className={inputCls} />
          </Field>
        </div>
      </div>

      {/* Inventory */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Inventory & Location</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Status *">
            <select name="status" required defaultValue={asset?.status ?? "AVAILABLE"} className={inputCls}>
              {Object.entries(ASSET_STATUSES).map(([k, v]) => (
                <option key={k} value={v}>{STATUS_LABELS[v as keyof typeof STATUS_LABELS]}</option>
              ))}
            </select>
          </Field>
          <Field label="Condition *">
            <select name="condition" required defaultValue={asset?.condition ?? "GOOD"} className={inputCls}>
              {Object.keys(CONDITIONS).map((k) => (
                <option key={k} value={k}>{k.charAt(0) + k.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </Field>
          <Field label="Location *">
            <select name="location" required defaultValue={asset?.location ?? ""} className={inputCls}>
              <option value="">Select location…</option>
              {HOTEL_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity *">
              <input type="number" name="quantity" required min={0} defaultValue={asset?.quantity ?? 1} className={inputCls} />
            </Field>
            <Field label="Unit">
              <input name="unit" defaultValue={asset?.unit ?? "pcs"} placeholder="pcs" className={inputCls} />
            </Field>
          </div>
          <Field label="Par Level (minimum)">
            <input type="number" name="parLevel" min={0} defaultValue={asset?.parLevel ?? ""} placeholder="Alert below this qty" className={inputCls} />
          </Field>
          <Field label="Cost (BWP)">
            <input type="number" name="cost" min={0} step="0.01" defaultValue={asset?.cost ?? ""} placeholder="0.00" className={inputCls} />
          </Field>
        </div>
      </div>

      {/* Dates */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Dates</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Purchase Date">
            <input type="date" name="purchaseDate" defaultValue={fmt(asset?.purchaseDate ?? null)} className={inputCls} />
          </Field>
          <Field label="Expiry Date">
            <input type="date" name="expiryDate" defaultValue={fmt(asset?.expiryDate ?? null)} className={inputCls} />
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton className="px-6">{isEdit ? "Save Changes" : "Create Asset"}</SubmitButton>
        <Link href={isEdit ? `/assets/${asset.id}` : "/assets"} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
          Cancel
        </Link>
      </div>
    </form>
  );
}
