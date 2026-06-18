"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createStockTake(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session) return;

  const rawLocation = formData.get("location") as string;
  const location = rawLocation && rawLocation !== "ALL" ? rawLocation : null;
  const notes = (formData.get("notes") as string) || null;

  const assets = await prisma.asset.findMany({
    where: location ? { location } : {},
    select: { id: true, quantity: true },
  });

  if (assets.length === 0) redirect("/stock-takes/new");

  const stockTake = await prisma.stockTake.create({
    data: {
      userId: session.user.id,
      location,
      notes,
      items: {
        create: assets.map((a) => ({
          assetId: a.id,
          expected: a.quantity,
          counted: a.quantity,
          variance: 0,
        })),
      },
    },
  });

  revalidatePath("/stock-takes");
  redirect(`/stock-takes/${stockTake.id}`);
}

export async function saveStockTakeItems(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session) return;

  const stockTakeId = formData.get("stockTakeId") as string;
  const complete = formData.get("complete") === "true";

  const stockTake = await prisma.stockTake.findUnique({
    where: { id: stockTakeId },
    include: { items: { include: { asset: true } } },
  });
  if (!stockTake || stockTake.status !== "IN_PROGRESS") return;

  for (const item of stockTake.items) {
    const counted = parseInt(formData.get(`counted_${item.id}`) as string ?? String(item.counted));
    const variance = isNaN(counted) ? item.variance : counted - item.expected;
    await prisma.stockTakeItem.update({
      where: { id: item.id },
      data: { counted: isNaN(counted) ? item.counted : counted, variance },
    });
  }

  if (complete) {
    const updatedItems = await prisma.stockTakeItem.findMany({
      where: { stockTakeId },
      include: { asset: true },
    });

    for (const item of updatedItems) {
      await prisma.asset.update({ where: { id: item.assetId }, data: { quantity: item.counted } });
      if (item.variance !== 0) {
        await prisma.alert.create({
          data: {
            assetId: item.assetId,
            userId: session.user.id,
            type: "HIGH_VARIANCE",
            message: `Stock take variance: ${item.asset.name} — ${Math.abs(item.variance)} units ${item.variance < 0 ? "unaccounted for" : "surplus"}`,
          },
        }).catch(() => null);
      }
    }

    await prisma.stockTake.update({
      where: { id: stockTakeId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    revalidatePath("/stock-takes");
    revalidatePath("/assets");
    revalidatePath("/alerts");
    revalidatePath("/dashboard");
    redirect("/stock-takes");
  }

  revalidatePath(`/stock-takes/${stockTakeId}`);
}

export async function cancelStockTake(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session) return;

  const id = formData.get("id") as string;
  const st = await prisma.stockTake.findUnique({ where: { id }, select: { userId: true } });
  const isAdminOrManager = ["ADMIN", "MANAGER"].includes(session.user.role);
  if (!st || (st.userId !== session.user.id && !isAdminOrManager)) return;

  await prisma.stockTake.update({ where: { id }, data: { status: "CANCELLED" } }).catch(() => null);

  revalidatePath("/stock-takes");
  redirect("/stock-takes");
}
