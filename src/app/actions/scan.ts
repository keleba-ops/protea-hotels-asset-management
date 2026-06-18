"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { HOTEL_LOCATIONS } from "@/types";

const STATUS_FOR_TYPE: Record<string, string> = {
  CHECK_OUT: "IN_USE",
  CHECK_IN: "AVAILABLE",
  LAUNDRY_OUT: "IN_LAUNDRY",
  LAUNDRY_IN: "AVAILABLE",
  MAINTENANCE: "IN_MAINTENANCE",
  TRANSFER: "AVAILABLE",
};

const ALLOWED_TYPES = new Set(Object.keys(STATUS_FOR_TYPE));
const ALLOWED_LOCATIONS = new Set<string>(HOTEL_LOCATIONS);

export async function confirmScan(
  _: unknown,
  formData: FormData
): Promise<{ success?: true; assetName?: string; error?: string }> {
  const session = await auth();
  if (!session) return { error: "Not authenticated. Please log in." };

  const assetId = formData.get("assetId") as string;
  const type = formData.get("type") as string;
  const toLocation = formData.get("toLocation") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 1;

  if (!assetId || !type || !toLocation) return { error: "Missing required fields." };

  // Allowlist validation — reject any value not in the pre-defined sets
  if (!ALLOWED_TYPES.has(type)) return { error: "Invalid movement type." };
  if (!ALLOWED_LOCATIONS.has(toLocation)) return { error: "Invalid destination." };

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return { error: "Asset not found." };
  if (quantity > asset.quantity) return { error: `Only ${asset.quantity} ${asset.unit} available.` };

  try {
    await prisma.movement.create({
      data: {
        assetId,
        userId: session.user.id,
        type,
        fromLocation: asset.location,
        toLocation,
        quantity,
        notes: "Recorded via QR scan",
      },
    });

    await prisma.asset.update({
      where: { id: assetId },
      data: {
        status: STATUS_FOR_TYPE[type] ?? asset.status,
        location: toLocation,
      },
    });
  } catch {
    return { error: "Failed to record movement." };
  }

  revalidatePath("/tracking");
  revalidatePath("/assets");
  revalidatePath("/dashboard");

  return { success: true, assetName: asset.name };
}
