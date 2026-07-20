import { z } from "zod";

export const updateConfigSchema = z.object({
  enableCredit: z.boolean().optional(),
  enableStock: z.boolean().optional(),
  enableExpense: z.boolean().optional(),
  currency: z.string().optional(),
  dateFormat: z.string().optional(),
  businessType: z.string().optional(),
  customFields: z.record(z.string(), z.any()).optional(),
});
