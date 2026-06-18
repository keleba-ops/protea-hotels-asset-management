import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const MAINTENANCE_TIMEOUT_DAYS = 7;

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - MAINTENANCE_TIMEOUT_DAYS * 24 * 60 * 60 * 1000);

  const overdueAssets = await prisma.asset.findMany({
    where: { status: "IN_MAINTENANCE", updatedAt: { lt: cutoff } },
    select: { id: true, name: true },
  });

  const results: string[] = [];

  for (const asset of overdueAssets) {
    // Check if an alert already exists for this asset
    const existing = await prisma.alert.findFirst({
      where: { assetId: asset.id, type: "MAINTENANCE_DUE", resolved: false },
    });
    if (existing) continue;

    await prisma.alert.create({
      data: {
        assetId: asset.id,
        type: "MAINTENANCE_DUE",
        message: `${asset.name} has been in maintenance for over ${MAINTENANCE_TIMEOUT_DAYS} days — follow up required`,
      },
    });
    results.push(`Alert raised: ${asset.name}`);
  }

  return NextResponse.json({ processed: overdueAssets.length, alerts: results });
}
