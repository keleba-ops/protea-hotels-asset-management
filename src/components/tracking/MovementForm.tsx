"use client";

import { useActionState, useState, useRef } from "react";
import { createMovement } from "@/app/actions/movements";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { MOVEMENT_TYPES, MOVEMENT_LABELS, HOTEL_LOCATIONS } from "@/types";
import Link from "next/link";
import { Barcode, QrCode } from "lucide-react";

type AssetOption = { id: string; name: string; code: string; location: string; quantity: number; unit: string; barcodeValue: string | null };

const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 focus:border-navy-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy-500";
const labelCls = "mb-1.5 block text-sm font-medium text-gray-700";

export default function MovementForm({ assets }: { assets: AssetOption[] }) {
  const [state, formAction] = useActionState(createMovement, null);
  const [selectedId, setSelectedId] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");
  const selectRef = useRef<HTMLSelectElement>(null);

  function handleCodeLookup(e: React.FormEvent) {
    e.preventDefault();
    const code = codeInput.trim().toUpperCase();
    const match = assets.find(
      (a) => a.code.toUpperCase() === code || a.barcodeValue?.toUpperCase() === code
    );
    if (match) {
      setSelectedId(match.id);
      setCodeError("");
      selectRef.current?.focus();
    } else {
      setCodeError(`No asset found with code "${code}"`);
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
      )}

      {/* Barcode / QR code lookup */}
      <div className="rounded-xl border border-navy-100 bg-navy-50 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Barcode className="h-4 w-4 text-navy-600" />
          <QrCode className="h-4 w-4 text-navy-600" />
          <span className="text-sm font-semibold text-navy-800">Barcode / Code Lookup</span>
          <span className="ml-auto text-xs text-navy-500">Scan or type asset code</span>
        </div>
        <form onSubmit={handleCodeLookup} className="flex gap-2">
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="e.g. LN-A3X7K2 — scan barcode here"
            className="flex-1 rounded-lg border border-navy-200 bg-white px-3.5 py-2 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
            autoComplete="off"
          />
          <button type="submit" className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700">
            Find
          </button>
        </form>
        {codeError && <p className="text-xs text-red-600">{codeError}</p>}
        {selectedId && !codeError && (
          <p className="text-xs text-green-700 font-medium">
            ✓ Asset selected: {assets.find((a) => a.id === selectedId)?.name}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">Movement Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Asset *</label>
            <select
              ref={selectRef}
              name="assetId"
              required
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className={inputCls}
            >
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
