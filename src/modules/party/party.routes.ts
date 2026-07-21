import { Router } from "express";
import { PartyController } from "./party.controller.js";
import { validateRequest } from "../../shared/middlewares/validation.middleware.js";
import { createPartySchema, updatePartySchema } from "./party.validator.js";

const router = Router();

router.post(
  "/",
  validateRequest(createPartySchema),
  PartyController.createParty,
);
router.get("/", PartyController.getAllParties);
router.get("/due", PartyController.getPartiesWithDue);
router.get("/:id", PartyController.getPartyById);
router.get("/:id/balance", PartyController.getPartyBalance);
router.get("/:id/ledger", PartyController.getPartyLedger);
router.get("/:id/transactions", PartyController.getPartyTransactions);
router.post("/:id/payment", PartyController.makePayment);
router.put(
  "/:id",
  validateRequest(updatePartySchema),
  PartyController.updateParty,
);
router.delete("/:id", PartyController.deleteParty);

export const partyRoutes = router;
