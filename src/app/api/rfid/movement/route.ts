import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Map reader checkpoint IDs → hotel locations
const CHECKPOINTS: Record<string, string> = {
  "CP-LAUNDRY":      "Laundry Room",
  "CP-MAINTENANCE":  "Maintenance Room",
  "CP-MAIN-STORE":   "Main Store",
  "CP-HOUSEKEEPING": "Housekeeping Store",
  "CP-POOL":         "Pool Area",
  "CP-RECEPTION":    "Reception",
  "CP-KITCHEN":      "Kitchen",
  "CP-RESTAURANT":   "Restaurant",
  "CP-GYM":          "Gym",
  "CP-FLOOR1":       "Rooms Floor 1",
  "CP-FLOOR2":       "Rooms Floor 2",
  "CP-FLOOR3":       "Rooms Floor 3",
};

// Derive movement type from current asset status + destination checkpoint
function resolveMovementType(currentStatus: string, toLocation: string): string {
  if (toLocation === "Laundry Room") return "LAUNDRY_OUT";
  if (toLocation === "Maintenance Room") return "MAINTENANCE";
  if (currentStatus === "IN_LAUNDRY") return "LAUNDRY_IN";
  if (currentStatus === "IN_MAINTENANCE") return "CHECK_IN";
  if (currentStatus === "AVAILABLE") return "CHECK_OUT";
  if (currentStatus === "IN_USE") return "CHECK_IN";
  return "TRANSFER";
}

const STATUS_FOR_TYPE: Record<string, string> = {
  CHECK_OUT: "IN_USE", CHECK_IN: "AVAILABLE",
  LAUNDRY_OUT: "IN_LAUNDRY", LAUNDRY_IN: "AVAILABLE",
  MAINTENANCE: "IN_MAINTENANCE", TRANSFER: "AVAILABLE",
};

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-rfid-api-key");
  if (apiKey !== process.env.RFID_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { rfidTag?: string; checkpointId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { rfidTag, checkpointId } = body;
  if (!rfidTag || !checkpointId) {
    return NextResponse.json({ error: "rfidTag and checkpointId are required" }, { status: 400 });
  }

  const toLocation = CHECKPOINTS[checkpointId];
  if (!toLocation) {
    return NextResponse.json({ error: `Unknown checkpoint: ${checkpointId}` }, { status: 400 });
  }

  const asset = await prisma.asset.findUnique({
    where: { rfidTag },
    select: { id: true, name: true, status: true, location: true, quantity: true },
  });
  if (!asset) {
    return NextResponse.json({ error: `No asset with RFID tag: ${rfidTag}` }, { status: 404 });
  }

  // No-op if asset is already at this location
  if (asset.location === toLocation) {
    return NextResponse.json({ skipped: true, reason: "Asset already at this location" });
  }

  const type = resolveMovementType(asset.status, toLocation);
  const newStatus = STATUS_FOR_TYPE[type] ?? asset.status;

  await prisma.movement.create({
    data: {
      assetId: asset.id,
      userId: "system",
      type,
      fromLocation: asset.location,
      toLocation,
      quantity: asset.quantity,
      notes: `Auto-logged via RFID checkpoint ${checkpointId}`,
    },
  });

  await prisma.asset.update({
    where: { id: asset.id },
    data: { status: newStatus, location: toLocation },
  });

  return NextResponse.json({
    success: true,
    asset: asset.name,
    movement: type,
    from: asset.location,
    to: toLocation,
  });
}
