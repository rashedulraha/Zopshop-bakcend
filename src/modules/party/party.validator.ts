import { z } from "zod";
import { PartyType } from "../../shared/utils/constants.js";

export const createPartySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  mobile: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().optional(),
  type: z.enum([PartyType.CUSTOMER, PartyType.SUPPLIER, PartyType.BOTH]),
  openingBalance: z.number().default(0).optional(),
  customData: z.record(z.string(), z.any()).optional(),
});

export const updatePartySchema = createPartySchema.partial();
