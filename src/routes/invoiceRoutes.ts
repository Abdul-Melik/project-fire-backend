import express from "express";

import verifyTokenMiddleware from "../middleware/verifyTokenMiddleware";
import validateResourceMiddleware from "../middleware/validateResourceMiddleware";
import {
  getInvoicesSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
} from "../schemas/invoiceSchemas";
import * as invoicesController from "../controllers/invoicesController";

const router = express.Router();

router.use(verifyTokenMiddleware);

router.get(
  "/",
  validateResourceMiddleware(getInvoicesSchema),
  invoicesController.getInvoices
);
router.get("/:invoiceId", invoicesController.getInvoiceById);
router.post(
  "/",
  validateResourceMiddleware(createInvoiceSchema),
  invoicesController.createInvoice
);
router.patch(
  "/:invoiceId",
  validateResourceMiddleware(updateInvoiceSchema),
  invoicesController.updateInvoice
);
router.delete("/:invoiceId", invoicesController.deleteInvoice);

export default router;
