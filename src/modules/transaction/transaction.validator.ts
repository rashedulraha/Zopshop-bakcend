import { z } from "zod";
import {
  TransactionType,
  TransactionMode,
} from "../../shared/utils/constants.js";

const transactionItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().positive("Quantity must be greater than zero"),
  unitPrice: z.number().nonnegative("Unit price cannot be negative"),
});

export const createTransactionSchema = z
  .object({
    partyId: z.string().uuid("Invalid party ID").optional(),
    type: z.enum([
      TransactionType.SALE,
      TransactionType.SALE_RETURN,
      TransactionType.PURCHASE,
      TransactionType.PURCHASE_RETURN,
      TransactionType.EXPENSE,
      TransactionType.PAYMENT_RECEIVED,
      TransactionType.PAYMENT_SENT,
    ]),
    mode: z.enum([
      TransactionMode.CASH,
      TransactionMode.CREDIT,
      TransactionMode.BANK,
    ]),
    amount: z.number().positive("Amount must be greater than zero"),
    discount: z
      .number()
      .nonnegative("Discount cannot be negative")
      .default(0)
      .optional(),
    tax: z.number().nonnegative("Tax cannot be negative").default(0).optional(),
    paidAmount: z
      .number()
      .nonnegative("Paid amount cannot be negative")
      .default(0)
      .optional(),
    note: z.string().optional(),
    transactionDate: z
      .string()
      .datetime({ message: "Invalid ISO date string" })
      .optional(),
    customData: z.record(z.string(), z.any()).optional(),
    items: z.array(transactionItemSchema).optional(),
  })
  .superRefine((data, ctx) => {
    // 1. For SALE, PURCHASE, and RETURNS, items array is required and must not be empty
    if (
      [
        TransactionType.SALE,
        TransactionType.SALE_RETURN,
        TransactionType.PURCHASE,
        TransactionType.PURCHASE_RETURN
      ].includes(data.type as any)
    ) {
      if (!data.items || data.items.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Items are required for SALE, PURCHASE, and RETURN transactions",
          path: ["items"],
        });
      }
    }

    // 2. For CREDIT mode, partyId is required
    if (data.mode === TransactionMode.CREDIT && !data.partyId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Party ID is required for CREDIT transactions",
        path: ["partyId"],
      });
    }
  });

// Note: updateTransactionSchema does not use superRefine because partial updates
// might not include all fields to satisfy the conditional logic.
// We will rely on business logic to handle partial updates properly, or we can just
// use a partial version of the base object without superRefine.
export const updateTransactionSchema = z.object({
  partyId: z.string().uuid().optional(),
  type: z
    .enum([
      TransactionType.SALE,
      TransactionType.SALE_RETURN,
      TransactionType.PURCHASE,
      TransactionType.PURCHASE_RETURN,
      TransactionType.EXPENSE,
      TransactionType.PAYMENT_RECEIVED,
      TransactionType.PAYMENT_SENT,
    ])
    .optional(),
  mode: z
    .enum([TransactionMode.CASH, TransactionMode.CREDIT, TransactionMode.BANK])
    .optional(),
  amount: z.number().positive().optional(),
  discount: z.number().nonnegative().optional(),
  tax: z.number().nonnegative().optional(),
  paidAmount: z.number().nonnegative().optional(),
  note: z.string().optional(),
  transactionDate: z.string().datetime().optional(),
  customData: z.record(z.string(), z.any()).optional(),
  items: z.array(transactionItemSchema).optional(),
});
