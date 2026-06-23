import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const WARN_DAYS = 30;

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const soon = new Date(Date.now() + WARN_DAYS * 24 * 60 * 60 * 1000);

  const expiring = await prisma.asset.findMany({
    where: {
      expiryDate: { gte: now, lte: soon },
      status: { notIn: ["LOST", "WRITTEN_OFF"] },
    },
    select: { id: true, name: true, expiryDate: true },
  });

  const results: string[] = [];

  for (const asset of expiring) {
    const existing = await prisma.alert.findFirst({
      where: { assetId: asset.id, type: "EXPIRY_SOON", resolved: false },
    });
    if (existing) continue;

    const daysLeft = Math.ceil(
      (asset.expiryDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    await prisma.alert.create({
      data: {
        assetId: asset.id,
        type: "EXPIRY_SOON",
        message: `${asset.name} expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} (${asset.expiryDate!.toDateString()})`,
      },
    });
    results.push(`${asset.name}: ${daysLeft} days remaining`);
  }

  return NextResponse.json({ checked: expiring.length, alerts: results });
}
