// Static demo data shown when the database is not yet connected.
// Replace with real DB once DATABASE_URL is configured in Vercel.

export const demoAssets = [
  { id: "1", name: "King Bed Sheets", code: "LN-SHEET01", category: "LINEN", subcategory: "Bed Linen", status: "AVAILABLE", condition: "GOOD", location: "Housekeeping Store", quantity: 120, parLevel: 80, unit: "sets", updatedAt: new Date() },
  { id: "2", name: "Bath Towels", code: "LN-TOWEL01", category: "LINEN", subcategory: "Towels", status: "IN_LAUNDRY", condition: "GOOD", location: "Laundry Room", quantity: 45, parLevel: 100, unit: "pcs", updatedAt: new Date() },
  { id: "3", name: "Hand Towels", code: "LN-HTWL01", category: "LINEN", subcategory: "Towels", status: "AVAILABLE", condition: "GOOD", location: "Housekeeping Store", quantity: 200, parLevel: 150, unit: "pcs", updatedAt: new Date() },
  { id: "4", name: "Pillow Cases", code: "LN-PILW01", category: "LINEN", subcategory: "Bed Linen", status: "AVAILABLE", condition: "EXCELLENT", location: "Housekeeping Store", quantity: 180, parLevel: 100, unit: "pcs", updatedAt: new Date() },
  { id: "5", name: '42" Smart TV', code: "EL-TV4201", category: "ELECTRONIC", subcategory: "Television", status: "IN_USE", condition: "EXCELLENT", location: "Rooms Floor 1", quantity: 12, parLevel: null, unit: "units", updatedAt: new Date() },
  { id: "6", name: "Mini Bar Fridge", code: "EL-MINI01", category: "ELECTRONIC", subcategory: "Minibar", status: "IN_MAINTENANCE", condition: "FAIR", location: "Maintenance Room", quantity: 2, parLevel: null, unit: "units", updatedAt: new Date() },
  { id: "7", name: "Hair Dryer", code: "EL-HAIR01", category: "ELECTRONIC", subcategory: "Room Appliance", status: "IN_USE", condition: "GOOD", location: "Rooms Floor 2", quantity: 8, parLevel: null, unit: "units", updatedAt: new Date() },
  { id: "8", name: "Guest Shampoo 50ml", code: "CN-SHAM01", category: "CONSUMABLE", subcategory: "Toiletries", status: "AVAILABLE", condition: "EXCELLENT", location: "Main Store", quantity: 340, parLevel: 200, unit: "bottles", updatedAt: new Date() },
  { id: "9", name: "Body Lotion 50ml", code: "CN-LOTN01", category: "CONSUMABLE", subcategory: "Toiletries", status: "AVAILABLE", condition: "EXCELLENT", location: "Main Store", quantity: 280, parLevel: 150, unit: "bottles", updatedAt: new Date() },
  { id: "10", name: "Coffee Pods", code: "CN-COFF01", category: "CONSUMABLE", subcategory: "F&B", status: "AVAILABLE", condition: "EXCELLENT", location: "Kitchen Store", quantity: 96, parLevel: 120, unit: "pods", updatedAt: new Date() },
];

export const demoMovements = [
  { id: "m1", assetId: "2", userId: "u1", type: "LAUNDRY_OUT", fromLocation: "Housekeeping Store", toLocation: "Laundry Room", quantity: 45, notes: "Morning laundry cycle", createdAt: new Date(Date.now() - 3600000), asset: { name: "Bath Towels" }, user: { name: "Keamo Setlhabi" } },
  { id: "m2", assetId: "1", userId: "u1", type: "CHECK_OUT", fromLocation: "Housekeeping Store", toLocation: "Rooms Floor 2", quantity: 10, notes: null, createdAt: new Date(Date.now() - 7200000), asset: { name: "King Bed Sheets" }, user: { name: "Keamo Setlhabi" } },
  { id: "m3", assetId: "6", userId: "u2", type: "MAINTENANCE", fromLocation: "Rooms Floor 1", toLocation: "Maintenance Room", quantity: 2, notes: "Compressor issue reported", createdAt: new Date(Date.now() - 86400000), asset: { name: "Mini Bar Fridge" }, user: { name: "Admin User" } },
  { id: "m4", assetId: "3", userId: "u1", type: "CHECK_IN", fromLocation: "Rooms Floor 3", toLocation: "Housekeeping Store", quantity: 20, notes: null, createdAt: new Date(Date.now() - 172800000), asset: { name: "Hand Towels" }, user: { name: "Keamo Setlhabi" } },
];

export const demoAlerts = [
  { id: "a1", assetId: "2", userId: null, type: "LOW_STOCK", message: "Bath Towels below par level — 45 in store, minimum is 100", resolved: false, createdAt: new Date(Date.now() - 3600000), asset: { name: "Bath Towels" } },
  { id: "a2", assetId: "6", userId: null, type: "MAINTENANCE_DUE", message: "2 Mini Bar Fridges in maintenance — rooms 102 and 105 affected", resolved: false, createdAt: new Date(Date.now() - 86400000), asset: { name: "Mini Bar Fridge" } },
  { id: "a3", assetId: "10", userId: null, type: "LOW_STOCK", message: "Coffee Pods below par level — 96 in stock, minimum is 120", resolved: false, createdAt: new Date(Date.now() - 43200000), asset: { name: "Coffee Pods" } },
];

export const demoCounts = {
  total: 10,
  linens: 4,
  electronics: 3,
  consumables: 3,
  lost: 0,
  lowStock: 2,
  movementsToday: 2,
  activeAlerts: 3,
};
