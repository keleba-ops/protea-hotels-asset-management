import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Pre-hashed passwords (bcrypt, 10 rounds)
// admin@mariot.co.bw  → Admin@Mariot2024
// demo@mariot.co.bw   → Demo@Mariot2024
const ADMIN_HASH = "$2b$10$DatFikxtpo7PBywyGRuS5eLADLW2I3YbCYYJpJsSpzCD2BzVzQXlG";
const DEMO_HASH  = "$2b$10$w0A2nGxqcwOmxu4pzfJBMe9A1yEXKFEdEAitp.H5/Bt27.RCi9.42";

async function main() {
  // ─── Users ──────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@mariot.co.bw" },
    update: { password: ADMIN_HASH },
    create: { name: "Admin User", email: "admin@mariot.co.bw", password: ADMIN_HASH, role: "ADMIN" },
  });
  // Demo login account
  await prisma.user.upsert({
    where: { email: "demo@mariot.co.bw" },
    update: { password: DEMO_HASH },
    create: { name: "Demo User", email: "demo@mariot.co.bw", password: DEMO_HASH, role: "MANAGER" },
  });
  const manager = await prisma.user.upsert({
    where: { email: "manager@mariot.co.bw" },
    update: {},
    create: { name: "Thabo Molefe", email: "manager@mariot.co.bw", password: ADMIN_HASH, role: "MANAGER" },
  });
  const housekeeper = await prisma.user.upsert({
    where: { email: "housekeeper@mariot.co.bw" },
    update: {},
    create: { name: "Keamo Setlhabi", email: "housekeeper@mariot.co.bw", password: ADMIN_HASH, role: "HOUSEKEEPER" },
  });
  const laundry = await prisma.user.upsert({
    where: { email: "laundry@mariot.co.bw" },
    update: {},
    create: { name: "Neo Kgosi", email: "laundry@mariot.co.bw", password: ADMIN_HASH, role: "LAUNDRY_STAFF" },
  });
  const storeManager = await prisma.user.upsert({
    where: { email: "store@mariot.co.bw" },
    update: {},
    create: { name: "Lesedi Dube", email: "store@mariot.co.bw", password: ADMIN_HASH, role: "STORE_MANAGER" },
  });

  // ─── Linen Assets ──────────────────────────────────────────────────────
  const linens = await Promise.all([
    prisma.asset.upsert({ where: { code: "LN-SHEET-K01" }, update: {}, create: { name: "King Bed Sheets", code: "LN-SHEET-K01", category: "LINEN", subcategory: "Bed Linen", location: "Housekeeping Store", quantity: 120, parLevel: 80, unit: "sets", status: "AVAILABLE", condition: "GOOD", cost: 450 } }),
    prisma.asset.upsert({ where: { code: "LN-SHEET-Q01" }, update: {}, create: { name: "Queen Bed Sheets", code: "LN-SHEET-Q01", category: "LINEN", subcategory: "Bed Linen", location: "Housekeeping Store", quantity: 95, parLevel: 60, unit: "sets", status: "AVAILABLE", condition: "GOOD", cost: 380 } }),
    prisma.asset.upsert({ where: { code: "LN-SHEET-S01" }, update: {}, create: { name: "Single Bed Sheets", code: "LN-SHEET-S01", category: "LINEN", subcategory: "Bed Linen", location: "Housekeeping Store", quantity: 40, parLevel: 30, unit: "sets", status: "AVAILABLE", condition: "EXCELLENT", cost: 220 } }),
    prisma.asset.upsert({ where: { code: "LN-DUVET-K01" }, update: {}, create: { name: "King Duvet Cover", code: "LN-DUVET-K01", category: "LINEN", subcategory: "Bed Linen", location: "Housekeeping Store", quantity: 85, parLevel: 60, unit: "pcs", status: "AVAILABLE", condition: "GOOD", cost: 320 } }),
    prisma.asset.upsert({ where: { code: "LN-PILW-W01" }, update: {}, create: { name: "White Pillow Cases", code: "LN-PILW-W01", category: "LINEN", subcategory: "Bed Linen", location: "Housekeeping Store", quantity: 240, parLevel: 160, unit: "pcs", status: "AVAILABLE", condition: "GOOD", cost: 85 } }),
    prisma.asset.upsert({ where: { code: "LN-BATH-L01" }, update: {}, create: { name: "Bath Towels (Large)", code: "LN-BATH-L01", category: "LINEN", subcategory: "Towels", location: "Laundry Room", quantity: 45, parLevel: 120, unit: "pcs", status: "IN_LAUNDRY", condition: "GOOD", cost: 95 } }),
    prisma.asset.upsert({ where: { code: "LN-BATH-M01" }, update: {}, create: { name: "Bath Towels (Medium)", code: "LN-BATH-M01", category: "LINEN", subcategory: "Towels", location: "Housekeeping Store", quantity: 88, parLevel: 80, unit: "pcs", status: "AVAILABLE", condition: "FAIR", cost: 75 } }),
    prisma.asset.upsert({ where: { code: "LN-HAND-T01" }, update: {}, create: { name: "Hand Towels", code: "LN-HAND-T01", category: "LINEN", subcategory: "Towels", location: "Housekeeping Store", quantity: 210, parLevel: 150, unit: "pcs", status: "AVAILABLE", condition: "GOOD", cost: 45 } }),
    prisma.asset.upsert({ where: { code: "LN-FACE-C01" }, update: {}, create: { name: "Face Cloths", code: "LN-FACE-C01", category: "LINEN", subcategory: "Towels", location: "Housekeeping Store", quantity: 320, parLevel: 200, unit: "pcs", status: "AVAILABLE", condition: "GOOD", cost: 25 } }),
    prisma.asset.upsert({ where: { code: "LN-POOL-T01" }, update: {}, create: { name: "Pool Towels", code: "LN-POOL-T01", category: "LINEN", subcategory: "Towels", location: "Pool Area", quantity: 60, parLevel: 80, unit: "pcs", status: "IN_USE", condition: "GOOD", cost: 110 } }),
    prisma.asset.upsert({ where: { code: "LN-BATH-R01" }, update: {}, create: { name: "Bath Robes", code: "LN-BATH-R01", category: "LINEN", subcategory: "Robes", location: "Housekeeping Store", quantity: 55, parLevel: 40, unit: "pcs", status: "AVAILABLE", condition: "EXCELLENT", cost: 280 } }),
    prisma.asset.upsert({ where: { code: "LN-BATH-M02" }, update: {}, create: { name: "Bath Mats", code: "LN-BATH-M02", category: "LINEN", subcategory: "Mats", location: "Housekeeping Store", quantity: 130, parLevel: 90, unit: "pcs", status: "AVAILABLE", condition: "GOOD", cost: 55 } }),
    prisma.asset.upsert({ where: { code: "LN-TABL-C01" }, update: {}, create: { name: "Table Cloths (Round)", code: "LN-TABL-C01", category: "LINEN", subcategory: "F&B Linen", location: "Restaurant", quantity: 28, parLevel: 20, unit: "pcs", status: "IN_USE", condition: "GOOD", cost: 180 } }),
    prisma.asset.upsert({ where: { code: "LN-NAPR-W01" }, update: {}, create: { name: "Dinner Napkins (White)", code: "LN-NAPR-W01", category: "LINEN", subcategory: "F&B Linen", location: "Restaurant", quantity: 180, parLevel: 120, unit: "pcs", status: "IN_USE", condition: "GOOD", cost: 30 } }),
    prisma.asset.upsert({ where: { code: "LN-CURT-B01" }, update: {}, create: { name: "Blackout Curtains (Pair)", code: "LN-CURT-B01", category: "LINEN", subcategory: "Room Furnishings", location: "Rooms Floor 1", quantity: 18, parLevel: null, unit: "pairs", status: "IN_USE", condition: "GOOD", cost: 650, purchaseDate: new Date("2022-03-15") } }),
  ]);

  // ─── Electronics ────────────────────────────────────────────────────────
  const electronics = await Promise.all([
    prisma.asset.upsert({ where: { code: "EL-TV42-F1" }, update: {}, create: { name: '42" Smart TV (Floor 1)', code: "EL-TV42-F1", category: "ELECTRONIC", subcategory: "Television", location: "Rooms Floor 1", quantity: 12, unit: "units", status: "IN_USE", condition: "EXCELLENT", cost: 4200, purchaseDate: new Date("2023-06-01") } }),
    prisma.asset.upsert({ where: { code: "EL-TV42-F2" }, update: {}, create: { name: '42" Smart TV (Floor 2)', code: "EL-TV42-F2", category: "ELECTRONIC", subcategory: "Television", location: "Rooms Floor 2", quantity: 14, unit: "units", status: "IN_USE", condition: "GOOD", cost: 4200, purchaseDate: new Date("2022-11-10") } }),
    prisma.asset.upsert({ where: { code: "EL-TV55-S01" }, update: {}, create: { name: '55" Smart TV (Suite)', code: "EL-TV55-S01", category: "ELECTRONIC", subcategory: "Television", location: "Rooms Floor 3", quantity: 4, unit: "units", status: "IN_USE", condition: "EXCELLENT", cost: 7800, purchaseDate: new Date("2023-09-20") } }),
    prisma.asset.upsert({ where: { code: "EL-MINI-F1" }, update: {}, create: { name: "Mini Bar Fridge (Floor 1)", code: "EL-MINI-F1", category: "ELECTRONIC", subcategory: "Minibar", location: "Maintenance Room", quantity: 2, unit: "units", status: "IN_MAINTENANCE", condition: "FAIR", cost: 2800, purchaseDate: new Date("2021-04-05") } }),
    prisma.asset.upsert({ where: { code: "EL-MINI-F2" }, update: {}, create: { name: "Mini Bar Fridge (Floor 2)", code: "EL-MINI-F2", category: "ELECTRONIC", subcategory: "Minibar", location: "Rooms Floor 2", quantity: 12, unit: "units", status: "IN_USE", condition: "GOOD", cost: 2800, purchaseDate: new Date("2022-01-18") } }),
    prisma.asset.upsert({ where: { code: "EL-HAIR-D01" }, update: {}, create: { name: "Hair Dryer (1800W)", code: "EL-HAIR-D01", category: "ELECTRONIC", subcategory: "Room Appliance", location: "Housekeeping Store", quantity: 30, parLevel: 25, unit: "units", status: "AVAILABLE", condition: "GOOD", cost: 380 } }),
    prisma.asset.upsert({ where: { code: "EL-IRON-B01" }, update: {}, create: { name: "Iron & Ironing Board", code: "EL-IRON-B01", category: "ELECTRONIC", subcategory: "Room Appliance", location: "Housekeeping Store", quantity: 18, parLevel: 15, unit: "sets", status: "AVAILABLE", condition: "GOOD", cost: 520 } }),
    prisma.asset.upsert({ where: { code: "EL-SAFE-D01" }, update: {}, create: { name: "In-Room Digital Safe", code: "EL-SAFE-D01", category: "ELECTRONIC", subcategory: "Security", location: "Rooms Floor 1", quantity: 12, unit: "units", status: "IN_USE", condition: "EXCELLENT", cost: 1200, purchaseDate: new Date("2023-01-12") } }),
    prisma.asset.upsert({ where: { code: "EL-KTLE-E01" }, update: {}, create: { name: "Electric Kettle", code: "EL-KTLE-E01", category: "ELECTRONIC", subcategory: "Room Appliance", location: "Housekeeping Store", quantity: 35, parLevel: 28, unit: "units", status: "AVAILABLE", condition: "GOOD", cost: 220 } }),
    prisma.asset.upsert({ where: { code: "EL-PHON-D01" }, update: {}, create: { name: "Desk Phone (Corded)", code: "EL-PHON-D01", category: "ELECTRONIC", subcategory: "Communication", location: "Rooms Floor 2", quantity: 14, unit: "units", status: "IN_USE", condition: "FAIR", cost: 450, purchaseDate: new Date("2020-08-22") } }),
    prisma.asset.upsert({ where: { code: "EL-WROU-R01" }, update: {}, create: { name: "WiFi Router (Room)", code: "EL-WROU-R01", category: "ELECTRONIC", subcategory: "Networking", location: "Rooms Floor 3", quantity: 6, unit: "units", status: "IN_USE", condition: "GOOD", cost: 890 } }),
    prisma.asset.upsert({ where: { code: "EL-CCTV-L01" }, update: {}, create: { name: "CCTV Camera (Lobby)", code: "EL-CCTV-L01", category: "ELECTRONIC", subcategory: "Security", location: "Reception", quantity: 4, unit: "units", status: "IN_USE", condition: "GOOD", cost: 1500, purchaseDate: new Date("2022-06-30") } }),
    prisma.asset.upsert({ where: { code: "EL-PROJ-C01" }, update: {}, create: { name: "Projector (Conference)", code: "EL-PROJ-C01", category: "ELECTRONIC", subcategory: "AV Equipment", location: "Conference Room", quantity: 2, unit: "units", status: "AVAILABLE", condition: "EXCELLENT", cost: 12000, purchaseDate: new Date("2023-11-01") } }),
    prisma.asset.upsert({ where: { code: "EL-MAID-V01" }, update: {}, create: { name: "Vacuum Cleaner (Industrial)", code: "EL-MAID-V01", category: "ELECTRONIC", subcategory: "Housekeeping Equipment", location: "Housekeeping Store", quantity: 4, parLevel: 3, unit: "units", status: "AVAILABLE", condition: "GOOD", cost: 3200 } }),
    prisma.asset.upsert({ where: { code: "EL-DISP-K01" }, update: {}, create: { name: "Dispenser Machine (Kitchen)", code: "EL-DISP-K01", category: "ELECTRONIC", subcategory: "Kitchen Equipment", location: "Kitchen", quantity: 2, unit: "units", status: "IN_USE", condition: "GOOD", cost: 5500, purchaseDate: new Date("2021-12-10") } }),
  ]);

  // ─── Consumables ────────────────────────────────────────────────────────
  const consumables = await Promise.all([
    prisma.asset.upsert({ where: { code: "CN-SHAM-50" }, update: {}, create: { name: "Shampoo 50ml", code: "CN-SHAM-50", category: "CONSUMABLE", subcategory: "Toiletries", location: "Main Store", quantity: 340, parLevel: 200, unit: "bottles", status: "AVAILABLE", condition: "EXCELLENT", cost: 12, expiryDate: new Date("2027-06-30") } }),
    prisma.asset.upsert({ where: { code: "CN-COND-50" }, update: {}, create: { name: "Conditioner 50ml", code: "CN-COND-50", category: "CONSUMABLE", subcategory: "Toiletries", location: "Main Store", quantity: 280, parLevel: 200, unit: "bottles", status: "AVAILABLE", condition: "EXCELLENT", cost: 12, expiryDate: new Date("2027-06-30") } }),
    prisma.asset.upsert({ where: { code: "CN-BODY-50" }, update: {}, create: { name: "Body Lotion 50ml", code: "CN-BODY-50", category: "CONSUMABLE", subcategory: "Toiletries", location: "Main Store", quantity: 190, parLevel: 150, unit: "bottles", status: "AVAILABLE", condition: "EXCELLENT", cost: 14, expiryDate: new Date("2027-03-31") } }),
    prisma.asset.upsert({ where: { code: "CN-SOAP-B01" }, update: {}, create: { name: "Bath Soap (Bar)", code: "CN-SOAP-B01", category: "CONSUMABLE", subcategory: "Toiletries", location: "Main Store", quantity: 480, parLevel: 300, unit: "pcs", status: "AVAILABLE", condition: "EXCELLENT", cost: 8, expiryDate: new Date("2026-12-31") } }),
    prisma.asset.upsert({ where: { code: "CN-DENT-K01" }, update: {}, create: { name: "Dental Kit (Brush+Paste)", code: "CN-DENT-K01", category: "CONSUMABLE", subcategory: "Toiletries", location: "Main Store", quantity: 220, parLevel: 150, unit: "kits", status: "AVAILABLE", condition: "EXCELLENT", cost: 18, expiryDate: new Date("2026-09-30") } }),
    prisma.asset.upsert({ where: { code: "CN-RAZR-D01" }, update: {}, create: { name: "Disposable Razor", code: "CN-RAZR-D01", category: "CONSUMABLE", subcategory: "Toiletries", location: "Main Store", quantity: 180, parLevel: 100, unit: "pcs", status: "AVAILABLE", condition: "EXCELLENT", cost: 5, expiryDate: new Date("2028-01-01") } }),
    prisma.asset.upsert({ where: { code: "CN-SHCP-30" }, update: {}, create: { name: "Shower Cap", code: "CN-SHCP-30", category: "CONSUMABLE", subcategory: "Toiletries", location: "Main Store", quantity: 350, parLevel: 200, unit: "pcs", status: "AVAILABLE", condition: "EXCELLENT", cost: 3 } }),
    prisma.asset.upsert({ where: { code: "CN-COFF-P01" }, update: {}, create: { name: "Coffee Pods (Arabica)", code: "CN-COFF-P01", category: "CONSUMABLE", subcategory: "F&B", location: "Kitchen Store", quantity: 96, parLevel: 120, unit: "pods", status: "AVAILABLE", condition: "EXCELLENT", cost: 8, expiryDate: new Date("2026-08-15") } }),
    prisma.asset.upsert({ where: { code: "CN-TEAS-B01" }, update: {}, create: { name: "Tea Bags (Assorted)", code: "CN-TEAS-B01", category: "CONSUMABLE", subcategory: "F&B", location: "Kitchen Store", quantity: 420, parLevel: 300, unit: "bags", status: "AVAILABLE", condition: "EXCELLENT", cost: 2, expiryDate: new Date("2026-11-30") } }),
    prisma.asset.upsert({ where: { code: "CN-SUGR-S01" }, update: {}, create: { name: "Sugar Sachets", code: "CN-SUGR-S01", category: "CONSUMABLE", subcategory: "F&B", location: "Kitchen Store", quantity: 1200, parLevel: 800, unit: "sachets", status: "AVAILABLE", condition: "EXCELLENT", cost: 1 } }),
    prisma.asset.upsert({ where: { code: "CN-WATR-5L" }, update: {}, create: { name: "Bottled Water 500ml", code: "CN-WATR-5L", category: "CONSUMABLE", subcategory: "F&B", location: "Main Store", quantity: 240, parLevel: 180, unit: "bottles", status: "AVAILABLE", condition: "EXCELLENT", cost: 6, expiryDate: new Date("2026-12-01") } }),
    prisma.asset.upsert({ where: { code: "CN-CLNR-M01" }, update: {}, create: { name: "Multi-Surface Cleaner 5L", code: "CN-CLNR-M01", category: "CONSUMABLE", subcategory: "Cleaning", location: "Housekeeping Store", quantity: 22, parLevel: 15, unit: "bottles", status: "AVAILABLE", condition: "EXCELLENT", cost: 45, expiryDate: new Date("2027-01-01") } }),
    prisma.asset.upsert({ where: { code: "CN-DISD-B01" }, update: {}, create: { name: "Disinfectant 5L", code: "CN-DISD-B01", category: "CONSUMABLE", subcategory: "Cleaning", location: "Housekeeping Store", quantity: 18, parLevel: 12, unit: "bottles", status: "AVAILABLE", condition: "EXCELLENT", cost: 62, expiryDate: new Date("2026-10-31") } }),
    prisma.asset.upsert({ where: { code: "CN-TPPR-R01" }, update: {}, create: { name: "Toilet Paper Rolls", code: "CN-TPPR-R01", category: "CONSUMABLE", subcategory: "Housekeeping", location: "Housekeeping Store", quantity: 600, parLevel: 400, unit: "rolls", status: "AVAILABLE", condition: "EXCELLENT", cost: 4 } }),
    prisma.asset.upsert({ where: { code: "CN-GLOV-L01" }, update: {}, create: { name: "Latex Gloves (Box/100)", code: "CN-GLOV-L01", category: "CONSUMABLE", subcategory: "Cleaning", location: "Housekeeping Store", quantity: 14, parLevel: 10, unit: "boxes", status: "AVAILABLE", condition: "EXCELLENT", cost: 85, expiryDate: new Date("2027-06-01") } }),
    prisma.asset.upsert({ where: { code: "CN-MNBA-S01" }, update: {}, create: { name: "Minibar Snacks (Assorted)", code: "CN-MNBA-S01", category: "CONSUMABLE", subcategory: "F&B", location: "Kitchen Store", quantity: 55, parLevel: 80, unit: "packs", status: "AVAILABLE", condition: "EXCELLENT", cost: 35, expiryDate: new Date("2026-07-31") } }),
  ]);

  // Convenience references
  const bathTowelsLarge = linens[5];
  const bedSheetsKing = linens[0];
  const minibarF1 = electronics[3];
  const coffePods = consumables[7];
  const minibarSnacks = consumables[15];

  // ─── Movements ──────────────────────────────────────────────────────────
  const now = new Date();
  const movements = [
    { assetId: bathTowelsLarge.id, userId: laundry.id, type: "LAUNDRY_OUT", fromLocation: "Housekeeping Store", toLocation: "Laundry Room", quantity: 45, notes: "Morning laundry run", createdAt: new Date(now.getTime() - 2 * 3600000) },
    { assetId: bedSheetsKing.id, userId: housekeeper.id, type: "CHECK_OUT", fromLocation: "Housekeeping Store", toLocation: "Rooms Floor 2", quantity: 10, notes: "Room turnovers F2", createdAt: new Date(now.getTime() - 4 * 3600000) },
    { assetId: minibarF1.id, userId: manager.id, type: "MAINTENANCE", fromLocation: "Rooms Floor 1", toLocation: "Maintenance Room", quantity: 2, notes: "Compressor failure rooms 102 & 105", createdAt: new Date(now.getTime() - 24 * 3600000) },
    { assetId: linens[6].id, userId: laundry.id, type: "LAUNDRY_IN", fromLocation: "Laundry Room", toLocation: "Housekeeping Store", quantity: 30, notes: "Returned from overnight cycle", createdAt: new Date(now.getTime() - 6 * 3600000) },
    { assetId: linens[9].id, userId: housekeeper.id, type: "CHECK_OUT", fromLocation: "Housekeeping Store", toLocation: "Pool Area", quantity: 20, notes: "Pool opening replenishment", createdAt: new Date(now.getTime() - 8 * 3600000) },
    { assetId: linens[9].id, userId: housekeeper.id, type: "CHECK_IN", fromLocation: "Pool Area", toLocation: "Housekeeping Store", quantity: 8, notes: "End of day returns", createdAt: new Date(now.getTime() - 1 * 3600000) },
    { assetId: electronics[5].id, userId: storeManager.id, type: "CHECK_OUT", fromLocation: "Housekeeping Store", toLocation: "Rooms Floor 3", quantity: 3, notes: "Suite room restock", createdAt: new Date(now.getTime() - 48 * 3600000) },
    { assetId: consumables[7].id, userId: storeManager.id, type: "CHECK_OUT", fromLocation: "Kitchen Store", toLocation: "Rooms Floor 1", quantity: 48, notes: "Minibar restock F1", createdAt: new Date(now.getTime() - 72 * 3600000) },
    { assetId: linens[2].id, userId: laundry.id, type: "LAUNDRY_OUT", fromLocation: "Housekeeping Store", toLocation: "Laundry Room", quantity: 20, notes: "Routine cycle", createdAt: new Date(now.getTime() - 96 * 3600000) },
    { assetId: linens[2].id, userId: laundry.id, type: "LAUNDRY_IN", fromLocation: "Laundry Room", toLocation: "Housekeeping Store", quantity: 18, notes: "2 damaged — removed", createdAt: new Date(now.getTime() - 90 * 3600000) },
    { assetId: electronics[13].id, userId: manager.id, type: "MAINTENANCE", fromLocation: "Housekeeping Store", toLocation: "Maintenance Room", quantity: 1, notes: "Brush motor worn out", createdAt: new Date(now.getTime() - 120 * 3600000) },
    { assetId: consumables[11].id, userId: storeManager.id, type: "CHECK_OUT", fromLocation: "Main Store", toLocation: "Housekeeping Store", quantity: 6, notes: "Weekly issue to housekeeping", createdAt: new Date(now.getTime() - 36 * 3600000) },
    { assetId: linens[12].id, userId: housekeeper.id, type: "TRANSFER", fromLocation: "Housekeeping Store", toLocation: "Restaurant", quantity: 10, notes: "Dinner service setup", createdAt: new Date(now.getTime() - 5 * 3600000) },
    { assetId: consumables[15].id, userId: storeManager.id, type: "CHECK_OUT", fromLocation: "Kitchen Store", toLocation: "Rooms Floor 2", quantity: 24, notes: "Minibar restock F2", createdAt: new Date(now.getTime() - 60 * 3600000) },
    { assetId: linens[4].id, userId: housekeeper.id, type: "WRITE_OFF", fromLocation: "Housekeeping Store", toLocation: "Disposal", quantity: 12, notes: "Stained beyond recovery — written off", createdAt: new Date(now.getTime() - 144 * 3600000) },
  ];

  // Clear old movements and insert fresh ones
  await prisma.movement.deleteMany({});
  for (const m of movements) {
    await prisma.movement.create({ data: m });
  }

  // ─── Stock Takes ────────────────────────────────────────────────────────
  await prisma.stockTakeItem.deleteMany({});
  await prisma.stockTake.deleteMany({});

  const stockTake = await prisma.stockTake.create({
    data: {
      userId: storeManager.id,
      location: "Main Store",
      status: "COMPLETED",
      notes: "Monthly stock take — Main Store",
      createdAt: new Date(now.getTime() - 7 * 24 * 3600000),
      completedAt: new Date(now.getTime() - 7 * 24 * 3600000 + 2 * 3600000),
      items: {
        create: [
          { assetId: consumables[0].id, expected: 360, counted: 340, variance: -20 },
          { assetId: consumables[1].id, expected: 290, counted: 280, variance: -10 },
          { assetId: consumables[3].id, expected: 500, counted: 480, variance: -20 },
          { assetId: consumables[7].id, expected: 144, counted: 96, variance: -48 },
          { assetId: consumables[10].id, expected: 240, counted: 240, variance: 0 },
          { assetId: consumables[15].id, expected: 72, counted: 55, variance: -17 },
        ],
      },
    },
  });

  // In-progress stock take
  await prisma.stockTake.create({
    data: {
      userId: housekeeper.id,
      location: "Housekeeping Store",
      status: "IN_PROGRESS",
      notes: "Weekly linen count",
      createdAt: new Date(now.getTime() - 3600000),
      items: {
        create: [
          { assetId: linens[0].id, expected: 130, counted: 120, variance: -10 },
          { assetId: linens[5].id, expected: 90, counted: 45, variance: -45 },
          { assetId: linens[7].id, expected: 220, counted: 210, variance: -10 },
        ],
      },
    },
  });

  // ─── Alerts ─────────────────────────────────────────────────────────────
  await prisma.alert.deleteMany({});
  await prisma.alert.createMany({
    data: [
      { assetId: bathTowelsLarge.id, type: "LOW_STOCK", message: "Bath Towels (Large) critically below par — 45 in store, minimum is 120", resolved: false, createdAt: new Date(now.getTime() - 2 * 3600000) },
      { assetId: minibarF1.id, type: "MAINTENANCE_DUE", message: "2 Mini Bar Fridges in maintenance — rooms 102 and 105 out of service", resolved: false, createdAt: new Date(now.getTime() - 24 * 3600000) },
      { assetId: coffePods.id, type: "LOW_STOCK", message: "Coffee Pods below par — 96 in stock, minimum is 120", resolved: false, createdAt: new Date(now.getTime() - 12 * 3600000) },
      { assetId: minibarSnacks.id, type: "LOW_STOCK", message: "Minibar Snacks below par — 55 in stock, minimum is 80", resolved: false, createdAt: new Date(now.getTime() - 8 * 3600000) },
      { assetId: linens[9].id, type: "LOW_STOCK", message: "Pool Towels below par — 60 in stock, minimum is 80", resolved: false, createdAt: new Date(now.getTime() - 30 * 3600000) },
      { assetId: consumables[7].id, type: "HIGH_VARIANCE", message: "Stock take variance: Coffee Pods — 48 units unaccounted for (-33%)", resolved: false, createdAt: new Date(now.getTime() - 7 * 24 * 3600000) },
      { assetId: linens[4].id, type: "ITEM_LOST", message: "12 White Pillow Cases written off — stained beyond recovery", resolved: true, createdAt: new Date(now.getTime() - 144 * 3600000) },
      { assetId: electronics[13].id, type: "MAINTENANCE_DUE", message: "Industrial Vacuum Cleaner sent for repair — brush motor failure", resolved: true, createdAt: new Date(now.getTime() - 120 * 3600000) },
    ],
  });

  console.log("Seed complete — assets:", linens.length + electronics.length + consumables.length, "| movements:", movements.length, "| alerts: 8 | stock takes: 2");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
