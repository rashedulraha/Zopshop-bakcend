export const SystemConstants = {
  DEFAULT_CURRENCY: "BDT",
  DEFAULT_DATE_FORMAT: "DD-MM-YYYY",
  PAGE_SIZE: 10,
} as const;

export const PartyType = {
  CUSTOMER: "CUSTOMER",
  SUPPLIER: "SUPPLIER",
  BOTH: "BOTH",
} as const;

export type PartyTypeEnum = (typeof PartyType)[keyof typeof PartyType];

export const TransactionType = {
  SALE: "SALE",
  SALE_RETURN: "SALE_RETURN",
  PURCHASE: "PURCHASE",
  PURCHASE_RETURN: "PURCHASE_RETURN",
  EXPENSE: "EXPENSE",
  PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
  PAYMENT_SENT: "PAYMENT_SENT",
} as const;

export type TransactionTypeEnum =
  (typeof TransactionType)[keyof typeof TransactionType];

export const TransactionMode = {
  CASH: "CASH",
  CREDIT: "CREDIT",
  BANK: "BANK",
} as const;

export type TransactionModeEnum =
  (typeof TransactionMode)[keyof typeof TransactionMode];
