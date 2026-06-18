"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const STATUS_FOR_TYPE: Record<string, string> = {
  CHECK_OUT: "IN_USE",
  CHECK_IN: "AVAILABLE",
  LAUNDRY_OUT: "IN_LAUNDRY",
  LAUNDRY_IN: "AVAILABLE",
  MAINTENANCE: "IN_MAINTENANCE",
  LOSS_REPORT: "LOST",
  WRITE_OFF: "WRITTEN_OFF",
  TRANSFER: "AVAILABLE",
};

export async function createMovement(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Unauthorized." };

  const assetId = formData.get("assetId") as string;
  const type = formData.get("type") as string;
  const toLocation = formData.get("toLocation") as string;
  const quantity = parseInt(formData.get("quantity") as string) || 1;
  const notes = (formData.get("notes") as string) || null;

  if (!assetId || !type || !toLocation) return { error: "Asset, type and destination are required." };

  try {
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return { error: "Asset not found." };
    if (quantity > asset.quantity) return { error: `Only ${asset.quantity} ${asset.unit} available.` };

    await prisma.movement.create({
      data: {
        assetId,
        userId: session.user.id,
        type,
        fromLocation: asset.location,
        toLocation,
        quantity,
        notes,
      },
    });

    await prisma.asset.update({
      where: { id: assetId },
      data: {
        status: STATUS_FOR_TYPE[type] ?? asset.status,
        location: toLocation,
      },
    });

    if (type === "LOSS_REPORT") {
      await prisma.alert.create({
        data: {
          assetId,
          userId: session.user.id,
          type: "ITEM_LOST",
          message: `${asset.name} reported as lost — ${quantity} ${asset.unit}`,
        },
      });
    }
  } catch {
    return { error: "Failed to record movement." };
  }

  revalidatePath("/tracking");
  revalidatePath("/assets");
  revalidatePath("/dashboard");
  redirect("/tracking");
}
