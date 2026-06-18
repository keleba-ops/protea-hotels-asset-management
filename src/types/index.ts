export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  HOUSEKEEPER: "HOUSEKEEPER",
  LAUNDRY_STAFF: "LAUNDRY_STAFF",
  STORE_MANAGER: "STORE_MANAGER",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const CATEGORIES = {
  LINEN: "LINEN",
  ELECTRONIC: "ELECTRONIC",
  CONSUMABLE: "CONSUMABLE",
} as const;
export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES];

export const ASSET_STATUSES = {
  AVAILABLE: "AVAILABLE",
  IN_USE: "IN_USE",
  IN_LAUNDRY: "IN_LAUNDRY",
  IN_MAINTENANCE: "IN_MAINTENANCE",
  LOST: "LOST",
  WRITTEN_OFF: "WRITTEN_OFF",
} as const;
export type AssetStatus = (typeof ASSET_STATUSES)[keyof typeof ASSET_STATUSES];

export const CONDITIONS = {
  EXCELLENT: "EXCELLENT",
  GOOD: "GOOD",
  FAIR: "FAIR",
  POOR: "POOR",
  DAMAGED: "DAMAGED",
} as const;
export type Condition = (typeof CONDITIONS)[keyof typeof CONDITIONS];

export const MOVEMENT_TYPES = {
  CHECK_OUT: "CHECK_OUT",
  CHECK_IN: "CHECK_IN",
  TRANSFER: "TRANSFER",
  LAUNDRY_OUT: "LAUNDRY_OUT",
  LAUNDRY_IN: "LAUNDRY_IN",
  MAINTENANCE: "MAINTENANCE",
  LOSS_REPORT: "LOSS_REPORT",
  WRITE_OFF: "WRITE_OFF",
} as const;
export type MovementType = (typeof MOVEMENT_TYPES)[keyof typeof MOVEMENT_TYPES];

export const ALERT_TYPES = {
  LOW_STOCK: "LOW_STOCK",
  ITEM_LOST: "ITEM_LOST",
  MAINTENANCE_DUE: "MAINTENANCE_DUE",
  EXPIRY_SOON: "EXPIRY_SOON",
  HIGH_VARIANCE: "HIGH_VARIANCE",
} as const;
export type AlertType = (typeof ALERT_TYPES)[keyof typeof ALERT_TYPES];

export const STOCK_TAKE_STATUSES = {
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type StockTakeStatus =
  (typeof STOCK_TAKE_STATUSES)[keyof typeof STOCK_TAKE_STATUSES];

// Human-readable labels for display
export const CATEGORY_LABELS: Record<Category, string> = {
  LINEN: "Linen",
  ELECTRONIC: "Electronics",
  CONSUMABLE: "Consumables",
};

export const STATUS_LABELS: Record<AssetStatus, string> = {
  AVAILABLE: "Available",
  IN_USE: "In Use",
  IN_LAUNDRY: "In Laundry",
  IN_MAINTENANCE: "In Maintenance",
  LOST: "Lost",
  WRITTEN_OFF: "Written Off",
};

export const MOVEMENT_LABELS: Record<MovementType, string> = {
  CHECK_OUT: "Checked Out",
  CHECK_IN: "Checked In",
  TRANSFER: "Transferred",
  LAUNDRY_OUT: "Sent to Laundry",
  LAUNDRY_IN: "Returned from Laundry",
  MAINTENANCE: "Sent for Maintenance",
  LOSS_REPORT: "Loss Reported",
  WRITE_OFF: "Written Off",
};

export const ALERT_LABELS: Record<AlertType, string> = {
  LOW_STOCK: "Low Stock",
  ITEM_LOST: "Item Lost",
  MAINTENANCE_DUE: "Maintenance Due",
  EXPIRY_SOON: "Expiry Soon",
  HIGH_VARIANCE: "High Variance",
};

export const HOTEL_LOCATIONS = [
  "Main Store",
  "Housekeeping Store",
  "Laundry Room",
  "Maintenance Room",
  "Reception",
  "Kitchen",
  "Restaurant",
  "Gym",
  "Pool Area",
  "Rooms Floor 1",
  "Rooms Floor 2",
  "Rooms Floor 3",
  "Conference Room",
] as const;
export type HotelLocation = (typeof HOTEL_LOCATIONS)[number];
