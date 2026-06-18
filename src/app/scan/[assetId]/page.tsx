export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ScanConfirm from "@/components/scan/ScanConfirm";

interface SmartAction {
  type: string;
  label: string;
  toLocation: string;
  needsDestination: boolean;
  description: string;
  color: string;
}

function resolveSmartAction(status: string, location: string, category: string): {
  primary: SmartAction;
  alternatives: SmartAction[];
} {
  const allActions: Record<string, SmartAction> = {
    checkOut: { type: "CHECK_OUT", label: "Check Out", toLocation: "", needsDestination: true, description: "Move to a new location", color: "bg-navy-600 hover:bg-navy-700" },
    checkIn: { type: "CHECK_IN", label: "Check In", toLocation: location, needsDestination: false, description: `Return to ${location}`, color: "bg-green-600 hover:bg-green-700" },
    laundryOut: { type: "LAUNDRY_OUT", label: "Send to Laundry", toLocation: "Laundry Room", needsDestination: false, description: "Send for cleaning", color: "bg-purple-600 hover:bg-purple-700" },
    laundryIn: { type: "LAUNDRY_IN", label: "Return from Laundry", toLocation: "Housekeeping Store", needsDestination: false, description: "Mark as cleaned & returned", color: "bg-green-600 hover:bg-green-700" },
    maintenance: { type: "MAINTENANCE", label: "Send to Maintenance", toLocation: "Maintenance Room", needsDestination: false, description: "Send for repair", color: "bg-amber-600 hover:bg-amber-700" },
    maintenanceReturn: { type: "CHECK_IN", label: "Return from Maintenance", toLocation: location, needsDestination: false, description: `Return to ${location}`, color: "bg-green-600 hover:bg-green-700" },
    transfer: { type: "TRANSFER", label: "Transfer", toLocation: "", needsDestination: true, description: "Move to another location", color: "bg-blue-600 hover:bg-blue-700" },
  };

  switch (status) {
    case "AVAILABLE":
      return {
        primary: allActions.checkOut,
        alternatives: [allActions.laundryOut, allActions.maintenance, allActions.transfer],
      };
    case "IN_USE":
      return {
        primary: category === "LINEN" ? allActions.laundryOut : allActions.checkIn,
        alternatives: category === "LINEN"
          ? [allActions.checkIn, allActions.maintenance, allActions.transfer]
          : [allActions.laundryOut, allActions.maintenance, allActions.transfer],
      };
    case "IN_LAUNDRY":
      return {
        primary: allActions.laundryIn,
        alternatives: [allActions.maintenance],
      };
    case "IN_MAINTENANCE":
      return {
        primary: allActions.maintenanceReturn,
        alternatives: [allActions.transfer],
      };
    default:
      return {
        primary: allActions.checkIn,
        alternatives: [allActions.transfer],
      };
  }
}

export default async function ScanPage({ params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = await params;

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    select: { id: true, name: true, code: true, status: true, location: true, category: true, quantity: true, unit: true },
  }).catch(() => null);

  if (!asset) notFound();

  const { primary, alternatives } = resolveSmartAction(asset.status, asset.location, asset.category);

  return (
    <ScanConfirm
      assetId={asset.id}
      assetName={asset.name}
      assetCode={asset.code}
      assetStatus={asset.status}
      assetLocation={asset.location}
      assetCategory={asset.category}
      assetQuantity={asset.quantity}
      assetUnit={asset.unit}
      smartAction={primary}
      alternativeActions={alternatives}
    />
  );
}
