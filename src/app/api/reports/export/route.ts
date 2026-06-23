import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

function escapeCsv(value: unknown): string {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function row(cols: unknown[]): string {
  return cols.map(escapeCsv).join(",");
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const type = new URL(req.url).searchParams.get("type") ?? "assets";

  let csv = "";

  if (type === "movements") {
    const movements = await prisma.movement.findMany({
      orderBy: { createdAt: "desc" },
      include: { asset: { select: { name: true, code: true } }, user: { select: { name: true } } },
    });
    csv = [
      row(["Date", "Asset", "Code", "Type", "From", "To", "Qty", "Staff", "Notes"]),
      ...movements.map((m) =>
        row([
          m.createdAt.toISOString(),
          m.asset.name,
          m.asset.code,
          m.type,
          m.fromLocation ?? "",
          m.toLocation,
          m.quantity,
          m.user?.name ?? "System",
          m.notes ?? "",
        ])
      ),
    ].join("\n");
  } else {
    // Default: assets
    const assets = await prisma.asset.findMany({ orderBy: { category: "asc" } });
    csv = [
      row([
        "Code", "Name", "Category", "Subcategory", "Status", "Condition",
        "Location", "Quantity", "Unit", "Par Level", "Supplier", "Cost (BWP)",
        "Purchase Date", "Expiry Date", "RFID Tag", "Created",
      ]),
      ...assets.map((a) =>
        row([
          a.code, a.name, a.category, a.subcategory ?? "", a.status, a.condition,
          a.location, a.quantity, a.unit, a.parLevel ?? "",
          a.supplier ?? "", a.cost ?? "", a.purchaseDate?.toISOString() ?? "",
          a.expiryDate?.toISOString() ?? "", a.rfidTag ?? "",
          a.createdAt.toISOString(),
        ])
      ),
    ].join("\n");
  }

  const filename = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
