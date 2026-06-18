import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const belowPar = await prisma.asset.findMany({
    where: {
      parLevel: { not: null },
      status: { notIn: ["LOST", "WRITTEN_OFF"] },
    },
    select: { id: true, name: true, quantity: true, parLevel: true, unit: true },
  });

  const results: string[] = [];

  for (const asset of belowPar) {
    if (asset.parLevel === null || asset.quantity >= asset.parLevel) continue;

    // Only alert if no unresolved LOW_STOCK alert already exists
    const existing = await prisma.alert.findFirst({
      where: { assetId: asset.id, type: "LOW_STOCK", resolved: false },
    });
    if (existing) continue;

    await prisma.alert.create({
      data: {
        assetId: asset.id,
        type: "LOW_STOCK",
        message: `${asset.name} below par — ${asset.quantity} ${asset.unit} in stock, minimum is ${asset.parLevel}`,
      },
    });
    results.push(`${asset.name}: ${asset.quantity}/${asset.parLevel} ${asset.unit}`);
  }

  return NextResponse.json({ checked: belowPar.length, alerts: results });
}
