import { accountParamsSchema, createAccountSchema, updateAccountSchema } from "../models/accounts";
import {
  createAccount,
  deleteAccount,
  getAccount,
  listAccounts,
  updateAccount,
  verifyAccount,
} from "../controllers/accounts";
import { validateBody, validateParams } from "../middleware/validation";

import { Router } from "express";

export const router = Router();

// GET /v1/accounts
router.get("/", listAccounts);

// POST /v1/accounts
router.post("/", validateBody(createAccountSchema), createAccount);

// GET /v1/accounts/:accountId
router.get("/:accountId", validateParams(accountParamsSchema), getAccount);

// PATCH /v1/accounts/:accountId
router.patch(
  "/:accountId",
  validateParams(accountParamsSchema),
  validateBody(updateAccountSchema),
  updateAccount,
);

// DELETE /v1/accounts/:accountId
router.delete("/:accountId", validateParams(accountParamsSchema), deleteAccount);

// POST /v1/accounts/:accountId/verify
router.post("/:accountId/verify", validateParams(accountParamsSchema), verifyAccount);
