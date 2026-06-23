export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { CATEGORY_LABELS, STATUS_LABELS, MOVEMENT_LABELS } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Pencil, ArrowLeft, QrCode, Wifi, Barcode } from "lucide-react";
import { deleteAsset } from "@/app/actions/assets";
import { SubmitButton } from "@/components/ui/SubmitButton";
import AssetQRCode from "@/components/assets/AssetQRCode";
import AssetBarcode from "@/components/assets/AssetBarcode";

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  IN_USE: "bg-navy-100 text-navy-700",
  IN_LAUNDRY: "bg-purple-100 text-purple-700",
  IN_MAINTENANCE: "bg-amber-100 text-amber-700",
  LOST: "bg-red-100 text-red-700",
  WRITTEN_OFF: "bg-gray-100 text-gray-600",
};

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-900">{value || "—"}</p>
    </div>
  );
}

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      movements: {
        take: 15,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      },
    },
  }).catch(() => null);

  if (!asset) notFound();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <TopBar title={asset.name} subtitle={`${asset.code} · ${CATEGORY_LABELS[asset.category as keyof typeof CATEGORY_LABELS] ?? asset.category}`} />
        <div className="p-6 space-y-6">

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/assets" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" /> All Assets
            </Link>
            <div className="ml-auto flex gap-2">
              <Link href={`/assets/${asset.id}/edit`} className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Pencil className="h-4 w-4" /> Edit
              </Link>
              <form action={deleteAsset}>
                <input type="hidden" name="id" value={asset.id} />
                <SubmitButton variant="danger">Delete Asset</SubmitButton>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Details */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Asset Details</h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[asset.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[asset.status as keyof typeof STATUS_LABELS] ?? asset.status}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Detail label="Location" value={asset.location} />
                  <Detail label="Condition" value={asset.condition.charAt(0) + asset.condition.slice(1).toLowerCase()} />
                  <Detail label="Quantity" value={`${asset.quantity} ${asset.unit}`} />
                  <Detail label="Par Level" value={asset.parLevel ? `${asset.parLevel} ${asset.unit}` : "Not set"} />
                  <Detail label="Subcategory" value={asset.subcategory} />
                  <Detail label="Supplier" value={asset.supplier} />
                  <Detail label="Cost" value={asset.cost ? `BWP ${asset.cost.toFixed(2)}` : null} />
                  <Detail label="Purchase Date" value={asset.purchaseDate ? formatDate(asset.purchaseDate) : null} />
                  <Detail label="Expiry Date" value={asset.expiryDate ? formatDate(asset.expiryDate) : null} />
                  <Detail label="Last Updated" value={formatDateTime(asset.updatedAt)} />
                  {asset.description && (
                    <div className="col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Description</p>
                      <p className="mt-0.5 text-sm text-gray-700">{asset.description}</p>
                    </div>
                  )}
                </dl>
              </div>

              {/* Movement history */}
              <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
                <h2 className="border-b border-gray-100 px-5 py-4 font-semibold text-gray-900">
                  Movement History
                </h2>
                {asset.movements.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-gray-400">No movements recorded.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-100 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">From</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">To</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Qty</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Staff</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {asset.movements.map((m) => (
                        <tr key={m.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-700">
                            {MOVEMENT_LABELS[m.type as keyof typeof MOVEMENT_LABELS] ?? m.type}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{m.fromLocation ?? "—"}</td>
                          <td className="px-4 py-3 text-gray-700">{m.toLocation}</td>
                          <td className="px-4 py-3 text-gray-900">{m.quantity}</td>
                          <td className="px-4 py-3 text-gray-600">{m.user?.name ?? "System"}</td>
                          <td className="px-4 py-3 text-gray-400">{formatDateTime(m.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 font-semibold text-gray-900">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href={`/scan/${asset.id}`} className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-700">
                    <QrCode className="h-4 w-4" /> Scan / Quick Move
                  </Link>
                  <Link href={`/tracking/new?assetId=${asset.id}`} className="flex w-full items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Record Movement
                  </Link>
                  <Link href={`/assets/${asset.id}/edit`} className="flex w-full items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Edit Details
                  </Link>
                </div>
              </div>

              {/* QR Code */}
              <AssetQRCode assetId={asset.id} assetName={asset.name} assetCode={asset.code} />

              {/* RFID Tag */}
              <div className={`rounded-xl border p-5 shadow-sm space-y-3 ${asset.rfidTag ? "border-navy-100 bg-navy-50" : "border-gray-100 bg-white"}`}>
                <div className="flex items-center gap-2">
                  <Wifi className={`h-4 w-4 ${asset.rfidTag ? "text-navy-600" : "text-gray-400"}`} />
                  <h3 className={`font-semibold ${asset.rfidTag ? "text-navy-800" : "text-gray-500"}`}>RFID Tag</h3>
                  {asset.rfidTag
                    ? <span className="ml-auto text-xs font-semibold text-navy-600">Active</span>
                    : <span className="ml-auto text-xs text-gray-400">Not assigned</span>}
                </div>
                {asset.rfidTag ? (
                  <div className="rounded-lg bg-white px-3 py-2 font-mono text-xs text-navy-800 break-all border border-navy-100">
                    {asset.rfidTag}
                  </div>
                ) : (
                  <Link href={`/assets/${asset.id}/edit`} className="block text-center text-xs font-medium text-navy-600 hover:underline">
                    + Assign RFID tag
                  </Link>
                )}
              </div>

              {/* Barcode */}
              <div className={`rounded-xl border p-5 shadow-sm space-y-3 ${(asset.barcodeValue ?? asset.code) ? "border-blue-100 bg-blue-50" : "border-gray-100 bg-white"}`}>
                <div className="flex items-center gap-2">
                  <Barcode className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Barcode</h3>
                  <span className="ml-auto text-xs font-semibold text-blue-600">Active</span>
                </div>
                <div className="rounded-lg bg-white p-2">
                  <AssetBarcode
                    value={asset.barcodeValue ?? asset.code}
                    height={52}
                    showPrint
                    assetName={asset.name}
                    assetCode={asset.code}
                  />
                </div>
                {!asset.barcodeValue && (
                  <p className="text-xs text-blue-600 text-center">
                    Using asset code · <Link href={`/assets/${asset.id}/edit`} className="underline">Set custom barcode</Link>
                  </p>
                )}
              </div>

              {asset.parLevel && asset.quantity < asset.parLevel && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-800">Low Stock Warning</p>
                  <p className="mt-1 text-xs text-amber-700">
                    {asset.quantity} {asset.unit} remaining — par level is {asset.parLevel} {asset.unit}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
