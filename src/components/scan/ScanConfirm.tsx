"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { confirmScan } from "@/app/actions/scan";
import { HOTEL_LOCATIONS } from "@/types";
import { CheckCircle, Loader2, ArrowRight, RefreshCw } from "lucide-react";

interface SmartAction {
  type: string;
  label: string;
  toLocation: string;
  needsDestination: boolean;
  description: string;
  color: string;
}

interface Props {
  assetId: string;
  assetName: string;
  assetCode: string;
  assetStatus: string;
  assetLocation: string;
  assetCategory: string;
  assetQuantity: number;
  assetUnit: string;
  smartAction: SmartAction;
  alternativeActions: SmartAction[];
}

function ConfirmButton({ label, color }: { label: string; color: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-5 text-lg font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-60 ${color}`}
    >
      {pending ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle className="h-6 w-6" />}
      {pending ? "Recording…" : label}
    </button>
  );
}

export default function ScanConfirm({
  assetId, assetName, assetCode, assetStatus, assetLocation,
  assetQuantity, assetUnit, smartAction, alternativeActions,
}: Props) {
  const [state, formAction] = useActionState(confirmScan, null);
  const [active, setActive] = useState<SmartAction>(smartAction);
  const [destination, setDestination] = useState(smartAction.toLocation);
  const [showAlts, setShowAlts] = useState(false);

  const statusColors: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-700",
    IN_USE: "bg-blue-100 text-blue-700",
    IN_LAUNDRY: "bg-purple-100 text-purple-700",
    IN_MAINTENANCE: "bg-amber-100 text-amber-700",
    LOST: "bg-red-100 text-red-700",
  };
  const statusLabels: Record<string, string> = {
    AVAILABLE: "Available", IN_USE: "In Use", IN_LAUNDRY: "In Laundry",
    IN_MAINTENANCE: "In Maintenance", LOST: "Lost",
  };

  if (state?.success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg text-center space-y-5">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">Movement Recorded</p>
            <p className="mt-1 text-gray-500">{state.assetName}</p>
          </div>
          <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <span className="font-medium">{active.label}</span>
            {destination && <> → <span className="font-medium">{destination}</span></>}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-600 py-3 text-sm font-semibold text-white"
          >
            <RefreshCw className="h-4 w-4" /> Scan Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900 px-6 pt-12 pb-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-navy-300">Protea Hotels · Asset Scan</p>
        <h1 className="mt-2 text-2xl font-bold leading-tight">{assetName}</h1>
        <p className="mt-1 font-mono text-sm text-navy-400">{assetCode}</p>
        <div className="mt-3 flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[assetStatus] ?? "bg-gray-100 text-gray-600"}`}>
            {statusLabels[assetStatus] ?? assetStatus}
          </span>
          <span className="text-sm text-navy-300">{assetLocation}</span>
        </div>
      </div>

      {/* Action card */}
      <div className="flex-1 px-5 py-6 space-y-4">
        {/* Movement preview */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Movement</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-xl bg-gray-50 px-3 py-2 text-center text-sm font-medium text-gray-600">
              {assetLocation}
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-navy-600" />
            <div className="flex-1 rounded-xl bg-navy-50 px-3 py-2 text-center text-sm font-semibold text-navy-700">
              {active.needsDestination ? destination || "Select →" : (destination || active.toLocation)}
            </div>
          </div>
          <p className="mt-3 text-center text-sm text-gray-500">{active.description}</p>
        </div>

        {/* Destination picker (when CHECK_OUT or TRANSFER) */}
        {active.needsDestination && (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Send to</p>
            <div className="grid grid-cols-2 gap-2">
              {HOTEL_LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setDestination(loc)}
                  className={`rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    destination === loc
                      ? "bg-navy-600 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Confirm form */}
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="assetId" value={assetId} />
          <input type="hidden" name="type" value={active.type} />
          <input type="hidden" name="toLocation" value={active.needsDestination ? destination : (active.toLocation)} />
          <input type="hidden" name="quantity" value={assetQuantity} />

          {state?.error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{state.error}</p>
          )}

          <ConfirmButton label={`Confirm — ${active.label}`} color={active.color} />
        </form>

        {/* Alternative actions */}
        <div>
          <button
            type="button"
            onClick={() => setShowAlts(!showAlts)}
            className="w-full text-center text-sm text-gray-400 py-2"
          >
            {showAlts ? "Hide" : "Different movement type"}
          </button>
          {showAlts && (
            <div className="mt-2 space-y-2">
              {alternativeActions.map((alt) => (
                <button
                  key={alt.type}
                  type="button"
                  onClick={() => {
                    setActive(alt);
                    setDestination(alt.toLocation);
                    setShowAlts(false);
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {alt.label} — <span className="text-gray-400">{alt.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
