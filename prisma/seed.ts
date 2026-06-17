import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@mariot.co.bw" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@mariot.co.bw",
      password: "hashed-placeholder",
      role: "ADMIN",
    },
  });

  const housekeeper = await prisma.user.upsert({
    where: { email: "housekeeper@mariot.co.bw" },
    update: {},
    create: {
      name: "Keamo Setlhabi",
      email: "housekeeper@mariot.co.bw",
      password: "hashed-placeholder",
      role: "HOUSEKEEPER",
    },
  });

  const sheets = await prisma.asset.upsert({
    where: { code: "LN-SHEET01" },
    update: {},
    create: {
      name: "King Bed Sheets",
      code: "LN-SHEET01",
      category: "LINEN",
      subcategory: "Bed Linen",
      location: "Housekeeping Store",
      quantity: 120,
      parLevel: 80,
      unit: "sets",
      status: "AVAILABLE",
      condition: "GOOD",
    },
  });

  const towels = await prisma.asset.upsert({
    where: { code: "LN-TOWEL01" },
    update: {},
    create: {
      name: "Bath Towels",
      code: "LN-TOWEL01",
      category: "LINEN",
      subcategory: "Towels",
      location: "Laundry Room",
      quantity: 45,
      parLevel: 100,
      unit: "pcs",
      status: "IN_LAUNDRY",
      condition: "GOOD",
    },
  });

  const minibar = await prisma.asset.upsert({
    where: { code: "EL-MINI01" },
    update: {},
    create: {
      name: "Mini Bar Fridge",
      code: "EL-MINI01",
      category: "ELECTRONIC",
      subcategory: "Minibar",
      location: "In Maintenance",
      quantity: 2,
      unit: "units",
      status: "IN_MAINTENANCE",
      condition: "FAIR",
    },
  });

  await prisma.asset.upsert({
    where: { code: "EL-TV4201" },
    update: {},
    create: {
      name: '42" Smart TV',
      code: "EL-TV4201",
      category: "ELECTRONIC",
      subcategory: "Television",
      location: "Rooms Floor 1",
      quantity: 12,
      unit: "units",
      status: "IN_USE",
      condition: "EXCELLENT",
      purchaseDate: new Date("2023-06-01"),
    },
  });

  await prisma.asset.upsert({
    where: { code: "CN-SHAM01" },
    update: {},
    create: {
      name: "Guest Shampoo (50ml)",
      code: "CN-SHAM01",
      category: "CONSUMABLE",
      subcategory: "Toiletries",
      location: "Main Store",
      quantity: 340,
      parLevel: 200,
      unit: "bottles",
      status: "AVAILABLE",
      condition: "EXCELLENT",
      expiryDate: new Date("2026-12-31"),
    },
  });

  // Movements
  await prisma.movement.create({
    data: {
      assetId: towels.id,
      userId: housekeeper.id,
      type: "LAUNDRY_OUT",
      fromLocation: "Housekeeping Store",
      toLocation: "Laundry Room",
      quantity: 45,
      notes: "Regular morning laundry cycle",
    },
  });

  await prisma.movement.create({
    data: {
      assetId: sheets.id,
      userId: housekeeper.id,
      type: "CHECK_OUT",
      fromLocation: "Housekeeping Store",
      toLocation: "Rooms Floor 2",
      quantity: 10,
    },
  });

  await prisma.movement.create({
    data: {
      assetId: minibar.id,
      userId: admin.id,
      type: "MAINTENANCE",
      fromLocation: "Rooms Floor 1",
      toLocation: "In Maintenance",
      quantity: 2,
      notes: "Compressor issue reported",
    },
  });

  // Alerts
  await prisma.alert.create({
    data: {
      assetId: towels.id,
      type: "LOW_STOCK",
      message: "Bath Towels below par level (45 of 100 minimum in store)",
    },
  });

  await prisma.alert.create({
    data: {
      assetId: minibar.id,
      type: "MAINTENANCE_DUE",
      message: "2 Mini Bar Fridges sent for maintenance — rooms 102, 105 affected",
    },
  });

  console.log("Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
