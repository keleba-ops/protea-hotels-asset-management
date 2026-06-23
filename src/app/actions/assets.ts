"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function genCode(category: string) {
  const prefix = category === "LINEN" ? "LN" : category === "ELECTRONIC" ? "EL" : "CN";
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function parseOptionalInt(val: FormDataEntryValue | null) {
  const n = parseInt(val as string);
  return isNaN(n) ? null : n;
}
function parseOptionalFloat(val: FormDataEntryValue | null) {
  const n = parseFloat(val as string);
  return isNaN(n) ? null : n;
}
function parseOptionalDate(val: FormDataEntryValue | null) {
  return val ? new Date(val as string) : null;
}

const ASSET_ROLES = ["ADMIN", "MANAGER", "STORE_MANAGER"];

export async function createAsset(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session || !ASSET_ROLES.includes(session.user.role)) return { error: "Forbidden." };

  const name = (formData.get("name") as string)?.trim();
  const category = formData.get("category") as string;
  const location = formData.get("location") as string;

  if (!name || !category || !location) return { error: "Name, category and location are required." };

  let code = (formData.get("code") as string)?.trim();
  if (!code) code = genCode(category);

  try {
    await prisma.asset.create({
      data: {
        name,
        code,
        category,
        subcategory: (formData.get("subcategory") as string) || null,
        description: (formData.get("description") as string) || null,
        status: (formData.get("status") as string) || "AVAILABLE",
        condition: (formData.get("condition") as string) || "GOOD",
        location,
        quantity: parseInt(formData.get("quantity") as string) || 1,
        parLevel: parseOptionalInt(formData.get("parLevel")),
        unit: (formData.get("unit") as string) || "pcs",
        supplier: (formData.get("supplier") as string) || null,
        cost: parseOptionalFloat(formData.get("cost")),
        purchaseDate: parseOptionalDate(formData.get("purchaseDate")),
        expiryDate: parseOptionalDate(formData.get("expiryDate")),
        rfidTag: (formData.get("rfidTag") as string)?.trim() || null,
        barcodeValue: (formData.get("barcodeValue") as string)?.trim() || null,
      },
    });
  } catch (e: unknown) {
    return { error: (e as { code?: string }).code === "P2002" ? "Asset code or tag already in use." : "Failed to create asset." };
  }

  revalidatePath("/assets");
  revalidatePath("/dashboard");
  redirect("/assets");
}

export async function updateAsset(_: unknown, formData: FormData) {
  const session = await auth();
  if (!session || !ASSET_ROLES.includes(session.user.role)) return { error: "Forbidden." };

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string)?.trim();
  const category = formData.get("category") as string;
  const location = formData.get("location") as string;

  if (!id || !name || !category || !location) return { error: "Required fields are missing." };

  try {
    await prisma.asset.update({
      where: { id },
      data: {
        name,
        category,
        subcategory: (formData.get("subcategory") as string) || null,
        description: (formData.get("description") as string) || null,
        status: formData.get("status") as string,
        condition: formData.get("condition") as string,
        location,
        quantity: parseInt(formData.get("quantity") as string) || 1,
        parLevel: parseOptionalInt(formData.get("parLevel")),
        unit: (formData.get("unit") as string) || "pcs",
        supplier: (formData.get("supplier") as string) || null,
        cost: parseOptionalFloat(formData.get("cost")),
        purchaseDate: parseOptionalDate(formData.get("purchaseDate")),
        expiryDate: parseOptionalDate(formData.get("expiryDate")),
        rfidTag: (formData.get("rfidTag") as string)?.trim() || null,
        barcodeValue: (formData.get("barcodeValue") as string)?.trim() || null,
      },
    });
  } catch {
    return { error: "Failed to update asset." };
  }

  revalidatePath("/assets");
  revalidatePath(`/assets/${id}`);
  revalidatePath("/dashboard");
  redirect(`/assets/${id}`);
}

export async function deleteAsset(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) return;

  const id = formData.get("id") as string;

  await prisma.stockTakeItem.deleteMany({ where: { assetId: id } }).catch(() => null);
  await prisma.alert.deleteMany({ where: { assetId: id } }).catch(() => null);
  await prisma.movement.deleteMany({ where: { assetId: id } }).catch(() => null);
  await prisma.asset.delete({ where: { id } }).catch(() => null);

  revalidatePath("/assets");
  revalidatePath("/dashboard");
  redirect("/assets");
}
