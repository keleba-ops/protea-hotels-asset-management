import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const LAUNDRY_TIMEOUT_HOURS = 48;
const SYSTEM_USER_ID = "system";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - LAUNDRY_TIMEOUT_HOURS * 60 * 60 * 1000);

  // Assets stuck in laundry longer than the timeout
  const overdueAssets = await prisma.asset.findMany({
    where: { status: "IN_LAUNDRY", updatedAt: { lt: cutoff } },
    select: { id: true, name: true, location: true, quantity: true },
  });

  const results: string[] = [];

  for (const asset of overdueAssets) {
    // Auto-return to Housekeeping Store
    await prisma.movement.create({
      data: {
        assetId: asset.id,
        userId: SYSTEM_USER_ID,
        type: "LAUNDRY_IN",
        fromLocation: asset.location,
        toLocation: "Housekeeping Store",
        quantity: asset.quantity,
        notes: `Auto-returned after ${LAUNDRY_TIMEOUT_HOURS}h — system cron`,
      },
    });
    await prisma.asset.update({
      where: { id: asset.id },
      data: { status: "AVAILABLE", location: "Housekeeping Store" },
    });
    results.push(`Returned: ${asset.name}`);
  }

  return NextResponse.json({
    processed: overdueAssets.length,
    actions: results,
    cutoff: cutoff.toISOString(),
  });
}
