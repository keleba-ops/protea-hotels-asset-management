"use client";

import { useActionState, useState, useEffect } from "react";
import { createAsset, updateAsset } from "@/app/actions/assets";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { CATEGORIES, ASSET_STATUSES, CONDITIONS, HOTEL_LOCATIONS, STATUS_LABELS, CATEGORY_LABELS } from "@/types";
import Link from "next/link";
import { QrCode, Wifi, Barcode, CheckCircle2, Info } from "lucide-react";
import dynamic from "next/dynamic";

const AssetBarcode = dynamic(() => import("@/components/assets/AssetBarcode"), { ssr: false });

type AssetData = {
  id: string; name: string; code: string; category: string; subcategory: string | null;
  description: string | null; status: string; condition: string; location: string;
  quantity: number; parLevel: number | null; unit: string; supplier: string | null;
  cost: number | null; purchaseDate: Date | null; expiryDate: Date | null;
  rfidTag: string | null; barcodeValue: string | null;
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
  const [rfidVal, setRfidVal] = useState(asset?.rfidTag ?? "");
  const [barcodeVal, setBarcodeVal] = useState(asset?.barcodeValue ?? "");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const scanUrl = isEdit
    ? (typeof window !== "undefined" ? window.location.origin : "https://mariot-assets.vercel.app") + `/scan/${asset.id}`
    : null;

  useEffect(() => {
    if (!scanUrl) return;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(scanUrl, {
        width: 140, margin: 1,
        color: { dark: "#1B3464", light: "#ffffff" },
      }).then(setQrDataUrl);
    });
  }, [scanUrl]);

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

      {/* Tracking */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-900">Tracking Tags</h2>
          <span className="text-xs text-gray-400">— assign one or more tracking methods to this asset</span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

          {/* QR Code */}
          <div className="rounded-xl border border-green-100 bg-green-50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">QR Code</span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                <CheckCircle2 className="h-3 w-3" /> Auto
              </span>
            </div>
            {isEdit && qrDataUrl ? (
              <div className="flex flex-col items-center gap-2">
                <img src={qrDataUrl} alt="QR Code" className="h-28 w-28 rounded-lg bg-white p-1 shadow-sm" />
                <p className="text-center text-xs text-green-700 font-mono break-all">{scanUrl}</p>
              </div>
            ) : (
              <div className="flex h-28 flex-col items-center justify-center gap-2 rounded-lg bg-white/60">
                <QrCode className="h-8 w-8 text-green-300" />
                <p className="text-center text-xs text-green-600">Generated automatically when asset is saved</p>
              </div>
            )}
            <div className="flex items-start gap-2 rounded-lg bg-white/60 px-3 py-2">
              <Info className="h-3.5 w-3.5 shrink-0 text-green-600 mt-0.5" />
              <p className="text-xs text-green-700">No setup required. Print the label from the asset detail page.</p>
            </div>
          </div>

          {/* RFID */}
          <div className={`rounded-xl border p-4 space-y-3 ${rfidVal ? "border-navy-100 bg-navy-50" : "border-gray-100 bg-gray-50"}`}>
            <div className="flex items-center gap-2">
              <Wifi className={`h-4 w-4 ${rfidVal ? "text-navy-600" : "text-gray-400"}`} />
              <span className={`text-sm font-semibold ${rfidVal ? "text-navy-800" : "text-gray-600"}`}>RFID Tag</span>
              {rfidVal && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-navy-100 px-2 py-0.5 text-xs font-semibold text-navy-700">
                  <CheckCircle2 className="h-3 w-3" /> Set
                </span>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">Tag ID</label>
              <input
                name="rfidTag"
                value={rfidVal}
                onChange={(e) => setRfidVal(e.target.value)}
                placeholder="e.g. E2001234560000001234ABCD"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-900 focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
              />
            </div>
            {rfidVal ? (
              <div className="rounded-lg bg-navy-100 px-3 py-2">
                <p className="text-xs font-mono text-navy-800 break-all">{rfidVal}</p>
              </div>
            ) : (
              <div className="flex h-12 items-center justify-center rounded-lg bg-white/60">
                <p className="text-xs text-gray-400">Enter RFID tag ID above</p>
              </div>
            )}
            <div className="flex items-start gap-2 rounded-lg bg-white/60 px-3 py-2">
              <Info className="h-3.5 w-3.5 shrink-0 text-gray-500 mt-0.5" />
              <p className="text-xs text-gray-500">Auto-logs movement when asset passes a reader checkpoint.</p>
            </div>
          </div>

          {/* Barcode */}
          <div className={`rounded-xl border p-4 space-y-3 ${barcodeVal ? "border-blue-100 bg-blue-50" : "border-gray-100 bg-gray-50"}`}>
            <div className="flex items-center gap-2">
              <Barcode className={`h-4 w-4 ${barcodeVal ? "text-blue-600" : "text-gray-400"}`} />
              <span className={`text-sm font-semibold ${barcodeVal ? "text-blue-800" : "text-gray-600"}`}>Barcode</span>
              {barcodeVal && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  <CheckCircle2 className="h-3 w-3" /> Set
                </span>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">Barcode value</label>
              <input
                name="barcodeValue"
                value={barcodeVal}
                onChange={(e) => setBarcodeVal(e.target.value)}
                placeholder={`e.g. ${asset?.code ?? "LN-A3X7K2"}`}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-mono text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="rounded-lg bg-white p-2 min-h-[3.5rem] flex items-center justify-center">
              {barcodeVal
                ? <AssetBarcode value={barcodeVal} height={44} />
                : <p className="text-xs text-gray-400">Live preview appears here</p>
              }
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-white/60 px-3 py-2">
              <Info className="h-3.5 w-3.5 shrink-0 text-gray-500 mt-0.5" />
              <p className="text-xs text-gray-500">Scan with USB/BT barcode scanner on the movement form or asset search.</p>
            </div>
          </div>

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
