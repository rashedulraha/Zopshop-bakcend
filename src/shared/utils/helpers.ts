/**
 * Generate a unique invoice number based on prefix and timestamp
 * @param prefix e.g., "INV", "SAL", "PUR"
 */
export const generateInvoiceNo = (prefix = "INV"): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${randomStr}`;
};

/**
 * Calculate net amount based on amount, discount, and tax
 * Formula: Net = Amount - Discount + Tax
 */
export const calculateNetAmount = (
  amount: number,
  discount = 0,
  tax = 0,
): number => {
  return amount - discount + tax;
};

/**
 * Format currency
 * @param amount Amount to format
 * @param currency Currency code (e.g., 'BDT', 'USD')
 */
export const formatCurrency = (amount: number, currency = "BDT"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Get start and end dates for various ranges
 */
export const getDateRange = (
  range: "today" | "week" | "month" | "year",
): { start: Date; end: Date } => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  switch (range) {
    case "today":
      // already set
      break;
    case "week":
      start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      break;
    case "month":
      start.setDate(1); // Start of month
      break;
    case "year":
      start.setMonth(0, 1); // Start of year
      break;
  }

  return { start, end };
};
